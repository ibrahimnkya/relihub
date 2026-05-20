/**
 * RELI-IQ NEURAL ORCHESTRATOR
 * This module handles embedding generation, vector search fallbacks,
 * and LLM orchestration via Ollama.
 */

const db = require('./db');

let extractor = null;

/**
 * Generates a vector embedding for the given text using MiniLM (384 dimensions).
 * Runs fully in-memory on the server CPU.
 */
async function getEmbedding(text) {
    try {
        const { pipeline } = await import('@xenova/transformers');
        if (!extractor) {
            console.log('[AI_CORE] Loading MiniLM-L6 model into memory...');
            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    } catch (err) {
        console.warn('[AI_CORE] Embedding generation failed, using keyword fallback:', err.message);
        return null;
    }
}

/**
 * Searches the knowledge base using vector similarity.
 * Falls back to keyword search if pgvector is not available.
 */
async function searchKnowledge(query, tenantId, userRole) {
    const vector = await getEmbedding(query);
    
    // Map roles to hierarchical access levels
    const allowedRoles = userRole === 'admin' 
        ? ['admin', 'manager', 'user'] 
        : userRole === 'manager' ? ['manager', 'user'] : ['user'];

    try {
        if (vector) {
            const vectorString = `[${vector.join(',')}]`;
            const result = await db.query(`
                SELECT content 
                FROM saas_knowledge 
                WHERE tenant_id = $1 
                  AND required_role = ANY($2)
                ORDER BY embedding <=> $3 
                LIMIT 3;
            `, [tenantId, allowedRoles, vectorString]);
            return result.rows.map(row => row.content).join('\n');
        }
    } catch (err) {
        console.warn('[AI_CORE] pgvector search failed, falling back to ILIKE:', err.message);
    }

    // Keyword Fallback
    const result = await db.query(`
        SELECT content FROM saas_knowledge 
        WHERE tenant_id = $1 AND required_role = ANY($2)
        AND content ILIKE $3 LIMIT 3
    `, [tenantId, allowedRoles, `%${query}%`]);
    return result.rows.map(row => row.content).join('\n');
}

/**
 * Generates an answer using Ollama or local reasoning fallback.
 */
async function generateAnswer(question, context) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2.5:1.5b',
                prompt: `System: Answer using ONLY the context below. If unsure, say "Contact Support".\nContext: ${context}\nUser: ${question}`,
                stream: false
            })
        });

        if (!response.ok) throw new Error('Ollama unreachable');
        const data = await response.json();
        return { answer: data.response, mode: 'OLLAMA_REALTIME' };
    } catch (err) {
        console.warn('[AI_CORE] Ollama inference failed, using local reasoning engine.');
        // Local deterministic reasoning fallback
        let answer = `[Local Intelligence] Based on the discovered records: ${context || 'No specific context found.'}`;
        if (!context) answer = "I've scanned the database but couldn't find a direct match. Please contact support for specialized node analysis.";
        return { answer, mode: 'LOCAL_DETERMINISTIC' };
    }
}

module.exports = {
    getEmbedding,
    searchKnowledge,
    generateAnswer
};

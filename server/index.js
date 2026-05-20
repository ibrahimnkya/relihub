const express = require('express');
const cors = require('cors');
const entityRoutes = require('./routes/entities');
const iqRoutes = require('./routes/iq');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3060;

const db = require('./db');

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  next();
});

// Health Check Endpoint (Public)
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await db.query('SELECT 1');
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        api: 'OK',
        database: dbCheck.rowCount > 0 ? 'CONNECTED' : 'ERROR'
      },
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        api: 'OK',
        database: 'DISCONNECTED'
      },
      error: err.message
    });
  }
});

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  const publicPaths = ['/api/auth/login', '/health'];
  const isPublic = publicPaths.some(path => req.originalUrl.includes(path));
  
  if (!authHeader && !isPublic) {
    console.warn(`[AUTH] Blocked unauthorized request to ${req.originalUrl}`);
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  next();
});

const authRoutes = require('./routes/auth');
const aiEngine = require('./ai_engine');
const reportRoutes = require('./routes/reports');

// --- DIRECT RELI-IQ CORE ENGINE (RAG-ENABLED) ---
app.post('/api/iq-core/discovery', async (req, res) => {
  const db = require('./db');
  try {
    const { query } = req.body;
    const q = query?.toLowerCase() || '';
    
    // 1. Relational Discovery (Incidents, Alerts, Branches)
    const [incidents, alerts, branches] = await Promise.all([
      db.query('SELECT * FROM incidents ORDER BY created_at DESC LIMIT 10'),
      db.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 5'),
      db.query('SELECT * FROM branches LIMIT 10')
    ]);

    // 2. Semantic Discovery (Vector Search via Orchestrator)
    // Defaulting to tenant 1 and 'admin' for demo if not in req.user
    const tenantId = req.user?.tenant_id || 1;
    const role = req.user?.role || 'admin';
    const knowledgeContext = await aiEngine.searchKnowledge(q, tenantId, role);

    const dataPoints = [
      ...incidents.rows.map(r => ({ id: r.id, type: 'INCIDENT', context: `Incident: ${r.title} (${r.status})`, importance: 0.9 })),
      ...alerts.rows.map(r => ({ id: r.id, type: 'ALERT', context: `Alert: ${r.message}`, importance: 0.8 })),
      ...branches.rows.map(r => ({ id: r.id, type: 'BRANCH', context: `Node: ${r.name} in ${r.location}`, importance: 0.7 }))
    ].filter(p => !q || q.split(' ').some(k => k.length > 2 && p.context.toLowerCase().includes(k)));

    res.json({ 
      success: true, 
      data_points: dataPoints.length > 0 ? dataPoints : [{ type: 'SYSTEM', context: 'Baseline Telemetry', importance: 0.5 }],
      knowledge_context: knowledgeContext,
      discovery_token: `DISC-RAG-${Date.now()}`
    });
  } catch (err) { 
    console.error('[DISCOVERY_ERROR]', err);
    res.status(500).json({ error: err.message }); 
  }
});

app.post('/api/iq-core/extraction', async (req, res) => {
  try {
    const { dataPoints } = req.body;
    const extracted = (dataPoints || []).map(p => ({ ...p, features: { variance: '0.04', frequency: 'REAL_TIME', neural_weight: 0.95 } }));
    res.json({ success: true, context: extracted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CHAT HISTORY & PERSISTENCE ---
app.get('/api/iq-core/chats', async (req, res) => {
  const db = require('./db');
  const userId = req.user?.id || 1;
  try {
    const result = await db.query('SELECT * FROM iq_chats WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/iq-core/chats', async (req, res) => {
  const db = require('./db');
  const userId = req.user?.id || 1;
  const { title } = req.body;
  try {
    const result = await db.query('INSERT INTO iq_chats (user_id, title) VALUES ($1, $2) RETURNING *', [userId, title || 'New Analysis']);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/iq-core/chats/:id/messages', async (req, res) => {
  const db = require('./db');
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM iq_messages WHERE chat_id = $1 ORDER BY created_at ASC', [id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/iq-core/chats/:id', async (req, res) => {
  const db = require('./db');
  const userId = req.user?.id || 1;
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM iq_chats WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Chat not found or unauthorized' });
    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/iq-core/answers', async (req, res) => {
  const db = require('./db');
  try {
    const { query, context, knowledgeContext, chatId } = req.body;
    
    // Combine relational context with semantic knowledge
    const relationalSummary = (context || []).map(c => c.context).join('. ');
    const fullContext = `DATABASE_RECORDS: ${relationalSummary}\nKNOWLEDGE_BASE: ${knowledgeContext || 'None'}`;

    const { answer, mode } = await aiEngine.generateAnswer(query, fullContext);

    // Metadata for reasoning chain
    const incidentsCount = (context || []).filter(c => c.type === 'INCIDENT').length;
    const branchesCount = (context || []).filter(c => c.type === 'BRANCH').length;
    const reasoning = [
      `Analyzing ${incidentsCount} incident vectors...`,
      `Synthesizing ${branchesCount} branch nodes...`,
      `Orchestrating ${mode} inference...`
    ];

    // Persistence: Save user message and AI response if chatId exists
    if (chatId) {
      await db.query('INSERT INTO iq_messages (chat_id, role, content) VALUES ($1, $2, $3)', [chatId, 'user', query]);
      await db.query(
        'INSERT INTO iq_messages (chat_id, role, content, reasoning, context_data) VALUES ($1, $2, $3, $4, $5)', 
        [chatId, 'assistant', answer, JSON.stringify(reasoning), JSON.stringify({ context, knowledgeContext })]
      );
    }

    res.json({ 
      success: true, 
      reasoning_chain: reasoning, 
      answer 
    });
  } catch (err) { 
    console.error('[ANSWERS_ERROR]', err);
    res.status(500).json({ error: err.message }); 
  }
});

app.use('/api', entityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Direct override for company updates to resolve 404
app.put('/api/companies/:id', async (req, res) => {
  const db = require('./db');
  const { id } = req.params;
  console.log(`[SERVER] Direct Update hit for company ${id}`);
  try {
    const keys = Object.keys(req.body);
    const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(', ');
    const values = Object.values(req.body).map(v => (Array.isArray(v) || (v !== null && typeof v === 'object')) ? JSON.stringify(v) : v);
    const query = `UPDATE companies SET ${setClause} WHERE "id" = $${keys.length + 1} RETURNING *`;
    const result = await db.query(query, [...values, id]);
    
    if (result.rowCount === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[SERVER] Direct Update Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ReliHub Fallback API Server running on port ${PORT}`);
});

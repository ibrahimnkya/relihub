import { api, fallbackApi } from './api';

/**
 * Executes a request with the primary API and falls back to the secondary API if it fails.
 * @param {string} method - 'get', 'post', etc.
 * @param {string} url - The endpoint URL
 * @param {object} [data] - Optional request body
 * @returns {Promise<any>} - The API response
 */
export const fetchWithFallback = async (method, url, data = null) => {
  try {
    // Try primary API
    const response = await api[method](url, data);
    return response;
  } catch (err) {
    const isNetworkError = !err.response;
    const is404 = err.response?.status === 404;
    const is500 = err.response?.status === 500;
    
    console.warn(`[API] Primary fail (${err.response?.status || 'Network'}): ${url}. Attempting local fallback...`);
    
    try {
      // Try fallback API
      const response = await fallbackApi[method](url, data);
      console.log(`[API] Fallback SUCCESS for ${url}`);
      return response;
    } catch (fallbackErr) {
      console.error(`[API] CRITICAL: Both Primary and Fallback failed for ${url}`);
      console.error(` - Primary Error: ${err.message}`);
      console.error(` - Fallback Error: ${fallbackErr.message}`);
      
      // If the fallback is a network error (server not running), clarify that
      if (!fallbackErr.response) {
        console.warn(`[API] Suggestion: Is the local fallback server running on port 3060?`);
      }
      
      throw fallbackErr; 
    }
  }
};

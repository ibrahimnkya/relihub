import { fetchWithFallback } from './fetchWithFallback'
import { iqMock } from './iqMock'

export const iqService = {
  getStats: async () => {
    return fetchWithFallback('get', '/iq-core/stats')
  },
  
  getAnomalies: async () => {
    return fetchWithFallback('get', '/iq-core/anomalies')
  },
  
  getForecast: async () => {
    return fetchWithFallback('get', '/iq-core/forecast')
  },
  
  performAnalysis: async () => {
    return fetchWithFallback('post', '/iq-core/analyze')
  },

  getChats: async () => {
    return fetchWithFallback('get', '/iq-core/chats')
  },

  createChat: async (title) => {
    return fetchWithFallback('post', '/iq-core/chats', { title })
  },

  getChatMessages: async (chatId) => {
    return fetchWithFallback('get', `/iq-core/chats/${chatId}/messages`)
  },

  deleteChat: async (id) => {
    return fetchWithFallback('delete', `/iq-core/chats/${id}`)
  },

  discovery: async (query) => {
    try {
      return await fetchWithFallback('post', '/iq-core/discovery', { query })
    } catch (err) {
      console.warn('[RELI-IQ] Real Data Link Failed. Engaging Cognitive Mock Fallback.');
      return iqMock.discovery(query);
    }
  },

  extraction: async (dataPoints) => {
    try {
      return await fetchWithFallback('post', '/iq-core/extraction', { dataPoints })
    } catch (err) {
      return iqMock.extraction(dataPoints);
    }
  },

  answers: async (query, context, knowledgeContext, chatId) => {
    try {
      return await fetchWithFallback('post', '/iq-core/answers', { query, context, knowledgeContext, chatId })
    } catch (err) {
      return iqMock.answers(query);
    }
  },

  agent: async (action, parameters) => {
    try {
      return await fetchWithFallback('post', '/iq-core/agent', { action, parameters })
    } catch (err) {
      return iqMock.agent(action);
    }
  }
}

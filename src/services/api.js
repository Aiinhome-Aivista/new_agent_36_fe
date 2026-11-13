import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // ── Chat & SSE Streaming ─────────────────────────────────────────
  async sendChatStream({ query, sessionId, selectedLanguage, attachedCode, onMetadata, onToken, onDone, onError }) {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          session_id: sessionId,
          selected_language: selectedLanguage,
          attached_code: attachedCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete chunk

        let currentEvent = 'message';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace('event:', '').trim();
          } else if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.replace('data:', '').trim();
            try {
              const dataObj = JSON.parse(dataStr);
              if (currentEvent === 'metadata' && onMetadata) {
                onMetadata(dataObj);
              } else if (currentEvent === 'token' && onToken) {
                onToken(dataObj.token);
              } else if (currentEvent === 'done' && onDone) {
                onDone(dataObj);
              }
            } catch (err) {
              console.error('Error parsing SSE data JSON:', err, dataStr);
            }
          }
        }
      }

      if (onDone) onDone({ status: 'completed' });
    } catch (err) {
      console.error('Stream failed:', err);
      if (onError) onError(err);
    }
  },

  // ── Knowledge Base Management ────────────────────────────────────
  async uploadKnowledgeBase(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/knowledge-base/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getStats() {
    const res = await apiClient.get('/knowledge-base/stats');
    return res.data;
  },

  async getFiles() {
    const res = await apiClient.get('/knowledge-base/files');
    return res.data;
  },

  async reindex() {
    const res = await apiClient.post('/knowledge-base/reindex');
    return res.data;
  },

  // ── Function Search & Details ────────────────────────────────────
  async getFunctions(params = {}) {
    const res = await apiClient.get('/functions', { params });
    return res.data;
  },

  async getFunctionById(id) {
    const res = await apiClient.get(`/functions/${id}`);
    return res.data;
  },

  // ── Self-Growing Knowledge Base ──────────────────────────────────
  async saveLLMAnswer(data) {
    const res = await apiClient.post('/knowledge/save-llm-answer', data);
    return res.data;
  },

  async getLLMGenerated() {
    const res = await apiClient.get('/knowledge/llm-generated');
    return res.data;
  },

  async deleteLLMGenerated(id) {
    const res = await apiClient.delete(`/knowledge/llm-generated/${id}`);
    return res.data;
  },

  // ── Conversations ────────────────────────────────────────────────
  async getConversations() {
    const res = await apiClient.get('/conversations');
    return res.data;
  },

  async getConversation(sessionId) {
    const res = await apiClient.get(`/conversations/${sessionId}`);
    return res.data;
  },

  async deleteConversation(sessionId) {
    const res = await apiClient.delete(`/conversations/${sessionId}`);
    return res.data;
  },
};


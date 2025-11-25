import axios from 'axios';

// Use relative path for production (Vercel), localhost for development
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for multiple models
});

/**
 * Get list of available models
 */
export async function getAvailableModels() {
  try {
    const response = await api.get('/api/models');
    return response.data.models;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw new Error('Failed to fetch available models');
  }
}

/**
 * Analyze text with selected models
 * @param {string} text - Text to analyze
 * @param {string[]} models - Array of model IDs to use (optional)
 */
export async function analyzeText(text, models = null) {
  try {
    const payload = { text };
    if (models && models.length > 0) {
      payload.models = models;
    }

    const response = await api.post('/api/analyze', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || 'Analysis failed');
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

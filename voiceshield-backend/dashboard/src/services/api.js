import axios from 'axios';
import { INITIAL_CALLS } from './mockData';

// API Base URL - handles both direct local backend and proxied Vite requests
const API_BASE = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: '', // Uses Vite proxy in development or direct routes
  timeout: 45000,
});

const STORAGE_KEY = 'voiceshield_call_history_v1';

/**
 * Check if the FastAPI backend server is alive and responding
 */
export async function checkBackendHealth() {
  try {
    const res = await client.get('/health');
    return { online: true, data: res.data };
  } catch (error) {
    try {
      const directRes = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
      return { online: true, data: directRes.data };
    } catch {
      return { online: false, error: 'Backend unreachable' };
    }
  }
}

/**
 * Send an audio file to POST /voice/analyze
 * @param {File | Blob} audioFile 
 * @param {Function} [onProgress]
 */
export async function analyzeVoiceAudio(audioFile, onProgress) {
  const formData = new FormData();
  // Ensure the file has an appropriate name if it is a recorded blob
  const filename = audioFile.name || 'recorded_voice_sample.wav';
  formData.append('audio', audioFile, filename);

  try {
    const res = await client.post('/voice/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  } catch (error) {
    // If proxy fails, try direct backend URL
    try {
      const directRes = await axios.post(`${API_BASE}/voice/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      return directRes.data;
    } catch (directError) {
      console.error('Failed to analyze voice:', directError);
      throw directError.response?.data?.detail || directError.message || 'Voice analysis failed';
    }
  }
}

/**
 * Send security text payload to POST /security/analyze
 * @param {Object} payload 
 */
export async function analyzeSecurityPayload(payload) {
  try {
    const res = await client.post('/security/analyze', payload);
    return res.data;
  } catch (error) {
    try {
      const directRes = await axios.post(`${API_BASE}/security/analyze`, payload);
      return directRes.data;
    } catch (directError) {
      console.error('Failed to analyze security payload:', directError);
      throw directError.response?.data?.detail || directError.message;
    }
  }
}

/**
 * Fetch calls list.
 * Attempts GET /voice/calls or GET /calls from backend.
 * Falls back to local storage cache initialized with INITIAL_CALLS.
 */
export async function getCallHistory() {
  try {
    const res = await client.get('/voice/calls', { timeout: 3000 });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {
    // Backend GET endpoint not available or not yet defined
  }

  // Retrieve from localStorage or seed with high-fidelity mock data
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Corrupt local storage data, resetting...', e);
    }
  }

  // Initialize and persist initial calls
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CALLS));
  return INITIAL_CALLS;
}

/**
 * Save a newly analyzed call record to history cache
 */
export function saveCallToHistory(callRecord) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing = stored ? JSON.parse(stored) : INITIAL_CALLS;
    
    // Add new call at the beginning
    const updated = [callRecord, ...existing.filter(c => c.id !== callRecord.id && c.call_id !== callRecord.call_id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save call to history:', err);
    return [callRecord];
  }
}

/**
 * Clear local call history (reset to seed)
 */
export function resetCallHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CALLS));
  return INITIAL_CALLS;
}

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 600000, // Increase to 10 minutes for long YouTube processing
});

export const uploadAudio = async (file, title, language) => {
  const formData = new FormData();
  formData.append('audio', file);
  if (title) formData.append('title', title);
  if (language) formData.append('language', language);

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const processUrl = async (url, title, language) => {
  const { data } = await api.post('/process-url', { url, title, language });
  return data;
};

export const getPodcast = async (id) => {
  const { data } = await api.get(`/podcast/${id}`);
  return data;
};

export const searchTranscript = async (query, podcastId) => {
  const { data } = await api.get('/search', {
    params: { q: query, podcastId },
  });
  return data;
};

export const getPodcastPDFUrl = (id, options = {}) => {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    params.append(key, value);
  });
  return `${API_BASE}/podcast/${id}/pdf?${params.toString()}`;
};

export const listPodcasts = async () => {
  const { data } = await api.get('/podcasts');
  return data;
};

export const updateSpeakers = async (id, oldName, newName) => {
  const { data } = await api.put(`/podcast/${id}/speakers`, { oldName, newName });
  return data;
};

export const translatePodcast = async (id, targetLanguage) => {
  const { data } = await api.post(`/podcast/${id}/translate`, { targetLanguage });
  return data;
};

export default api;

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const request = async (token, path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}/recommendations${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || 'Advisor request failed');
  return data;
};

export const advisorApi = {
  getRecommendations: (token) => request(token, '/'),
  generateRecommendations: (token) => request(token, '/generate', { method: 'POST' }),
  dismissRecommendation: (token, id) => request(token, `/${id}/dismiss`, { method: 'PUT' })
};

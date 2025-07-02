import axios from 'axios';

/**
 * By setting baseURL to an empty string, we make all requests relative.
 * A request to apiClient.get('/agents/') will go to:
 * - 'http://localhost:5173/agents/' in development (which we will proxy)
 * - 'https://your.domain.com/agents/' in production
 */
const apiClient = axios.create({
  baseURL: '', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
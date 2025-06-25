import axios from 'axios';

// Define the base URL of your FastAPI backend.
// In a real production app, this would come from an environment variable.
const API_BASE_URL = 'http://127.0.0.1:8080'; // Or 'http://localhost:8000'

/**
 * A centrally configured axios instance.
 * All other API service files will import and use this client.
 * This is the single place to configure base URLs, headers, and interceptors.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // If you add JWT authentication later, you would add the token header here
    // via an interceptor.
  },
});

export default apiClient;
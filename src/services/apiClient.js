// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  // --- CHANGE THIS LINE ---
  baseURL: 'http://localhost:8000', // Set the full backend address
  
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
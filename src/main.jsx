import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- IMPORT THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap your App component with the AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
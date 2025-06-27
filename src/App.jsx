import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Import existing pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import AgentListPage from './pages/AgentListPage.jsx';

// --- Step 1: Import the new PolicyListPage component ---
import PolicyListPage from './pages/PolicyListPage.jsx'; // We will create this file
import EventHistoryPage from './pages/EventHistoryPage.jsx'; 

// Your placeholder pages
const AgentsPage = () => <h1>Agents Page</h1>;
const ResourcesPage = () => <h1>Resources Page</h1>;
const SettingsPage = () => <h1>Settings Page</h1>;

// Your ProtectedRoute component is perfect
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Your login route is perfect */}
        <Route path="/" element={user ? <Navigate to="/app/clients" replace /> : <LoginPage />} />

        {/* Your main protected layout route */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Your existing routes are perfect */}
          <Route index element={<Navigate to="clients" replace />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:tenantUuid/agents" element={<AgentListPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* --- Step 2: Add the new, specific route for an agent's policies --- */}
          {/* This dynamic route will match URLs like "/app/agents/some-agent-uuid-456/policies" */}
         <Route 
            path="assets/:assetId/policies" 
            element={<PolicyListPage />} 
          />
          <Route 
            path="assets/:assetId/policies/:policyId/log" 
            element={<EventHistoryPage />} 
          />
        </Route>
        
        {/* Your fallback route is perfect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 
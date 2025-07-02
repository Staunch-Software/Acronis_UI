import React, { useState, useEffect } from 'react';
import styles from './AgentDetailModal.module.css';
import { getAllAgentsByTenant } from '../services/agent_api.js';
import { FaTimes } from 'react-icons/fa';

const AgentDetailModal = ({ tenant, onClose }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tenant) return;

    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await getAllAgentsByTenant(tenant.tenant_uuid);
        setAgents(response.data.items);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch agents for tenant ${tenant.tenant_uuid}:`, err);
        setError("Could not load agent data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [tenant]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Agents for: <span>{tenant.name}</span></h2>
        
        {loading && <p>Loading agents...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        {!loading && !error && (
          <div className={styles.agentList}>
            {agents.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Status</th>
                    <th>Version</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map(agent => (
                    <tr key={agent.agent_id}>
                      <td>{agent.assetname || 'N/A'}</td>
                      <td>{agent.agent_status || 'N/A'}</td>
                      <td>{agent.agent_version || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No agents found for this tenant.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetailModal;
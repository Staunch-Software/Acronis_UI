import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './AgentListPage.module.css';
import { FaCog, FaSearch, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { getAgentsByTenant } from '../services/agent_api.js';
import { useOutsideClick } from '../hooks/useOutsideClick.js';

// Your column definitions are perfect
const allAgentColumns = [
  { id: 'assetname', label: 'Asset Name', isVisible: true },
  { id: 'agent_status', label: 'Status', isVisible: true },
  { id: 'agent_version', label: 'Version', isVisible: true },
  { id: 'asset_type', label: 'Asset Type', isVisible: true },
  { id: 'asset_ip', label: 'IP Address', isVisible: false },
  { id: 'agent_id', label: 'Agent UUID', isVisible: false },
  { id: 'agent_created_at', label: 'Created On', isVisible: false },
];

const AgentListPage = () => {
  // All your state and hook logic is perfect and requires no changes
  const { tenantUuid } = useParams();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState(allAgentColumns);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const settingsRef = useRef(null);
  useOutsideClick(settingsRef, () => setIsSettingsOpen(false));

  useEffect(() => {
    if (!tenantUuid) return;
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const response = await getAgentsByTenant(tenantUuid);
        setAgents(response.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching agents for tenant ${tenantUuid}:`, err);
        setError("Could not load agent data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [tenantUuid]);

  const filteredAgents = useMemo(() => {
    if (!searchTerm) return agents;
    return agents.filter(agent =>
      agent.assetname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agents, searchTerm]);

  const handleColumnToggle = (columnId) => {
    setColumns(prev => prev.map(col => col.id === columnId ? { ...col, isVisible: !col.isVisible } : col));
  };

  const activeColumns = columns.filter(col => col.isVisible);

  if (loading) return <div className={styles.centeredMessage}>Loading Agents...</div>;
  if (error) return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.agentPage}>
      {/* The header requires no changes */}
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <Link to="/app/clients" className={styles.backButton}>
            <FaArrowLeft />
          </Link>
          <h1>Agents</h1>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by asset name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.settingsContainer} ref={settingsRef}>
            <button className={styles.settingsButton} onClick={() => setIsSettingsOpen(p => !p)}>
              <FaCog />
            </button>
            {isSettingsOpen && (
              <div className={styles.settingsDropdown}>
                <div className={styles.dropdownHeader}>Configure Columns</div>
                <ul>
                  {columns.map(col => (
                    <li key={col.id} onClick={() => handleColumnToggle(col.id)}>
                      <div className={`${styles.checkbox} ${col.isVisible ? styles.checked : ''}`}>
                        {col.isVisible && <FaCheck size={10} />}
                      </div>
                      <span>{col.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className={styles.gridContainer}>
        {/* The grid layout requires no changes */}
        <div className={styles.grid} style={{ gridTemplateColumns: `minmax(200px, 1.5fr) repeat(${activeColumns.length - 1}, 1fr) auto` }}>
          {activeColumns.map(col => <div key={col.id} className={styles.gridHeader}>{col.label}</div>)}
          <div className={styles.gridHeader}>Policies</div>
          
          {filteredAgents.map(agent => (
            <React.Fragment key={agent.agent_id}>
              {activeColumns.map(col => (
                <div key={col.id} className={styles.gridCell}>
                  {col.id === 'agent_created_at' ? (
                    agent.agent_created_at ? new Date(agent.agent_created_at).toLocaleDateString() : 'N/A'
                  ) : (
                    agent[col.id] || 'N/A'
                  )}
                </div>
              ))}
              <div className={styles.gridCell}>
                {/* --- THIS IS THE ONLY CHANGE --- */}
                {/* Replace the button with a Link that navigates to the policy page */}
                <Link
                  to={`/app/agents/${agent.agent_id}/policies`}
                  className={styles.actionButton}
                >
                  View Policies
                </Link>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentListPage;
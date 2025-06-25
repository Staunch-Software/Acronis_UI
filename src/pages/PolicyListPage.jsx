import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PolicyListPage.module.css';
import { FaCog, FaSearch, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { getPoliciesByAgent } from '../services/policy_api.js';
import { useOutsideClick } from '../hooks/useOutsideClick.js';

// --- Step 1: Define all possible columns based on your policy_model.py ---
const allPolicyColumns = [
  { id: 'policy_name', label: 'Policy Name', isVisible: true },
  { id: 'policy_type', label: 'Policy Type', isVisible: true },
  { id: 'policy_enabled', label: 'Enabled', isVisible: true },
  { id: 'policy_updated_at', label: 'Last Updated', isVisible: true },
  { id: 'policy_acronis_id', label: 'Policy UUID', isVisible: false },
  { id: 'resource_name', label: 'Resource Name', isVisible: false },
  { id: 'policy_created_at', label: 'Created On', isVisible: false },
];

const PolicyListPage = () => {
  const { agentId } = useParams();

  // --- Step 2: Add all the necessary state variables ---
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState(allPolicyColumns);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const settingsRef = useRef(null);
  useOutsideClick(settingsRef, () => setIsSettingsOpen(false));

  useEffect(() => {
    if (!agentId) return;
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        const response = await getPoliciesByAgent(agentId);
        setPolicies(response.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching policies for agent ${agentId}:`, err);
        setError("Could not load policy data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyData();
  }, [agentId]);

  // --- Step 3: Add the search and column logic ---
  const filteredPolicies = useMemo(() => {
    if (!searchTerm) return policies;
    return policies.filter(policy =>
      policy.policy_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [policies, searchTerm]);

  const handleColumnToggle = (columnId) => {
    setColumns(prev => prev.map(col => col.id === columnId ? { ...col, isVisible: !col.isVisible } : col));
  };

  const activeColumns = columns.filter(col => col.isVisible);

  if (loading) return <div className={styles.centeredMessage}>Loading Policies...</div>;
  if (error) return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.policyPage}>
      {/* --- Step 4: Update the header with the new actions --- */}
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <Link to="#" onClick={() => window.history.back()} className={styles.backButton}>
            <FaArrowLeft />
          </Link>
          <h1>Applied Policies</h1>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by policy name..."
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
        {/* --- Step 5: Make the grid fully dynamic --- */}
        <div className={styles.grid} style={{ gridTemplateColumns: `2fr repeat(${activeColumns.length - 1}, 1fr) auto` }}>
          {activeColumns.map(col => <div key={col.id} className={styles.gridHeader}>{col.label}</div>)}
          <div className={styles.gridHeader}>Details</div>

          {policies.length > 0 ? (
            filteredPolicies.map(policy => (
              <React.Fragment key={policy.id}>
                {activeColumns.map(col => (
                  <div key={col.id} className={styles.gridCell}>
                    {col.id === 'policy_enabled' ? (
                      <span className={`${styles.status} ${policy.policy_enabled ? styles.active : styles.inactive}`}>
                        {policy.policy_enabled ? 'Yes' : 'No'}
                      </span>
                    ) : (col.id === 'policy_created_at' || col.id === 'policy_updated_at') ? (
                      policy[col.id] ? new Date(policy[col.id]).toLocaleString() : 'N/A'
                    ) : (
                      policy[col.id] || 'N/A'
                    )}
                  </div>
                ))}
                <div className={styles.gridCell}>
                    <button className={styles.actionButton}>View</button>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className={styles.noDataCell} style={{ gridColumn: `span ${activeColumns.length + 1}` }}>
              No policies found for this agent.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyListPage;
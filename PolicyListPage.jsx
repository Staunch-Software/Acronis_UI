import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PolicyListPage.module.css';
import { FaCog, FaSearch, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { getPoliciesByAssetId } from '../services/policy_api.js';
import { useOutsideClick } from '../hooks/useOutsideClick.js';
import PolicyRow from '../components/PolicyRow.jsx';
import { useConfigurableColumns } from '../hooks/useConfigurableColumns.js';

// Add the 'latest_event_type_name' to your columns
const allPolicyColumns = [
  { id: 'policy_name', label: 'Policy Name', isVisible: true },
  { id: 'policy_type', label: 'Policy Type', isVisible: true },
  { id: 'policy_enabled', label: 'Enabled', isVisible: true },
  { id: 'latest_event_type_name', label: 'Status', isVisible: true },
  { id: 'policy_updated_at', label: 'Last Updated', isVisible: false },
  { id: 'policy_acronis_id', label: 'Policy UUID', isVisible: false },
  { id: 'resource_name', label: 'Resource Name', isVisible: false },
  { id: 'policy_created_at', label: 'Created On', isVisible: false },
];

const PolicyListPage = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  useOutsideClick(settingsRef, () => setIsSettingsOpen(false));

const { columns, handleColumnToggle, activeColumns, isMaxColumnsReached } = useConfigurableColumns(allPolicyColumns);
  useEffect(() => {
    // This hook ONLY fetches the base list of policies.
    if (!assetId) return;
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        const response = await getPoliciesByAssetId(assetId);
        if (Array.isArray(response.data)) {
          setPolicies(response.data);
        } else {
          setPolicies([]);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching policies:", err);
        setError("Could not load policy list.");
        setPolicies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyData();
  }, [assetId]);

  // This search logic works on the base policy data
  const filteredPolicies = useMemo(() => {
    if (!searchTerm) return policies;
    return policies.filter(policy =>
      policy.policy_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [policies, searchTerm]);

  // This column toggle logic is correct
  

 

  if (loading) return <div className={styles.centeredMessage}>Loading Policies...</div>;
  if (error) return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.policyPage}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <FaArrowLeft />
          </button>
          <div className={styles.headerText}>
            <h1>Applied Policies</h1>
            <h2>For Asset: <span>{location.state?.assetName || `ID ${assetId.substring(0,8)}...`}</span></h2>
          </div>
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
                  {columns.map(col => {
                    // --- THIS IS THE FIX ---
                    // We define `isDisabled` right here inside the loop, before we use it.
                    const isDisabled = isMaxColumnsReached && !col.isVisible;

                    return (
                      <li
                        key={col.id}
                        className={isDisabled ? styles.disabled : ''}
                        onClick={() => handleColumnToggle(col.id)}
                      >
                        <div className={`${styles.checkbox} ${col.isVisible ? styles.checked : ''}`}>
                          {col.isVisible && <FaCheck size={10} />}
                        </div>
                        <span>{col.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.gridContainer}>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${activeColumns.length}, 1fr) auto` }}>
          {/* Render headers based on active columns */}
          {activeColumns.map(col => <div key={col.id} className={styles.gridHeader}>{col.label}</div>)}
          <div className={styles.gridHeader}>Details</div>
          
          {policies.length > 0 ? (
            filteredPolicies.map(policy => (
              // Use the PolicyRow component, passing the policy and active columns
              <PolicyRow
                key={policy.policy_acronis_id}
                policy={policy}
                activeColumns={activeColumns}
                assetId={assetId} 
                assetName={assetName} 
              />
            ))
          ) : (
            <div className={styles.noDataCell} style={{ gridColumn: `span ${activeColumns.length + 1}` }}>
              No policies found for this asset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyListPage;
import React, { useState, useEffect, useMemo, useRef } from 'react';
// --- Step 1: Import useNavigate and useLocation ---
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './PolicyListPage.module.css';
import { FaCog, FaSearch, FaCheck, FaArrowLeft } from 'react-icons/fa';
// --- Step 2: Import the correct API function ---
import { getPoliciesByAssetId } from '../services/policy_api.js';
import { useOutsideClick } from '../hooks/useOutsideClick.js';

// Your column definitions are perfect
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
  // --- Step 3: Get assetId from URL, and location/navigate for other data ---
  const { assetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get assetName from the state passed in the Link, with a fallback
  const assetName = location.state?.assetName || `Asset (${assetId ? assetId.substring(0, 8) : ''}...)`;

  // All your state hooks are perfect
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState(allPolicyColumns);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const settingsRef = useRef(null);
  useOutsideClick(settingsRef, () => setIsSettingsOpen(false));

  // --- Step 4: Update useEffect to use the new API function ---
  useEffect(() => {
    if (!assetId) return;
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        const response = await getPoliciesByAssetId(assetId); // <-- Use the new function
        setPolicies(response.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching policies for asset ${assetId}:`, err);
        setError("Could not load policy data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyData();
  }, [assetId]); // The dependency is now assetId

  // The rest of your logic for filtering and toggling columns is perfect
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
      <header className={styles.header}>
        {/* --- Step 5: Update the header to show the asset name --- */}
        <div className={styles.titleContainer}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <FaArrowLeft />
          </button>
          <div className={styles.headerText}>
            <h1>Applied Policies</h1>
            <h2>For Asset: <span>{assetName}</span></h2>
          </div>
        </div>
        {/* The actions div remains the same */}
        <div className={styles.actions}>
            {/* ... */}
        </div>
      </header>

      <div className={styles.gridContainer}>
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
              No policies found for this asset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyListPage;
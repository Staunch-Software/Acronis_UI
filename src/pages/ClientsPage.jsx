import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './ClientsPage.module.css';
import { FaCog, FaSearch, FaCheck, FaSyncAlt } from 'react-icons/fa';
import { getAllTenants, syncTenants } from '../services/tenant_api.js';
import { useOutsideClick } from '../hooks/useOutsideClick.js';
import { useConfigurableColumns } from '../hooks/useConfigurableColumns.js';

const allColumns = [
  { id: 'name', label: 'Tenant Name', isVisible: true },
  { id: 'status', label: 'Status', isVisible: true },
  { id: 'email', label: 'Contact Email', isVisible: true },
  { id: 'tenant_type', label: 'Kind / Type', isVisible: true },
  { id: 'mfa_status', label: '2FA Status', isVisible: false },
  { id: 'tenant_uuid', label: 'Tenant UUID', isVisible: false },
  { id: 'created_on', label: 'Created On', isVisible: false },
];

const ClientsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const { columns, handleColumnToggle, activeColumns, isMaxColumnsReached } = useConfigurableColumns(allColumns);
  const settingsRef = useRef(null);
  useOutsideClick(settingsRef, () => setIsSettingsOpen(false));

  const fetchTenantData = async () => {
    try {
      // Set loading to true only for the main data fetch
      if (!isSyncing) setLoading(true);
      const responseData = await getAllTenants();
      setTenants(responseData);
      setError(null);
    } catch (err) {
      console.error("Error fetching tenants:", err);
      setError("Failed to load data from the server. Please check the API connection.");
    } finally {
      if (!isSyncing) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const filteredTenants = useMemo(() => {
    if (!searchTerm) return tenants;
    return tenants.filter(tenant => tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tenants, searchTerm]);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing tenants from cloud...');
    try {
      const response = await syncTenants();
      setSyncMessage('Sync job successfully queued! Data will be updated shortly.');
      
      // After a delay, clear the message and refresh the data on the page
      setTimeout(() => {
        setSyncMessage('');
        fetchTenantData(); // Re-fetch data to show updates
      }, 5000); // 5-second delay

    } catch (err) {
      console.error("Sync trigger failed:", err);
      const errorMessage = err.response?.data?.detail || 'Error: Could not start sync job.';
      setSyncMessage(errorMessage);
      setTimeout(() => setSyncMessage(''), 8000);
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (loading) return <div className={styles.centeredMessage}>Loading Clients...</div>;
  if (error) return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.clientsPage}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <h1>Clients</h1>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.syncButton}
            onClick={handleSyncClick}
            disabled={isSyncing}
          >
            <FaSyncAlt className={isSyncing ? styles.syncingIcon : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Tenants'}
          </button>

          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.settingsContainer} ref={settingsRef}>
            <button
              className={styles.settingsButton}
              onClick={() => setIsSettingsOpen(prev => !prev)}
            >
              <FaCog />
            </button>
            {isSettingsOpen && (
              <div className={styles.settingsDropdown}>
                <div className={styles.dropdownHeader}>Configure Columns</div>
                <ul>
                 {columns.map(col => {
                   const isDisabled = isMaxColumnsReached && !col.isVisible;
                   return (
                     <li
                       key={col.id}
                       className={isDisabled ? styles.disabled : ''}
                       onClick={() => !isDisabled && handleColumnToggle(col.id)}
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
      
      {syncMessage && (
        <div className={styles.syncMessageBar}>
          {syncMessage}
        </div>
      )}
      
      <div className={styles.gridContainer}>
        <div className={styles.grid} style={{ gridTemplateColumns: `minmax(250px, 2fr) repeat(${activeColumns.length - 1}, 1fr) auto` }}>
          {activeColumns.map(col => <div key={col.id} className={styles.gridHeader}>{col.label}</div>)}
          <div className={styles.gridHeader}>Actions</div>

          {filteredTenants.map(tenant => (
            <React.Fragment key={tenant.tenant_uuid}>
              {activeColumns.map(col => (
                <div key={col.id} className={styles.gridCell} data-label={col.label}>
                  {col.id === 'status' ? ( <span className={`${styles.status} ${tenant.enabled ? styles.active : styles.inactive}`}>{tenant.enabled ? 'Active' : 'Inactive'}</span> ) : 
                   col.id === 'created_on' ? ( tenant.created_on ? new Date(tenant.created_on).toLocaleDateString() : 'N/A' ) : 
                   ( tenant[col.id] || 'N/A' )}
                </div>
              ))}
              <div className={styles.gridCell}>
                <Link to={`/app/clients/${tenant.tenant_uuid}/agents`} className={styles.actionButton}>
                  View Agents
                </Link>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
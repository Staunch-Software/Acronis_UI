import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './AgentListPage.module.css';
import { FaCog, FaSearch, FaCheck, FaArrowLeft, FaSyncAlt } from 'react-icons/fa';
import { getAgentsByTenantPaginated, syncAgents } from '../services/agent_api.js';
import { useOutsideClick } from '../hooks/useOutsideClick.js';
import { useConfigurableColumns } from '../hooks/useConfigurableColumns.js';

const allAgentColumns = [
  { id: 'assetname', label: 'Asset Name', isVisible: true },
  { id: 'agent_status', label: 'Status', isVisible: true },
  { id: 'agent_version', label: 'Version', isVisible: true },
  { id: 'asset_type', label: 'Asset Type', isVisible: true },
  { id: 'asset_ip', label: 'IP Address', isVisible: false },
  { id: 'agent_id', label: 'Agent UUID', isVisible: false },
  { id: 'agent_created_at', label: 'Created On', isVisible: false },
];

const AGENTS_PER_PAGE = 50;

const AgentListPage = () => {
  const { tenantUuid } = useParams();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const { columns, handleColumnToggle, activeColumns, isMaxColumnsReached } = useConfigurableColumns(allAgentColumns);
  const settingsRef = useRef(null);
  useOutsideClick(settingsRef, () => setIsSettingsOpen(false));

  const fetchInitialAgentData = async () => {
    if (!tenantUuid) return;
    try {
      if (!isSyncing) setLoading(true);
      const response = await getAgentsByTenantPaginated(tenantUuid, AGENTS_PER_PAGE, 0);
      setAgents(response.data.items);
      setHasMore(response.data.items.length < response.data.total);
      setPage(1);
      setError(null);
    } catch (err) {
      console.error(`Error fetching agents for tenant ${tenantUuid}:`, err);
      setError("Could not load agent data.");
    } finally {
      if (!isSyncing) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialAgentData();
  }, [tenantUuid]);

  const loadMoreAgents = async () => {
    if (isMoreLoading || !hasMore) return;
    setIsMoreLoading(true);
    try {
      const nextPage = page + 1;
      const skip = page * AGENTS_PER_PAGE;
      const response = await getAgentsByTenantPaginated(tenantUuid, AGENTS_PER_PAGE, skip);
      setAgents(prevAgents => [...prevAgents, ...response.data.items]);
      const loadedCount = agents.length + response.data.items.length;
      setHasMore(loadedCount < response.data.total);
      setPage(nextPage);
    } catch (err) {
      console.error("Error fetching more agents:", err);
      setError("Could not load more agents.");
    } finally {
      setIsMoreLoading(false);
    }
  };

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing agents from cloud...');
    try {
      const response = await syncAgents();
      setSyncMessage('Agent sync job successfully queued!');
      setTimeout(() => {
        setSyncMessage('');
        // Re-fetch the first page of data to show any immediate updates
        fetchInitialAgentData();
      }, 5000);
    } catch (err) {
      console.error("Agent sync failed:", err);
      setSyncMessage('Error: Could not start agent sync job.');
      setTimeout(() => setSyncMessage(''), 8000);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredAgents = useMemo(() => {
    if (!searchTerm) return agents;
    return agents.filter(agent =>
      agent.assetname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agents, searchTerm]);

  if (loading) return <div className={styles.centeredMessage}>Loading Agents...</div>;
  if (error && agents.length === 0) return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.agentPage}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <Link to="/app/clients" className={styles.backButton}>
            <FaArrowLeft />
          </Link>
          <h1>Agents</h1>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.syncButton}
            onClick={handleSyncClick}
            disabled={isSyncing}
          >
            <FaSyncAlt className={isSyncing ? styles.syncingIcon : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Agents'}
          </button>
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
                {agent.asset_id ? (
                  <Link
                    to={`/app/assets/${agent.asset_id}/policies`}
                    state={{ assetName: agent.assetname }}
                    className={styles.actionButton}
                  >
                    View Policies
                  </Link>
                ) : (
                  <button className={styles.actionButtonDisabled} disabled>
                    No Asset
                  </button>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        
        <div className={styles.footerActions}>
          {isMoreLoading && (
            <div className={styles.centeredMessage}>Loading more...</div>
          )}
          {hasMore && !isMoreLoading && (
            <button onClick={loadMoreAgents} className={styles.loadMoreButton}>
              Load More Agents
            </button>
          )}
          {!hasMore && agents.length > 0 && (
             <div className={styles.centeredMessage}>All agents loaded.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentListPage;
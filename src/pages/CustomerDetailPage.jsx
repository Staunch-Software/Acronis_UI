// src/pages/CustomerDetailPage.jsx (OPTIMIZED VERSION)

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CustomerDetailPage.module.css';
import { getPoliciesForTenant,getRevokedPoliciesForTenant, getPoliciesForExport } from '../services/policy_api.js';
import { getTenantDetails } from '../services/tenant_api.js';
import { FaFilter, FaShieldAlt, FaSpinner, FaExclamationCircle, FaCog, FaCheck, FaEye, FaFileExcel , FaBan, FaTasks } from 'react-icons/fa';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useConfigurableColumns } from '../hooks/useConfigurableColumns.js'; 
import * as XLSX from 'xlsx';
import { useOutsideClick } from '../hooks/useOutsideClick.js';

const allPolicyColumns = [
  { id: 'policy_name', label: 'Policy Name', isVisible: true },
  { id: 'resource_name', label: 'Applied To', isVisible: true },
  { id: 'policy_created_at', label: 'Date Applied', isVisible: true },
  { id: 'policy_type', label: 'Policy Type', isVisible: true },
  { id: 'policy_enabled', label: 'Enabled', isVisible: false },
  { id: 'asset_type', label: 'Asset Type', isVisible: false },
  { id: 'agent_id', label: 'Agent UUID', isVisible: false },
  { id: 'policy_acronis_id', label: 'Policy UUID', isVisible: false },
];

const BATCH_SIZE = 100; // Increased batch size for better performance

const CustomerDetailPage = () => {
  const { tenantUuid } = useParams();
  // --- 2. State to track the current view: 'applied' or 'revoked' ---
  const [viewMode, setViewMode] = useState('applied'); 
  // State for data and UI
  const [tenantInfo, setTenantInfo] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // State for filtering and pagination
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPolicies, setTotalPolicies] = useState(0); 
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { columns, handleColumnToggle, activeColumns, isMaxColumnsReached } = useConfigurableColumns(allPolicyColumns);
  const settingsRef = useRef(null);
  const scrollContainerRef = useRef(null);
  // State to track the current view: 'applied' or 'revoked'
  
  
  useOutsideClick(settingsRef, () => setIsSettingsOpen(false));
  
  // Fetch the tenant's name when the component loads
  useEffect(() => {
    if (!tenantUuid) return;
    setTenantInfo(null); // Reset on tenant change
    getTenantDetails(tenantUuid)
      .then(res => setTenantInfo(res.data))
      .catch(err => {
        console.error("Failed to fetch tenant details:", err);
        setTenantInfo({ name: "Customer Not Found" });
      });
  }, [tenantUuid]);

  // Optimized fetchPolicies function - removed policies.length dependency
  const fetchPolicies = useCallback(async (page, filter, mode, isFirstLoad = false) => {
    if (!tenantUuid) return;

    if (isFirstLoad) setLoading(true); else setIsLoadingMore(true);
    setError(null);

    try {
      const apiCall = mode === 'applied' 
        ? getPoliciesForTenant(tenantUuid, filter, page, BATCH_SIZE)
        : getRevokedPoliciesForTenant(tenantUuid, filter, page, BATCH_SIZE);
      
      const response = await apiCall;
      
      if (response.data && Array.isArray(response.data.items)) {
        const newItems = response.data.items;
        setPolicies(prev => page === 1 ? newItems : [...prev, ...newItems]);
        setTotalPolicies(response.data.total);
        setHasMore((policies.length + newItems.length) < response.data.total);
      } else { throw new Error("Invalid data format"); }
    } catch (err) {
      console.error(`Failed to load policies for mode '${mode}':`, err);
      setError("Could not load policy data.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [tenantUuid, policies.length]);

  // Reset and fetch policies when filter or tenant changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setPolicies([]);
    fetchPolicies(1, timeFilter, viewMode, true);
  }, [timeFilter, tenantUuid, viewMode]); // <-- `viewMode` is the key dependency

  const loadMorePolicies = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPolicies(nextPage, timeFilter, viewMode, false);
    }
  }, [currentPage, timeFilter, viewMode, isLoadingMore, hasMore])
// --- 5. New, simpler function to toggle the view ---
  const handleToggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'applied' ? 'revoked' : 'applied');
  };
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await getPoliciesForExport(tenantUuid, timeFilter);
      const dataToExport = response.data;
      
      const formattedData = dataToExport.map(policy => {
        const row = {};
        activeColumns.forEach(col => {
          let value = policy[col.id];
          if (col.id === 'policy_created_at' || col.id === 'policy_updated_at') {
            value = value ? new Date(value).toLocaleString() : 'N/A';
          }
          if (col.id === 'policy_enabled') {
            value = value ? 'Yes' : 'No';
          }
          row[col.label] = value || 'N/A';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Policy Report');
      XLSX.writeFile(workbook, `Policy_Report_${tenantInfo?.name || tenantUuid}.xlsx`);

    } catch (err) {
      console.error("Failed to export policy data:", err);
      alert("Error: Could not export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  // Memoized policy row rendering for better performance
  const renderPolicyRow = useCallback((policy) => (
    <tr key={`${policy.id}-${policy.policy_acronis_id}`}>
      {activeColumns.map(col => (
        <td key={col.id} title={policy[col.id]}>
          {(() => {
            const value = policy[col.id];
            switch (col.id) {
              case 'policy_name':
                return (
                  <div className={styles.policyNameCell}>
                    <FaShieldAlt className={styles.policyIcon}/>
                    <span>{value || 'Unnamed'}</span>
                  </div>
                );
              case 'policy_created_at':
              case 'policy_updated_at':
                return value ? new Date(value).toLocaleString() : 'N/A';
              case 'policy_enabled':
                return (
                  <span className={`${styles.statusBadge} ${value ? styles.enabled : styles.disabled}`}>
                    {value ? 'Yes' : 'No'}
                  </span>
                );
              default:
                return value || 'N/A';
            }
          })()}
        </td>
      ))}
    </tr>
  ), [activeColumns]);
  
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.detailPage}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerLeft}>
              <h1>{tenantInfo ? tenantInfo.name : 'Loading...'} - Policy Details
                 <span className={styles.viewTitle}> {viewMode === 'applied' ? 'Applied Consumption' : 'Revoked Consumption'}</span>
              </h1>
              <p className={styles.policyCount}>
                {loading && policies.length === 0 ? 'Loading...' : `${policies.length} of ${totalPolicies} policies shown`}
              </p>
            </div>
          </div>

          <div className={styles.controls}>
             <div className={styles.filterContainer}>
              <FaEye className={styles.filterIcon} />
              <select 
                value={viewMode} 
                onChange={e => setViewMode(e.target.value)} 
                className={styles.filterSelect}
              >
                <option value="applied">View Applied</option>
                <option value="revoked">View Revoked</option>
              </select>
            </div>
            <div className={styles.filterContainer}>
              <FaFilter className={styles.filterIcon} />
              <select value={timeFilter} onChange={handleFilterChange} className={styles.filterSelect}>
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option> 
                <option value="7d">Last 7 Days</option>
                <option value="14d">Last 14 Days</option>
                <option value="1m">Last 1 Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="1y">Last 1 Year</option>
              </select>
            </div>
            
            <div className={styles.rightControls}>
               {/* <button 
                className={styles.actionButton}
                onClick={handleToggleViewMode}
              >
                {viewMode === 'applied' ? (
                  <><FaBan /> View Revoked</>
                ) : (
                  <><FaTasks /> View Applied</>
                )}
              </button> */}
              <button 
                className={styles.actionButton} 
                onClick={handleExport} 
                disabled={isExporting || policies.length === 0}
              >
                <FaFileExcel />
                {isExporting ? 'Exporting...' : 'Usage Report Export'}
              </button>
              
              <div className={styles.settingsContainer} ref={settingsRef}>
                <button className={styles.actionButton} onClick={() => setIsSettingsOpen(p => !p)}>
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
          </div>
        </header>

        <div className={styles.tableContainer}>
          {loading && policies.length === 0 ? (
            <div className={styles.statusBox}>
              <FaSpinner className={styles.spinner} />
              <span>Loading policies...</span>
            </div>
          ) : error ? (
            <div className={`${styles.statusBox} ${styles.errorBox}`}>
              <FaExclamationCircle />
              <span>{error}</span>
              <button 
                onClick={() => fetchPolicies(1, timeFilter, true)}
                className={styles.retryButton}
              >
                Retry
              </button>
            </div>
          ) : (
            <div 
              id="scrollableDiv" 
              className={styles.scrollableDiv}
              ref={scrollContainerRef}
            >
              <InfiniteScroll
                dataLength={policies.length}
                next={loadMorePolicies}
                hasMore={hasMore}
                loader={
                  <div className={styles.loader}>
                    <FaSpinner className={styles.spinner} />
                    <span>Loading more policies...</span>
                  </div>
                }
                endMessage={
                  <div className={styles.endMessage}>
                    <strong>All {totalPolicies} policies loaded</strong>
                  </div>
                }
                scrollableTarget="scrollableDiv"
                style={{ overflow: 'visible' }}
              >
                <table className={styles.policiesTable}>
                  <thead>
                    <tr>
                      {activeColumns.map(col => {
                        // Dynamically change header text
                        let label = col.label;
                        if (col.id === 'policy_created_at') {
                          label = viewMode === 'revoked' ? 'Date Created' : 'Date Applied';
                        }
                        // Hide "Applied To" column for revoked policies
                        if (viewMode === 'revoked' && col.id === 'resource_name') {
                          return null;
                        }
                        return <th key={col.id}>{label}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map(policy => (
                      <tr key={`${policy.id}-${policy.policy_acronis_id}`}>
                        {activeColumns.map(col => {
                           // Hide "Applied To" cell for revoked policies
                          if (viewMode === 'revoked' && col.id === 'resource_name') {
                            return null;
                          }
                          return (
                            <td key={col.id}>
                              {/* Your existing cell rendering logic here */}
                              {(() => {
                                const value = policy[col.id];
                                switch (col.id) {
                                  case 'policy_name':
                                    return <><FaShieldAlt className={styles.policyIcon}/>{value || 'Unnamed'}</>;
                                  case 'policy_created_at':
                                    return value ? new Date(value).toLocaleString() : 'N/A';
                                  case 'policy_enabled':
                                    return value ? 'Yes' : 'No';
                                  default:
                                    return value || 'N/A';
                                }
                              })()}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </InfiniteScroll>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
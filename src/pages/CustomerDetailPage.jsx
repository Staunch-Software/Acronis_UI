// src/pages/CustomerDetailPage.jsx (REPLACED)

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CustomerDetailPage.module.css';
import { getPoliciesForTenant } from '../services/policy_api.js';
import { FaFilter, FaShieldAlt } from 'react-icons/fa';

const ITEMS_PER_PAGE = 10;

const CustomerDetailPage = () => {
  const { tenantUuid } = useParams();
  
  // State for data and UI
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering and pagination
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPoliciesForTenant(tenantUuid, timeFilter, currentPage, ITEMS_PER_PAGE);
      setPolicies(response.data.items);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
    } catch (err) {
      console.error("Failed to load policies for tenant:", err);
      setError("Could not load policy data for this customer.");
    } finally {
      setLoading(false);
    }
  }, [tenantUuid, timeFilter, currentPage]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);
  
  // Reset to page 1 when the filter changes
  const handleFilterChange = (e) => {
    setCurrentPage(1);
    setTimeFilter(e.target.value);
  };
  
  return (
    <div className={styles.detailPage}>
      <header className={styles.header}>
        <h1>Customer Policy Details</h1>
        <p className={styles.uuid}>Tenant ID: {tenantUuid}</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.filterContainer}>
          <FaFilter className={styles.filterIcon} />
          <select value={timeFilter} onChange={handleFilterChange} className={styles.filterSelect}>
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="14d">Last 14 Days</option>
            <option value="1m">Last 1 Month</option>
            <option value="1y">Last 1 Year</option>
          </select>
        </div>
      </div>
      
      <div className={styles.content}>
        {loading && <p>Loading policies...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {!loading && !error && policies.length > 0 && (
          <table className={styles.policiesTable}>
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Applied To</th>
                <th>Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(policy => (
                <tr key={policy.id}>
                  <td className={styles.policyNameCell}>
                    <FaShieldAlt className={styles.policyIcon}/>
                    {policy.policy_name || 'Unnamed Policy'}
                  </td>
                  <td>{policy.resource_name || 'N/A'}</td>
                  <td>{new Date(policy.policy_created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !error && policies.length === 0 && (
          <p>No policies found for this time period.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
// consumptionpage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import styles from './ConsumptionPage.module.css';
import { getAllAgents } from '../services/agent_api.js';
import { getAllTenants } from '../services/tenant_api.js';
// Import the new policy overview function
import { getPolicyOverview } from '../services/policy_api.js';
import StatCard from '../components/dashboard/StatCard.jsx';
import AssetTypeChart from '../components/dashboard/AssetTypeChart.jsx';
import TenantFilter from '../components/dashboard/TenantFilter.jsx';
import { FaServer, FaUsers, FaHistory } from 'react-icons/fa';

const ConsumptionPage = () => {
  // State for raw data
  const [allAgents, setAllAgents] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  
  // --- NEW STATE for policy data ---
  const [policyCount, setPolicyCount] = useState(0);
  const [recentPolicies, setRecentPolicies] = useState([]);
  
  // UI and control state
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [policyLoading, setPolicyLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect 1: Fetch static data (unchanged)
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        setLoading(true);
        const [agentData, tenantData] = await Promise.all([
          getAllAgents(),
          getAllTenants(),
        ]);
        setAllAgents(agentData);
        setAllTenants(tenantData);
        setError(null);
      } catch (err) {
        console.error("Failed to load initial dashboard data:", err);
        setError("Could not load consumption data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  // --- EFFECT 2: REWIRED for policies ---
  useEffect(() => {
    const fetchPolicyDataForTenant = async () => {
      try {
        setPolicyLoading(true);
        // Call our new, efficient overview endpoint
        const response = await getPolicyOverview(selectedTenant);
        
        // Destructure the data and update state
        const { total_count, recent_policies } = response.data;
        setPolicyCount(total_count);
        setRecentPolicies(recent_policies);

      } catch (err) {
        console.error(`Failed to load policy overview for tenant ${selectedTenant}:`, err);
        setPolicyCount(0);
        setRecentPolicies([]); // Clear data on error
      } finally {
        setPolicyLoading(false);
      }
    };
    
    fetchPolicyDataForTenant();
  }, [selectedTenant]); // Re-runs whenever the tenant filter changes

  // Data processing (unchanged)
  const filteredAgents = useMemo(() => {
    if (selectedTenant === 'all') return allAgents;
    return allAgents.filter(agent => agent.tenant_id === selectedTenant);
  }, [allAgents, selectedTenant]);

  if (loading) return <div className={styles.centeredMessage}>Loading Consumption Dashboard...</div>;
  if (error) return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.consumptionPage}>
      <header className={styles.header}>
        <h1>Consumption Overview</h1>
        <TenantFilter
          tenants={allTenants}
          selectedTenant={selectedTenant}
          onTenantChange={setSelectedTenant}
        />
      </header>

      <div className={styles.widgetsGrid}>
        <StatCard title="Total Tenants" value={allTenants.length} icon={<FaUsers />} />
        <StatCard 
          title="Protected Assets" 
          value={filteredAgents.length} 
          subtext={selectedTenant === 'all' ? 'Across all tenants' : 'For selected tenant'} 
          icon={<FaServer />} 
        />
        {/* --- StatCard UPDATED --- */}
        <StatCard 
          title="Total Applied Policies" 
          value={policyCount} // Use the new state variable for the count
          subtext={selectedTenant === 'all' ? 'Across all tenants' : 'For selected tenant'}
          icon={<FaHistory />} 
        />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <h3>Assets by Type</h3>
          <AssetTypeChart agentData={filteredAgents} />
        </div>
        <div className={styles.chartContainer}>
          <h3>Last Applied Policies</h3>
          <div className={styles.logContainer}>
            {/* --- List rendering UPDATED --- */}
            {policyLoading ? (
              <p className={styles.noDataMessage}>Loading policies...</p>
            ) : recentPolicies.length > 0 ? (
              // Map over the new recentPolicies state
              recentPolicies.map(policy => (
                <div key={policy.id} className={styles.logEntry}>
                  <div className={styles.logDetails}>
                    <span className={styles.logType}>{policy.policy_name || 'N/A'}</span>
                    {/* Use resource_name for the asset */}
                    <p className={styles.logTitle}>On Asset: {policy.resource_name || 'N/A'}</p>
                    {/* Use policy_created_at for the timestamp */}
                    <div className={styles.logTimestamp}>
                      Applied on: {new Date(policy.policy_created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noDataMessage}>No applied policies found for this selection.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionPage;
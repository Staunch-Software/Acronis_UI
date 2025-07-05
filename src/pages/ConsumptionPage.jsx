// ConsumptionPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import styles from './ConsumptionPage.module.css';
import { getAllAgents } from '../services/agent_api.js';
import { getAllTenants } from '../services/tenant_api.js';
// We only need ONE function now!
import { getPolicyOverview } from '../services/policy_api.js'; 
import StatCard from '../components/dashboard/StatCard.jsx';
import AssetTypeChart from '../components/dashboard/AssetTypeChart.jsx';
import TenantFilter from '../components/dashboard/TenantFilter.jsx';
import { FaServer, FaUsers, FaHistory } from 'react-icons/fa';

const ConsumptionPage = () => {
  const [allAgents, setAllAgents] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  const [policyCount, setPolicyCount] = useState(0);
  const [recentPolicies, setRecentPolicies] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [policyLoading, setPolicyLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        setLoading(true);
        const [agentData, tenantData] = await Promise.all([getAllAgents(), getAllTenants()]);
        setAllAgents(agentData);
        setAllTenants(tenantData);
      } catch (err) {
        console.error("Failed to load initial dashboard data:", err);
        setError("Could not load consumption data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        setPolicyLoading(true);
        const response = await getPolicyOverview(selectedTenant);
        const { total_count, recent_policies } = response.data;
        setPolicyCount(total_count);
        setRecentPolicies(recent_policies);
      } catch (err) {
        console.error(`Failed to load policy data for selection ${selectedTenant}:`, err);
        setPolicyCount(0);
        setRecentPolicies([]);
      } finally {
        setPolicyLoading(false);
      }
    };
    fetchPolicyData();
  }, [selectedTenant]);

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
        <TenantFilter tenants={allTenants} selectedTenant={selectedTenant} onTenantChange={setSelectedTenant} />
      </header>
      <div className={styles.widgetsGrid}>
        <StatCard title="Total Tenants" value={allTenants.length} icon={<FaUsers />} />
        <StatCard title="Protected Assets" value={filteredAgents.length} subtext={selectedTenant === 'all' ? 'Across all tenants' : 'For selected tenant'} icon={<FaServer />} />
        <StatCard title="Applied Policies" value={policyCount} subtext={selectedTenant === 'all' ? 'Total across all tenants' : 'Total for selected tenant'} icon={<FaHistory />} />
      </div>
      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <h3>Assets by Type</h3>
          <AssetTypeChart agentData={filteredAgents} />
        </div>
        <div className={styles.chartContainer}>
          <h3>Last Applied Policies</h3>
          <div className={styles.logContainer}>
            {policyLoading ? (
              <p className={styles.noDataMessage}>Loading policies...</p>
            ) : recentPolicies.length > 0 ? (
              recentPolicies.map(policy => (
                <div key={policy.id} className={styles.logEntry}>
                  <div className={styles.logDetails}>
                    <span className={styles.logType}>{policy.policy_name || 'N/A'}</span>
                    <div className={styles.logTimestamp}>Applied on: {new Date(policy.policy_created_at).toLocaleString()}</div>
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
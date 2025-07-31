import React, { useState, useEffect, useMemo,useCallback } from "react";
import styles from "./ConsumptionPage.module.css";
import { getAllAgents, syncAgentUpdates, getAgentOverview } from "../services/agent_api.js"; 
import { getAllTenants } from "../services/tenant_api.js";
import {
  getPolicyOverview,
  getUnassignedPolicyCount,
  syncPolicyUpdates,
} from "../services/policy_api.js";
import StatCard from "../components/dashboard/StatCard.jsx";
import AssetTypeChart from "../components/dashboard/AssetTypeChart.jsx";
import TenantFilter from "../components/dashboard/TenantFilter.jsx";
import {
  FaServer,
  FaUsers,
  FaShieldAlt,
  FaFileContract,
  FaChartLine,
  FaClock,
  FaBan,
  FaSyncAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const ConsumptionPage = () => {
  const [allAgents, setAllAgents] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState("all");
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enabledCount, setEnabledCount] = useState(0);
  const [revokedCount, setRevokedCount] = useState(0);
  const [recentPolicies, setRecentPolicies] = useState([]);
  const [dailySummary, setDailySummary] = useState({ applied: 0, revoked: 0 }); // 
  const [policyLoading, setPolicyLoading] = useState(true);
  const [unassignedLoading, setUnassignedLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDate, setSyncDate] = useState("");
  const [agentEnabledCount, setAgentEnabledCount] = useState(0);
  const [agentDailySummary, setAgentDailySummary] = useState({ added: 0, disabled: 0 });
  const [agentLoading, setAgentLoading] = useState(true);
  const [policySyncStatus, setPolicySyncStatus] = useState({
    applied: 0,
    revoked: 0,
  });
const fetchAgentDashboardData = useCallback(async () => {
    setAgentLoading(true);
    try {
      const response = await getAgentOverview(selectedTenant);
      const { enabled_count, daily_summary } = response.data;
      setAgentEnabledCount(enabled_count);
      setAgentDailySummary(daily_summary || { added: 0, disabled: 0 });
    } catch (err) {
      console.error("Failed to load agent overview:", err);
      // Don't set the main error, just fail gracefully for this card
    } finally {
      setAgentLoading(false);
    }
  }, [selectedTenant]);
  const [syncMessage, setSyncMessage] = useState("");
const fetchDashboardData = useCallback(async () => {
    setPolicyLoading(true);
    try {
      const response = await getPolicyOverview(selectedTenant);
      const { enabled_count, revoked_count, daily_summary, recent_policies } = response.data;
      
      setEnabledCount(enabled_count);
      setRevokedCount(revoked_count);
      setRecentPolicies(recent_policies);
      setDailySummary(daily_summary || { applied: 0, revoked: 0 });

    } catch (err) {
      console.error("Failed to load policy overview:", err);
      setError("Could not load policy data.");
    } finally {
      setPolicyLoading(false);
    }
  }, [selectedTenant]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true); // Changed from setLoading
        const [agentData, tenantData] = await Promise.all([ getAllAgents(), getAllTenants() ]);
        setAllAgents(agentData);
        setAllTenants(tenantData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not load dashboard data.");
      } finally {
        setInitialLoading(false); // Changed from setLoading
      }
    };
    fetchInitialData();
  }, []);

  // useEffect(() => {
  //   fetchData();
  // }, []);

   useEffect(() => {
    // This fetches BOTH overviews when the tenant filter changes
    fetchDashboardData(); // For policies
    fetchAgentDashboardData(); // For agents
  }, [fetchDashboardData, fetchAgentDashboardData]);


  // useEffect(() => {
  //   const fetchPolicyData = async () => {
  //     setPolicyLoading(true);
  //     try {
  //       const response = await getPolicyOverview(selectedTenant);
  //       const { total_count, recent_policies } = response.data;
  //       setPolicyCount(total_count);
  //       setRecentPolicies(recent_policies);
  //     } catch (err) {
  //       setPolicyCount(0);
  //       setRecentPolicies([]);
  //     } finally {
  //       setPolicyLoading(false);
  //     }
  //   };
  //   fetchPolicyData();
  // }, [selectedTenant]);

  // useEffect(() => {
  //   const fetchUnassignedCount = async () => {
  //     setUnassignedLoading(true);
  //     try {
  //       const response = await getUnassignedPolicyCount(selectedTenant);
  //       setUnassignedCount(response.data.count);
  //     } catch (err) {
  //       setUnassignedCount(0);
  //     } finally {
  //       setUnassignedLoading(false);
  //     }
  //   };
  //   fetchUnassignedCount();
  // }, [selectedTenant]);

  const filteredAgents = useMemo(() => {
    const activeAgents = allAgents.filter(
      (agent) => agent.status === "enabled"
    );
    if (selectedTenant === "all") return activeAgents;
    return activeAgents.filter((agent) => agent.tenant_id === selectedTenant);
  }, [allAgents, selectedTenant]);
  const protectedAgentCount = useMemo(() => {
    
    return agentEnabledCount;
  }, [agentEnabledCount]);
  const handleSyncClick = async () => {
  setIsSyncing(true);
  const payload = syncDate ? { target_date: syncDate } : {};

  try {
    // --- STEP 1: Run the AGENT sync FIRST and wait for it to complete. ---
    setSyncMessage("Step 1 of 2: Syncing daily agent changes...");
    const agentResponse = await syncAgentUpdates(payload);
    console.log("Agent Sync Message:", agentResponse.data.message);
    
    // --- STEP 2: Now that agents are in the DB, run the POLICY sync. ---
    setSyncMessage("Step 2 of 2: Syncing daily policy changes...");
    const policyResponse = await syncPolicyUpdates(payload);
    console.log("Policy Sync Message:", policyResponse.data.message);

    // --- STEP 3: Refresh the entire dashboard. ---
    setSyncMessage("Sync complete. Refreshing dashboard...");
    await Promise.all([
      fetchDashboardData(),      // Refreshes policy data
      fetchAgentDashboardData()  // Refreshes agent data
    ]);
    
    setSyncMessage("Dashboard refreshed with the latest data.");
    setTimeout(() => setSyncMessage(""), 4000);

  } catch (err) {
    console.error("Failed to trigger sequential delta sync:", err);
    const errorMessage = err.response?.data?.detail || err.message || "Error: A step in the sync process failed.";
    setSyncMessage(errorMessage);
  } finally {
    setIsSyncing(false);
  }
};
  

 if (initialLoading) return ( <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Loading Dashboard...</p></div> );
  if (error) return ( <div className={styles.errorContainer}><div className={styles.errorIcon}>⚠️</div><p>{error}</p></div> );

  return (
    <div className={styles.consumptionPage}>
      <div className={styles.backgroundElements}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>
              <FaChartLine className={styles.titleIcon} />
              Consumption Overview
            </h1>
            <p className={styles.subtitle}>
              Monitor your infrastructure and policy deployment
            </p>
          </div>
          <div className={styles.actionsSection}>
            <div className={styles.syncStatus}>
              {syncMessage && (
                <p className={styles.syncMessageText}>{syncMessage}</p>
              )}
            </div>
            <div className={styles.datePickerWrapper}>
              <FaCalendarAlt className={styles.datePickerIcon} />
              <input
                type="date"
                className={styles.datePickerInput}
                value={syncDate}
                onChange={(e) => setSyncDate(e.target.value)}
                title="Select a date to sync. Leave blank for yesterday."
              />
            </div>
            <button
              className={styles.syncButton}
              onClick={handleSyncClick}
              disabled={isSyncing}
            >
              <FaSyncAlt
                className={
                  isSyncing ? styles.syncIconSpinning : styles.syncIcon
                }
              />
              {isSyncing ? "Syncing..." : "Sync Daily Changes"}
            </button>
          </div>
        </div>
        <div className={styles.filterBar}>
          <TenantFilter
            tenants={allTenants}
            selectedTenant={selectedTenant}
            onTenantChange={setSelectedTenant}
          />
        </div>
      </header>

      <div className={styles.widgetsGrid}>
        <StatCard
          title="Total Tenants"
          value={allTenants.length}
          icon={<FaUsers />}
          color="#6366f1"
        />
        <StatCard
          title="Protected Agents"
          value={agentLoading ? "..." : agentEnabledCount}
          subtext={selectedTenant === "all" ? "Across all tenants" : "For selected tenant"}
          icon={<FaServer />}
          color="#10b981"
          changeAdded={agentDailySummary.added}
          changeRemoved={agentDailySummary.disabled}
        />

         <StatCard
          title="Applied Policies"
          value={policyLoading ? "..." : enabledCount}
          subtext="Total enabled policies"
          icon={<FaFileContract />}
          color="#f59e0b"
          changeAdded={dailySummary.applied}
          changeRemoved={dailySummary.revoked}
        />
        <StatCard
          title="Revoked Consumption"
          value={policyLoading ? "..." : revokedCount}
          subtext="Total disabled policies"
          icon={<FaBan />}
          color="#ef4444"
          changeAdded={dailySummary.revoked}
        />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Assets by Type</h3>
            <div className={styles.chartSubtitle}>
              Distribution of your protected assets
            </div>
          </div>
          <AssetTypeChart agentData={filteredAgents} />
        </div>
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <FaClock className={styles.chartIcon} />
              Recent Policy Applications
            </h3>
            <div className={styles.chartSubtitle}>
              Latest 5 applied policies
            </div>
          </div>
          {policyLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.policySpinner}></div>
              <p>Loading policies...</p>
            </div>
          ) : recentPolicies.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.policiesTable}>
                <thead>
                  <tr>
                    <th>Policy Name</th>
                    <th>Applied To</th>
                    <th>Date Applied</th>
                     <th>Created At</th>
                     <th>policy status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPolicies.map((policy, index) => (
                    <tr
                      key={policy.id}
                      className={styles.tableRow}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className={styles.policyNameCell}>
                        <div className={styles.policyIconWrapper}>
                          <FaShieldAlt />
                        </div>
                        <span className={styles.policyName}>
                          {policy.policy_name || "Unnamed Policy"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.resourceName}>
                          {policy.resource_name || "N/A"}
                        </span>
                      </td>
                       <td>
                <span className={styles.policyDate}>
                  {policy.policy_applied_at 
                    ? new Date(policy.policy_applied_at).toLocaleString() 
                    : 'N/A'
                  }
                </span>
              </td>
                      <td>
                        <span className={styles.policyDate}>
                          {new Date(policy.policy_created_at|| "N/A").toLocaleString()}
                        </span>
                      </td>
                      
                      <td>
                        <span className={policy.policy_status === 'enabled' ? styles.statusEnabled : styles.statusRevoked}>
                          {policy.policy_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaFileContract className={styles.emptyIcon} />
              <p>No applied policies found for this selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumptionPage;

import React, { useState, useEffect, useMemo } from "react";
import styles from "./ConsumptionPage.module.css";
import { getAllAgents } from "../services/agent_api.js";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policyCount, setPolicyCount] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [recentPolicies, setRecentPolicies] = useState([]);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [unassignedLoading, setUnassignedLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDate, setSyncDate] = useState("");
  const [policySyncStatus, setPolicySyncStatus] = useState({
    applied: 0,
    revoked: 0,
  });
  const [syncMessage, setSyncMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentData, tenantData] = await Promise.all([
        getAllAgents(),
        getAllTenants(),
      ]);
      setAllAgents(agentData);
      setAllTenants(tenantData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPolicyData = async () => {
      setPolicyLoading(true);
      try {
        const response = await getPolicyOverview(selectedTenant);
        const { total_count, recent_policies } = response.data;
        setPolicyCount(total_count);
        setRecentPolicies(recent_policies);
      } catch (err) {
        setPolicyCount(0);
        setRecentPolicies([]);
      } finally {
        setPolicyLoading(false);
      }
    };
    fetchPolicyData();
  }, [selectedTenant]);

  useEffect(() => {
    const fetchUnassignedCount = async () => {
      setUnassignedLoading(true);
      try {
        const response = await getUnassignedPolicyCount(selectedTenant);
        setUnassignedCount(response.data.count);
      } catch (err) {
        setUnassignedCount(0);
      } finally {
        setUnassignedLoading(false);
      }
    };
    fetchUnassignedCount();
  }, [selectedTenant]);

  const filteredAgents = useMemo(() => {
    const activeAgents = allAgents.filter(
      (agent) => agent.status === "enabled"
    );
    if (selectedTenant === "all") return activeAgents;
    return activeAgents.filter((agent) => agent.tenant_id === selectedTenant);
  }, [allAgents, selectedTenant]);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncMessage("Syncing policy changes...");
    setPolicySyncStatus({ applied: 0, revoked: 0 });

    const payload = syncDate ? { target_date: syncDate } : {};

    try {
      const response = await syncPolicyUpdates(payload);
      const summary = response.data.summary;

      if (summary.error) {
        throw new Error(summary.message || "Sync failed with a server error.");
      }

      setPolicySyncStatus({
        applied: summary.applied || 0,
        revoked: summary.revoked || 0,
      });

      setSyncMessage(summary.message || "Sync complete. Refreshing data...");

      await fetchData();
    } catch (err) {
      console.error("Failed to trigger policy delta sync:", err);
      const errorMessage =
        err.response?.data?.detail || err.message || "Error: Sync failed.";
      setSyncMessage(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading && allAgents.length === 0)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Consumption Dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>{error}</p>
      </div>
    );

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
              {isSyncing ? "Syncing..." : "Sync Policy Changes"}
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
          value={filteredAgents.length}
          subtext={
            selectedTenant === "all"
              ? "Across all tenants"
              : "For selected tenant"
          }
          icon={<FaServer />}
          color="#10b981"
        />
        <StatCard
          title="Applied Policies"
          value={policyLoading ? "..." : policyCount}
          subtext={
            selectedTenant === "all"
              ? "Total across all tenants"
              : "Total for selected tenant"
          }
          icon={<FaFileContract />}
          color="#f59e0b"
          changeAdded={policySyncStatus.applied}
        />
        <StatCard
          title="Revoked Consumption"
          value={unassignedLoading ? "..." : unassignedCount}
          subtext={
            selectedTenant === "all"
              ? "Total across all tenants"
              : "Total for selected tenant"
          }
          icon={<FaBan />}
          color="#ef4444"
          changeRemoved={policySyncStatus.revoked}
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
                          {new Date(policy.policy_created_at).toLocaleString()}
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

import React from 'react';
import styles from './Dashboard.module.css';

const TenantFilter = ({ tenants, selectedTenant, onTenantChange }) => {
  return (
    <div className={styles.filterWrapper}>
      <div className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <span className={styles.filterIcon}>🏢</span>
          <label htmlFor="tenant-filter" className={styles.filterLabel}>
            Select Tenant
          </label>
        </div>
        <div className={styles.selectWrapper}>
          <select
            id="tenant-filter"
            value={selectedTenant}
            onChange={(e) => onTenantChange(e.target.value)}
            className={styles.tenantSelect}
          >
            <option value="all">All Tenants</option>
            {tenants.map(tenant => (
              <option key={tenant.tenant_uuid} value={tenant.tenant_uuid}>
                {tenant.name}
              </option>
            ))}
          </select>
          <div className={styles.selectArrow}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantFilter;
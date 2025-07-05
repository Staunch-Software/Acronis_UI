import React from 'react';
import styles from './Dashboard.module.css';

const TenantFilter = ({ tenants, selectedTenant, onTenantChange }) => {
  return (
    <div className={styles.filterContainer}>
      <label htmlFor="tenant-filter">Filter by Tenant:</label>
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
    </div>
  );
};

export default TenantFilter;
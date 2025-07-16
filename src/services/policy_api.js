import apiClient from './apiClient';
const SYNC_API_PREFIX = '/sync/';
// Make sure this prefix matches the one in your main_api.py.
// If your main_api.py has `prefix="/api/policies"`, this should be "/api/policies/".
const POLICY_API_PREFIX = '/policies/'; 

// This function gets the main list of policies for an asset. It is correct.
export const getPoliciesByAssetId = (assetId) => {
  return apiClient.get(POLICY_API_PREFIX, {
    params: { resource_acronis_id: assetId }
  });
};

/**
 * --- THIS IS THE NEW FUNCTION TO ADD ---
 * Fetches the enriched details (including latest event) for a SINGLE policy.
 * @param {string} policyId - The `policy_acronis_id` of the policy.
 * @param {string} assetId - The UUID of the asset.
 */
export const getEnrichedPolicyDetails = (policyId, assetId) => {
  // This constructs the URL like: /api/policies/some-uuid/with-latest-event
  // This now perfectly matches your FastAPI router.
 return apiClient.get(`${POLICY_API_PREFIX}${policyId}/with-latest-event`, {
    params: {
      // This key MUST match the query parameter name in your FastAPI endpoint
      asset_id: assetId
    }
  });
};
 
export const getAllPolicies = () => {
  return apiClient.get(POLICY_API_PREFIX, {
    params: {
      limit: 1000
    }
  });
};
/**
 * Fetches the consumption overview for policies.
 * @param {string} tenantUuid - The UUID of the tenant, or 'all'.
 * @returns Promise
 */
export const getPolicyOverview = (tenantUuid) => {
  const params = {};
  
  // This logic is perfect. If tenantUuid is 'all', params remains empty.
  // The backend sees no tenant_uuid parameter and fetches data for everyone.
  if (tenantUuid && tenantUuid !== 'all') {
    params.tenant_uuid = tenantUuid;
  }
  
  // This single API call now handles everything.
  return apiClient.get(`${POLICY_API_PREFIX}overview`, { params });
};
export const getUnassignedPolicyCount = (tenantUuid) => {
  const params = {};
  if (tenantUuid && tenantUuid !== 'all') {
    params.tenant_uuid = tenantUuid;
  }
  // Calls the new, dedicated endpoint
  return apiClient.get(`${POLICY_API_PREFIX}unassigned-count`, { params });
};
/**
 * Fetches a paginated and filtered list of policies for a specific tenant.
 * @param {string} tenantUuid The UUID of the tenant.
 * @param {string} period The time filter ('7d', '14d', etc.) or null.
 * @param {number} page The current page number (e.g., 1).
 * @param {number} limit The number of items per page.
 */
export const getPoliciesForTenant = (tenantUuid, period, page, limit) => {
  const params = {
    skip: (page - 1) * limit,
    limit: limit
  };
  
  if (period && period !== 'all') {
    params.period = period;
  }
  
  // This will call the new endpoint, e.g., /policies/tenant/some-uuid
  return apiClient.get(`${POLICY_API_PREFIX}tenant/${tenantUuid}`, { params });
};
export const syncPolicies = () => {
  return apiClient.post(`${SYNC_API_PREFIX}policies`);
};
export const getPoliciesForExport = (tenantUuid, period) => {
  const params = {};
  if (period && period !== 'all') {
    params.period = period;
  }
  // Calls the new backend endpoint
  return apiClient.get(`/policies/tenant/${tenantUuid}/export`, { params });
};

/**
 * Fetches a paginated and filtered list of REVOKED policies for a tenant.
 * @param {string} tenantUuid The UUID of the tenant.
 * @param {string} period The time filter ('7d', '14d', etc.).
 * @param {number} page The current page number.
 * @param {number} limit The number of items per page.
 */
export const getRevokedPoliciesForTenant = (tenantUuid, period, page, limit) => {
  const params = {
    skip: (page - 1) * limit,
    limit: limit,
  };

  if (period && period !== 'all') {
    params.period = period;
  }

  // Calls the new backend endpoint: /policies/tenant/{uuid}/revoked
  return apiClient.get(`/policies/tenant/${tenantUuid}/revoked`, { params });
};
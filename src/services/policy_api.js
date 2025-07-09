import apiClient from './apiClient';

// Make sure this prefix matches the one in your main_api.py.
// If your main_api.py has `prefix="/api/policies"`, this should be "/api/policies/".
const POLICY_API_PREFIX = '/policies/'; 
const SYNC_API_PREFIX = '/sync/';

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
 
  return apiClient.get(`${POLICY_API_PREFIX}unassigned-count`, { params });
};

export const syncPolicies = () => {
  return apiClient.post(`${SYNC_API_PREFIX}policies`);
};
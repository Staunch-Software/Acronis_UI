import apiClient from './apiClient';

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
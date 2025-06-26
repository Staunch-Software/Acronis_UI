import apiClient from './apiClient';

// The prefix for your policy router in main_api.py
const POLICY_API_PREFIX = '/policies/';

/**
 * --- THIS IS THE FUNCTION WE WILL USE ---
 * Fetches policies by the agent's ASSET ID. This corresponds to the
 * `resource_acronis_id` query parameter in your FastAPI endpoint.
 *
 * @param {string} assetId - The `asset_id` from an agent object.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getPoliciesByAssetId = (assetId) => {
  return apiClient.get(POLICY_API_PREFIX, {
    params: {
      // This key MUST match the query parameter name in your routers/policy.py
      resource_acronis_id: assetId,
    }
  });
};
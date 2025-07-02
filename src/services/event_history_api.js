import apiClient from './apiClient';

// Ensure this prefix matches what's in your main_api.py file.
// For example: app.include_router(event_history.router, prefix="/api/event-history", ...)
const EVENT_HISTORY_API_PREFIX = '/event-history/';

/**
 * Fetches the event history log for a specific policy on a specific asset.
 * This function makes a GET request to the root of the event history router
 * and passes the IDs as query parameters.
 * @param {string} policyId - The policy's UUID.
 * @param {string} assetId - The asset's UUID.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getEventHistoryForPolicyOnAsset = (policyId, assetId) => {
  // THIS IS THE CORRECT API CALL.
  // It sends a GET request to "/api/event-history/"
  // and adds the parameters to the URL like "?policy_id=...&asset_id=..."
  return apiClient.get(EVENT_HISTORY_API_PREFIX, {
    params: {
      policy_id: policyId,
      asset_id: assetId
    }
  });
};
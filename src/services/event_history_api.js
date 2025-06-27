import apiClient from './apiClient';

// Make sure this prefix matches what you have in your main_api.py
const EVENT_HISTORY_API_PREFIX = '/event-history/';

/**
 * Fetches the event history log for a specific policy on a specific asset.
 * @param {string} policyId - The policy's UUID.
 * @param {string} assetId - The asset's UUID.
 */
export const getEventHistoryForPolicyOnAsset = (policyId, assetId) => {
  return apiClient.get(EVENT_HISTORY_API_PREFIX, {
    params: {
      policy_id: policyId,
      asset_id: assetId
    }
  });
};
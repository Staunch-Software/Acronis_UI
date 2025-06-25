import apiClient from './apiClient';

const POLICY_API_PREFIX = '/policies/'; // Make sure this matches your main_api.py prefix

/**
 * Fetches a list of policies filtered by the agent's UUID.
 * Corresponds to your `handle_read_policy_records` endpoint.
 * @param {string} agentId - The UUID of the agent.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getPoliciesByAgent = (agentId) => {
  return apiClient.get(POLICY_API_PREFIX, {
    params: {
      agent_id: agentId,
    }
  });
};

// You can add other policy-related functions here later
import apiClient from './apiClient';

const AGENT_API_PREFIX = '/agents/'; // Make sure your main_api.py uses this prefix

/**
 * Fetches a list of agents filtered by their parent tenant's UUID.
 * Corresponds to your `handle_read_agents` endpoint with a query parameter.
 * @param {string} tenantUuid - The UUID of the parent tenant.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getAgentsByTenant = (tenantUuid) => {
  return apiClient.get(AGENT_API_PREFIX, {
    params: {
      tenant_uuid: tenantUuid,
    }
  });
};

// You can add other agent-related functions here later
// export const getAgentById = (agentId) => { ... };
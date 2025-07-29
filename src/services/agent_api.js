import apiClient from './apiClient';
import { fetchAllPaginated } from './api_helpers.js';
const AGENT_API_PREFIX = '/agents/';
const SYNC_API_PREFIX = '/sync/';

/**
 * Fetches a PAGINATED list of agents filtered by their parent tenant's UUID.
 * Used by AgentListPage.
 * @param {string} tenantUuid - The UUID of the parent tenant.
 * @param {number} limit - The number of agents to fetch.
 * @param {number} skip - The number of agents to skip.
 * @returns {Promise<axios.AxiosResponse<{items: any[], total: number}>>}
 */
export const getAgentsByTenantPaginated = (tenantUuid, limit, skip) => {
  return apiClient.get(AGENT_API_PREFIX, {
    params: {
      tenant_uuid: tenantUuid,
      limit: limit,
      skip: skip,
    }
  });
};


/**

 * @param {string} tenantUuid - The UUID of the parent tenant.
 * @returns {Promise<axios.AxiosResponse<{items: any[], total: number}>>}
 */
export const getAllAgentsByTenant = (tenantUuid) => {
  return apiClient.get(AGENT_API_PREFIX, {
    params: {
      tenant_uuid: tenantUuid,
      limit: 1000, // Request a large number to get all agents
      skip: 0,
    }
  });
};


export const getAllAgents = () => {
  // We simply call our powerful helper with the agents' endpoint.
  // It handles all the looping and page requests for us.
  return fetchAllPaginated(AGENT_API_PREFIX);
};

export const syncAgents = () => {
  return apiClient.post(`${SYNC_API_PREFIX}agents`);
};

/**
 * Triggers the fast, daily delta sync for agent statuses.
 * @param {object} payload - The request body, e.g., {} or { target_date: 'YYYY-MM-DD' }.
 * @returns {Promise<axios.AxiosResponse>} The Axios response from the API.
 */
export const syncAgentUpdates = (payload) => {
  // Pass the payload as the second argument to apiClient.post.
  // This sends the JSON body to the FastAPI backend.
  return apiClient.post(`${SYNC_API_PREFIX}agent-updates`, payload);
};
export const getAgentOverview = (tenantUuid) => {
  const params = {};
  if (tenantUuid && tenantUuid !== 'all') {
    params.tenant_uuid = tenantUuid;
  }
  // This calls the new GET /agents/overview endpoint
  return apiClient.get(`${AGENT_API_PREFIX}overview`, { params });
};
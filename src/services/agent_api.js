import apiClient from './apiClient';

const AGENT_API_PREFIX = '/agents/';

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
 * --- THIS IS THE NEW FUNCTION ---
 * Fetches ALL agents for a given tenant by requesting a very high limit.
 * Used by AgentDetailModal.
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
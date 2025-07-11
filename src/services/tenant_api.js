import apiClient from './apiClient'; // <-- Import the configured axios instance
import { fetchAllPaginated } from './api_helpers.js';
const SYNC_API_PREFIX = '/sync/';
const TENANT_API_PREFIX = '/tenants/'; // Adjust if your prefix is different in your main FastAPI router

/**
 * Fetches a paginated list of all tenants.
 * Corresponds to: `handle_read_tenants` (GET /)
 * @param {number} skip - Number of records to skip for pagination.
 * @param {number} limit - Maximum number of records to return.
 * @returns {Promise<axios.AxiosResponse<any>>} The axios response promise.
 */
export const getTenants = (skip = 0, limit = 100) => {
  return apiClient.get(TENANT_API_PREFIX, {
    params: { skip, limit }
  });
};

/**
 * Fetches a single tenant by its unique UUID.
 * Corresponds to: `handle_read_one_tenant` (GET /{tenant_uuid_in_path})
 * @param {string} tenantUuid - The UUID of the tenant to fetch.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getTenantByUuid = (tenantUuid) => {
  return apiClient.get(`${TENANT_API_PREFIX}/${tenantUuid}`);
};

/**
 * Creates a new tenant.
 * Corresponds to: `handle_create_tenant` (POST /)
 * @param {object} tenantData - The tenant data payload matching your `tenant_schema.TenantCreate`.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const createTenant = (tenantData) => {
  return apiClient.post(TENANT_API_PREFIX, tenantData);
};

/**
 * Updates an existing tenant by its UUID.
 * Corresponds to: `handle_update_tenant` (PUT /{tenant_uuid_in_path})
 * @param {string} tenantUuid - The UUID of the tenant to update.
 * @param {object} updateData - The payload with the fields to update, matching `tenant_schema.TenantUpdate`.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const updateTenant = (tenantUuid, updateData) => {
  return apiClient.put(`${TENANT_API_PREFIX}/${tenantUuid}`, updateData);
};

/**
 * Deletes a tenant by its UUID.
 * Corresponds to: `handle_delete_tenant` (DELETE /{tenant_uuid_in_path})
 * @param {string} tenantUuid - The UUID of the tenant to delete.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const deleteTenant = (tenantUuid) => {
  return apiClient.delete(`${TENANT_API_PREFIX}/${tenantUuid}`);
};

/**
 * Fetches ALL tenants by handling pagination automatically.
 * This is the primary function for getting tenant data for display.
 * @returns {Promise<any[]>} A promise that resolves to an array of all tenant objects.
 */
export const getAllTenants = () => {
  return fetchAllPaginated(TENANT_API_PREFIX);
};

/**
 * Queues a background job to sync all tenants from the Acronis cloud.
 * Corresponds to POST /sync/tenants
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const syncTenants = () => {
  return apiClient.post(`${SYNC_API_PREFIX}tenants`);
};

export const getTenantDetails = (tenantUuid) => {
  // This assumes your tenant router has a GET endpoint like `/tenants/{tenant_uuid}`
  return apiClient.get(`/tenants/${tenantUuid}`); 
};
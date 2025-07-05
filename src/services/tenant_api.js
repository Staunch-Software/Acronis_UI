import apiClient from './apiClient'; // <-- Import the configured axios instance
import { fetchAllPaginated } from './api_helpers.js';
// Define the API prefix for the tenant resource.
// This is the part of the URL that comes after the base URL.
// Example: http://localhost:8000/api/tenants
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
export const getAllTenants = () => {
  // Just call the helper with the correct endpoint
  return fetchAllPaginated(TENANT_API_PREFIX);
};
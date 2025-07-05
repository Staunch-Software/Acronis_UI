import apiClient from './apiClient';

/**
 * A helper function to fetch ALL items from a paginated FastAPI endpoint.
 * It repeatedly calls the endpoint, incrementing the 'skip' parameter,
 * until no more new items are returned in a page.
 *
 * @param {string} endpoint - The API endpoint to fetch from (e.g., '/api/agents/').
 * @param {number} [pageSize=100] - The number of items to fetch per API call.
 * @returns {Promise<Array<any>>} - A promise that resolves to a single flat array of all items.
 */
export const fetchAllPaginated = async (endpoint, pageSize = 100) => {
  let allItems = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await apiClient.get(endpoint, {
        params: {
          skip: skip,
          limit: pageSize,
        },
      });

      // This logic handles both kinds of API responses:
      // 1. An object like { items: [], total: x } (for your agents)
      // 2. A direct array `[]` (for your tenants)
      const items = Array.isArray(response.data) ? response.data : response.data.items;

      // Check if the API returned a valid array with items in it
      if (items && Array.isArray(items) && items.length > 0) {
        allItems = [...allItems, ...items];
        skip += pageSize;

        // If the number of items returned is less than the page size, it's the last page.
        if (items.length < pageSize) {
          hasMore = false;
        }
      } else {
        // If the API returns an empty array or no items, we're done.
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching paginated data from ${endpoint}:`, error);
      // Stop fetching if an error occurs to prevent an infinite loop
      hasMore = false;
      throw error; // Re-throw the error so the calling component can handle it
    }
  }

  return allItems;
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../pages/PolicyListPage.module.css'; // Reuses styles from the parent page
import { getEnrichedPolicyDetails } from '../services/policy_api.js';

const PolicyRow = ({ policy, activeColumns, assetId, assetName }) => {
  const [enrichedData, setEnrichedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Guard clause to prevent API calls without necessary IDs
    if (!policy.policy_acronis_id || !assetId) {
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getEnrichedPolicyDetails(policy.policy_acronis_id, assetId);
        setEnrichedData(response.data);
      } catch (error) {
        console.error("Failed to fetch enriched details for policy:", policy.policy_acronis_id, error);
        // Set a fallback state on error so the row still renders something meaningful
        setEnrichedData({ ...policy, latest_event_type_name: 'Error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [policy.policy_acronis_id, assetId]); // Re-run if props change

  // Determine which data object to use for rendering
  const displayData = enrichedData || policy;

  return (
    // This uses React.Fragment to avoid adding extra divs to the DOM,
    // allowing the cells to be direct children of the CSS Grid layout.
    <React.Fragment>
      {activeColumns.map(col => (
        <div key={col.id} className={styles.gridCell}>
          {(() => {
            // Use a self-invoking function for cleaner conditional rendering
            if (isLoading && col.id === 'latest_event_type_name') {
              return <span className={styles.loadingText}>Loading...</span>;
            }

            switch (col.id) {
              case 'policy_enabled':
                return (
                  <span className={`${styles.status} ${displayData.policy_enabled ? styles.active : styles.inactive}`}>
                    {displayData.policy_enabled ? 'Yes' : 'No'}
                  </span>
                );
              case 'policy_created_at':
              case 'policy_updated_at':
                return displayData[col.id] ? new Date(displayData[col.id]).toLocaleString() : 'N/A';
              default:
                return displayData[col.id] || 'N/A';
            }
          })()}
        </div>
      ))}
      <div className={styles.gridCell}>
        <Link
          to={`/app/assets/${assetId}/policies/${policy.policy_acronis_id}/log`}
          state={{ assetName: assetName, policyName: displayData.policy_name }}
          className={styles.actionButton}
        >
          View Log
        </Link>
      </div>
    </React.Fragment>
  );
};

export default PolicyRow;
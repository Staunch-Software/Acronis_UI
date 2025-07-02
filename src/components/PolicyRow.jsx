import React, { useState, useEffect } from 'react';
import styles from '../pages/PolicyListPage.module.css'; // We reuse the styles
import { getEnrichedPolicyDetails } from '../services/policy_api.js';
import { Link } from 'react-router-dom';
const PolicyRow = ({ policy, activeColumns, assetId, assetName }) => {
  const [enrichedData, setEnrichedData] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!policy.policy_acronis_id || !assetId) return; // Guard clause
      try {
        // --- Pass both IDs to the API call ---
        const response = await getEnrichedPolicyDetails(policy.policy_acronis_id, assetId);
        setEnrichedData(response.data);
      } catch (error) {
        console.error("Failed to fetch enriched details for policy:", policy.policy_acronis_id, error);
        setEnrichedData({ ...policy, latest_event_type_name: 'Error' });
      }
    };
    fetchDetails();
  }, [policy.policy_acronis_id, assetId]);

  // Show a loading state for the "Last Event" column while fetching
  if (!enrichedData) {
    return (
      <React.Fragment>
        {activeColumns.map(col => (
          <div key={col.id} className={styles.gridCell}>
            {col.id === 'latest_event_type_name' ? 'Loading...' : (policy[col.id] || 'N/A')}
          </div>
        ))}
        <div className={styles.gridCell}>
          <button className={styles.actionButton} disabled>View</button>
        </div>
      </React.Fragment>
    );
  }

  // Render the full row with all data
  return (
    <React.Fragment>
      {activeColumns.map(col => (
        <div key={col.id} className={styles.gridCell}>
          {col.id === 'policy_enabled' ? (
            <span className={`${styles.status} ${enrichedData.policy_enabled ? styles.active : styles.inactive}`}>
              {enrichedData.policy_enabled ? 'Yes' : 'No'}
            </span>
          ) : (col.id === 'policy_created_at' || col.id === 'policy_updated_at') ? (
            enrichedData[col.id] ? new Date(enrichedData[col.id]).toLocaleString() : 'N/A'
          ) : (
            enrichedData[col.id] || 'N/A'
          )}
        </div>
      ))}
      <div className={styles.gridCell}>
        <Link
          to={`/app/assets/${assetId}/policies/${policy.policy_acronis_id}/log`}
          state={{ assetName: assetName, policyName: policy.policy_name }}
          className={styles.actionButton}
        >
          View Log
        </Link>  </div>
    </React.Fragment>
  );
};

export default PolicyRow;
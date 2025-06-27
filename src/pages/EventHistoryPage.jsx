import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './EventHistoryPage.module.css';
import { FaArrowLeft } from 'react-icons/fa';
import { getEventHistoryForPolicyOnAsset } from '../services/event_history_api.js';

const EventHistoryPage = () => {
  const { assetId, policyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const assetName = location.state?.assetName || `Asset (${assetId ? assetId.substring(0, 8) : ''}...)`;
  const policyName = location.state?.policyName || `Policy (${policyId ? policyId.substring(0, 8) : ''}...)`;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assetId || !policyId) return;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await getEventHistoryForPolicyOnAsset(policyId, assetId);
        setHistory(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching event history:", err);
        setError("Could not load event history log.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [assetId, policyId]);

  if (loading) return <div className={styles.centeredMessage}>Loading Event Log...</div>;
  if (error) return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.historyPage}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <FaArrowLeft />
          </button>
          <div className={styles.headerText}>
            <h1>Event Log for: <span>{policyName}</span></h1>
            <h2>On Asset: {assetName}</h2>
          </div>
        </div>
      </header>
      <div className={styles.logContainer}>
        {history.length > 0 ? (
          history.map(log => (
            <div key={log.event_id} className={styles.logEntry}>
              <div className={styles.logTimestamp}>{new Date(log.created_on).toLocaleString()}</div>
              <div className={styles.logDetails}>
                <span className={styles.logType}>{log.event_type_name || 'Event'}</span>
                <p className={styles.logTitle}>{log.raw_event_title || 'No details available.'}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.centeredMessage}>No event history found for this policy on this asset.</p>
        )}
      </div>
    </div>
  );
};

export default EventHistoryPage;
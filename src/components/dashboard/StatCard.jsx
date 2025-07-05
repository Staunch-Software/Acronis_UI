import React from 'react';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, subtext, icon }) => (
  <div className={styles.statCard}>
    <div className={styles.iconWrapper}>{icon}</div>
    <div className={styles.textWrapper}>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.value}>{value}</p>
      {subtext && <p className={styles.subtext}>{subtext}</p>}
    </div>
  </div>
);
export default StatCard;
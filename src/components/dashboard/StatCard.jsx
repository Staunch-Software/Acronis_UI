import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, subtext, icon, color = '#6366f1', trend }) => {
  const isPositiveTrend = trend && trend.startsWith('+');
  
  return (
    <div className={styles.statCard}>
      <div className={styles.cardBackground}></div>
      
      <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
        {icon}
      </div>
      
      <div className={styles.textWrapper}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.value}>{value}</p>
        
        <div className={styles.bottomRow}>
          {subtext && <p className={styles.subtext}>{subtext}</p>}
          {trend && (
            <div className={`${styles.trendIndicator} ${isPositiveTrend ? styles.positive : styles.negative}`}>
              {isPositiveTrend ? <FaArrowUp /> : <FaArrowDown />}
              <span>{trend}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.sparkline}>
        <svg width="60" height="30" viewBox="0 0 60 30">
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
          <path
            d="M0,25 Q15,15 30,20 T60,10"
            fill="none"
            stroke={`url(#gradient-${title})`}
            strokeWidth="2"
            className={styles.sparkPath}
          />
        </svg>
      </div>
    </div>
  );
};

export default StatCard;
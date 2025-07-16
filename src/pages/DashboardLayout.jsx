import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import styles from './DashboardLayout.module.css';
import { FaBars } from 'react-icons/fa';

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
console.log("Sidebar Open:", isSidebarOpen);
  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile toggle button */}
      <button className={styles.toggleButton} onClick={() => setSidebarOpen(prev => !prev)}>
        <FaBars />
      </button>

      <Sidebar isOpen={isSidebarOpen} />

      <main className={`${styles.mainContent} ${isSidebarOpen ? styles.shifted : ''}`}>

        <Outlet />
      </main>
       {/* --- ADD THIS DIV --- */}
      {/* This is the target container for our flyout panel portal */}
      <div id="flyout-portal-root"></div>
    </div>
  );
};

export default DashboardLayout;

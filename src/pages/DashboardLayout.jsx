import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet is a placeholder for the child page
import Sidebar from '../components/Sidebar.jsx'; // We will create this next
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        {/* The current page (Clients, Agents, etc.) will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
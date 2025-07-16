// src/components/Sidebar.jsx (Your code with the two requested fixes)

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FaUsers, FaChartPie, FaCubes, FaCog, FaChevronRight, FaBuilding, FaThList, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllTenants } from '../services/tenant_api.js';

// FlyoutPanel Component (using Portal) - No changes needed here
const FlyoutPanel = ({ isOpen, customers, searchTerm, onSearch, onMouseEvents }) => {
  if (!isOpen) return null;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return createPortal(
    <div
      className={`${styles.flyoutPanel} ${isOpen ? styles.flyoutOpen : ''}`}
      onMouseEnter={onMouseEvents.onMouseEnter}
      onMouseLeave={onMouseEvents.onMouseLeave}
    >
      <div className={styles.flyoutHeader}>Customers</div>
      <div className={styles.searchContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search customers..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <ul className={styles.flyoutList}>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <li key={customer.tenant_uuid}>
              <NavLink
                to={`/app/consumption/customer/${customer.tenant_uuid}`}
                className={({ isActive }) => `${styles.flyoutLink} ${isActive ? styles.active : ''}`}
              >
                <FaBuilding className={styles.flyoutIcon} />
                <span>{customer.name}</span>
              </NavLink>
            </li>
          ))
        ) : (
          <li className={styles.noResults}>No customers found.</li>
        )}
      </ul>
    </div>,
    document.getElementById('flyout-portal-root')
  );
};

// Main Sidebar Component
const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const hoverTimeoutRef = useRef(null);

  const isConsumptionSectionActive = location.pathname.startsWith('/app/consumption');

  useEffect(() => {
    setIsFlyoutOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchCustomersForMenu = async () => {
      try {
        const tenantData = await getAllTenants();
        setCustomers(tenantData);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };
    fetchCustomersForMenu();
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsFlyoutOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFlyoutOpen(false);
    }, 200);
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logoContainer}>
          <NavLink to="/app/clients" className={styles.logoLink}>Acronis</NavLink>
        </div>
        <nav className={styles.nav}>
          <ul className={styles.navList}>

            <li className={styles.navItem}>
              <NavLink to="/app/clients" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                <FaUsers className={styles.navIcon} /><span>Clients</span>
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/app/consumption"
                end
                className={({ isActive }) => `${styles.navLink} ${isActive || (isConsumptionSectionActive && !isActive) ? styles.activeParentLink : ''}`}
              >
                <FaChartPie className={styles.navIcon} /><span>Consumption</span>
              </NavLink>
            </li>

            <li
              className={styles.navItem}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* --- FIX 1: Icon Visibility --- */}
              {/* Removed the 'styles.subLink' class to fix the alignment and make the icon visible. */}
              <button className={`${styles.navLink} ${isFlyoutOpen ? styles.active : ''}`}>
                <FaThList className={`${styles.navIcon} ${styles.customerwiseIcon}`} />

                <span>customerwise</span>
                <FaChevronRight className={styles.chevron} />
              </button>
            </li>

            <li className={styles.navItem}>
              <NavLink to="/app/policies" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                <FaCubes className={styles.navIcon} /><span>Policies</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink to="/app/settings" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                <FaCog className={styles.navIcon} /><span>Settings</span>
              </NavLink>
            </li>

          </ul>
        </nav>
        <div className={styles.footer}>
          <button onClick={logout} className={styles.logoutButton}>Logout</button>
        </div>
      </aside>

      <FlyoutPanel
        isOpen={isFlyoutOpen}
        customers={customers}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onMouseEvents={{ onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }}
      />
    </>
  );
};

export default Sidebar;
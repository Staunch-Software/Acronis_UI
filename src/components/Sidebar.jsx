// src/components/Sidebar.jsx (FIXED)

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { 
  FaUsers, 
  FaChartPie, 
  FaCubes, 
  FaCog, 
  FaChevronRight, 
  FaBuilding,
  FaThList
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllTenants } from '../services/tenant_api.js';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  
  // State to manage which dropdowns are open
  const [isConsumptionOpen, setIsConsumptionOpen] = useState(false);
  const [isCustomerwiseOpen, setIsCustomerwiseOpen] = useState(false);

  // Check if any customer route is active
  const isAnyCustomerActive = customers.some(customer => 
    location.pathname === `/app/consumption/${customer.tenant_uuid}`
  );

  // Auto-expand menus based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/app/consumption')) {
      setIsConsumptionOpen(true);
      
      // If we're on a specific customer page, also open the customerwise menu
      if (isAnyCustomerActive) {
        setIsCustomerwiseOpen(true);
      }
    } else {
      setIsConsumptionOpen(false);
      setIsCustomerwiseOpen(false);
    }
  }, [location.pathname, isAnyCustomerActive]);

  // Fetch tenants to build the dropdown menu
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

  // This function handles the special click on the main "Consumption" item
  const handleConsumptionClick = () => {
    navigate('/app/consumption'); // Navigate to the main dashboard
    setIsConsumptionOpen(prev => !prev); // Toggle the submenu
  };

  // Handle customerwise button click
  const handleCustomerwiseClick = () => {
    setIsCustomerwiseOpen(prev => !prev);
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logoContainer}>
        <NavLink to="/app/clients" className={styles.logoLink}>Acronis</NavLink>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {/* 1. Clients (Static Link) */}
          <li className={`${styles.navItem} ${location.pathname.startsWith('/app/clients') ? styles.active : ''}`}>
            <NavLink to="/app/clients" className={styles.navLink}>
              <FaUsers className={styles.navIcon} />
              <span>Clients</span>
            </NavLink>
          </li>

          {/* 2. Consumption (Hybrid Dropdown) */}
          <li className={`${styles.navItem} ${location.pathname.startsWith('/app/consumption') ? styles.activeParent : ''}`}>
            <button className={styles.navLink} onClick={handleConsumptionClick}>
              <FaChartPie className={styles.navIcon} />
              <span>Consumption</span>
              <FaChevronRight className={`${styles.chevron} ${isConsumptionOpen ? styles.open : ''}`} />
            </button>
            {isConsumptionOpen && (
              <ul className={styles.dropdownMenu}>
                <li className={styles.navItem}>
                  <button 
                    className={`${styles.navLink} ${styles.subLink} ${isCustomerwiseOpen || isAnyCustomerActive ? styles.activeSubMenu : ''}`} 
                    onClick={handleCustomerwiseClick}
                  >
                    <FaThList className={styles.navIcon} />
                    <span>customerwise</span>
                    <FaChevronRight className={`${styles.chevron} ${isCustomerwiseOpen ? styles.open : ''}`} />
                  </button>
                  {isCustomerwiseOpen && (
                    <ul className={`${styles.dropdownMenu} ${styles.nestedDropdown}`}>
                      {customers.map(customer => {
                        const customerPath = `/app/consumption/${customer.tenant_uuid}`;
                        const isActive = location.pathname === customerPath;
                        return (
                          <li key={customer.tenant_uuid} className={styles.nestedNavItem}>
                            <NavLink 
                              to={customerPath} 
                              className={`${styles.navLink} ${styles.subLink} ${styles.nestedSubLink} ${isActive ? styles.active : ''}`}
                            >
                              <FaBuilding className={styles.navIcon} />
                              <span>{customer.name}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </li>

          {/* 3. Policies (Static Link) */}
          <li className={`${styles.navItem} ${location.pathname.startsWith('/app/policies') ? styles.active : ''}`}>
            <NavLink to="/app/policies" className={styles.navLink}>
              <FaCubes className={styles.navIcon} />
              <span>Policies</span>
            </NavLink>
          </li>
          
          {/* 4. Settings (Static Link) */}
          <li className={`${styles.navItem} ${location.pathname.startsWith('/app/settings') ? styles.active : ''}`}>
            <NavLink to="/app/settings" className={styles.navLink}>
              <FaCog className={styles.navIcon} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className={styles.footer}>
        <button onClick={logout} className={styles.logoutButton}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
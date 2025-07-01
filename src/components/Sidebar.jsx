import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FaUsers, FaUserTie, FaCubes, FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';

// Define your navigation items here
const navItems = [
  { path: '/app/clients', label: 'Clients', Icon: FaUsers },
  { path: '/app/agents', label: 'Agents', Icon: FaUserTie },
  { path: '/app/resources', label: 'Resources', Icon: FaCubes },
  { path: '/app/settings', label: 'Settings', Icon: FaCog },
];

const Sidebar = ({ isOpen })  => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logoContainer}>
        <Link to="/app/clients" className={styles.logoLink}>
          Acronis
        </Link>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.label} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                <Link to={item.path} className={styles.navLink}>
                  <item.Icon className={styles.navIcon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={styles.footer}>
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
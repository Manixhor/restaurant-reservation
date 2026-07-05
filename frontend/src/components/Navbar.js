import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: '#fff',
  },
  brand: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: '#e0e0e0',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  button: {
    padding: '0.4rem 1rem',
    backgroundColor: 'transparent',
    color: '#e0e0e0',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Restaurant Reservations</Link>
      {user && (
        <div style={styles.links}>
          {user.role === 'customer' && (
            <Link to="/dashboard" style={styles.link}>My Reservations</Link>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/admin" style={styles.link}>Dashboard</Link>
              <Link to="/admin/tables" style={styles.link}>Manage Tables</Link>
            </>
          )}
          <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{user.name} ({user.role})</span>
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

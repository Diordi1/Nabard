import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LogoutButton: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // hide if not logged in

  const handleClick = () => {
    logout();
    // If already on home force re-render, else navigate
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Logout"
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 1000,
        background: '#ef4444',
        color: '#fff',
        border: 'none',
        padding: '6px 14px',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 14,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;

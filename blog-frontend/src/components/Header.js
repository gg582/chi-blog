// src/components/Header.js (Delete this file if you're embedding Header directly into App.js as a functional component, OR ensure it imports Link and useAuth)
// If you want Header to remain a separate component, it needs these imports:
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get auth state

/**
 * Header Component
 * This component provides a consistent header and navigation for the application.
 * It dynamically shows "New Post" and "Login/Logout" links based on user authentication status.
 */
function Header() {
  const { isAuthenticated, logout } = useAuth(); // Get authentication state and logout function

  return (
    <header style={{
      position: 'fixed', // Fixed header stays at the top
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#333',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      fontSize: '1.1rem',
      zIndex: 1000, // Ensure header is on top
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Optional: add a subtle shadow
    }}>
      <div style={{ fontWeight: 'bold' }}>Linuxer&apos;s Blog</div>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex' }}>
          <li style={{ marginRight: '15px' }}><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
          <li style={{ marginRight: '15px' }}><Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About</Link></li>
          <li style={{ marginRight: '15px' }}><Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</Link></li>

          {/* Conditional rendering: Show "New Post" only if authenticated */}
          {isAuthenticated && (
            <li style={{ marginRight: '15px' }}><Link to="/new-post" style={{ color: 'white', textDecoration: 'none' }}>New Post</Link></li>
          )}

          {/* Conditional rendering: Show "Logout" if authenticated, "Login" otherwise */}
          {isAuthenticated ? (
            <li style={{ marginRight: '15px' }}>
              <button onClick={logout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '1em' }}>
                Logout
              </button>
            </li>
          ) : (
            <li style={{ marginRight: '15px' }}><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;

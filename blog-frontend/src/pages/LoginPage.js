// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Header component with navigation menu
function Header() {
  return (
    <header style={{
      position: 'fixed',
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
      zIndex: 1000,
      justifyContent: 'space-between',
    }}>
      <div style={{ fontWeight: 'bold' }}>My Blog</div>
      <nav>
        <Link to="/" style={navLinkStyle}>Home</Link>
        <Link to="/about" style={navLinkStyle}>About</Link>
        <Link to="/contact" style={navLinkStyle}>Contact</Link>
      </nav>
    </header>
  );
}
const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  marginLeft: '20px',
  fontWeight: 'normal',
};



function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // For displaying login messages
  const navigate = useNavigate(); // For programmatic navigation

  /**
   * Handles the login form submission.
   * Sends the username and password to the backend for authentication.
   * On success, navigates to the NewPostPage.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setMessage(''); // Clear any previous messages

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indicate JSON payload
        },
        body: JSON.stringify({ username, password }), // Send username and password as JSON
      });

      // Check if the response status is 200 OK (or 202 Accepted if backend truly uses it)
      // For a successful login, 200 OK is the standard.
      if (response.ok) { // response.ok checks for status in the 200-299 range
        const data = await response.json();
        setMessage(data.message || 'Login successful!');
        // In a real application, you would save an authentication token (e.g., JWT) here.
        // For example: localStorage.setItem('authToken', data.token);

        // Redirect to the NewPostPage upon successful login
        navigate('/new-post');
      } else {
        // If login failed, parse the error message from the backend
        const errorData = await response.json();
        setMessage(`Login failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      // Handle network errors (e.g., backend server not running)
      setMessage(`Network error: ${error.message}. Please check if the backend server is running.`);
      console.error('Login fetch error:', error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>{message}</p>}
    </div>
  );
}

export default LoginPage;

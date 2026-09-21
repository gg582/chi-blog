// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from "../config/api";

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const loginData = { username, password };

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Login successful!');
        login('some_auth_token_from_backend');
        localStorage.setItem('authToken', 'true');
        navigate('/new-post');
      } else {
        const errorData = await response.json();
        setMessage(`Login failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setMessage(`Network error: ${error.message}. Please check if the backend server is running.`);
      console.error('Login fetch error:', error);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Log In
          </button>
        </form>
        {message && (
          <p className={`login-message ${message.includes('failed') || message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

export default LoginPage;

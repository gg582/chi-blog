// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';

// Create a new React Context. This context will provide the authentication state
// and functions (login, logout) to any component that consumes it.
// 'null' is the default value for the context before a provider is rendered.
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * This component is a Context Provider. It wraps parts of your application (typically the root 'App' component)
 * to make the authentication state and related functions available to all its child components.
 * It manages the 'isAuthenticated' state.
 */
export const AuthProvider = ({ children }) => {
  // Initialize the 'isAuthenticated' state.
  // It checks if an 'authToken' exists in localStorage upon component mounting.
  // This helps maintain login status across page reloads.
  // NOTE: Storing sensitive tokens directly in localStorage can be vulnerable to XSS attacks.
  // For production-grade applications, consider using HttpOnly cookies.
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  /**
   * Logs the user in by setting an authentication token in localStorage
   * and updating the 'isAuthenticated' state to true.
   * @param {string} token - The authentication token received from the backend (e.g., JWT).
   * (For this example, it's a placeholder string).
   */
  const login = (token) => {
    localStorage.setItem('authToken', token); // Store the token. Replace 'token' with actual token if applicable.
    setIsAuthenticated(true); // Set authentication status to true
  };

  /**
   * Logs the user out by removing the authentication token from localStorage
   * and updating the 'isAuthenticated' state to false.
   */
  const logout = () => {
    localStorage.removeItem('authToken'); // Remove the stored token
    setIsAuthenticated(false); // Set authentication status to false
  };

  // The value prop of the Provider makes 'isAuthenticated', 'login', and 'logout'
  // available to any descendant component that calls 'useAuth()'.
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children} {/* Render all child components */}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * This custom hook provides a convenient way for any functional component to
 * consume the authentication context.
 * It returns the current authentication state and the login/logout functions.
 */
export const useAuth = () => {
  // Use the useContext hook to access the value provided by AuthContext.Provider.
  // If useAuth is called outside of an AuthProvider, it will receive the default context value (null),
  // which might lead to errors if not handled.
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

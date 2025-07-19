// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate component for redirection
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook to access authentication state

/**
 * ProtectedRoute Component
 * This component acts as a guard for routes that require authentication.
 * If the user is authenticated, it renders its child components (the protected content).
 * If not authenticated, it redirects the user to the login page.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components (the content to be protected).
 */
const ProtectedRoute = ({ children }) => {
  // Access the 'isAuthenticated' status from the AuthContext
  const { isAuthenticated } = useAuth();

  // If the user is NOT authenticated, redirect them to the '/login' page.
  // 'replace' prop ensures the login page replaces the current entry in the history stack,
  // preventing the user from navigating back to the protected page directly.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user IS authenticated, render the child components (the actual protected content).
  return children;
};

// Export the ProtectedRoute component as the default export.
export default ProtectedRoute;

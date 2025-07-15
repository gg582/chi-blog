import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Global styling for the application
import App from './App'; // The root component of the application

// Create a root to render the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component inside React.StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

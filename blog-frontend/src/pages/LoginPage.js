// src/pages/LoginPage.js

import React, { useState } from 'react'; // Import React and useState for managing component state
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import { useAuth } from '../context/AuthContext'; // Import useAuth hook from your AuthContext
import Header from '../components/Header'; // ★★★ Import the reusable Header component ★★★

/**
 * LoginPage Component
 * This component renders a login form where users can enter their username and password.
 * It includes a Header for consistent navigation and handles form submission,
 * communicates with the backend for authentication, updates global auth state,
 * and navigates upon successful login.
 */
function LoginPage() {
  const [username, setUsername] = useState(''); // State for the username input field
  const [password, setPassword] = useState(''); // State for the password input field
  const [message, setMessage] = useState(''); // State for displaying login messages (e.g., success, error)

  const navigate = useNavigate(); // Hook to programmatically change routes after login
  const { login } = useAuth(); // Access the login function from AuthContext

  /**
   * Handles the submission of the login form.
   * This asynchronous function prevents the default form submission (page reload),
   * sends authentication data to the backend, and processes the API response.
   * Based on the response, it updates the authentication state and navigates the user.
   * @param {Event} e - The form submission event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the browser from performing a full page reload
    setMessage(''); // Clear any previous login messages

    // Prepare the login data object to be sent as JSON to the backend
    const loginData = {
      username: username,
      password: password,
    };

    try {
      // Send a POST request to the backend's login API endpoint
      // NOTE: In a production environment, this URL MUST be HTTPS for security.
      const response = await fetch('https://hobbies.yoonjin2.kr:8080/api/login', {
        method: 'POST', // Use the POST HTTP method for login
        headers: {
          'Content-Type': 'application/json', // Inform the server that the request body is JSON
        },
        body: JSON.stringify(loginData), // Convert the JavaScript object to a JSON string
      });

      // Check if the HTTP response indicates success (status code in the 200-299 range).
      // Standard for successful login is 200 OK.
      // If your backend specifically returns 202 Accepted for login, adjust 'response.ok' to 'response.status === 202'.
      if (response.ok) {
        const data = await response.json(); // Parse the JSON response from the backend
        setMessage(data.message || 'Login successful!'); // Display the success message

        // Call the login function from AuthContext to update the global authentication state.
        // In a real app, 'data.token' (if backend provides a JWT) would be passed here.
        login('some_auth_token_from_backend'); // Placeholder token; replace with actual token if applicable
        localStorage.setItem('authToken', 'true'); // Temporarily using this for AuthProvider check

        // Redirect the user to the NewPostPage after successful login
        navigate('/new-post');
      } else {
        // If login failed, parse the error details from the backend response
        const errorData = await response.json();
        setMessage(`Login failed: ${errorData.message || response.statusText}`); // Display the error message
      }
    } catch (error) {
      // Catch any network-related errors (e.g., server not reachable, no internet)
      setMessage(`Network error: ${error.message}. Please check if the backend server is running.`);
      console.error('Login fetch error:', error); // Log the full error details for debugging
    }
  };

  return (
    // Fragment to hold both the Header and the main content div
    <>
      <Header /> {/* ★★★ Render the Header component here ★★★ */}
      {/* Main container for the login form with basic styling for centering and padding.
          Added paddingTop to account for the fixed header. */}
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', paddingTop: '80px' }}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          {/* Username input group */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Update username state on input change
              required // HTML5 validation: this field is required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} // Full width, padding, border-box sizing
            />
          </div>
          {/* Password input group */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password" // Input type 'password' masks the characters
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state on input change
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          {/* Submit button */}
          <button type="submit" style={{
            backgroundColor: '#007bff', // Blue background
            color: 'white',            // White text
            padding: '10px 20px',      // Padding
            border: 'none',            // No border
            borderRadius: '5px',       // Rounded corners
            cursor: 'pointer',         // Hand cursor on hover
          }}>
            Log In
          </button>
        </form>
        {/* Display login messages if present */}
        {message && (
          <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
            {message}
          </p>
        )}
      </div>
    </>
  );
}

// Export the LoginPage component as the default export of this file.
// This allows other files (like App.js) to import it easily using:
// `import LoginPage from './pages/LoginPage';` (without curly braces).
export default LoginPage;

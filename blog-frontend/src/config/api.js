const API_BASE_URL = process.env.REACT_APP_API_URL || "";

// Return the stored auth token, or null if not logged in.
export const getAuthToken = () => localStorage.getItem('authToken');

// Build request headers for authenticated calls.
// Merges any extra headers (e.g. Content-Type) and adds the Bearer token when one exists.
export const authHeaders = (extraHeaders = {}) => {
  const headers = { ...extraHeaders };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Handle a 401 response from a protected endpoint:
// clear the stored token and force a reload to /login so the AuthContext re-initializes logged out.
export const clearAuthAndRedirect = () => {
  localStorage.removeItem('authToken');
  window.location.assign('/login');
};

export default API_BASE_URL;

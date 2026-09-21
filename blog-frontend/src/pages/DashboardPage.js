import React, { useState, useEffect, useCallback } from 'react';
import './DashboardPage.css';
import API_BASE_URL, { authHeaders, clearAuthAndRedirect } from '../config/api';

// Format a byte count as KB or MB for display.
const formatSize = (bytes) => {
  if (typeof bytes !== 'number' || isNaN(bytes)) { return '-'; }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

function DashboardPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/files`, {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        clearAuthAndRedirect();
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFiles(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete file "${filename}"?`)) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete-file`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ filename }),
      });
      if (response.status === 401) {
        clearAuthAndRedirect();
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Refresh the list after a successful deletion.
      fetchFiles();
    } catch (e) {
      setError(e);
    }
  };

  return (
    <div className="dashboard-page">
      <main className="container">
        <h2 className="dashboard-title">Dashboard</h2>

        {error && (
          <div className="error-box">
            <p>{error.message}</p>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <p>No uploaded files found.</p>
          </div>
        ) : (
          <table className="files-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Modified</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name}>
                  <td className="file-name">{file.name}</td>
                  <td>{formatSize(file.size)}</td>
                  <td>{file.modifiedAt ? new Date(file.modifiedAt).toLocaleString() : '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="file-delete-btn"
                      onClick={() => handleDelete(file.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;

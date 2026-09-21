import React, { useEffect, useState } from 'react';
import './AboutPage.css';
import API_BASE_URL from "../config/api";

function AboutPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/about`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContent(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  if (loading) {
    return (
      <div className="about-page">
        <main className="container">
          <div className="loading-spinner">Loading About page...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="about-page">
        <main className="container">
          <div className="error-box">
            <h2>Error</h2>
            <p>{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="about-page">
      <main className="container">
        {content && content.title && <h1 className="about-title">{content.title}</h1>}
        {content && content.contentHtml && (
          <div className="about-content" dangerouslySetInnerHTML={{ __html: content.contentHtml }}></div>
        )}
        {!content && <p>About page content not found.</p>}
      </main>
    </div>
  );
}

export default AboutPage;

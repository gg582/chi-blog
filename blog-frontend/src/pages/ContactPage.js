import React, { useEffect, useState } from 'react';
import './ContactPage.css';
import API_BASE_URL from "../config/api";

function ContactPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact`);
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

    fetchContactContent();
  }, []);

  if (loading) {
    return (
      <div className="contact-page">
        <main className="container">
          <div className="loading-spinner">Loading Contact page...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contact-page">
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
    <div className="contact-page">
      <main className="container">
        {content && content.title && <h1 className="contact-title">{content.title}</h1>}
        {content && content.contentHtml && (
          <div className="contact-content" dangerouslySetInnerHTML={{ __html: content.contentHtml }}></div>
        )}
        {!content && <p>Contact page content not found.</p>}
      </main>
    </div>
  );
}

export default ContactPage;

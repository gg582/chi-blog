import React, { useEffect, useState } from 'react';
import Header from '../components/Header'; // Re-use the Header component
import './ContactPage.css'; // Styling for the Contact page

function ContactPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        // Fetch content from the /api/contact endpoint
        const response = await fetch('/api/contact');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the backend sends a JSON object with 'title' and 'contentHtml'
        setContent(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchContactContent();
  }, []); // Empty dependency array means this effect runs only once on mount

  if (loading) {
    return (
      <div className="contact-page">
        <Header />
        <main className="container">
          <p>Loading Contact page...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contact-page">
        <Header />
        <main className="container">
          <p>Error: {error.message}</p>
        </main>
      </div>
    );
  }

  // Render the Contact page content
  return (
    <div className="contact-page">
      <Header /> {/* Header is rendered once */}
      <main className="container">
        {/* Display the title, if available */}
        {content && content.title && <h1 className="contact-title">{content.title}</h1>}
        {/* Render the HTML content directly */}
        {content && content.contentHtml && (
          <div className="contact-content" dangerouslySetInnerHTML={{ __html: content.contentHtml }}></div>
        )}
        {!content && <p>Contact page content not found.</p>}
      </main>
    </div>
  );
}

export default ContactPage;

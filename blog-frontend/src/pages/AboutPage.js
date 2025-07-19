import React, { useEffect, useState } from 'react';
import Header from '../components/Header'; // Re-use the Header component
import './AboutPage.css'; // Styling for the About page

function AboutPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        // Fetch content from the /api/about endpoint
        const response = await fetch('http://hobbies.yoonjin2.kr:8080/api/about');
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

    fetchAboutContent();
  }, []); // Empty dependency array means this effect runs only once on mount

  if (loading) {
    return (
      <div className="about-page">
        <Header />
        <main className="container">
          <p>Loading About page...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="about-page">
        <Header />
        <main className="container">
          <p>Error: {error.message}</p>
        </main>
      </div>
    );
  }

  // Render the About page content
  return (
    <div className="about-page">
      <Header /> {/* Header is rendered once */}
      <main className="container">
        {/* Display the title, if available */}
        {content && content.title && <h1 className="about-title">{content.title}</h1>}
        {/* Render the HTML content directly */}
        {content && content.contentHtml && (
          <div className="about-content" dangerouslySetInnerHTML={{ __html: content.contentHtml }}></div>
        )}
        {!content && <p>About page content not found.</p>}
      </main>
    </div>
  );
}

export default AboutPage;

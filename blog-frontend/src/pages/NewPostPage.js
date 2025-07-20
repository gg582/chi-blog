// src/pages/NewPostPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Header component with navigation menu
function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#333',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      fontSize: '1.1rem',
      zIndex: 1000,
      justifyContent: 'space-between',
    }}>
      <div style={{ fontWeight: 'bold' }}>Lee Yunjin&apos;s Open Source Blog</div>
      <nav>
        <Link to="/" style={navLinkStyle}>Home</Link>
        <Link to="/about" style={navLinkStyle}>About</Link>
        <Link to="/contact" style={navLinkStyle}>Contact</Link>
      </nav>
    </header>
  );
}

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  marginLeft: '20px',
  fontWeight: 'normal',
};

function NewPostPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Create slug from title: lowercase, remove invalid characters, replace spaces with dashes
  const createSlug = (inputTitle) => {
    let slug = inputTitle.toLowerCase();
    slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, '');
    slug = slug.replace(/[\s-]+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');
    return slug || "untitled-post";
  };

  // Handle form submission to create a new post
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !author || !content) {
      setMessage('Please fill in all fields (Title, Author, Content).');
      return;
    }

    const postSlug = createSlug(title);
    if (!postSlug || postSlug === "untitled-post") {
      setMessage('The title is too generic or contains only invalid characters. Please use a more descriptive title.');
      return;
    }

    const backendUrl = `https://hobbies.yoonjin2.kr:8080/api/new-post/${encodeURIComponent(postSlug)}`;

    const postData = { title, author, content };

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const responseData = await response.json();
        setMessage(`Post "${responseData.id || postSlug}" submitted successfully!`);

        // Clear input fields after successful submission
        setTitle('');
        setAuthor('');
        setContent('');

        // Navigate back to home page
        navigate('/');
      } else {
        const errorData = await response.json();
        setMessage(`Error submitting post: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setMessage(`Network error: ${error.message}. Check if backend server is running.`);
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', paddingTop: '100px' }}>
        <h1>Create New Post</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="author" style={{ display: 'block', marginBottom: '5px' }}>Author:</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="content" style={{ display: 'block', marginBottom: '5px' }}>Content (Markdown):</label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows="15"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            ></textarea>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Submit Post
          </button>
        </form>

        {message && (
          <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
            {message}
          </p>
        )}
      </div>
    </>
  );
}

export default NewPostPage;


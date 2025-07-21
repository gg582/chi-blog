// ~/chi-blog/blog-frontend/src/pages/PostDetailPage.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import "./PostDetailPage.css"; // Ensure Monokai theme CSS is imported here or in a global CSS file

import hljs from "highlight.js"; // Import highlight.js library

function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect hook to fetch the post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch a single post from your Go Chi backend using its ID via POST method
        const response = await fetch(
          `https://hobbies.yoonjin2.kr:8080/api/posts/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Required for POST requests with a body
            },
            body: JSON.stringify({}), // Send an empty JSON object as the body
          },
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Post not found.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPost(data); // Set the fetched post data
      } catch (e) {
        setError(e); // Handle errors
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchPost();
  }, [id]); // Re-run effect if the 'id' parameter in the URL changes

  // --- START: New useEffect hook for highlight.js application ---
  // This hook runs after the component renders and 'post' data is available.
  useEffect(() => {
    // Check if post data and its HTML content are loaded
    if (post && post.contentHtml) {
      // highlight.js will find all <pre><code> blocks within the rendered HTML.
      // It automatically detects the language if no 'language-xyz' class is present,
      // or uses the specified class if it exists (e.g., from Blackfriday's output).
      hljs.highlightAll();
    }
  }, [post]); // Re-run this effect whenever the 'post' data changes (i.e., when a new post is loaded)
  // --- END: New useEffect hook for highlight.js application ---

  if (loading) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="container">
          <p>Loading post...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="container">
          <p>Error: {error.message}</p>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="container">
          <p>Post not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <Header /> {/* Header is rendered once */}
      <main className="container">
        <p className="post-detail-meta">
          Author: {post.author} | Date:{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        {/* Render the full HTML content of the post. */}
        {/* highlight.js will process the <pre><code> tags inside this div for highlighting. */}
        <div
          className="post-detail-content"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        ></div>
      </main>
    </div>
  );
}

export default PostDetailPage;

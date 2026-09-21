// ~/chi-blog/blog-frontend/src/pages/PostDetailPage.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PostDetailPage.css";
import API_BASE_URL from "../config/api";

function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!response.ok) {
          if (response.status === 404) { throw new Error("Post not found."); }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPost(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (window.hljs && post && post.contentHtml) {
      const postContentElement = document.querySelector('.post-detail-content');
      if (postContentElement) {
        postContentElement.querySelectorAll('pre code').forEach((block) => {
          if (!block.classList.contains('hljs')) {
            window.hljs.highlightElement(block);
          }
        });
      }
    }
  }, [post]);

  if (loading) {
    return (
      <div className="post-detail-page">
        <main className="container">
          <div className="loading-spinner">Loading post...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-page">
        <main className="container">
          <div className="error-box">
            <h2>Error</h2>
            <p>{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <main className="container">
          <div className="error-box">
            <p>Post not found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <main className="container">
        <h1 className="post-detail-title">{post.title}</h1>
        <p className="post-detail-meta">
          Author: {post.author} | Date:{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <div
          className="post-detail-content"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        ></div>
      </main>
    </div>
  );
}

export default PostDetailPage;

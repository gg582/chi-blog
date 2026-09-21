import React, { useEffect, useState } from "react";
import BlogPostCard from "../components/BlogPostCard";
import "./HomePage.css";
import API_BASE_URL from "../config/api";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <main className="container">
          <div className="loading-spinner">Loading posts...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <main className="container">
          <div className="error-box">
            <h2>Something went wrong</h2>
            <p>{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <main className="container">
        <h2 className="section-title">Latest Posts</h2>
        <div className="blog-posts-grid">
          {posts.length > 0 ? (
            posts.map((post) => <BlogPostCard key={post.id} post={post} />)
          ) : (
            <div className="empty-state">
              <p>No posts found. Be the first to write one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;

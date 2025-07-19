import React, { useEffect, useState } from 'react';
import Header from '../components/Header'; // Header component for navigation
import BlogPostCard from '../components/BlogPostCard'; // Card component for each blog post
import './HomePage.css'; // Styling for the home page

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to fetch posts when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch data from your Go Chi backend
        const response = await fetch('http://hobbies.yoonjin2.kr:8080/api/posts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data); // Update state with fetched posts
      } catch (e) {
        setError(e); // Set error state if fetch fails
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchPosts();
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  // Conditional rendering based on loading and error states
  if (loading) {
    return (
      <div className="home-page">
        <Header /> {/* Header is rendered once */}
        <main className="container">
          <p>Loading posts...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header /> {/* Header is rendered once */}
        <main className="container">
          <p>Error: {error.message}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header /> {/* Header is rendered once */}
      <main className="container">
        <h2 className="section-title">Latest Posts</h2>
        <div className="blog-posts-grid">
          {/* Render BlogPostCard for each post if posts array is not empty */}
          {posts.length > 0 ? (
            posts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))
          ) : (
            <p>No posts found. Be the first to write one!</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Hook to access URL parameters
import Header from '../components/Header'; // Re-use the Header component
import './PostDetailPage.css'; // Styling for the post detail page

function PostDetailPage() {
  const { id } = useParams(); // Get the 'id' from the URL (e.g., /posts/my-post-id)
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch a single post from your Go Chi backend using its ID
        const response = await fetch(`https://hobbies.yoonjin2.kr:8080/api/posts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found.');
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
          Author: {post.author} | Date: {new Date(post.createdAt).toLocaleDateString()}
        </p>
        {/* Render the full HTML content of the post */}
        <div className="post-detail-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }}></div>
      </main>
    </div>
  );
}

export default PostDetailPage;

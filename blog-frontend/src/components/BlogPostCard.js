import React from 'react';
import './BlogPostCard.css'; // Styling for the BlogPostCard component

function BlogPostCard({ post }) {
  return (
    <div className="blog-post-card">
      <p className="post-meta">
        {/* Display author and formatted creation date */}
        Author: {post.author} | Date: {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {/* Render the HTML content directly from the backend.
          WARNING: Using dangerouslySetInnerHTML can expose to XSS attacks if content is not trusted/sanitized.
          For production, consider a library like DOMPurify to sanitize post.contentHtml. */}
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }}></div>
      {/* Link to read the full post (not yet implemented) */}
      <a href={`/posts/${post.id}`} className="read-more">Read More</a>
    </div>
  );
}

export default BlogPostCard;

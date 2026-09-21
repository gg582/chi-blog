import React from 'react';
import { Link } from 'react-router-dom';
import './BlogPostCard.css';

function BlogPostCard({ post }) {
  return (
    <article className="blog-post-card">
      <h3 className="post-title">
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <p className="post-meta">
        Author: {post.author} | Date: {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }}></div>
      <Link to={`/posts/${post.id}`} className="read-more">Read More →</Link>
    </article>
  );
}

export default BlogPostCard;

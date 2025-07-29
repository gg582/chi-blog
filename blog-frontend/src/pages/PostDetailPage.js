// ~/chi-blog/blog-frontend/src/pages/PostDetailPage.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import "./PostDetailPage.css";

// No need to import hljs here; it's loaded via CDN in public/index.html.
// No need to import desktopLanguageDefinition; it's bundled in the CDN's highlight.min.js.

function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect hook: Fetches post data from the backend.
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `https://hobbies.yoonjin2.kr:8080/api/posts/${id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          },
        );
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

  // Effect hook: Applies Highlight.js after post HTML content is rendered.
  useEffect(() => {
    if (window.hljs) { // Check if window.hljs is available.
      // The 'desktop' language is already bundled in the CDN's highlight.min.js,
      // so explicit registration here is not needed.

      if (post && post.contentHtml) {
        // Highlight code blocks within the specific post content div.
        const postContentElement = document.querySelector('.post-detail-content');
        if (postContentElement) {
            postContentElement.querySelectorAll('pre code').forEach((block) => {
                if (!block.classList.contains('hljs')) { // Prevent re-highlighting already processed blocks.
                    window.hljs.highlightElement(block);
                }
            });
        }
      }
    }
  }, [post]);

  if (loading) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="container"> <p>Loading post...</p> </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="container"> <p>Error: {error.message}</p> </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="container"> <p>Post not found.</p> </main>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <Header />
      <main className="container">
        <p className="post-detail-meta">
          Author: {post.author} | Date:{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        {/* Renders post HTML content. Highlight.js will process code tags inside. */}
        <div
          className="post-detail-content"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        ></div>
      </main>
    </div>
  );
}

export default PostDetailPage;

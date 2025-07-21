// ~/chi-blog/blog-frontend/src/pages/NewPostPage.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link import added

// Header component (unchanged)
function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "#333",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        fontSize: "1.1rem",
        zIndex: 1000,
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: "bold" }}>Linuxer&apos;s Blog</div>
      <nav>
        <Link to="/" style={navLinkStyle}>
          Home
        </Link>
        <Link to="/about" style={navLinkStyle}>
          About
        </Link>
        <Link to="/contact" style={navLinkStyle}>
          Contact
        </Link>
      </nav>
    </header>
  );
}

const navLinkStyle = {
  color: "white",
  textDecoration: "none",
  marginLeft: "20px",
  fontWeight: "normal",
};

function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Markdown content
  const [author, setAuthor] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // --- Image Upload States ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // To store the URL of the uploaded image
  // --- End Image Upload States ---

  // Create slug from title: lowercase, remove invalid characters, replace spaces with dashes
  const createSlug = (inputTitle) => {
    let slug = inputTitle.toLowerCase();
    slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, ""); // Keep letters, numbers, spaces, hyphens
    slug = slug.replace(/[\s-]+/g, "-"); // Replace multiple spaces/hyphens with single hyphen
    slug = slug.replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
    return slug || "untitled-post";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!title || !content || !author) {
      setError("Please fill in all fields (Title, Content, Author).");
      return;
    }

    const postSlug = createSlug(title);
    if (!postSlug || postSlug === "untitled-post") {
      setError(
        "The title is too generic or contains only invalid characters. Please use a more descriptive title.",
      );
      return;
    }

    // THIS IS THE LINE YOU WERE ASKING ABOUT!
    // Re-introducing backendUrl with postSlug in the path, as per your original NewPostPage.js
    const backendUrl = `https://hobbies.yoonjin2.kr:8080/api/new-post/${encodeURIComponent(postSlug)}`;

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Assuming you have an authentication token from AuthContext
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        // Sending the actual post data in the body
        body: JSON.stringify({ title, content, author }),
      });

      if (!response.ok) {
        // Attempt to parse error message from backend
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorData.message}`,
        );
      }

      const newPost = await response.json();
      setSuccess(true);
      // Clear form after successful submission
      setTitle("");
      setContent("");
      setAuthor("");
      setUploadedImageUrl(""); // Clear uploaded image URL as well
      setSelectedFile(null); // Clear selected file

      // Optionally redirect to the new post's detail page or home
      setTimeout(() => {
        navigate(`/posts/${newPost.id}`); // Assuming newPost has an 'id' field returned from backend
      }, 1500);
    } catch (e) {
      setError(e.message);
    }
  };

  // --- Image Upload Handlers (unchanged, as it's separate functionality) ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError(null);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(
        "https://hobbies.yoonjin2.kr:8080/api/upload-image",
        {
          method: "POST",
          body: formData,
          // 'Authorization': `Bearer ${yourAuthToken}` // If image upload requires auth
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Upload failed! status: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();
      setUploadedImageUrl(result.url);
      setContent(
        (prevContent) =>
          prevContent + `\n![Alt text for image](${result.url})\n`,
      );
      setSelectedFile(null);
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };
  // --- End Image Upload Handlers ---

  return (
    <div className="new-post-page">
      <Header />
      <main className="container">
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit} className="new-post-form">
          {error && <p className="error-message">{error}</p>}
          {success && (
            <p className="success-message">Post created successfully!</p>
          )}

          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author:</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          {/* --- Image Upload Section --- */}
          <div className="form-group image-upload-section">
            <label>Image Upload:</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
            {uploadError && <p className="error-message">{uploadError}</p>}
            {uploadedImageUrl && (
              <p className="success-message">
                Image uploaded:{" "}
                <a
                  href={uploadedImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {uploadedImageUrl}
                </a>
                <br />
                (Markdown automatically inserted into content)
              </p>
            )}
          </div>
          {/* --- End Image Upload Section --- */}

          <div className="form-group">
            <label htmlFor="content">Content (Markdown):</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="15"
              required
              placeholder="Write your post content in Markdown here..."
            ></textarea>
          </div>

          <button type="submit" disabled={uploading}>
            Create Post
          </button>
        </form>
      </main>
    </div>
  );
}

export default NewPostPage;

// ~/chi-blog/blog-frontend/src/pages/NewPostPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // Re-use the Header component
import "./NewPostPage.css"; // Assume you have a CSS file for styling

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!title || !content || !author) {
      setError("Please fill in all fields (Title, Content, Author).");
      return;
    }

    try {
      const response = await fetch(
        "https://hobbies.yoonjin2.kr:8080/api/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Assuming you have an authentication token from AuthContext
            // 'Authorization': `Bearer ${yourAuthToken}`
          },
          body: JSON.stringify({ title, content, author }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        navigate(`/posts/${newPost.id}`); // Assuming newPost has an 'id' field
      }, 1500);
    } catch (e) {
      setError(e.message);
    }
  };

  // --- Image Upload Handlers ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError(null); // Clear previous errors
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("image", selectedFile); // 'image' should match the backend's expected form field name

    try {
      const response = await fetch(
        "https://hobbies.yoonjin2.kr:8080/api/upload-image",
        {
          // <-- New Image Upload Endpoint
          method: "POST",
          body: formData, // No 'Content-Type' header here, FormData sets it automatically
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
      setUploadedImageUrl(result.url); // Assuming backend returns a JSON with a 'url' field
      // Optionally insert into markdown content directly
      setContent(
        (prevContent) =>
          prevContent + `\n![Alt text for image](${result.url})\n`,
      );
      setSelectedFile(null); // Clear selected file after successful upload
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
              type="button" // Use type="button" to prevent form submission
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

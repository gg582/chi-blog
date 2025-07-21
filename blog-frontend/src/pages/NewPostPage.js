// ~/chi-blog/blog-frontend/src/pages/NewPostPage.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// The Header component is now included directly within NewPostPage for consistent styling.
// If you have a global Header component, you might import it instead and adjust its styling.
// import Header from '../components/Header';
import "./NewPostPage.css"; // Assuming a dedicated CSS file for NewPostPage styles

// Header component with basic inline styling for proper UI display
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
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Add shadow for depth
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
  transition: "color 0.3s ease",
};

// NewPostPage component starts here
function NewPostPage() {
  // Define state variables
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Markdown content for the post
  const [author, setAuthor] = useState("");
  const [error, setError] = useState(null); // For displaying error messages
  const [success, setSuccess] = useState(false); // For displaying success messages
  const navigate = useNavigate(); // Hook for programmatic navigation

  // --- Image Upload related state variables ---
  const [selectedFile, setSelectedFile] = useState(null); // The file selected by the user
  const [uploading, setUploading] = useState(false); // Flag to indicate if upload is in progress
  const [uploadError, setUploadError] = useState(null); // For displaying image upload errors
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // Stores the URL of the uploaded image
  // --- End Image Upload State variables ---

  // Utility function to create a slug from the post title
  const createSlug = (inputTitle) => {
    let slug = inputTitle.toLowerCase();
    // Allow Unicode letters (e.g., Korean), numbers, spaces, and hyphens
    slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, "");
    // Replace multiple spaces/hyphens with a single hyphen
    slug = slug.replace(/[\s-]+/g, "-");
    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, "");
    return slug || "untitled-post"; // Return a default slug if empty
  };

  // Handler for form submission to create a new post
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(null); // Clear previous error messages
    setSuccess(false); // Clear previous success messages

    // Basic input validation
    if (!title || !content || !author) {
      setError("Please fill in all fields (Title, Content, Author).");
      return;
    }

    // Generate and validate the slug
    const postSlug = createSlug(title);
    if (!postSlug || postSlug === "untitled-post") {
      setError(
        "The title is too generic or contains only invalid characters. Please use a more descriptive title.",
      );
      return;
    }

    // Construct the backend URL, including the postSlug in the path as per your original design
    const backendUrl = `https://hobbies.yoonjin2.kr:8080/api/new-post/${encodeURIComponent(postSlug)}`;

    // Data to be sent in the request body
    const postData = { title, content, author };

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Required header for sending JSON data
          // 'Authorization': `Bearer ${yourAuthToken}` // Uncomment if authentication token is needed
        },
        body: JSON.stringify(postData), // Convert JavaScript object to JSON string for the body
      });

      if (!response.ok) {
        // Attempt to parse specific error message from the backend response
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `HTTP Error! Status: ${response.status} - ${errorData.message}`,
        );
      }

      const newPost = await response.json(); // Parse the server's response (newly created post data)
      setSuccess(true); // Set success status

      // Clear form fields after successful submission
      setTitle("");
      setContent("");
      setAuthor("");
      setUploadedImageUrl(""); // Also clear the uploaded image URL
      setSelectedFile(null); // Clear the selected file

      // Redirect to the new post's detail page after a short delay (assuming backend returns newPost.id)
      setTimeout(() => {
        navigate(`/posts/${newPost.id}`);
      }, 1500);
    } catch (e) {
      setError(e.message); // Display error message if any occurs
    }
  };

  // --- Image Upload Handler ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Update state with the selected file
    setUploadError(null); // Clear any previous upload errors
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true); // Set uploading status
    setUploadError(null); // Clear errors

    const formData = new FormData(); // Create FormData object for file upload
    formData.append("image", selectedFile); // 'image' should match the backend's expected form field name

    try {
      const response = await fetch(
        "https://hobbies.yoonjin2.kr:8080/api/upload-image",
        {
          method: "POST",
          body: formData, // When using FormData, Content-Type header is automatically set
          // 'Authorization': `Bearer ${yourAuthToken}` // Uncomment if authentication is required for image upload
        },
      );

      if (!response.ok) {
        const errorText = await response.text(); // Parse text response for error message
        throw new Error(
          `Upload failed! Status: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json(); // Parse server response (uploaded image URL)
      setUploadedImageUrl(result.url); // Update state with the image URL
      // Automatically insert markdown image tag into the content textarea
      setContent(
        (prevContent) =>
          prevContent + `\n![Alt text for image](${result.url})\n`,
      );
      setSelectedFile(null); // Clear selected file after successful upload
    } catch (e) {
      setUploadError(e.message); // Set upload error message
    } finally {
      setUploading(false); // Reset uploading status
    }
  };
  // --- End Image Upload Handler ---

  // Component rendering
  return (
    <>
      <Header /> {/* Render the Header component */}
      <main style={mainStyle}>
        <h2 style={h2Style}>Create New Post</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Error and success messages display */}
          {error && <p style={errorMessageStyle}>{error}</p>}
          {success && (
            <p style={successMessageStyle}>Post created successfully!</p>
          )}

          {/* Title input field */}
          <div style={formGroupStyle}>
            <label htmlFor="title" style={labelStyle}>
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Author input field */}
          <div style={formGroupStyle}>
            <label htmlFor="author" style={labelStyle}>
              Author:
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* --- Image Upload Section --- */}
          <div style={{ ...formGroupStyle, ...imageUploadSectionStyle }}>
            <label style={labelStyle}>Image Upload:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={fileInputStyle}
            />
            <button
              type="button" // Use type="button" to prevent form submission
              onClick={handleImageUpload}
              disabled={uploading || !selectedFile} // Disable if uploading or no file selected
              style={buttonStyle}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
            {uploadError && <p style={errorMessageStyle}>{uploadError}</p>}
            {uploadedImageUrl && (
              <p style={successMessageStyle}>
                Image uploaded:{" "}
                <a
                  href={uploadedImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff" }}
                >
                  {uploadedImageUrl}
                </a>
                <br />
                (Markdown automatically inserted into content)
              </p>
            )}
          </div>
          {/* --- End Image Upload Section --- */}

          {/* Content (Markdown) input field */}
          <div style={formGroupStyle}>
            <label htmlFor="content" style={labelStyle}>
              Content (Markdown):
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="15"
              required
              placeholder="Write your post content in Markdown here..."
              style={textareaStyle}
            ></textarea>
          </div>

          {/* Create Post button */}
          <button type="submit" disabled={uploading} style={submitButtonStyle}>
            Create Post
          </button>
        </form>
      </main>
    </>
  );
}

export default NewPostPage;

// --- Inline Styles Definition (Can be moved to NewPostPage.css file) ---
// These styles are applied inline for immediate visual feedback.
// For better maintainability, consider moving them to an external CSS file.

const mainStyle = {
  maxWidth: "800px",
  margin: "auto",
  padding: "20px",
  paddingTop: "100px", // Add padding to account for fixed header
};

const h2Style = {
  textAlign: "center",
  marginBottom: "30px",
  color: "#333",
};

const formStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
};

const formGroupStyle = {
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "bold",
  color: "#555",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxSizing: "border-box",
  fontSize: "1rem",
};

const textareaStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxSizing: "border-box",
  minHeight: "200px",
  fontSize: "1rem",
  resize: "vertical", // Allow vertical resizing
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "10px 15px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
};

const submitButtonStyle = {
  backgroundColor: "#28a745", // Different color for the main submit button
  color: "white",
  padding: "12px 25px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1.1rem",
  fontWeight: "bold",
  display: "block", // Make button a block element to take full width
  width: "100%",
  marginTop: "30px",
  transition: "background-color 0.3s ease",
};

// Hover effects (can be handled in CSS for better practice)
// Note: Inline styles don't directly support :hover. This is for illustrative purposes.
// For real applications, use CSS classes in NewPostPage.css
/*
buttonStyle[':hover'] = {
  backgroundColor: '#0056b3',
};
submitButtonStyle[':hover'] = {
  backgroundColor: '#218838',
};
*/

const errorMessageStyle = {
  color: "#dc3545",
  backgroundColor: "#f8d7da",
  border: "1px solid #f5c6cb",
  padding: "10px",
  borderRadius: "5px",
  marginBottom: "20px",
  textAlign: "center",
};

const successMessageStyle = {
  color: "#28a745",
  backgroundColor: "#d4edda",
  border: "1px solid #c3e6cb",
  padding: "10px",
  borderRadius: "5px",
  marginBottom: "20px",
  textAlign: "center",
};

const imageUploadSectionStyle = {
  display: "flex",
  flexDirection: "column", // Stack elements vertically
  gap: "10px", // Space between elements
  padding: "15px",
  backgroundColor: "#f8f9fa",
  border: "1px dashed #ced4da",
  borderRadius: "5px",
  marginBottom: "20px",
};

const fileInputStyle = {
  padding: "8px 0",
};

// --- End Inline Styles Definition ---

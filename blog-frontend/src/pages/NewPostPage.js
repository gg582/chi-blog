// ~/chi-blog/blog-frontend/src/pages/NewPostPage.js

import React, { useState, useEffect } from 'react'; // useEffect added for preview functionality
import { useNavigate, Link } from 'react-router-dom';
import './NewPostPage.css'; // Assuming a dedicated CSS file for NewPostPage styles

// Markdown parsing and syntax highlighting libraries
import { marked } from 'marked'; // Markdown to HTML parser
import hljs from 'highlight.js'; // Syntax highlighter
import 'highlight.js/styles/github.css'; // GitHub style theme for highlight.js

// --- Configure Marked to use Highlight.js for syntax highlighting ---
// This setup ensures that when 'marked' converts markdown to HTML,
// it uses highlight.js for any code blocks it encounters.
marked.setOptions({
  // The highlight function tells marked how to highlight code.
  // It checks if the language is supported by hljs; otherwise, defaults to plaintext.
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-', // Required prefix for highlight.js CSS classes (e.g., <code class="hljs language-javascript">)
  gfm: true, // Enable GitHub Flavored Markdown (e.g., for tables, task lists)
  breaks: true, // Enable GFM line breaks (single newlines become <br> tags)
});

// Header component with basic inline styling for proper UI display
// In a larger application, this would typically be a separate, reusable component.
function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#333',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      fontSize: '1.1rem',
      zIndex: 1000,
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Adds a subtle shadow for depth
    }}>
      <div style={{ fontWeight: 'bold' }}>Linuxer&apos;s Blog</div>
      <nav>
        <Link to="/" style={navLinkStyle}>Home</Link>
        <Link to="/about" style={navLinkStyle}>About</Link>
        <Link to="/contact" style={navLinkStyle}>Contact</Link>
      </nav>
    </header>
  );
}

// Inline style for navigation links in the Header
const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  marginLeft: '20px',
  fontWeight: 'normal',
  transition: 'color 0.3s ease', // Smooth color transition on hover
};

// NewPostPage component starts here
function NewPostPage() {
  // State variables for post data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Stores the original Markdown content
  const [author, setAuthor] = useState('');
  const [error, setError] = useState(null);   // For displaying general error messages
  const [success, setSuccess] = useState(false); // For displaying post creation success message
  const navigate = useNavigate(); // Hook for programmatic navigation after post creation

  // --- Image Upload related state variables ---
  const [selectedFile, setSelectedFile] = useState(null); // The file chosen by the user for upload
  const [uploading, setUploading] = useState(false);     // Boolean flag to indicate if an upload is in progress
  const [uploadError, setUploadError] = useState(null);   // For displaying image upload specific errors
  const [uploadedImageUrl, setUploadedImageUrl] = useState(''); // Stores the public URL of the uploaded image
  // --- End Image Upload State variables ---

  // State for storing the HTML rendition of the markdown content for preview
  const [previewHtml, setPreviewHtml] = useState('');

  // useEffect hook to update the preview HTML whenever 'content' state changes
  useEffect(() => {
    // Convert the current markdown content to HTML using marked.js
    // This will automatically apply syntax highlighting because of marked.setOptions above.
    const html = marked.parse(content);
    setPreviewHtml(html);
  }, [content]); // Dependency array: this effect runs whenever 'content' changes

  // useEffect hook to apply highlight.js to the preview area after its HTML is updated
  // This is crucial because highlight.js needs to run on the actual DOM elements after they are rendered.
  useEffect(() => {
    if (previewHtml) { // Only attempt highlighting if there's HTML content in the preview
        const previewElement = document.getElementById('markdown-preview');
        if (previewElement) {
            // Target only code blocks within the specific preview element for efficiency
            previewElement.querySelectorAll('pre code').forEach((block) => {
                // Manually highlight each code block
                // hljs.highlightElement is preferred over hljs.highlightAll() for specific areas
                hljs.highlightElement(block);
            });
        } else {
            // Fallback: If for some reason the specific element isn't found,
            // highlight all code blocks on the page. Less efficient but ensures highlighting.
            hljs.highlightAll();
        }
    }
  }, [previewHtml]); // Dependency array: this effect runs whenever 'previewHtml' changes

  // Utility function to create a URL-friendly slug from the post title
  const createSlug = (inputTitle) => {
    let slug = inputTitle.toLowerCase();
    // Replace non-alphanumeric (including Unicode letters), non-space, non-hyphen characters
    // The 'p{L}' and 'p{N}' are Unicode character properties for letters and numbers.
    slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, '');
    // Replace multiple spaces or hyphens with a single hyphen
    slug = slug.replace(/[\s-]+/g, '-');
    // Trim leading or trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    return slug || 'untitled-post'; // Provide a default slug if the input title is empty or invalid
  };

  // Handler for submitting the post creation form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the browser's default form submission behavior
    setError(null);     // Clear any previous error messages
    setSuccess(false);  // Clear any previous success messages

    // Basic validation to ensure all required fields are filled
    if (!title || !content || !author) {
      setError('Please fill in all fields (Title, Content, Author).');
      return;
    }

    // Generate and validate the post slug
    const postSlug = createSlug(title);
    if (!postSlug || postSlug === 'untitled-post') {
      setError('The title is too generic or contains only invalid characters. Please use a more descriptive title.');
      return;
    }

    // Construct the backend URL. This uses the postSlug in the path,
    // matching your backend's `/api/new-post/{id}` route for new post creation.
    const backendUrl = `https://hobbies.yoonjin2.kr:8080/api/new-post/${encodeURIComponent(postSlug)}`;

    // Prepare the data to be sent in the request body
    const postData = { title, content, author };

    try {
      const response = await fetch(backendUrl, {
        method: 'POST', // HTTP POST method for creating a new resource
        headers: {
          'Content-Type': 'application/json', // Inform the server that the request body is JSON
          // 'Authorization': `Bearer ${yourAuthToken}` // Uncomment if authentication is required (e.g., JWT)
        },
        body: JSON.stringify(postData), // Convert the JavaScript object to a JSON string
      });

      if (!response.ok) {
        // If the HTTP response status is not 2xx (e.g., 4xx or 5xx), throw an error.
        // Attempt to parse a specific error message from the backend response, if available.
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`HTTP Error! Status: ${response.status} - ${errorData.message}`);
      }

      // Parse the successful response from the server (e.g., the newly created post's data)
      const newPost = await response.json();
      setSuccess(true); // Indicate successful post creation

      // Clear all form fields and preview after successful submission
      setTitle('');
      setContent('');
      setAuthor('');
      setUploadedImageUrl('');
      setSelectedFile(null);
      setPreviewHtml(''); // Clear the preview area

      // Redirect to the newly created post's detail page after a short delay
      // Assumes the backend returns the new post object with an 'id' field.
      setTimeout(() => {
        navigate(`/posts/${newPost.id}`);
      }, 1500);
    } catch (e) {
      setError(e.message); // Catch and display any errors during the fetch operation
    }
  };

  // --- Image Upload Handler ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Get the first file selected by the user
    setUploadError(null); // Clear any previous upload errors when a new file is selected
  };

  // Handler for uploading the selected image file
  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true); // Set the uploading status to true
    setUploadError(null); // Clear previous errors

    const formData = new FormData(); // Create a FormData object to send file data
    formData.append('image', selectedFile); // 'image' must match the expected field name on the backend (e.g., r.FormFile("image"))

    try {
      const response = await fetch('https://hobbies.yoonjin2.kr:8080/api/upload-image', {
        method: 'POST',
        body: formData, // When using FormData, the 'Content-Type' header (e.g., multipart/form-data) is automatically set by the browser.
        // 'Authorization': `Bearer ${yourAuthToken}` // Uncomment if authentication is required for image upload
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get raw error text if response is not OK
        throw new Error(`Upload failed! Status: ${response.status} - ${errorText}`);
      }

      const result = await response.json(); // Parse the successful JSON response from the server
      setUploadedImageUrl(result.url);      // Store the public URL of the uploaded image
      // Automatically insert a markdown image tag into the content textarea.
      // This allows the user to easily include the uploaded image in their post.
      setContent((prevContent) => prevContent + `\n![Alt text for image](${result.url})\n`);
      setSelectedFile(null); // Clear the selected file input after successful upload
    } catch (e) {
      setUploadError(e.message); // Catch and display any errors during the image upload
    } finally {
      setUploading(false); // Reset the uploading status to false, regardless of success or failure
    }
  };
  // --- End Image Upload Handler ---

  // Component rendering starts here
  return (
    <>
      <Header /> {/* Render the Header component */}
      <main style={mainStyle}> {/* Main content area */}
        <h2 style={h2Style}>Create New Post</h2>
        <form onSubmit={handleSubmit} style={formStyle}> {/* Post creation form */}
          {/* Display general error or success messages */}
          {error && <p style={errorMessageStyle}>{error}</p>}
          {success && <p style={successMessageStyle}>Post created successfully!</p>}

          {/* Title input field */}
          <div style={formGroupStyle}>
            <label htmlFor="title" style={labelStyle}>Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required // HTML5 validation: field is required
              style={inputStyle}
            />
          </div>

          {/* Author input field */}
          <div style={formGroupStyle}>
            <label htmlFor="author" style={labelStyle}>Author:</label>
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
          {/* This section allows users to upload images and insert their markdown links */}
          <div style={{ ...formGroupStyle, ...imageUploadSectionStyle }}>
            <label style={labelStyle}>Image Upload:</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={fileInputStyle} />
            <button
              type="button" // Important: Prevents this button from submitting the form
              onClick={handleImageUpload}
              disabled={uploading || !selectedFile} // Disable button if uploading or no file is selected
              style={buttonStyle}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            {uploadError && <p style={errorMessageStyle}>{uploadError}</p>}
            {uploadedImageUrl && (
              <p style={successMessageStyle}>
                Image uploaded:{' '}
                <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
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
            <label htmlFor="content" style={labelStyle}>Content (Markdown):</label>
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

          {/* --- Markdown Preview Section --- */}
          {/* This section displays the real-time HTML preview of the markdown content */}
          <div style={previewSectionStyle}>
            <h3 style={previewHeadingStyle}>Preview</h3>
            <div
              id="markdown-preview" // Unique ID for targeting this specific element with highlight.js
              style={previewContentStyle}
              // dangerouslySetInnerHTML is used to render HTML strings directly from marked.js
              // Use with caution, ensuring the HTML source is trusted (in this case, from marked.js).
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
          {/* --- End Markdown Preview Section --- */}

          {/* Create Post submission button */}
          <button type="submit" disabled={uploading} style={submitButtonStyle}>
            Create Post
          </button>
        </form>
      </main>
    </>
  );
}

export default NewPostPage;

// --- Inline Styles Definition (Can/Should be moved to NewPostPage.css file for better practice) ---
// These styles are applied inline for immediate visual feedback and to directly address UI issues.
// For better maintainability and separation of concerns, it is highly recommended
// to move these styles to an external CSS file (e.g., NewPostPage.css) using CSS classes.

const mainStyle = {
  maxWidth: '900px', // Wider layout to accommodate both form and preview
  margin: 'auto',    // Center the content
  padding: '20px',
  paddingTop: '100px', // Offset for the fixed header
  display: 'grid',   // Use CSS Grid for flexible layout
  gridTemplateColumns: '1fr', // Default to a single column on smaller screens
  gap: '30px',       // Space between grid items
};

const h2Style = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#333',
  gridColumn: '1 / -1', // Make the heading span across all columns in the grid
};

const formStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Subtle shadow for form card effect
};

const formGroupStyle = {
  marginBottom: '20px', // Spacing between form fields
};

const labelStyle = {
  display: 'block',     // Make label a block element to sit above input
  marginBottom: '8px',
  fontWeight: 'bold',
  color: '#555',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  boxSizing: 'border-box', // Include padding and border in the element's total width/height
  fontSize: '1rem',
};

const textareaStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  boxSizing: 'border-box',
  minHeight: '200px', // Minimum height for the textarea
  fontSize: '1rem',
  resize: 'vertical', // Allow users to resize only vertically
};

const buttonStyle = {
  backgroundColor: '#007bff', // Bootstrap primary blue
  color: 'white',
  padding: '10px 15px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease', // Smooth hover effect
};

const submitButtonStyle = {
  backgroundColor: '#28a745', // Bootstrap success green for main submit button
  color: 'white',
  padding: '12px 25px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  display: 'block', // Make button take full width
  width: '100%',
  marginTop: '30px',
  transition: 'background-color 0.3s ease',
  gridColumn: '1 / -1', // Make submit button span all columns in the grid
};

// Hover effects (these are conceptual for inline styles, typically done with CSS classes)
// For actual implementation in CSS:
// button:hover { background-color: #0056b3; }
// button[type="submit"]:hover { background-color: #218838; }

const errorMessageStyle = {
  color: '#dc3545',          // Red text
  backgroundColor: '#f8d7da', // Light red background
  border: '1px solid #f5c6cb', // Border matching background
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '20px',
  textAlign: 'center',
  gridColumn: '1 / -1', // Span all columns for messages
};

const successMessageStyle = {
  color: '#28a745',          // Green text
  backgroundColor: '#d4edda', // Light green background
  border: '1px solid #c3e6cb', // Border matching background
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '20px',
  textAlign: 'center',
  gridColumn: '1 / -1', // Span all columns for messages
};

const imageUploadSectionStyle = {
  display: 'flex',
  flexDirection: 'column', // Stack elements vertically within this section
  gap: '10px',             // Space between elements
  padding: '15px',
  backgroundColor: '#f8f9fa', // Light gray background
  border: '1px dashed #ced4da', // Dashed border to visually separate
  borderRadius: '5px',
  marginBottom: '20px',
};

const fileInputStyle = {
  padding: '8px 0', // Vertical padding for file input
};

// --- Styles for the Markdown Preview Section ---
const previewSectionStyle = {
  gridColumn: '1 / -1', // Default: span full width on smaller screens
  backgroundColor: '#f8f9fa', // Light background for preview area
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Subtle shadow
  minHeight: '300px', // Ensure preview area has a minimum height
  overflowY: 'auto', // Add vertical scrollbar if content overflows
  border: '1px solid #eee', // Light border
};

const previewHeadingStyle = {
  marginTop: '0',
  marginBottom: '15px',
  color: '#333',
  borderBottom: '1px solid #ddd', // Separator line below heading
  paddingBottom: '10px',
};

const previewContentStyle = {
  // Styles for the actual markdown-rendered content inside the preview
  lineHeight: '1.6',      // Improve readability
  wordWrap: 'break-word', // Prevent long words from overflowing the container
  // Markdown rendering often includes default browser styles for h1-h6, p, ul, ol, pre, code.
  // The highlight.js CSS (`github.css`) will style the `pre code` blocks.
};

// --- Responsive Adjustments for Main Layout (conceptual, for CSS file) ---
// To achieve two columns on larger screens, you'd use CSS @media queries.
// Example for NewPostPage.css:
/*
@media (min-width: 900px) {
  .new-post-page main {
    grid-template-columns: 1fr 1fr; // Two equal columns
  }
  .new-post-form {
    grid-column: 1; // Form takes the first column
  }
  .markdown-preview-section { // Assign a class to the preview div
    grid-column: 2; // Preview takes the second column
  }
  .new-post-page h2,
  .error-message,
  .success-message,
  button[type="submit"] {
    grid-column: 1 / -1; // These elements should still span full width
  }
}
*/
// --- End Inline Styles Definition ---

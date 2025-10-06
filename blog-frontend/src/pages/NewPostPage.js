import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './NewPostPage.css';

import { marked } from 'marked'; 

marked.setOptions({
  highlight: function(code, lang) {
    if (window.hljs) {
      const language = window.hljs.getLanguage(lang) ? lang : 'plaintext';
      return window.hljs.highlight(code, { language }).value;
    }
    return code;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true,
});

function Header() { 
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '60px', backgroundColor: '#333',
      color: 'white', display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: '1.1rem',
      zIndex: 1000, justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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

const navLinkStyle = {
  color: 'white', textDecoration: 'none', marginLeft: '20px', fontWeight: 'normal',
  transition: 'color 0.3s ease',
};

// Function to safely get MIME type from file extension
const getMimeType = (fileName, category) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (category === 'video') {
        if (extension === 'mp4') return 'video/mp4';
        if (extension === 'webm') return 'video/webm';
        if (extension === 'ogg') return 'video/ogg';
        return `video/${extension}`;
    }
    
    if (category === 'audio') {
        if (extension === 'mp3') return 'audio/mpeg';
        if (extension === 'wav') return 'audio/wav';
        if (extension === 'ogg') return 'audio/ogg';
        return `audio/${extension}`;
    }

    // Default to application/octet-stream for general files
    return 'application/octet-stream'; 
};

// Function to determine file category based on MIME type hint
const getFileCategory = (file) => {
    if (!file || !file.type) return 'general';
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    return 'general';
};

// --- API Endpoint Definition ---
const UPLOAD_ENDPOINT = 'https://hobbies.yoonjin2.kr:8080/api/upload-file';


function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // State for batch file upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedResults, setUploadedResults] = useState([]); // Array of {url, fileName}

  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    const html = marked.parse(content);
    setPreviewHtml(html);

    if (window.hljs) {
      const previewElement = document.getElementById('markdown-preview');
      if (previewElement) {
        previewElement.querySelectorAll('pre code').forEach((block) => {
          if (!block.classList.contains('hljs')) {
            window.hljs.highlightElement(block);
          }
        });
      } else {
        window.hljs.highlightAll();
      }
    }
  }, [content]);

  const createSlug = (inputTitle) => {
    let slug = inputTitle.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '');
    slug = slug.replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');
    return slug || 'untitled-post';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || !content || !author) {
      setError('Please fill in all fields (Title, Content, Author).');
      return;
    }

    const postSlug = createSlug(title);
    if (!postSlug || postSlug === 'untitled-post') {
      setError('The title is too generic or contains only invalid characters.');
      return;
    }

    const backendUrl = `https://hobbies.yoonjin2.kr:8080/api/new-post/${encodeURIComponent(postSlug)}`;
    const postData = { title, content, author };

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`HTTP Error! Status: ${response.status} - ${errorData.message}`);
      }

      const newPost = await response.json();
      setSuccess(true);
      setTitle(''); setContent(''); setAuthor(''); setSelectedFiles([]); setUploadedResults([]); setPreviewHtml('');
      setTimeout(() => { navigate(`/posts/${newPost.id}`); }, 1500);
    } catch (e) {
      setError(e.message);
    }
  };

  // --- Unified File Change Handler ---
  const handleFileChange = (e) => {
    // Convert FileList to Array
    setSelectedFiles(Array.from(e.target.files));
    setUploadError(null);
  };

  // --- Unified Batch Upload Function ---
  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) {
        setUploadError('Please select at least one file to upload.');
        return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
        // The backend expects a field named 'file' for each uploaded item
        formData.append('file', file);
    });

    try {
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Check for 202 Accepted which the backend might return on partial success
        if (response.status === 202) {
             setUploadError('Partial success: Some files failed to upload. Check the inserted content for details.');
        } else {
            const errorText = await response.text();
            throw new Error(`Upload failed! Status: ${response.status} - ${errorText}`);
        }
      }

      // The backend returns an array of successfully uploaded file objects: [{url, fileName}]
      const results = await response.json();
      setUploadedResults(results);

      let contentSnippets = [];
      results.forEach((result) => {
        // Use result.fileName to determine category (using original name as file object is gone)
        const file = selectedFiles.find(f => f.name === result.fileName);
        const fileType = getFileCategory(file);

        // Safely encode the URL
        const url = result.url.replace(/\s/g, "%20");
        let markdownSnippet = '';
        
        // Generate the appropriate markdown/HTML snippet
        if (fileType === 'image') {
            markdownSnippet = `\n![${result.fileName}](${url})\n`;
        } else if (fileType === 'video') {
            const mimeType = getMimeType(result.fileName, 'video');
            markdownSnippet = `\n<video controls width="600">\n  <source src="${url}" type="${mimeType}">\n  Your browser does not support the video tag.\n</video>\n`;
        } else if (fileType === 'audio') {
            const mimeType = getMimeType(result.fileName, 'audio');
            markdownSnippet = `\n<audio controls>\n  <source src="${url}" type="${mimeType}">\n  Your browser does not support the audio tag.\n</audio>\n`;
        } else { // 'general'
            markdownSnippet = `\n[Download File: ${result.fileName}](${url})\n`;
        }
        contentSnippets.push(markdownSnippet);
      });

      // Append all snippets to the content area
      setContent((prevContent) => prevContent + contentSnippets.join('\n'));
      
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
      setSelectedFiles([]); // Clear the selected file list
      // Note: Clearing the file input element itself requires a ref or resetting its value property
      document.getElementById('file-upload-input').value = '';
    }
  };

  const totalFilesSelected = selectedFiles.length;
  const isFormSubmittable = !uploading;


  return (
    <>
      <Header />
      <main style={mainStyle}>
        <h2 style={h2Style}>Create New Post</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <p style={errorMessageStyle}>{error}</p>}
          {success && <p style={successMessageStyle}>Post created successfully!</p>}

          <div style={formGroupStyle}>
            <label htmlFor="title" style={labelStyle}>Title:</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="author" style={labelStyle}>Author:</label>
            <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required style={inputStyle} />
          </div>

          {/* Unified Batch File Upload Section */}
          <div style={{ ...formGroupStyle, ...uploadSectionStyle }}>
            <label style={labelStyle}>File Upload (Select Multiple Files):</label>
            <input 
                type="file" 
                id="file-upload-input" 
                multiple 
                onChange={handleFileChange} 
                style={fileInputStyle} 
                accept="image/*,video/*,audio/*,.pdf,.zip,.tar.gz" // Suggest common files
            />
            {totalFilesSelected > 0 && (
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#007bff' }}>
                    **{totalFilesSelected} file(s) selected.** Click Upload to insert into content.
                </p>
            )}
            <button 
                type="button" 
                onClick={handleBatchUpload} 
                disabled={uploading || totalFilesSelected === 0} 
                style={{...buttonStyle, marginTop: '10px'}}
            >
              {uploading ? 'Uploading...' : `Upload Selected Files (${totalFilesSelected})`}
            </button>
            
            {uploadError && <p style={errorMessageStyle}>{uploadError}</p>}
            
            {uploadedResults.length > 0 && (
              <div style={successMessageStyle}>
                <p style={{ fontWeight: 'bold' }}>{uploadedResults.length} file(s) successfully processed:</p>
                <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    {uploadedResults.map((result, index) => (
                        <li key={index}>
                            <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>{result.fileName}</a>
                        </li>
                    ))}
                </ul>
                <p>(Markdown/HTML snippets automatically inserted into content.)</p>
              </div>
            )}
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="content" style={labelStyle}>Content (Markdown):</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="15"
              required
              placeholder="Write your post content in Markdown here... Inserted files will appear at the bottom."
              style={textareaStyle}
            ></textarea>
          </div>

          <div style={previewSectionStyle}>
            <h3 style={previewHeadingStyle}>Preview</h3>
            <div
              id="markdown-preview"
              style={previewContentStyle}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          <button 
              type="submit" 
              disabled={!isFormSubmittable} 
              style={submitButtonStyle}
          >
            Create Post
          </button>
        </form>
      </main>
    </>
  );
}

export default NewPostPage;

// --- Inline Styles Definition ---
const mainStyle = {
  maxWidth: '900px', margin: 'auto', padding: '20px', paddingTop: '100px',
  display: 'grid', gridTemplateColumns: '1fr', gap: '30px',
};
const h2Style = {
  textAlign: 'center', marginBottom: '30px', color: '#333', gridColumn: '1 / -1',
};
const formStyle = {
  backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
};
const formGroupStyle = { marginBottom: '20px' };
const labelStyle = {
  display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555',
};
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px',
  boxSizing: 'border-box', fontSize: '1rem',
};
const textareaStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px',
  boxSizing: 'border-box', minHeight: '200px', fontSize: '1rem', resize: 'vertical',
};
const buttonStyle = {
  backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none',
  borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.3s ease',
};
const submitButtonStyle = {
  backgroundColor: '#28a745', color: 'white', padding: '12px 25px', border: 'none',
  borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold',
  display: 'block', width: '100%', marginTop: '30px', transition: 'background-color 0.3s ease',
  gridColumn: '1 / -1',
};
const errorMessageStyle = {
  color: '#dc3545', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb',
  padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center',
  gridColumn: '1 / -1',
};
const successMessageStyle = {
  color: '#28a745', backgroundColor: '#d4edda', border: '1px solid #c3e6cb',
  padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'left',
  gridColumn: '1 / -1',
};
const uploadSectionStyle = {
  display: 'flex', flexDirection: 'column', gap: '5px', padding: '15px',
  backgroundColor: '#f8f9fa', border: '1px dashed #ced4da', borderRadius: '5px',
  marginBottom: '20px',
};
const fileInputStyle = { padding: '8px 0' };
const previewSectionStyle = {
  gridColumn: '1 / -1', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', minHeight: '300px', overflowY: 'auto',
  border: '1px solid #eee',
};
const previewHeadingStyle = {
  marginTop: '0', marginBottom: '15px', color: '#333', borderBottom: '1px solid #ddd',
  paddingBottom: '10px',
};
const previewContentStyle = { lineHeight: '1.6', wordWrap: 'break-word' };
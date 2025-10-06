import React, { useState, useEffect } from 'react';
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
        return `video/${extension}`; // Fallback
    }
    
    if (category === 'audio') {
        if (extension === 'mp3') return 'audio/mpeg';
        if (extension === 'wav') return 'audio/wav';
        if (extension === 'ogg') return 'audio/ogg';
        return `audio/${extension}`; // Fallback
    }

    // Default to application/octet-stream for general files
    return 'application/octet-stream'; 
};

function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Video Upload State
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoError, setUploadVideoError] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  
  // Audio Upload State (New)
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadAudioError, setUploadAudioError] = useState(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState('');

  // General File Upload State (New)
  const [selectedGeneralFile, setSelectedGeneralFile] = useState(null);
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const [uploadGeneralError, setUploadGeneralError] = useState(null);
  const [uploadedGeneralUrl, setUploadedGeneralUrl] = useState('');

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
      setTitle(''); setContent(''); setAuthor(''); setUploadedImageUrl(''); setSelectedFile(null); setPreviewHtml('');
      setTimeout(() => { navigate(`/posts/${newPost.id}`); }, 1500);
    } catch (e) {
      setError(e.message);
    }
  };

  // --- File Change Handlers ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError(null);
  };

  const handleVideoFileChange = (e) => {
    setSelectedVideoFile(e.target.files[0]);
    setUploadVideoError(null);
  };
  
  const handleAudioFileChange = (e) => {
    setSelectedAudioFile(e.target.files[0]);
    setUploadAudioError(null);
  };

  const handleGeneralFileChange = (e) => {
    setSelectedGeneralFile(e.target.files[0]);
    setUploadGeneralError(null);
  };

  // --- Upload Handlers ---
  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('https://hobbies.yoonjin2.kr:8080/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed! Status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setUploadedImageUrl(result.url);
      setContent((prevContent) => prevContent + `\n![Alt text for image](${result.url.replace(/\s/g, "%20")})\n`);
      setSelectedFile(null);
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!selectedVideoFile) {
      setUploadVideoError('Please select a video file to upload.');
      return;
    }

    setUploadingVideo(true);
    setUploadVideoError(null);

    const formData = new FormData();
    formData.append('video', selectedVideoFile);

    try {
      const response = await fetch('https://hobbies.yoonjin2.kr:8080/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Video upload failed! Status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setUploadedVideoUrl(result.url);
      
      const mimeType = getMimeType(selectedVideoFile.name, 'video');
      
      const videoMarkdown = `\n<video controls width="600">\n  <source src="${result.url.replace(/\s/g, "%20")}" type="${mimeType}">\n  Your browser does not support the video tag.\n</video>\n`;
      
      setContent((prevContent) => prevContent + videoMarkdown);
      setSelectedVideoFile(null);
    } catch (e) {
      setUploadVideoError(e.message);
    } finally {
      setUploadingVideo(false);
    }
  };
  
  const handleAudioUpload = async () => {
    if (!selectedAudioFile) {
      setUploadAudioError('Please select an audio file to upload.');
      return;
    }

    setUploadingAudio(true);
    setUploadAudioError(null);

    const formData = new FormData();
    formData.append('audio', selectedAudioFile);

    try {
      const response = await fetch('https://hobbies.yoonjin2.kr:8080/api/upload-audio', { // Assumed endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Audio upload failed! Status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setUploadedAudioUrl(result.url);
      
      const mimeType = getMimeType(selectedAudioFile.name, 'audio');
      
      // Insert <audio> tag with source
      const audioMarkdown = `\n<audio controls>\n  <source src="${result.url.replace(/\s/g, "%20")}" type="${mimeType}">\n  Your browser does not support the audio tag.\n</audio>\n`;
      
      setContent((prevContent) => prevContent + audioMarkdown);
      setSelectedAudioFile(null);
    } catch (e) {
      setUploadAudioError(e.message);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleGeneralFileUpload = async () => {
    if (!selectedGeneralFile) {
      setUploadGeneralError('Please select a file to upload.');
      return;
    }

    setUploadingGeneral(true);
    setUploadGeneralError(null);

    const formData = new FormData();
    formData.append('file', selectedGeneralFile);

    try {
      const response = await fetch('https://hobbies.yoonjin2.kr:8080/api/upload-file', { // Assumed endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed! Status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setUploadedGeneralUrl(result.url);
      
      const fileName = selectedGeneralFile.name;
      
      // Insert Markdown link for download
      const fileMarkdown = `\n[Download File: ${fileName}](${result.url.replace(/\s/g, "%20")})\n`;
      
      setContent((prevContent) => prevContent + fileMarkdown);
      setSelectedGeneralFile(null);
    } catch (e) {
      setUploadGeneralError(e.message);
    } finally {
      setUploadingGeneral(false);
    }
  };


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

          {/* Image Upload Section */}
          <div style={{ ...formGroupStyle, ...uploadSectionStyle }}>
            <label style={labelStyle}>Image Upload:</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={fileInputStyle} />
            <button type="button" onClick={handleImageUpload} disabled={uploading || !selectedFile} style={buttonStyle}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            {uploadError && <p style={errorMessageStyle}>{uploadError}</p>}
            {uploadedImageUrl && (
              <p style={successMessageStyle}>
                Image uploaded: <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>{uploadedImageUrl}</a><br />
                (Markdown automatically inserted into content)
              </p>
            )}
          </div>

          {/* Video Upload Section */}
          <div style={{ ...formGroupStyle, ...uploadSectionStyle }}>
            <label style={labelStyle}>Video Upload:</label>
            <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={handleVideoFileChange} style={fileInputStyle} />
            <button type="button" onClick={handleVideoUpload} disabled={uploadingVideo || !selectedVideoFile} style={buttonStyle}>
              {uploadingVideo ? 'Uploading...' : 'Upload Video'}
            </button>
            {uploadVideoError && <p style={errorMessageStyle}>{uploadVideoError}</p>}
            {uploadedVideoUrl && (
              <p style={successMessageStyle}>
                Video uploaded: <a href={uploadedVideoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>{uploadedVideoUrl}</a><br />
                (HTML/Source tag automatically inserted into content)
              </p>
            )}
          </div>

          {/* Audio Upload Section (NEW) */}
          <div style={{ ...formGroupStyle, ...uploadSectionStyle }}>
            <label style={labelStyle}>Audio Upload:</label>
            <input type="file" accept="audio/mpeg,audio/wav,audio/ogg" onChange={handleAudioFileChange} style={fileInputStyle} />
            <button type="button" onClick={handleAudioUpload} disabled={uploadingAudio || !selectedAudioFile} style={buttonStyle}>
              {uploadingAudio ? 'Uploading...' : 'Upload Audio'}
            </button>
            {uploadAudioError && <p style={errorMessageStyle}>{uploadAudioError}</p>}
            {uploadedAudioUrl && (
              <p style={successMessageStyle}>
                Audio uploaded: <a href={uploadedAudioUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>{uploadedAudioUrl}</a><br />
                (HTML/Source tag automatically inserted into content)
              </p>
            )}
          </div>
          
          {/* General File Upload Section (NEW) */}
          <div style={{ ...formGroupStyle, ...uploadSectionStyle }}>
            <label style={labelStyle}>General File Upload (Download Link):</label>
            <input type="file" onChange={handleGeneralFileChange} style={fileInputStyle} />
            <button type="button" onClick={handleGeneralFileUpload} disabled={uploadingGeneral || !selectedGeneralFile} style={buttonStyle}>
              {uploadingGeneral ? 'Uploading...' : 'Upload File'}
            </button>
            {uploadGeneralError && <p style={errorMessageStyle}>{uploadGeneralError}</p>}
            {uploadedGeneralUrl && (
              <p style={successMessageStyle}>
                File uploaded: <a href={uploadedGeneralUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>{uploadedGeneralUrl}</a><br />
                (Markdown Download Link automatically inserted into content)
              </p>
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
              placeholder="Write your post content in Markdown here..."
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

          <button type="submit" disabled={uploading || uploadingVideo || uploadingAudio || uploadingGeneral} style={submitButtonStyle}>
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
  padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center',
  gridColumn: '1 / -1',
};
// Unified style for all upload sections
const uploadSectionStyle = {
  display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px',
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

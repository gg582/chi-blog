import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditPostPage.css';
import API_BASE_URL, { authHeaders, clearAuthAndRedirect } from '../config/api';
import hljs from "../highlight/hljs";

import { marked } from 'marked';

marked.setOptions({
  highlight: function(code, lang) {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return code;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true,
});

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    const fetchRawPost = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}/raw`);
        if (!response.ok) {
          if (response.status === 404) { throw new Error('Post not found.'); }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        setContent(text);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRawPost();
  }, [id]);

  useEffect(() => {
    const html = marked.parse(content);
    setPreviewHtml(html);

    const previewElement = document.getElementById('markdown-preview');
    if (previewElement) {
      previewElement.querySelectorAll('pre code').forEach((block) => {
        if (!block.classList.contains('hljs')) {
          hljs.highlightElement(block);
        }
      });
    }
  }, [content]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/edit-post/${id}`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ content }),
      });
      if (response.status === 401) {
        clearAuthAndRedirect();
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`HTTP Error! Status: ${response.status} - ${errorData.message}`);
      }
      navigate(`/posts/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="edit-post-page">
        <div className="loading-spinner">Loading post...</div>
      </main>
    );
  }

  return (
    <main className="edit-post-page">
      <h2>Edit Post</h2>
      <form onSubmit={handleSave}>
        {error && <p className="error-message">{error.message || error}</p>}

        <div className="form-group">
          <label htmlFor="content">Content (Markdown):</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="15"
            required
          ></textarea>
        </div>

        <div className="preview-section">
          <h3>Preview</h3>
          <div
            id="markdown-preview"
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>

        <button type="submit" className="save-button" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  );
}

export default EditPostPage;

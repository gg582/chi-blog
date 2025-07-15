// ... (이전 NewPostPage.js 코드와 동일) ...

// Function to process the title into a Jekyll-like slug
// 이 함수는 프론트엔드에 다시 있어야 합니다.
const createSlug = (inputTitle) => {
  let slug = inputTitle.toLowerCase();
  // Keep only alphanumeric, Korean, and hyphen characters.
  // \p{L} matches any Unicode letter, \p{N} matches any Unicode number.
  slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, ''); // 'u' flag for unicode support with \p{}
  slug = slug.replace(/[\s-]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  return slug || "untitled-post"; // Ensure a non-empty slug
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title || !content || !author) {
    setMessage('Please fill in all fields (Title, Author, Content).');
    return;
  }

  // Frontend creates the slug
  const postSlug = createSlug(title);
  if (!postSlug) { // Additional check for empty slug after generation
    setMessage('Title is too generic or contains only invalid characters. Cannot create post ID.');
    return;
  }

  // Target URL now includes the slug in the path
  const targetUrl = `http://localhost:8080/api/new-post/${encodeURIComponent(postSlug)}`; // Encode for URL safety

  const postData = {
    title: title, // Send original title for backend to store
    author: author,
    content: content,
    // Note: The slug is in the URL, not strictly needed in body, but can be for redundancy
  };

  console.log('Generated postSlug (frontend):', postSlug);
  console.log('Target URL (frontend):', targetUrl);
  console.log('Sending postData:', postData);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      const responseData = await response.json();
      setMessage(`Post "${responseData.id || postSlug}" submitted successfully! Message: ${responseData.message || 'No specific message.'}`);
      setTitle('');
      setAuthor('');
      setContent('');
    } else {
      const errorData = await response.json();
      setMessage(`Error submitting post: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    setMessage(`Network error: ${error.message}.`);
    console.error('Fetch error:', error);
  }
};

// ... (나머지 NewPostPage.js 코드) ...

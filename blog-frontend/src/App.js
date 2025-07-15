import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import the HomePage component
import PostDetailPage from './pages/PostDetailPage'; // Import the PostDetailPage component
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NewPostPage from './pages/NewPostPage';

function App() {
  return (
    // Router wraps the entire application to enable client-side routing
    <Router>
      {/* Routes component defines specific paths and their corresponding components */}
      <Routes>
        {/* Route for the home page ("/") renders the HomePage component */}
        <Route path="/" element={<HomePage />} />
        {/* Route for individual blog posts ("/posts/:id") renders the PostDetailPage component */}
        <Route path="/posts/:id" element={<PostDetailPage />} />
        {/*
          // Example of how to add more routes later:
          <Route path="/new-post" element={<NewPostPage />} />
        */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/new-post" element={<NewPostPage />} />
      </Routes>
    </Router>
  );
}

export default App;

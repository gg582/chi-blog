import React from 'react';
import './Header.css'; // Styling for the Header component

function Header() {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">
          <a href="/">My Blog</a>
        </h1>
        <nav className="nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/new-post" className="new-post-btn">New Post</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;

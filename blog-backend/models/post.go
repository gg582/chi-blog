package models

import "time"

// Post struct defines the data for a blog post.
type Post struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	ContentHTML string    `json:"contentHtml"` // Markdown content rendered to HTML
	Author      string    `json:"author"`
	CreatedAt   time.Time `json:"createdAt"`
	FileName    string    `json:"fileName"` // Original markdown file name (for debugging)
}

// NewPostRequest struct defines the expected JSON structure for creating a new post.
type NewPostRequest struct {
	Title   string `json:"title"`
	Author  string `json:"author"`
	Content string `json:"content"` // Markdown content
}
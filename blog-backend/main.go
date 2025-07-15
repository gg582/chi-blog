package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors" // Ensure this is imported

	"github.com/gg582/chi-blog/blog-backend/handlers"
)

func main() {
	r := chi.NewRouter()

	// Apply CORS middleware first
	r.Use(cors.Handler(cors.Options{
		// Allow all origins for development (you can narrow this down for production)
		AllowedOrigins: []string{"http://localhost:3000", "http://127.0.0.1:3000"}, // Add 127.0.0.1 if your browser uses it sometimes
		// AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, // Keep these methods
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        // Allow all headers during development (can be narrowed for production)
		AllowedHeaders:   []string{"*"}, // Allow all headers. This is often the culprit for "expected pattern"
        // Expose specific headers if your frontend needs to read them
		ExposedHeaders:   []string{"Link"},
        // Allow sending cookies/auth headers with requests
		AllowCredentials: true,
        // How long the browser can cache the preflight response
		MaxAge:           300, // 5 minutes
	}))

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Define your routes
	r.Get("/api/posts", handlers.GetPostsHandler)
	r.Get("/api/posts/{id}", handlers.GetPostByIDHandler)
	r.Get("/api/about", handlers.GetAboutPageHandler)
	r.Get("/api/contact", handlers.GetContactPageHandler)
	r.Post("/api/new-post/{id}", handlers.CreateNewPostHandler)

	log.Printf("Server started on port :8080...")
	http.ListenAndServe(":8080", r)
}

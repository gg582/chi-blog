package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"fmt"

	"github.com/gg582/chi-blog/blog-backend/database"
	"github.com/gg582/chi-blog/blog-backend/workerpool"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/gg582/chi-blog/blog-backend/handlers"
	"github.com/gg582/chi-blog/blog-backend/utils"
	"github.com/spf13/cobra"
)

const (
    numWorkers = 5
    jobQueueSize = 48
)

func main() {
	var chiBlog = &cobra.Command {
		Use: "run",
		Short: "Run chi-based personal blog",
		Long: `Run chi-based personal blog backend at localhost:8080`,
		Run: func(cmd *cobra.Command, args []string) {
			r := chi.NewRouter()

			// Modern CORS configuration
			// Get allowed origins from environment variable, with sensible defaults
			allowedOrigins := []string{
				"https://hobbies.yoonjin2.kr",
				"https://hobbies.yoonjin2.kr:3000",
				"http://localhost:3000",
			}
			if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
				origins := strings.Split(envOrigins, ",")
				allowedOrigins = make([]string, 0, len(origins))
				for _, origin := range origins {
					if trimmed := strings.TrimSpace(origin); trimmed != "" {
						allowedOrigins = append(allowedOrigins, trimmed)
					}
				}
			}

			r.Use(cors.Handler(cors.Options{
				// Specific origins instead of wildcard for security
				AllowedOrigins: allowedOrigins,
				// Standard HTTP methods for REST APIs
				AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
				// Headers commonly used by modern web applications
				AllowedHeaders: []string{
					"Accept",
					"Authorization",
					"Content-Type",
					"X-CSRF-Token",
					"X-Requested-With",
				},
				// Headers that the browser can expose to the frontend
				ExposedHeaders: []string{
					"Link",
					"X-Total-Count",
				},
				// Allow credentials for cookie-based authentication
				AllowCredentials: true,
				// Cache preflight requests for 1 hour to reduce overhead
				MaxAge: 3600,
			}))

			r.Use(middleware.Logger)
			r.Use(middleware.Recoverer)


            // --- START OF CHANGES ---
            // 1. Rename ImageJobQueue to FileJobQueue
            handlers.FileJobQueue = make(chan workerpool.UploadJob, jobQueueSize)
            workerpool.NewWorkerPool(numWorkers, handlers.FileJobQueue)
            // --- END OF CHANGES ---

			// Define your routes
			r.Post("/api/posts", handlers.GetPostsHandler)
			r.Post("/api/posts/{id}", handlers.GetPostByIDHandler)
			r.Get("/api/about", handlers.GetAboutPageHandler)
			r.Get("/api/contact", handlers.GetContactPageHandler)
			r.Post("/api/new-post/{id}", handlers.CreateNewPostHandler) 
            
            // --- START OF CHANGES ---
            // 2. Rename route from /api/upload-image to /api/upload-file
            // 3. Rename handler from handlers.UploadImage to handlers.UploadFile
            r.Post("/api/upload-file", handlers.UploadFile)
            // --- END OF CHANGES ---
            
			r.Post("/api/login", handlers.LoginHandler)
            fileServer := http.FileServer(http.Dir("./posts/assets")) 
        	r.Handle("/assets/*", http.StripPrefix("/assets/", fileServer))

			log.Printf("Server starting on port :8080 (HTTPS)...")
			database.InitDatabase()
			log.Println("Database loaded.")

			// Use http.ListenAndServeTLS for HTTPS.
			certFile := "/etc/letsencrypt/live/hobbies.yoonjin2.kr/fullchain.pem" // ★★★ Update with your actual fullchain.pem path ★★★
			keyFile := "/etc/letsencrypt/live/hobbies.yoonjin2.kr/privkey.pem"   // ★★★ Update with your actual privkey.pem path ★★★

			// HTTPS server on port 8080 (or 443 if you change the port)
			err := http.ListenAndServeTLS("0.0.0.0:8080", certFile, keyFile, r)
			if err != nil {
				log.Fatalf("HTTPS server failed to start on :8080: %v", err)
			}
		},
	}

	var initAdmin = &cobra.Command {
		Use: "init",
		Short: "Initialize blog admin via cobra",
		Long: `Initialize blog admin via cobra. You need to install sqlite3.`,
		Run: func(cmd *cobra.Command, args []string) {
			log.Println("WARNING: you will add administrator into SQLite. type 'yes' to continue")
			var r string
			fmt.Scanln(&r)
			r = strings.ToLower(r)
			if r != "yes" {
				log.Println("Quitting without registration...")
				os.Exit(1)
			}
			database.InitDatabase()
			rows, err := database.DB.Query("SELECT COUNT(*) FROM blog_users")
			if err != nil {
				log.Fatalf("Failed to query users: %v", err)
			}
			defer rows.Close()
			// Ensure to call rows.Next() before rows.Scan()
			count := 0
			if rows.Next() {
				rows.Scan(&count)
			}

			if count == 0 {
				log.Println("No users registered, continue...")
				log.Println("Please enter your username.")
				var username string
				fmt.Scanln(&username)
				log.Println("Please enter your password.")
				var password string
				fmt.Scanln(&password)
				pwHash, err := utils.HashPassword(password)
				if err != nil {
					log.Fatalf("Failed to generate password hash: %v", err)
				}
				_, err = database.DB.Exec("INSERT INTO blog_users (username, password_hash) values (?,?)", username, pwHash)
				if err != nil {
					log.Fatalf("Failed to insert user info to Database. Please check sqlite3's condition: %v", err)
				}
				log.Printf("Admin user (%v) created", username)
			} else {
				log.Println("You can enter only one admin account for this blog.")
				os.Exit(1)
			}
		},
	}

	chiBlog.AddCommand(initAdmin)
	// Execute the blog command
	if err := chiBlog.Execute(); err != nil {
		log.Println(err)
		os.Exit(1)
	}
}

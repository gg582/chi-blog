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
	"github.com/go-chi/cors" // Ensure this is imported

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

			// Apply CORS middleware first
			r.Use(cors.Handler(cors.Options{
				// AllowedOrigins: Specify the frontend origins allowed to make requests.
				// For GitHub Pages, it must be HTTPS. Include http://localhost for local development.
                //AllowedOrigins: []string{"https://localhost:3000", "http://localhost:3000", "https://chi-blog-seven.vercel.app", "http://chi-blog-seven.vercel.app"},
                AllowedOrigins: []string{"*"},
  				AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
				AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
				// Expose specific headers if your frontend needs to read them
				ExposedHeaders:   []string{"Link"},
				// Allow sending cookies/auth headers with requests
				AllowCredentials: true,
				// How long the browser can cache the preflight response
				MaxAge: 300, // 5 minutes
			}))

			r.Use(middleware.Logger)
			r.Use(middleware.Recoverer)


            handlers.ImageJobQueue = make(chan workerpool.UploadJob, jobQueueSize)
            workerpool.NewWorkerPool(numWorkers, handlers.ImageJobQueue)
			// Define your routes
			r.Post("/api/posts", handlers.GetPostsHandler)
			r.Post("/api/posts/{id}", handlers.GetPostByIDHandler)
			r.Get("/api/about", handlers.GetAboutPageHandler)
			r.Get("/api/contact", handlers.GetContactPageHandler)
			r.Post("/api/new-post/{id}", handlers.CreateNewPostHandler) // this should not be accessible without proper login
            r.Post("/api/upload-image", handlers.UploadImage)
			r.Post("/api/login", handlers.LoginHandler)
            fileServer := http.FileServer(http.Dir("./posts/assets")) 
        	r.Handle("/assets/*", http.StripPrefix("/assets/", fileServer))

			log.Printf("Server starting on port :8080 (HTTPS)...") // Log message changed to reflect HTTPS
			database.InitDatabase()
			log.Println("Database loaded.")

			// Use http.ListenAndServeTLS for HTTPS.
			// Provide the paths to your fullchain.pem and privkey.pem obtained from Certbot.
			// These files are typically found in /etc/letsencrypt/live/YOUR_DOMAIN/
			certFile := "/etc/letsencrypt/live/hobbies.yoonjin2.kr/fullchain.pem" // ★★★ Update with your actual fullchain.pem path ★★★
			keyFile := "/etc/letsencrypt/live/hobbies.yoonjin2.kr/privkey.pem"   // ★★★ Update with your actual privkey.pem path ★★★

			// HTTPS uses the standard 443 port.
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


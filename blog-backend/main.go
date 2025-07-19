package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"fmt"

	"github.com/gg582/chi-blog/blog-backend/database"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors" // Ensure this is imported

	"github.com/gg582/chi-blog/blog-backend/handlers"
	"github.com/gg582/chi-blog/blog-backend/utils"
	"github.com/spf13/cobra"
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
	        r.Post("/api/new-post/{id}", handlers.CreateNewPostHandler) // this should not be accessible without proper login
            r.Post("/api/login", handlers.LoginHandler)

	        log.Printf("Server started on port :8080...")
	        http.ListenAndServe(":8080", r)
        },
    }
    
    var initAdmin = &cobra.Command {
        Use: "init",
        Short: "Initialize blog admin via cobra",
        Long: `Initialize blog admin via cobra. You need to install sqlite3.`,
        Run: func(cmd *cobra.Command, args []string) {
            log.Println("WARNING: you will add administator into SQLite. type 'yes' to continue")
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
            //scan users from database
            count := 0
            rows.Scan(&count)
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
    //RUN blog
    if err := chiBlog.Execute(); err != nil {
        log.Println(err)
        os.Exit(1)
    }
}

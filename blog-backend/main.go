package main

import (
	"context"
	"crypto/tls"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"fmt"

	"github.com/gg582/chi-blog/blog-backend/database"
	"github.com/gg582/chi-blog/blog-backend/workerpool"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/gg582/chi-blog/blog-backend/handlers"
	"github.com/gg582/chi-blog/blog-backend/utils"
	"github.com/spf13/cobra"
	"golang.org/x/crypto/acme/autocert"
)

const (
	numWorkers  = 5
	jobQueueSize = 48
)

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

func main() {
	var chiBlog = &cobra.Command {
		Use: "run",
		Short: "Run chi-based personal blog",
		Long: `Run chi-based personal blog backend at localhost:8080`,
		Run: func(cmd *cobra.Command, args []string) {
			r := chi.NewRouter()

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

			// Serve React frontend static files from ../blog-frontend/build
			staticDir := http.Dir("../blog-frontend/build")
			staticFS := http.FileServer(staticDir)

			r.Get("/*", func(w http.ResponseWriter, req *http.Request) {
				// API routes are already registered above; let chi handle those first.
				// For everything else, try to serve a static file.
				// If the file doesn't exist (SPA route), serve index.html.
				path := req.URL.Path
				if path == "/" {
					http.ServeFile(w, req, "../blog-frontend/build/index.html")
					return
				}
				// Try to open the requested file
				f, err := staticDir.Open(path)
				if err != nil {
					http.ServeFile(w, req, "../blog-frontend/build/index.html")
					return
				}
				defer f.Close()
				// Check if it's a directory
				stat, err := f.Stat()
				if err != nil || stat.IsDir() {
					http.ServeFile(w, req, "../blog-frontend/build/index.html")
					return
				}
				// It's a real file — serve it
				staticFS.ServeHTTP(w, req)
			})

			serverAddr := "0.0.0.0:8080"
			useHTTPS := strings.EqualFold(os.Getenv("USE_HTTPS"), "true")
			if useHTTPS {
				log.Printf("Server starting on %s (HTTPS)...", serverAddr)
			} else {
				log.Printf("Server starting on %s (HTTP)...", serverAddr)
			}
			database.InitDatabase()
			log.Println("Database loaded.")

			// Use HTTPS only when explicitly enabled via USE_HTTPS=true.
			certFile := "/etc/letsencrypt/live/chatter.pw/fullchain.pem"
			keyFile := "/etc/letsencrypt/live/chatter.pw/privkey.pem"

			var err error
			if useHTTPS {
				certExists := fileExists(certFile) && fileExists(keyFile)
				if certExists {
					log.Printf("Found existing TLS certificate files for chatter.pw. Starting HTTPS with local certificate on %s.", serverAddr)
					err = http.ListenAndServeTLS(serverAddr, certFile, keyFile, r)
				} else {
					cacheDir := filepath.Join(".", "cert-cache")
					if mkErr := os.MkdirAll(cacheDir, 0o700); mkErr != nil {
						log.Fatalf("failed to create autocert cache directory %s: %v", cacheDir, mkErr)
					}

					log.Printf("TLS certificate not found at %s and %s. Requesting Let's Encrypt certificate for chatter.pw...", certFile, keyFile)
					manager := &autocert.Manager{
						Prompt:     autocert.AcceptTOS,
						HostPolicy: autocert.HostWhitelist("chatter.pw"),
						Cache:      autocert.DirCache(cacheDir),
					}

					challengeAddr := ":80"
					challengeListener, listenErr := net.Listen("tcp", challengeAddr)
					if listenErr != nil {
						log.Fatalf("failed to bind Let's Encrypt challenge server on %s: %v", challengeAddr, listenErr)
					}
					challengeServer := &http.Server{
						Handler: manager.HTTPHandler(nil),
					}
					challengeErrChan := make(chan error, 1)
					go func() {
						log.Printf("Starting HTTP-01 challenge server on %s for Let's Encrypt validation.", challengeAddr)
						if challengeErr := challengeServer.Serve(challengeListener); challengeErr != nil && challengeErr != http.ErrServerClosed {
							challengeErrChan <- challengeErr
						}
					}()
					select {
					case challengeErr := <-challengeErrChan:
						log.Fatalf("Let's Encrypt challenge server failed before HTTPS startup: %v", challengeErr)
					default:
					}

					autoTLSServer := &http.Server{
						Addr:    serverAddr,
						Handler: r,
						TLSConfig: &tls.Config{
							MinVersion:     tls.VersionTLS12,
							GetCertificate: manager.GetCertificate,
						},
					}

					err = autoTLSServer.ListenAndServeTLS("", "")
					shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
					defer cancel()
					if shutdownErr := challengeServer.Shutdown(shutdownCtx); shutdownErr != nil && shutdownErr != http.ErrServerClosed {
						log.Printf("failed to shutdown challenge server cleanly: %v", shutdownErr)
					}
				}
			} else {
				err = http.ListenAndServe(serverAddr, r)
			}
			if err != nil {
				log.Fatalf("server failed to start on %s: %v", serverAddr, err)
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

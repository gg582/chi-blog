package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/russross/blackfriday/v2"

	"blog-backend/models"
	"blog-backend/utils"
)

// GetAboutPageHandler handles fetching the content for the about page.
func GetAboutPageHandler(w http.ResponseWriter, r *http.Request) {
	filePath := filepath.Join("./posts", "about.md") // Assuming about.md is in the 'posts' directory
	
	content, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "About page content not found.", http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf("Error reading about file: %v", err), http.StatusInternalServerError)
		return
	}

	author, cleanedContent := utils.ParseAuthorAndCleanContent(content)
	htmlContent := blackfriday.Run(cleanedContent)
	
	// Determine title from cleaned content, or use a default
	title := "About Us"
	lines := strings.Split(string(cleanedContent), "\n")
	for _, line := range lines {
		trimmedLine := strings.TrimSpace(line)
		if trimmedLine != "" {
			if strings.HasPrefix(trimmedLine, "#") {
				title = strings.TrimSpace(strings.TrimPrefix(trimmedLine, "#"))
			} else {
				title = trimmedLine
			}
			break
		}
	}

	fileInfo, _ := os.Stat(filePath)
	createdAt := fileInfo.ModTime()

	post := models.Post{
		ID:          "about",
		Title:       title,
		ContentHTML: string(htmlContent),
		Author:      author,
		CreatedAt:   createdAt,
		FileName:    "about.md",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

// GetContactPageHandler handles fetching the content for the contact page.
func GetContactPageHandler(w http.ResponseWriter, r *http.Request) {
	filePath := filepath.Join("./posts", "contact.md") // Assuming contact.md is in the 'posts' directory
	
	content, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Contact page content not found.", http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf("Error reading contact file: %v", err), http.StatusInternalServerError)
		return
	}

	author, cleanedContent := utils.ParseAuthorAndCleanContent(content)
	htmlContent := blackfriday.Run(cleanedContent)
	
	// Determine title from cleaned content, or use a default
	title := "Contact Us"
	lines := strings.Split(string(cleanedContent), "\n")
	for _, line := range lines {
		trimmedLine := strings.TrimSpace(line)
		if trimmedLine != "" {
			if strings.HasPrefix(trimmedLine, "#") {
				title = strings.TrimSpace(strings.TrimPrefix(trimmedLine, "#"))
			} else {
				title = trimmedLine
			}
			break
		}
	}

	fileInfo, _ := os.Stat(filePath)
	createdAt := fileInfo.ModTime()

	post := models.Post{
		ID:          "contact",
		Title:       title,
		ContentHTML: string(htmlContent),
		Author:      author,
		CreatedAt:   createdAt,
		FileName:    "contact.md",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

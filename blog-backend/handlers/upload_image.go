package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"github.com/gg582/chi-blog/blog-backend/workerpool"
)

var ImageJobQueue chan workerpool.UploadJob

func UploadImage(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error retrieving the file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	uploadDirRelative := filepath.Join("posts", "assets")

	if _, err := os.Stat(uploadDirRelative); os.IsNotExist(err) {
		if err := os.MkdirAll(uploadDirRelative, os.ModePerm); err != nil {
			http.Error(w, fmt.Sprintf("Error creating upload directory '%s': %v", uploadDirRelative, err), http.StatusInternalServerError)
			return
		}
	}

	resultChan := make(chan workerpool.UploadResult)

	job := workerpool.UploadJob{
		File:       file,
		FileHeader: *handler,
		UploadDir:  uploadDirRelative,
		ResultChan: resultChan,
	}

	select {
	case ImageJobQueue <- job:
		log.Printf("Job for %s submitted to worker pool.", handler.Filename)
	default:
		http.Error(w, "Server is busy. Please try again later.", http.StatusServiceUnavailable)
		return
	}

	result := <-resultChan
	close(resultChan)

	if result.Error != nil {
		http.Error(w, fmt.Sprintf("File upload failed: %v", result.Error), http.StatusInternalServerError)
		return
	}

	publicURL := fmt.Sprintf("https://hobbies.yoonjin2.kr:8080/assets/%s", result.SavedFileName)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	responseJSON, _ := json.Marshal(map[string]string{
		"url":      publicURL,
		"fileName": result.OriginalFileName,
	})
	w.Write(responseJSON)

	log.Printf("Response sent for original file %s. Public URL: %s", result.OriginalFileName, publicURL)
}

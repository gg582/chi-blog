package workerpool

import (
    "fmt"
    "io"
    "log"
    "mime/multipart"
    "os"
    "path/filepath"
)

type UploadJob struct {
    File multipart.File
    FileHeader multipart.FileHeader
    UploadDir string
    ResultChan chan UploadResult
}

type UploadResult struct {
    SavedFileName string
    OriginalFileName string
    Error error
}

func NewWorkerPool(numWorkers int, jobQueue chan UploadJob) {
    for i := 0; i < numWorkers; i++ {
        go startWorker(i+1, jobQueue)
    }
}

func startWorker(id int, jobQueue chan UploadJob) {
    log.Printf("Worker %d started.", id)
    for job := range jobQueue {
        processUploadJob(id, job)
    }
    log.Printf("Worker %d stopped.", id)
}

func processUploadJob(id int, job UploadJob) {
    var result UploadResult
    result.OriginalFileName = job.FileHeader.Filename

    log.Printf("Worker %d: Processing file (%s)", id, result.OriginalFileName)

    savedFileName := job.FileHeader.Filename
    filePath := filepath.Join(job.UploadDir, savedFileName)

    dst, err := os.Create(filePath)
    if err != nil {
        result.Error = fmt.Errorf("worker %d: error creating file %s, %w", id, filePath, err)
        log.Printf("Error in worker %d: %v", id, result.Error)
        job.ResultChan <- result
        return
    }
    defer dst.Close()

    if _, err := io.Copy(dst, job.File); err != nil {
        result.Error = fmt.Errorf("worker %d: error copying file content for %s, %w", id, job.FileHeader.Filename, err)
        log.Printf("Error in worker %d: %v", id, result.Error)
        job.ResultChan <- result
        return
    }

    result.SavedFileName = savedFileName
    result.Error = nil

    log.Printf("Worker %d: successfully processed file %s. Saved as: %s", id, job.FileHeader.Filename, savedFileName)
    job.ResultChan <- result
}



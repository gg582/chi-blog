package database

import (
    "database/sql"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDatabase() {
    var err error
    DB, err = sql.Open("sqlite3", "/opt/chi-blog/blog-backend/auth.db")
    if err != nil {
        log.Fatalf("Failed to open database: %v", err)
    }
    createTblIfNone := `CREATE TABLE IF NOT EXISTS blog_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    );`
    _, err = DB.Exec(createTblIfNone)
    if err != nil {
        log.Fatalf("Failed to create users table: %v", err)
    }
    log.Println("Database initialized and users table checked/created")
}

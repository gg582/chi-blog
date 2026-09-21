# Multi-stage build for chi-blog (React frontend + Go/chi backend).
#
# Build:
#   docker build -t chi-blog .
#   # Optionally pass the frontend API URL at build time:
#   docker build --build-arg REACT_APP_API_URL=https://chatter.pw -t chi-blog .
#
# Run:
#   docker run -p 8080:8080 -e ALLOWED_ORIGINS=https://chatter.pw,http://localhost:3000 chi-blog

# --- Stage 1: build the React frontend ---
FROM node:20-bookworm-slim AS frontend
ARG REACT_APP_API_URL=""
WORKDIR /app/blog-frontend
COPY blog-frontend/package.json blog-frontend/package-lock.json ./
RUN npm ci
COPY blog-frontend/ ./
RUN REACT_APP_API_URL=$REACT_APP_API_URL npm run build

# --- Stage 2: build the Go backend ---
FROM golang:1.24-bookworm AS backend
WORKDIR /app/blog-backend
# CGO is required for mattn/go-sqlite3.
COPY blog-backend/go.mod blog-backend/go.sum ./
RUN go mod download
COPY blog-backend/ ./
RUN CGO_ENABLED=1 go build -o /out/chi-blog .

# --- Stage 3: runtime image ---
FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend /out/chi-blog /usr/local/bin/chi-blog
COPY --from=frontend /app/blog-frontend/build /app/blog-frontend/build
COPY blog-backend/posts /app/blog-backend/posts
COPY blog-backend/about /app/blog-backend/about
COPY blog-backend/contact /app/blog-backend/contact
COPY blog-backend/auth.db /app/blog-backend/auth.db

WORKDIR /app/blog-backend
ENV STATIC_DIR=/app/blog-frontend/build \
    SERVER_ADDR=:8080
EXPOSE 8080
CMD ["chi-blog"]

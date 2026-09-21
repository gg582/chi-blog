.PHONY: build install uninstall clean

FRONTEND_DIR := blog-frontend
BACKEND_DIR  := blog-backend
BINARY_NAME  := chi-blog
INSTALL_DIR  := /opt/chi-blog
SYSTEMD_DIR  := /etc/systemd/system

build:
	@echo "==> Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install
	@echo "==> Building frontend..."
	cd $(FRONTEND_DIR) && npm run build
	@echo "==> Tidying Go modules..."
	cd $(BACKEND_DIR) && go mod tidy
	@echo "==> Building Go backend..."
	cd $(BACKEND_DIR) && go build -o $(BINARY_NAME) .
	@echo "Build complete: $(BACKEND_DIR)/$(BINARY_NAME)"

install: build
	@if [ $$(id -u) -ne 0 ]; then \
		echo "Error: 'make install' must be run as root (try: sudo make install)"; \
		exit 1; \
	fi
	@echo "==> Installing to $(INSTALL_DIR)..."
	mkdir -p $(INSTALL_DIR)/bin
	mkdir -p $(INSTALL_DIR)/blog-backend/posts
	mkdir -p $(INSTALL_DIR)/blog-frontend/build
	cp $(BACKEND_DIR)/$(BINARY_NAME) $(INSTALL_DIR)/bin/
	cp -r $(BACKEND_DIR)/posts/* $(INSTALL_DIR)/blog-backend/posts/ 2>/dev/null || true
	cp -r $(BACKEND_DIR)/about $(INSTALL_DIR)/blog-backend/ 2>/dev/null || true
	cp -r $(BACKEND_DIR)/contact $(INSTALL_DIR)/blog-backend/ 2>/dev/null || true
	cp -r $(FRONTEND_DIR)/build/* $(INSTALL_DIR)/blog-frontend/build/
	cp $(BACKEND_DIR)/auth.db $(INSTALL_DIR)/blog-backend/ 2>/dev/null || true
	@echo "==> Installing systemd service..."
	printf '[Unit]\nDescription=Chi Blog Server\nAfter=network.target\n\n[Service]\nType=simple\nUser=root\nWorkingDirectory=%s/blog-backend\nExecStart=%s/bin/%s\nRestart=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\n' \
		"$(INSTALL_DIR)" "$(INSTALL_DIR)" "$(BINARY_NAME)" > $(SYSTEMD_DIR)/chi-blog.service
	systemctl daemon-reload
	systemctl enable chi-blog
	@echo "==> Starting chi-blog service..."
	systemctl start chi-blog
	@echo ""
	@echo "Installation complete."
	@echo "  - Service : chi-blog"
	@echo "  - URL     : http://localhost:8080"
	@echo "  - Logs    : journalctl -u chi-blog -f"
	@echo "  - Control : sudo systemctl {start|stop|restart|status} chi-blog"

uninstall:
	@if [ $$(id -u) -ne 0 ]; then \
		echo "Error: 'make uninstall' must be run as root (try: sudo make uninstall)"; \
		exit 1; \
	fi
	@echo "==> Stopping and disabling chi-blog..."
	systemctl stop chi-blog 2>/dev/null || true
	systemctl disable chi-blog 2>/dev/null || true
	rm -f $(SYSTEMD_DIR)/chi-blog.service
	systemctl daemon-reload
	@echo "==> Removing installation directory..."
	rm -rf $(INSTALL_DIR)
	@echo "Uninstall complete."

clean:
	@echo "==> Cleaning build artifacts..."
	cd $(FRONTEND_DIR) && rm -rf build
	cd $(BACKEND_DIR) && rm -f $(BINARY_NAME)
	@echo "Clean complete."

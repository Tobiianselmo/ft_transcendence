.PHONY: all build up stop clean fclean re help

# Regla por defecto: construye y levanta los contenedores
all: build up

# Construye las imágenes de Docker
build:
	@echo "📦 Building Docker images..."
	@docker compose build --no-cache > /dev/null 2>&1
	@echo "✅ Docker images built successfully."

# Levanta los contenedores de Docker
up:
	@echo "🚀 Starting Docker containers..."
	@docker compose up -d --remove-orphans > /dev/null 2>&1
	@echo "✅ Docker containers started successfully."
	@echo " -------------------------------------------- "
	@echo "🌐 Frontend: https://localhost:8443"

# Solo detener contenedores (mantiene database)
stop:
	@echo "⏹️ Stopping Docker containers..."
	@docker compose down > /dev/null 2>&1
	@echo "✅ Docker containers stopped (data preserved)."

# Limpiar sin eliminar volúmenes (mantiene database)
clean:
	@echo "🧹 Cleaning Docker containers and images (preserving data)..."
	@docker compose down --rmi all > /dev/null 2>&1
	@echo "✅ Docker cleanup completed (data preserved)."

# Limpia completamente (borra database)
fclean:
	@echo "🧹 Cleaning Docker containers, images, and volumes..."
	@echo "⚠️  WARNING: This will delete all user data!"
	@docker compose down -v --rmi all > /dev/null 2>&1
	@echo "✅ Docker cleanup completed (all data deleted)."

# Reconstruye (mantiene database)
re: clean build up

# Ayuda
help:
	@echo "Available commands:"
	@echo "  make          - Build and start Docker containers"
	@echo "  make build    - Only build Docker images"
	@echo "  make up       - Only start Docker containers"
	@echo "  make stop     - Stop containers (preserves database)"
	@echo "  make clean    - Clean containers/images (preserves database)"
	@echo "  make fclean   - Full clean (removes database)"
	@echo "  make re       - Rebuild (preserves database)"

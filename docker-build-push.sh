#!/bin/bash

# Script de build et push Docker pour sqlite-web
# Usage: ./docker-build-push.sh [tag]

set -e

# Configuration
DOCKER_USERNAME="fizzbuzz2"  # Nom d'utilisateur Docker Hub
DOCKER_REPO="$DOCKER_USERNAME/sqlite-web"
DEFAULT_TAG="latest"
TAG=${1:-$DEFAULT_TAG}

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé ou pas accessible"
    exit 1
fi

# Vérifier que nous sommes dans le bon répertoire
if [[ ! -f "docker/Dockerfile" ]]; then
    log_error "Dockerfile non trouvé dans docker/. Êtes-vous dans le bon répertoire ?"
    exit 1
fi

log_info "Démarrage du build et push Docker..."
log_info "Repository: $DOCKER_REPO"
log_info "Tag: $TAG"

# Arrêter et supprimer le container existant s'il existe
log_info "Arrêt du container existant..."
docker stop sqlite-web-demo 2>/dev/null || true
docker rm sqlite-web-demo 2>/dev/null || true

# Build de l'image
log_info "Build de l'image Docker..."
if docker build -t "$DOCKER_REPO:$TAG" -f docker/Dockerfile .; then
    log_success "Build réussi"
else
    log_error "Échec du build"
    exit 1
fi

# Tag supplémentaire pour latest si ce n'est pas déjà latest
if [[ "$TAG" != "latest" ]]; then
    log_info "Création du tag latest..."
    docker tag "$DOCKER_REPO:$TAG" "$DOCKER_REPO:latest"
fi

# Vérifier si l'utilisateur est connecté à Docker Hub
log_info "Vérification de la connexion Docker Hub..."
if ! docker info | grep -q "Username"; then
    log_warning "Non connecté à Docker Hub. Tentative de connexion..."
    echo "Veuillez vous connecter à Docker Hub:"
    docker login
fi

# Push vers Docker Hub
log_info "Push vers Docker Hub..."
if docker push "$DOCKER_REPO:$TAG"; then
    log_success "Push de $DOCKER_REPO:$TAG réussi"
else
    log_error "Échec du push de $DOCKER_REPO:$TAG"
    exit 1
fi

# Push latest si différent
if [[ "$TAG" != "latest" ]]; then
    if docker push "$DOCKER_REPO:latest"; then
        log_success "Push de $DOCKER_REPO:latest réussi"
    else
        log_warning "Échec du push de $DOCKER_REPO:latest"
    fi
fi

# Afficher les informations finales
log_success "Build et push terminés avec succès!"
echo ""
log_info "Images disponibles:"
echo "  - $DOCKER_REPO:$TAG"
if [[ "$TAG" != "latest" ]]; then
    echo "  - $DOCKER_REPO:latest"
fi
echo ""
log_info "Pour utiliser l'image:"
echo "  docker run -p 8080:8080 -v /path/to/data:/data -e SQLITE_DATABASE=your_db.db $DOCKER_REPO:$TAG"
echo ""
log_info "Pour tester localement:"
echo "  ./docker-run-local.sh"
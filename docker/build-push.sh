#!/bin/bash

# Script pour build et push de l'image Docker sqlite-web
set -e

# Configuration
IMAGE_NAME="sqlite-web"
REGISTRY=""  # Laissez vide pour Docker Hub, ou définissez votre registry
TAG_LATEST="latest"

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

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Affiche cette aide"
    echo "  -n, --name IMAGE    Nom de l'image (défaut: sqlite-web)"
    echo "  -r, --registry REG  Registry à utiliser"
    echo "  -t, --tag TAG       Tag supplémentaire (en plus de latest)"
    echo "  --no-push           Build seulement, pas de push"
    echo "  --build-only        Alias pour --no-push"
    echo ""
    echo "Exemples:"
    echo "  $0                                    # Build et push avec tag latest"
    echo "  $0 --no-push                         # Build seulement"
    echo "  $0 -n myapp/sqlite-web -t v1.0       # Build avec nom custom et tag"
    echo "  $0 -r ghcr.io/user -t v1.0          # Push vers GitHub Container Registry"
}

# Parse des arguments
PUSH=true
EXTRA_TAG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2/"
            shift 2
            ;;
        -t|--tag)
            EXTRA_TAG="$2"
            shift 2
            ;;
        --no-push|--build-only)
            PUSH=false
            shift
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Construction du nom complet de l'image
FULL_IMAGE_NAME="${REGISTRY}${IMAGE_NAME}"

log_info "Configuration:"
log_info "  Image: ${FULL_IMAGE_NAME}"
log_info "  Push: ${PUSH}"
if [[ -n "$EXTRA_TAG" ]]; then
    log_info "  Tags: latest, ${EXTRA_TAG}"
else
    log_info "  Tags: latest"
fi

# Vérification que nous sommes dans le bon répertoire
if [[ ! -f "Dockerfile" ]]; then
    log_error "Dockerfile non trouvé. Exécutez ce script depuis le répertoire docker/"
    exit 1
fi

# Build de l'image
log_info "Construction de l'image Docker..."
docker build -t "${FULL_IMAGE_NAME}:${TAG_LATEST}" .

if [[ $? -eq 0 ]]; then
    log_success "Image construite avec succès: ${FULL_IMAGE_NAME}:${TAG_LATEST}"
else
    log_error "Échec de la construction de l'image"
    exit 1
fi

# Tag supplémentaire si spécifié
if [[ -n "$EXTRA_TAG" ]]; then
    log_info "Ajout du tag supplémentaire: ${EXTRA_TAG}"
    docker tag "${FULL_IMAGE_NAME}:${TAG_LATEST}" "${FULL_IMAGE_NAME}:${EXTRA_TAG}"
    log_success "Tag ajouté: ${FULL_IMAGE_NAME}:${EXTRA_TAG}"
fi

# Push si demandé
if [[ "$PUSH" == true ]]; then
    log_info "Push de l'image vers le registry..."
    
    # Push du tag latest
    docker push "${FULL_IMAGE_NAME}:${TAG_LATEST}"
    if [[ $? -eq 0 ]]; then
        log_success "Image pushée: ${FULL_IMAGE_NAME}:${TAG_LATEST}"
    else
        log_error "Échec du push pour le tag latest"
        exit 1
    fi
    
    # Push du tag supplémentaire si présent
    if [[ -n "$EXTRA_TAG" ]]; then
        docker push "${FULL_IMAGE_NAME}:${EXTRA_TAG}"
        if [[ $? -eq 0 ]]; then
            log_success "Image pushée: ${FULL_IMAGE_NAME}:${EXTRA_TAG}"
        else
            log_error "Échec du push pour le tag ${EXTRA_TAG}"
            exit 1
        fi
    fi
    
    log_success "Toutes les images ont été pushées avec succès!"
else
    log_info "Push ignoré (option --no-push utilisée)"
fi

# Affichage des informations finales
log_info "Images créées:"
docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

log_success "Terminé!"
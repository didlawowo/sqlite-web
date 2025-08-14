#!/bin/bash

# Script pour lancer sqlite-web localement avec Docker
# Usage: ./docker-run-local.sh [port] [database]

set -e

# Configuration par défaut
DEFAULT_PORT="8082"
DEFAULT_DB="demo.db"
DEFAULT_DATA_DIR="/tmp/sqlite-demo"

PORT=${1:-$DEFAULT_PORT}
DATABASE=${2:-$DEFAULT_DB}
DATA_DIR=${3:-$DEFAULT_DATA_DIR}

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Créer le répertoire de données s'il n'existe pas
if [[ ! -d "$DATA_DIR" ]]; then
    log_info "Création du répertoire de données: $DATA_DIR"
    mkdir -p "$DATA_DIR"
fi

# Créer une base de données de démo si elle n'existe pas
if [[ ! -f "$DATA_DIR/$DATABASE" ]]; then
    log_info "Création de la base de données de démo: $DATABASE"
    sqlite3 "$DATA_DIR/$DATABASE" << EOF
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES 
    ('Alice Dupont', 'alice@example.com'),
    ('Bob Martin', 'bob@example.com'),
    ('Charlie Bernard', 'charlie@example.com'),
    ('Diana Rousseau', 'diana@example.com');

INSERT INTO products (name, price, category) VALUES 
    ('Laptop Dell XPS', 1299.99, 'Electronics'),
    ('Souris Sans Fil', 29.99, 'Electronics'),
    ('Clavier Mécanique', 89.99, 'Electronics'),
    ('Chaise de Bureau', 199.99, 'Furniture'),
    ('Lampe LED', 49.99, 'Lighting');
EOF
    log_success "Base de données de démo créée avec des données d'exemple"
fi

# Arrêter le container existant s'il existe
log_info "Arrêt du container existant..."
docker stop sqlite-web-demo 2>/dev/null || true
docker rm sqlite-web-demo 2>/dev/null || true

# Lancer le nouveau container
log_info "Lancement du container sqlite-web..."
log_info "Port: $PORT"
log_info "Base de données: $DATABASE"
log_info "Répertoire de données: $DATA_DIR"

CONTAINER_ID=$(docker run -d \
    -p "$PORT:8080" \
    -v "$DATA_DIR:/data" \
    -e SQLITE_DATABASE="$DATABASE" \
    --name sqlite-web-demo \
    sqlite-web:latest)

log_success "Container lancé avec l'ID: ${CONTAINER_ID:0:12}"

# Attendre que le container soit prêt
log_info "Attente du démarrage du serveur..."
sleep 3

# Vérifier que le container fonctionne
if docker ps | grep -q sqlite-web-demo; then
    log_success "SQLite Pro est maintenant accessible sur: http://localhost:$PORT"
    echo ""
    log_info "Informations utiles:"
    echo "  - Container: sqlite-web-demo"
    echo "  - Base de données: $DATABASE"
    echo "  - Données dans: $DATA_DIR"
    echo ""
    log_info "Commandes utiles:"
    echo "  - Voir les logs: docker logs sqlite-web-demo"
    echo "  - Arrêter: docker stop sqlite-web-demo"
    echo "  - Redémarrer: docker restart sqlite-web-demo"
else
    log_warning "Le container semble avoir des problèmes. Vérifiez les logs:"
    docker logs sqlite-web-demo
fi
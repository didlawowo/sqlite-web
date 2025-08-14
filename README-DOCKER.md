# SQLite Pro - Version Docker Sécurisée

Version modernisée et sécurisée de sqlite-web avec interface utilisateur améliorée.

## 🚀 Démarrage rapide

### Option 1: Utiliser l'image Docker Hub

```bash
docker run -p 8080:8080 -v /path/to/your/data:/data -e SQLITE_DATABASE=your_db.db fizzbuzz2/sqlite-web:latest
```

### Option 2: Scripts de développement

```bash
# Lancement rapide avec base de données de démo
./docker-run-local.sh

# Ou spécifier port et base de données
./docker-run-local.sh 8082 ma_base.db
```

## 🛠️ Scripts disponibles

### `docker-build-push.sh`
Build et push l'image vers Docker Hub.

```bash
# Build et push avec tag latest
./docker-build-push.sh

# Build et push avec tag spécifique
./docker-build-push.sh v1.0.0
```

### `docker-run-local.sh`
Lance une instance locale avec base de données de démo.

```bash
# Utilise les paramètres par défaut (port 8082, demo.db)
./docker-run-local.sh

# Spécifie le port
./docker-run-local.sh 8080

# Spécifie port et base de données
./docker-run-local.sh 8080 ma_base.db

# Spécifie port, base de données et répertoire
./docker-run-local.sh 8080 ma_base.db /mon/repertoire/data
```

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SQLITE_DATABASE` | Nom du fichier de base de données | `db.db` |
| `SQLITE_WEB_SECRET_KEY` | Clé secrète pour les sessions | Auto-générée |

### Volumes

- `/data` : Répertoire contenant les bases de données SQLite

### Ports

- `8080` : Port d'écoute du serveur web

## 🛡️ Fonctionnalités de sécurité

✅ **Protection CSRF** - Protection contre les attaques Cross-Site Request Forgery  
✅ **Rate Limiting** - Limitation du nombre de requêtes (5/minute sur login)  
✅ **Sanitisation SQL** - Validation et nettoyage des entrées utilisateur  
✅ **Clés secrètes dynamiques** - Génération automatique de clés sécurisées  
✅ **Validation des identifiants** - Contrôle strict des noms de tables/colonnes  

## 🎨 Interface moderne

- Design responsive et professionnel
- Cartes et statistiques visuelles
- Éditeur de requêtes amélioré
- Meilleure lisibilité et contrastes
- Suppression du mode sombre automatique

## 📊 Base de données de démo

Le script `docker-run-local.sh` crée automatiquement une base de données avec :

**Table `users`:**
- Alice Dupont (alice@example.com)
- Bob Martin (bob@example.com)
- Charlie Bernard (charlie@example.com)
- Diana Rousseau (diana@example.com)

**Table `products`:**
- Laptop Dell XPS (1299.99€, Electronics)
- Souris Sans Fil (29.99€, Electronics)
- Clavier Mécanique (89.99€, Electronics)
- Chaise de Bureau (199.99€, Furniture)
- Lampe LED (49.99€, Lighting)

## 🔨 Build local

```bash
# Build de l'image
docker build -t fizzbuzz2/sqlite-web -f docker/Dockerfile .

# Lancement
docker run -p 8080:8080 -v /path/to/data:/data -e SQLITE_DATABASE=demo.db fizzbuzz2/sqlite-web
```

## 📝 Commandes utiles

```bash
# Voir les logs
docker logs sqlite-web-demo

# Arrêter le container
docker stop sqlite-web-demo

# Redémarrer
docker restart sqlite-web-demo

# Entrer dans le container
docker exec -it sqlite-web-demo sh

# Voir les processus
docker ps | grep sqlite-web
```

## 🚨 Notes importantes

- L'utilisateur dans le container n'est pas root (sécurité)
- SQLite est compilé avec optimisations et extensions complètes
- La base de données est persistée dans le volume `/data`
- Le serveur écoute sur `0.0.0.0:8080` dans le container

## 📋 Changelog

### Version actuelle
- ✅ Corrections de sécurité critiques
- ✅ Interface utilisateur modernisée
- ✅ Scripts d'automatisation Docker
- ✅ Base de données de démo
- ✅ Documentation complète
- ✅ Image disponible sur Docker Hub

---

🔗 **Image Docker:** `fizzbuzz2/sqlite-web:latest`  
🌐 **Interface locale:** http://localhost:8082  
📖 **Documentation:** Voir `CLAUDE.md` pour les détails techniques
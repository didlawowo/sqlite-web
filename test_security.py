#!/usr/bin/env python3
"""
Test simple pour vérifier les corrections de sécurité de sqlite-web
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlite_web.sqlite_web import (
    sanitize_sql_identifier, 
    validate_and_wrap_subquery, 
    validate_ordering_column
)

def test_sanitize_sql_identifier():
    """Test de la validation des identifiants SQL"""
    print("=== Test sanitize_sql_identifier ===")
    
    # Cas valides
    valid_names = ["table1", "user_data", "col_name", "_private", "table123"]
    for name in valid_names:
        try:
            result = sanitize_sql_identifier(name)
            print(f"✅ '{name}' -> '{result}' (valide)")
        except ValueError as e:
            print(f"❌ '{name}' rejeté incorrectement: {e}")
    
    # Cas invalides (injection potentielle)
    invalid_names = [
        "table'; DROP TABLE users; --",
        "user-data",
        "table name",
        "1table",
        "table@domain",
        "",
        None
    ]
    for name in invalid_names:
        try:
            result = sanitize_sql_identifier(name)
            print(f"❌ '{name}' accepté à tort: '{result}'")
        except ValueError:
            print(f"✅ '{name}' correctement rejeté")
        except Exception as e:
            print(f"✅ '{name}' correctement rejeté ({type(e).__name__})")

def test_validate_subquery():
    """Test de la validation des sous-requêtes"""
    print("\n=== Test validate_and_wrap_subquery ===")
    
    # Cas valides
    valid_queries = [
        "SELECT * FROM users",
        "SELECT id, name FROM products WHERE price > 100",
        "SELECT COUNT(*) FROM orders"
    ]
    for query in valid_queries:
        try:
            result = validate_and_wrap_subquery(query)
            print(f"✅ Requête valide: '{query[:30]}...'")
        except ValueError as e:
            print(f"❌ Requête valide rejetée: {e}")
    
    # Cas invalides (injection SQL)
    invalid_queries = [
        "SELECT * FROM users; DROP TABLE users; --",
        "SELECT * FROM users; DELETE FROM users; --",
        "SELECT * FROM users; INSERT INTO admin VALUES ('hacker'); --",
        "SELECT * FROM users /* comment */ WHERE 1=1",
        "",
        None
    ]
    for query in invalid_queries:
        try:
            result = validate_and_wrap_subquery(query)
            print(f"❌ Requête dangereuse acceptée: '{str(query)[:30]}...'")
        except ValueError:
            print(f"✅ Requête dangereuse correctement rejetée: '{str(query)[:30]}...'")
        except Exception as e:
            print(f"✅ Requête dangereuse correctement rejetée ({type(e).__name__})")

def test_validate_ordering():
    """Test de la validation des paramètres d'ordering"""
    print("\n=== Test validate_ordering_column ===")
    
    # Cas valides
    valid_ordering = ["1", "-1", "5", "-10", "50"]
    for ordering in valid_ordering:
        try:
            result = validate_ordering_column(ordering)
            print(f"✅ Ordering valide: '{ordering}' -> {result}")
        except ValueError as e:
            print(f"❌ Ordering valide rejeté: {e}")
    
    # Cas invalides
    invalid_ordering = [
        "'; DROP TABLE users; --",
        "abc",
        "1.5",
        "101",  # Trop grand
        "-101", # Trop petit
        "",
        None
    ]
    for ordering in invalid_ordering:
        try:
            result = validate_ordering_column(ordering)
            print(f"❌ Ordering invalide accepté: '{ordering}' -> {result}")
        except ValueError:
            print(f"✅ Ordering invalide correctement rejeté: '{ordering}'")
        except Exception as e:
            print(f"✅ Ordering invalide correctement rejeté ({type(e).__name__}): '{ordering}'")

def test_secret_key():
    """Test de la génération du secret key"""
    print("\n=== Test SECRET_KEY ===")
    
    # Test sans variable d'environnement
    import secrets as secrets_module
    from sqlite_web.sqlite_web import SECRET_KEY
    
    if len(SECRET_KEY) >= 32:
        print(f"✅ SECRET_KEY généré avec longueur suffisante: {len(SECRET_KEY)} caractères")
    else:
        print(f"❌ SECRET_KEY trop court: {len(SECRET_KEY)} caractères")
    
    # Vérifier qu'il n'est pas statique
    if SECRET_KEY != 'sqlite-database-browser-0.1.0':
        print("✅ SECRET_KEY n'est plus statique")
    else:
        print("❌ SECRET_KEY toujours statique")

if __name__ == "__main__":
    print("🔒 Tests de sécurité pour sqlite-web")
    print("=" * 50)
    
    test_sanitize_sql_identifier()
    test_validate_subquery()
    test_validate_ordering()
    test_secret_key()
    
    print("\n" + "=" * 50)
    print("✅ Tests de sécurité terminés")
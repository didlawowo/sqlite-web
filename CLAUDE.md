# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sqlite-web is a web-based SQLite database browser written in Python using Flask and Peewee ORM. It provides a complete web interface for viewing, editing, and managing SQLite databases.

## Architecture

- **Entry Point**: `sqlite_web/sqlite_web.py` - Main Flask application with all routes and database operations
- **CLI Interface**: Accessible via `sqlite_web` command or `python -m sqlite_web`
- **Frontend**: Static assets in `sqlite_web/static/` (Bootstrap-based UI with jQuery)
- **Templates**: Jinja2 templates in `sqlite_web/templates/`
- **Dependencies**: Flask (web framework), Peewee (ORM), Pygments (SQL syntax highlighting)

## Installation and Setup

Install using uv (recommended):
```bash
uv pip install -e .
```

Or using pip:
```bash
pip install -e .
```

For development with testing tools:
```bash
uv sync --dev
```

## Development Commands

- `uv run pytest` - Run tests
- `uv run black .` - Format code
- `uv run isort .` - Sort imports
- `uv run flake8` - Lint code
- `uv run mypy .` - Type checking

## Running the Application

### Development
```bash
sqlite_web /path/to/database.db
```

### With options
```bash
sqlite_web --host 0.0.0.0 --port 8080 --debug /path/to/database.db
```

### Docker
```bash
docker build -t sqlite-web docker/
docker run -p 8080:8080 -v /path/to/data:/data -e SQLITE_DATABASE=db.db sqlite-web
```

## Key Command Line Options

- `-p, --port`: Port (default 8080)
- `-H, --host`: Host (default 127.0.0.1)  
- `-d, --debug`: Enable debug mode
- `-r, --read-only`: Open database read-only
- `-P, --password`: Prompt for password (or use SQLITE_WEB_PASSWORD env var)
- `-R, --rows-per-page`: Pagination for content (default 50)
- `-Q, --query-rows-per-page`: Pagination for query results (default 1000)
- `-e, --extension`: Load SQLite extensions
- `-f, --foreign-keys`: Enable foreign key constraints

## Core Components

### Main Application (`sqlite_web.py`)
- Single-file Flask application (~2000+ lines)
- Database connection management using Peewee DataSet API
- All HTTP routes and business logic
- Template rendering with custom filters
- File import/export functionality (CSV, JSON)

### Database Operations
- Uses Peewee ORM with dynamic model creation
- SQLite-specific features (FTS, JSON1, etc.)
- Support for views, triggers, indexes
- Schema introspection and modification
- Raw SQL query execution with result pagination

### Frontend Structure
- Bootstrap 3.x for styling
- jQuery for JavaScript functionality  
- Syntax highlighting via Pygments
- Responsive table layouts with sorting
- Modal dialogs for confirmations

## Development Notes

- No formal testing framework is present in the codebase
- Single Python file contains all application logic
- Uses Flask's development server by default
- WSGI deployment example provided in `wsgi_example/`
- Docker support with optimized SQLite build
- Supports Python 2/3 compatibility (legacy)

## File Structure

```
sqlite_web/
├── __init__.py           # Empty package init
├── __main__.py           # CLI entry point  
├── sqlite_web.py         # Main application (all logic)
├── static/               # CSS, JS, images, fonts
├── templates/            # Jinja2 HTML templates
docker/
└── Dockerfile            # Container build with optimized SQLite
wsgi_example/             # Alternative WSGI server setup
```

## Configuration

- Uses Flask's default configuration system
- Environment variables: `SQLITE_WEB_PASSWORD`
- No external config files - all options via CLI arguments
- Session management with configurable secret key
- Project uses `pyproject.toml` for modern Python packaging and dependency management
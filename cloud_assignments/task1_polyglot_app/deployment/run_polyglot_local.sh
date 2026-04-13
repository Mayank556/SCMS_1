#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017}"
export DB_NAME="${DB_NAME:-cloud_db}"
export PYTHON_SERVICE_URL="${PYTHON_SERVICE_URL:-http://localhost:8000/analyze}"

echo "Starting Python service on port 8000..."
(
  cd "$ROOT_DIR/python-service"
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn main:app --host 0.0.0.0 --port 8000
) &

PY_PID=$!
trap 'kill "$PY_PID" >/dev/null 2>&1 || true' EXIT

echo "Starting Java service on port 8080..."
cd "$ROOT_DIR/java-service"
mvn spring-boot:run

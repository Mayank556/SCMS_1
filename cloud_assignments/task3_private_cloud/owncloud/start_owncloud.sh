#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
docker compose up -d

echo "ownCloud is starting on http://localhost:8080"
echo "Default credentials: admin / admin"

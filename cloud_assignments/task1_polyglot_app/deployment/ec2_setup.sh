#!/usr/bin/env bash
set -euo pipefail

# Amazon EC2 setup script for polyglot Java + Python services.
# Usage:
#   chmod +x ec2_setup.sh
#   ./ec2_setup.sh

echo "[1/5] Updating system packages..."
sudo apt-get update -y

echo "[2/5] Installing Java, Maven, Python and tooling..."
sudo apt-get install -y openjdk-17-jdk maven python3.12 python3.12-venv python3-pip curl git

echo "[3/5] Verifying runtime versions..."
java -version
mvn -version
python3.12 --version

echo "[4/5] Creating app directories under /opt/project-cloud..."
sudo mkdir -p /opt/project-cloud
sudo chown -R "$USER":"$USER" /opt/project-cloud

echo "[5/5] Setup complete."
cat <<'EOF'
Next steps:
1) Clone repository into /opt/project-cloud
2) Export env vars:
	export MONGODB_URI='mongodb+srv://<user>:<password>@<cluster>/cloud_db?retryWrites=true&w=majority'
	export DB_NAME='cloud_db'
	export PYTHON_SERVICE_URL='http://localhost:8000/analyze'

3) Start Python service:
	cd cloud_assignments/task1_polyglot_app/python-service
	python3.12 -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt
	uvicorn main:app --host 0.0.0.0 --port 8000

4) Start Java service in a second terminal:
	cd cloud_assignments/task1_polyglot_app/java-service
	mvn spring-boot:run
EOF

# Task 1: Polyglot Cloud App (Java + Python)

This task provides:
- Java Spring Boot orchestration service (`java-service`)
- Python FastAPI analysis service (`python-service`)
- Shared cloud database via MongoDB Atlas (`MONGODB_URI`)
- Deployment paths for Google App Engine and Amazon EC2

## 1. Cloud Database Setup (MongoDB Atlas)

1. Create a free MongoDB Atlas cluster.
2. Create a DB user and allow your deployment IPs.
3. Copy your connection string and export:

```bash
export MONGODB_URI='mongodb+srv://<user>:<password>@<cluster>/cloud_db?retryWrites=true&w=majority'
export DB_NAME='cloud_db'
```

## 2. Local Run

Terminal 1:
```bash
cd cloud_assignments/task1_polyglot_app/python-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Terminal 2:
```bash
cd cloud_assignments/task1_polyglot_app/java-service
export PYTHON_SERVICE_URL='http://localhost:8000/analyze'
mvn spring-boot:run
```

Health checks:
- Java: `http://localhost:8080/`
- Python: `http://localhost:8000/`

## 3. Deploy to Google App Engine

Set GCP project and deploy Python first:

```bash
gcloud config set project <gcp-project-id>
cd cloud_assignments/task1_polyglot_app/python-service
gcloud app deploy app.yaml
```

Then deploy Java service:

```bash
cd ../java-service
gcloud app deploy app.yaml
```

After deployment, update `PYTHON_SERVICE_URL` for Java service to the Python App Engine URL.

## 4. Deploy to Amazon EC2

```bash
cd cloud_assignments/task1_polyglot_app/deployment
chmod +x ec2_setup.sh
./ec2_setup.sh
```

Then run both services with exported environment variables as shown in script output.

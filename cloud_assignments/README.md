# Cloud Application & Infrastructure Management System

This project is a comprehensive demonstration of modern cloud development, microservices architecture, and private cloud infrastructure. It was developed to fulfill requirements for multi-platform deployment and polyglot application management.

## 🚀 Key Modules

### 1. Polyglot Microservices (Java & Python)
A dual-service backend orchestrating cross-language communication.
- **Java Orchestrator**: Developed with Spring Boot 3.2. Provides the primary API gateway and handles business logic.
- **Python Data Engine**: Developed with FastAPI. Handles high-performance data processing and "AI-simulated" analysis.
- **Deployment**: Configured for **Google App Engine** (`app.yaml`) and **Amazon EC2** (`ec2_setup.sh`).
- **Database**: Integrated with **MongoDB Atlas** for persistent cloud storage.

### 2. Salesforce CRM Application
An enterprise-grade extension built within the Salesforce ecosystem.
- **Apex Controller**: Server-side logic for managing cloud tasks.
* **LWC Component**: A modern, reactive dashboard for real-time task interaction.
* **Deployment**: Comprehensive guide for **Custom Domain** (My Domain) registration and org-wide activation.

### 3. Private Cloud Virtualization
A full-stack simulation of private cloud infrastructure.
- **Application Layer**: **ownCloud** deployment via Docker for sensitive data hosting.
- **Computing Layer**: **OpenStack** (DevStack) configuration to manage physical/virtualized compute resources.

---

## 🛠️ Local Development & Demo

### Prerequisites
- Java 17+
- Python 3.10+
- Docker (for ownCloud)

### Running the Demo
1. **Start Python Service**:
   ```bash
   cd task1_polyglot_app/python-service
   uvicorn main:app --port 8000
   ```
2. **Start Java Service**:
   ```bash
   cd task1_polyglot_app/java-service
   mvn spring-boot:run
   ```
3. **Open Dashboard**:
   Launch `index.html` to access the Unified Command Center.

---

## ☁️ Production Deployment

### Google App Engine (GAE)
Run `gcloud app deploy` within the service directories.

### Amazon EC2
Provision an Ubuntu 22.04 instance and execute `deployment/ec2_setup.sh`.

### Salesforce
Follow the instructions in `task2_salesforce/setup_guide.md`.

---

**Developed for Rahulchaube1/SCMS Repository.**

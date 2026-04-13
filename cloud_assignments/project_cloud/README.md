# Project Cloud Integration

This folder integrates all cloud assignment tracks into one cloud base project:

1. Polyglot app services (Java + Python + MongoDB Atlas)
2. Salesforce trial app deployment for real-time UI
3. Private cloud stack (OpenStack infra + OwnCloud app)

## Unified Architecture

- Java service orchestrates task create/read and calls Python analysis API.
- Python service performs analysis and uses cloud MongoDB for shared persistence.
- Salesforce app manages Cloud Tasks in real time inside your org domain.
- OpenStack hosts private infrastructure where ownCloud and optional app VMs run.

## End-to-End Sequence

1. Deploy Python and Java to Google App Engine.
2. Deploy Java and Python to EC2 as a fallback/alternate path.
3. Deploy Salesforce Apex + LWC and expose on My Domain.
4. Deploy OpenStack and run ownCloud in private cloud environment.
5. Connect monitoring and DNS as needed for production.

## Quick Start Checklist

```bash
# Task 1 (polyglot)
cd /workspaces/SCMS/cloud_assignments/task1_polyglot_app

# Task 2 (salesforce)
cd /workspaces/SCMS/cloud_assignments/task2_salesforce

# Task 3 (private cloud)
cd /workspaces/SCMS/cloud_assignments/task3_private_cloud
```

Use each task guide for commands and environment variables.

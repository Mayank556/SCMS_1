# Salesforce Deployment and Domain Setup Guide

This task includes a deployable Salesforce DX structure under `force-app` and `manifest/package.xml`.

## 1. Create and Deploy My Domain

1. Log in to your Salesforce Developer/Trial org.
2. Go to Setup and search for **My Domain**.
3. Set a unique domain name, check availability, and register.
4. After provisioning, click **Deploy to Users**.

## 2. Create Required Custom Object

Create object `Cloud_Task__c`:

1. Setup -> Object Manager -> Create -> Custom Object.
2. Label: `Cloud Task`, Plural Label: `Cloud Tasks`.
3. API Name: `Cloud_Task`.

Create fields:

1. `Description__c` as Long Text Area.
2. `Status__c` as Picklist with values: `New`, `In Progress`, `Completed`.

## 3. Deploy Apex + LWC from This Repo

Prerequisites:

1. Salesforce CLI (`sf`) installed.
2. VS Code Salesforce Extension Pack installed.

Commands:

```bash
cd cloud_assignments/task2_salesforce
sf org login web --alias cloud-trial
sf project deploy start --target-org cloud-trial --source-dir force-app
```

## 4. Real-Time App Deployment

1. Open App Launcher and open any Lightning app (for example Sales).
2. Click Gear -> **Edit Page**.
3. Drag `cloudManagerComp` from Custom components onto the page.
4. Click **Save** and **Activate** (App Default or Org Default).

## 5. Verify on Your Domain

1. Open your My Domain URL.
2. Confirm you can create tasks from `cloudManagerComp`.
3. Confirm newly created tasks immediately appear in the list.

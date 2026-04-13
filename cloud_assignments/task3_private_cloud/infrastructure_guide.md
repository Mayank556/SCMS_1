# Private Cloud Infrastructure Setup Guide

This guide explains how to set up your own cloud application (OwnCloud) and your private cloud infrastructure (OpenStack).

## 1. Cloud-Based Application: ownCloud
ownCloud provides a private file-sharing and collaboration platform.

### Deployment (Using Docker)
1. Ensure **Docker** and **Docker Compose** are installed on your machine.
2. Navigate to `cloud_assignments/task3_private_cloud/owncloud/`.
3. Run the starter script:
   ```bash
   chmod +x start_owncloud.sh
   ./start_owncloud.sh
   ```
4. Access the application at `http://localhost:8080`.
5. Login with:
   - **Username**: `admin`
   - **Password**: `admin`

## 2. Private Cloud Infrastructure: OpenStack
OpenStack is the industry standard for creating private cloud infrastructure.

### Physical/Virtual Infrastructure Requirements
- **Host OS**: Ubuntu 22.04 LTS (Clean installation recommended).
- **RAM**: Minimum 8GB (16GB+ recommended).
- **CPU**: 4 Cores with Virtualization (VT-x) enabled.
- **Network**: Internet access for dependency installation.

### Installation via DevStack (Single Node)
1. Run the automated setup script:
   ```bash
   cd cloud_assignments/task3_private_cloud/openstack
   chmod +x deploy_devstack.sh
   ./deploy_devstack.sh
   ```
2. **Post-Installation**:
   Once complete, access the OpenStack Dashboard (Horizon) via the IP address of your host.
   - **Login**: `admin`
   - **Password**: `password` (as defined in `local.conf`)

### Verification
- Run `openstack service list` to verify all cloud services (Nova, Keystone, Neutron, etc.) are active.
- Create a virtual machine instance via the Horizon dashboard to verify the infrastructure is working.

## 3. Integrate with Project Cloud

Use OpenStack to provision VM(s) that host your app workloads:

1. Create VM-A for polyglot app (Java + Python services).
2. Create VM-B for ownCloud if you want clean isolation.
3. Configure security groups for ports `8080` (Java/ownCloud) and `8000` (Python internal).
4. Point DNS/subdomains to floating IPs for production-style access.

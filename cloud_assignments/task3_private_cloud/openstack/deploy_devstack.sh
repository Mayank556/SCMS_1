#!/usr/bin/env bash
set -euo pipefail

# DevStack bootstrap for Ubuntu host
# Run on a clean VM with sudo privileges.

sudo apt-get update -y
sudo apt-get install -y git

if ! id stack >/dev/null 2>&1; then
  sudo useradd -s /bin/bash -d /opt/stack -m stack
  echo "stack ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/stack >/dev/null
fi

sudo -u stack bash <<'EOF'
set -euo pipefail
cd /opt/stack
if [[ ! -d devstack ]]; then
  git clone https://opendev.org/openstack/devstack
fi
cd devstack
cp /workspaces/SCMS/cloud_assignments/task3_private_cloud/openstack/local.conf ./local.conf
./stack.sh
EOF

echo "DevStack deployment completed. Access Horizon at http://<host-ip>/dashboard"

# NetBuilder - Mininet & Open vSwitch Setup Guide

NetBuilder is a **full-stack interactive network topology simulator** powered by Mininet and Open vSwitch (OVS). Visual topologies built in the React Flow editor execute as real virtual network namespaces and OpenFlow 1.3 switches on Linux.

---

## Prerequisites

- **OS**: Linux (Ubuntu 20.04 / 22.04 LTS recommended) or **Windows with WSL2 (Ubuntu)**.
- **Python**: Python 3.8+
- **Node.js**: Node.js 18+ and npm

---

## 1. System Dependencies Installation (Linux / WSL2)

In your Ubuntu terminal or WSL2 environment, install Mininet, Open vSwitch, iperf, and Python dependencies:

```bash
# Update package lists
sudo apt update && sudo apt install -y mininet openvswitch-switch openvswitch-testcontroller iperf iperf3 python3-pip python3-flask python3-flask-cors

# Start and enable Open vSwitch service
sudo service openvswitch-switch start
# Or for systemd:
sudo systemctl enable --now openvswitch-switch

# Clean any existing Mininet state
sudo mn -c
```

---

## 2. Verify Mininet & Open vSwitch Installation

Before starting the NetBuilder platform, test Mininet:

```bash
# Run standard Mininet test ping
sudo mn --test pingall --switch ovsk,protocols=OpenFlow13
```

Expected output:
```
*** Results: 0% dropped (2/2 received)
```

---

## 3. Running the NetBuilder Platform

### Step A: Launch Backend Server (Requires `sudo` for Mininet/OVS namespaces)

From the project root directory:

```bash
sudo python3 backend/server.py
```

The Flask server will start listening on `http://localhost:5000`.

### Step B: Launch React Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your web browser.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check returning Mininet and OVS readiness |
| `POST` | `/api/start` | Validates topology & launches real Mininet network |
| `POST` | `/api/stop` | Stops Mininet network and clears interfaces |
| `POST` | `/api/reset` | Cleans environment state (`mn -c`) |
| `POST` | `/api/ping` | Executes real `ping` between Mininet hosts |
| `POST` | `/api/iperf` | Executes real `iperf` throughput & bandwidth test |
| `POST` | `/api/traffic` | Generates real TCP/UDP packet traffic |
| `POST` | `/api/link/down` | Simulates physical link failure |
| `POST` | `/api/link/up` | Restores physical link status |
| `GET` | `/api/stats` | Fetches real host & OVS switch port statistics |
| `GET` | `/api/topology` | Returns active registered Mininet topology |
| `GET` | `/api/flows` | Dumps OpenFlow flow tables from OVS switches |
| `POST` | `/api/path` | Discovers shortest path between devices |

---

## 5. Troubleshooting & FAQ

### Issue: "Permission denied" or "Cannot create veth pair"
**Fix**: Mininet requires root privileges to configure Linux virtual network interfaces. Ensure you start the backend with `sudo python3 backend/server.py`.

### Issue: "Open vSwitch is unavailable"
**Fix**: Start the OVS service manually:
```bash
sudo service openvswitch-switch start
```

### Issue: Topology fails with "Duplicate IP address" or "Disconnected device"
**Fix**: NetBuilder includes strict topology validation. Ensure every device has a unique IP address and all devices are connected before clicking **Start Simulation**.

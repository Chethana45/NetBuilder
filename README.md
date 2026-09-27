# NetBuilder - Interactive Network Topology Simulator & Full-Stack Platform

**NetBuilder** is an interactive, full-stack network topology simulator. It allows users to visually design network topologies in a React Flow canvas and execute those topologies directly in **Mininet** and **Open vSwitch (OVS)** network environments.

Unlike visual-only network mockups, NetBuilder instantiates **real Linux network namespaces**, **real virtual ethernet (veth) pairs**, **real OpenFlow 1.3 switches**, and **real Linux routers**. All ping tests, bandwidth measurements, packet statistics, and link failure simulations run on actual Linux network interfaces.

---

## 🏗 System Architecture Diagram

```
+-------------------------------------------------------------+
|                     React 18 Frontend                       |
|  - React Flow Interactive Topology Canvas                   |
|  - Real-time Network Dashboard & Traffic Monitor            |
|  - Interactive Ping, Iperf, Link Failure Controls           |
+-------------------------------------------------------------+
                              |
                              | HTTP REST API (VITE_API_BASE_URL=http://localhost:5000)
                              v
+-------------------------------------------------------------+
|                     Flask Backend                           |
|  - server.py (REST API Controller)                          |
+-------------------------------------------------------------+
       |                      |                      |
       v                      v                      v
+--------------+     +------------------+   +-------------------+
|  Topology    |     | Mininet Core     |   | Statistics        |
|  Manager     |     | Manager          |   | Manager           |
| (Validation, |     | (Network setup,  |   | (Linux /sys stats |
| IP & Naming  |     |  Ping, Iperf,    |   |  & OVS port/flow  |
| Mappings,    |     |  Link Up/Down)   |   |  dumps)           |
| Path Discovery)|   +------------------+   +-------------------+
+--------------+              |
                              v
+-------------------------------------------------------------+
|             Linux Networking & Open vSwitch                 |
|  - Real Host Namespaces (h1, h2, h3...)                     |
|  - Open vSwitch Bridges (s1, s2... OpenFlow 1.3)            |
|  - Linux Routers (IP Forwarding enabled)                    |
|  - Real Packets (ICMP ping, iperf TCP/UDP streams)          |
+-------------------------------------------------------------+
```

---

## ✨ Features

1. **Interactive Topology Builder**: Drag-and-drop PCs, Servers, Switches, and Routers onto a grid canvas. Connect devices with dynamic cable lines.
2. **Topology Validation Engine**: Verifies topology correctness (checks duplicate IDs/names, duplicate or invalid IP addresses, self-connections, disconnected devices) before starting Mininet.
3. **Real Mininet Execution**: Instantiates actual Mininet hosts (`net.addHost`), OVS switches (`net.addSwitch`, OpenFlow 1.3 `standalone`), and Linux routers (`sysctl -w net.ipv4.ip_forward=1`).
4. **Device Mapping**: Maps frontend IDs (`pc-001`, `switch-001`) to Mininet node identifiers (`h1`, `s1`) transparently.
5. **Real Ping Testing**: Executes `ping -c 4` inside Mininet namespaces. Displays packet loss %, RTT min/avg/max latency, and full console output.
6. **Iperf / Bandwidth Measurement**: Executes `iperf` server and client across hosts, reporting throughput in **Mbits/sec** and total data transfer.
7. **Real-time Statistics**: Polls host interface counters (`rx_packets`, `tx_packets`, `rx_bytes`, `tx_bytes`) directly from `/sys/class/net/` inside host namespaces.
8. **Open vSwitch Port Statistics**: Collects switch port RX/TX packet counts, byte counts, and dropped packet metrics via `ovs-ofctl dump-ports`.
9. **OpenFlow Flow Table Viewer**: Dumps active OpenFlow table entries from OVS switches using `ovs-ofctl dump-flows`.
10. **Link Failure Simulation**: Dynamically toggle links **DOWN** or **UP** in Mininet and verify connectivity failures in real-time.
11. **Multi-Subnet Routing**: Supports routing across distinct subnets (`10.0.1.0/24` to `10.0.2.0/24`) through Linux router nodes.
12. **Timestamped Network Activity Log**: Real-time event logging panel detailing network creation, pings, bandwidth tests, and link state changes.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Flow, Tailwind CSS, Lucide Icons, Sonner.
- **Backend**: Python 3, Flask, Flask-CORS.
- **Networking Core**: Mininet, Open vSwitch (OVS), Linux Virtual Interfaces (`veth`), `iperf`, `iproute2`.

---

## 🚀 Getting Started

### 1. Backend Setup (Linux / WSL2)

Install Mininet and Open vSwitch dependencies:

```bash
sudo apt update && sudo apt install -y mininet openvswitch-switch openvswitch-testcontroller iperf iperf3 python3-pip python3-flask python3-flask-cors
sudo service openvswitch-switch start
```

Launch the Flask backend with `sudo` (required for Linux network namespace configuration):

```bash
sudo python3 backend/server.py
```

### 2. Frontend Setup

In a new terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🎓 Step-by-Step Professor Demonstration Walkthrough

Follow these steps to demonstrate NetBuilder to a professor or evaluator:

1. **Launch NetBuilder**: Open `http://localhost:5173` with the backend running (`sudo python3 backend/server.py`).
2. **Select Template**: Click **Templates** → **Basic LAN Network** (loads `PC1 (10.0.0.2) -- Switch1 -- PC2 (10.0.0.3)`).
3. **Start Simulation**: Click **Start Simulation**. NetBuilder validates the topology, starts Mininet, creates `h1`, `s1`, `h2`, and builds the network.
4. **Execute Real Ping**:
   - Switch to the **Traffic Monitor & Dashboard** tab.
   - Select **Source Host: PC1** and **Destination Host: PC2**.
   - Click **Execute Ping**.
   - Observe **0% packet loss**, real **RTT latency** (e.g. `0.92 ms`), and console output.
5. **Run Bandwidth Test (Iperf)**:
   - Select **PC1 → PC2**, set duration to **5 sec**, and click **Run Bandwidth Test**.
   - Observe real throughput (e.g. `94.3 Mbits/sec`) and data transferred.
6. **Observe Real Traffic Statistics**:
   - Inspect the **Real Packet Statistics** table. Watch `RX Packets`, `TX Packets`, `RX Bytes`, and `TX Bytes` increment live!
7. **Simulate Link Failure**:
   - Scroll to **Link Failure Simulation**.
   - Click **Disable Link** on `PC1 ↔ Switch1`.
   - Click **Execute Ping** again. Observe **100% packet loss** and **Destination Unreachable**!
   - Click **Re-enable Link**. Re-run Ping and verify connectivity is restored.
8. **Inspect OpenFlow Flow Tables**:
   - Click **View Flow Tables** in the OpenFlow section to view active OVS flow rules (`priority=0 actions=NORMAL`).
9. **Multi-Subnet Router Demonstration**:
   - Click **Templates** → **Multi-Subnet Router**.
   - Click **Start Simulation**.
   - Ping `Host-Subnet1 (10.0.1.10)` → `Host-Subnet2 (10.0.2.10)` across the Linux router!

---

## 📁 Repository Structure

```
NetBuilder-main/
│
├── backend/
│   ├── server.py              # Flask API endpoints & routes
│   ├── mininet_manager.py     # Mininet network lifecycle, ping, iperf, link toggles
│   ├── topology_manager.py    # Topology validation, IP assignment & BFS path finding
│   ├── stats_manager.py       # Linux namespace interface & OVS switch port/flow stats
│   └── requirements.txt       # Python dependencies
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── network/
│   │   │       ├── NetworkCanvas.jsx        # React Flow topology editor & grid
│   │   │       ├── DeviceNode.jsx           # Device visual node & handles
│   │   │       ├── ConnectionLine.jsx       # Cable renderer & link status badge
│   │   │       ├── SimulationControls.jsx   # Interactive Dashboard & Traffic Monitor
│   │   │       └── ConfigPanel.jsx          # Device IP/subnet/gateway editor
│   │   ├── hooks/
│   │   │   └── useNetworkSimulation.js      # Simulation state & Mininet API integration
│   │   ├── pages/
│   │   │   └── NetworkSimulator.jsx        # Main Network Simulator page
│   │   └── data/
│   │       └── sampleNetworks.js            # Sample network topologies
│   ├── package.json
│   └── vite.config.js
│
├── README.md                  # Main documentation
└── MININET_SETUP.md           # Mininet & Linux installation guide
```

---

## 🔮 Future Improvements

- Support for Wireshark `.pcap` packet capture downloading directly from host namespaces via `tcpdump`.
- Custom OpenFlow flow entry insertion UI for Software-Defined Networking (SDN) experiments.
- Dynamic VLAN tagging and trunk port configurations on OVS switches.

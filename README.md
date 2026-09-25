<div align="center">

# 🌐 NetBuilder

### Interactive Network Topology Simulator

<p>
  <i>Build • Connect • Visualize • Explore Networks</i>
</p>

<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Flow-Topology-purple?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Type-Academic%20Project-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Domain-Computer%20Networks-orange?style=flat-square" />
</p>

</div>

---

<div align="center">

## 🧠 Build Your Network. See It. Understand It.

</div>

## 📖 About the Project

**NetBuilder** is a web-based interactive network topology simulator designed to provide a visual and intuitive environment for creating, organizing, and understanding computer network topologies.

The application allows users to construct network topologies directly on an interactive graphical canvas by placing networking devices, connecting them, repositioning them, and managing the overall network structure.

Instead of creating only static network diagrams, NetBuilder provides an interactive workspace where users can experiment with different network configurations and visually understand how devices are connected.

The project combines **Computer Networking concepts with modern web technologies** to create an interactive visual learning environment.

---

## 🎯 Problem Statement

Computer networking involves several abstract concepts such as:

- Network topology
- Network devices
- Device connections
- Communication paths
- Network structure
- Switching
- Routing
- Packet communication

For beginners, understanding these concepts through only theoretical diagrams can be difficult.

Traditional network diagrams are mostly static and do not allow users to experiment with different network configurations.

NetBuilder addresses this problem by providing an interactive topology-building environment where users can:

- Add network devices
- Move devices
- Connect devices
- Remove devices
- Rearrange the topology
- Inspect the network visually
- Experiment with different network structures

The goal is to transform networking from a **static diagram-based experience into an interactive visual experience**.

---

## 💡 Project Idea

The core idea of NetBuilder is:

```text
Select Device
      ↓
Place Device
      ↓
Connect Devices
      ↓
Create Topology
      ↓
Modify Topology
      ↓
Visualize Network
      ↓
Understand Network Structure
```

The application represents a network as a collection of nodes and connections.

```text
Nodes → Network Devices

Edges → Network Connections
```

Therefore, a topology can be represented as a graph:

```text
G = (V, E)
```

Where:

- `V` → Set of network devices
- `E` → Set of connections between devices

This graph-based representation provides a foundation for extending the project toward more advanced network simulation functionality.

---

# ✨ Features

## 🧩 Interactive Network Topology Builder

NetBuilder provides an interactive canvas where users can create and manage network topologies.

### Users can:

- Add network devices
- Position devices
- Move devices
- Connect devices
- Select devices
- Delete devices
- Delete connections
- Clear the topology
- Rearrange the network

---

## 💻 Supported Network Devices

NetBuilder provides visual representations of common networking components.

### 🖥️ Computer

Represents an end device within the network.

```text
       Computer
           │
           │
           ▼
         Switch
```

Computers can act as endpoints within the topology.

---

### 🔀 Switch

Represents a Layer 2 networking device used to connect multiple devices within a network.

```text
                 Computer
                     │
                     │
Computer ──────── Switch ──────── Server
                     │
                     │
                  Computer
```

The topology representation provides a foundation for implementing switching-related behavior in future versions.

---

### 🌐 Router

Represents a Layer 3 networking device that can be used to connect different networks.

```text
Network A
   │
   ▼
 Switch
   │
   ▼
 Router
   │
   ▼
 Switch
   │
   ▼
Network B
```

The current application focuses on visual topology construction, while routing behavior can be introduced in future versions.

---

### 🖥️ Server

Represents a server or destination device within the network.

```text
Computer ───── Switch ───── Server
```

---

# 🎨 Interactive Topology Editor

The topology editor is the central component of NetBuilder.

Users can visually construct and manipulate networks directly on the canvas.

```text
┌─────────────────────────────────────────────┐
│             INTERACTIVE CANVAS              │
│                                             │
│       💻 PC                                 │
│         │                                   │
│         │                                   │
│         ▼                                   │
│      🔀 Switch ───────── 🖥️ Server           │
│         │                                   │
│         │                                   │
│         ▼                                   │
│      🌐 Router                              │
│                                             │
│       Zoom • Pan • Move • Connect           │
└─────────────────────────────────────────────┘
```

### Canvas capabilities

- Drag devices
- Reposition devices
- Create connections
- Select nodes
- Delete nodes
- Delete connections
- Navigate the canvas
- Zoom in and out
- Pan around the topology
- Use the minimap for navigation

---

# 🔗 Network Connections

Devices can be connected using visual links.

Example:

```text
PC 1
 │
 │
 ▼
Switch
 ├──────── PC 2
 │
 └──────── Server
```

The topology maintains two fundamental types of information:

```text
Device Information
        +
Connection Information
        ↓
Network Topology
```

Each connection represents a relationship between two network devices.

---

# 🔍 Device Interaction

Users can interact with individual devices on the topology canvas.

The general interaction flow is:

```text
Select
  ↓
Inspect
  ↓
Move / Modify
  ↓
Connect
  ↓
Delete if required
```

This makes the topology dynamic rather than static.

---

# 🗺️ Network Visualization

NetBuilder provides a graphical representation of the entire topology.

Instead of displaying network information only as text, devices and their relationships are represented visually.

Example:

```text
             ┌─────────┐
             │   PC 1  │
             └────┬────┘
                  │
                  │
             ┌────▼────┐
             │ Switch  │
             └─┬────┬──┘
               │    │
          ┌────▼┐  ┌▼──────┐
          │ PC 2│  │Server │
          └─────┘  └───────┘
```

This makes the overall structure of the network easier to understand.

---

# 🔎 Zoom, Pan & Navigation

The topology canvas provides navigation features for working with larger networks.

### Supported navigation

- Zoom in
- Zoom out
- Pan
- Canvas navigation
- Minimap navigation

These features make it easier to work with complex topologies containing multiple devices.

---

# 🧭 Minimap

The minimap provides a compact overview of the complete topology.

```text
┌─────────────────────────────────┐
│                                 │
│          MAIN CANVAS             │
│                                 │
│      PC ── Switch ── Router     │
│              │                  │
│              └──── Server       │
│                                 │
└─────────────────────────────────┘

       ┌───────────────┐
       │    MINIMAP    │
       │  • • • • •    │
       │  • • • • •    │
       └───────────────┘
```

This is especially useful when the topology becomes larger than the visible canvas.

---

# 🏗️ System Architecture

The current implementation is centered around a **React + Vite frontend architecture**.

```text
                         ┌──────────────────────┐
                         │    USER / BROWSER    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    REACT FRONTEND    │
                         │                      │
                         │  User Interface     │
                         │  Device Management   │
                         │  Topology Controls   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      REACT FLOW      │
                         │                      │
                         │      Nodes           │
                         │      Edges            │
                         │      Canvas           │
                         │      Minimap          │
                         │      Navigation       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    TOPOLOGY STATE    │
                         │                      │
                         │    Devices           │
                         │    Connections       │
                         │    Positions         │
                         │    Network Structure │
                         └──────────────────────┘
```

---

# ⚛️ Frontend Architecture

The frontend is developed using **React** with **Vite** as the development and build tool.

React is responsible for:

- Rendering the user interface
- Managing reusable components
- Handling user interactions
- Managing topology state
- Updating network elements
- Rendering device nodes
- Rendering connections
- Updating the topology dynamically

The general flow is:

```text
User Action
     │
     ▼
React Component
     │
     ▼
Application State
     │
     ▼
Topology Update
     │
     ▼
React Flow
     │
     ▼
Updated Network Visualization
```

---

# 🔀 React Flow

**React Flow** forms the core of the topology editor.

The project maps networking concepts to graph elements:

```text
Network Device
      ↓
React Flow Node
```

and:

```text
Network Connection
      ↓
React Flow Edge
```

For example:

```text
PC ───────── Switch
```

can be represented as:

```text
Node: PC

Node: Switch

Edge:
PC → Switch
```

This allows the topology to behave like an interactive graph.

---

# 📦 Node Representation

A network device can conceptually be represented as a node:

```javascript
{
  id: "computer-1",
  type: "computer",
  position: {
    x: 200,
    y: 150
  }
}
```

A node can contain information such as:

- Unique identifier
- Device type
- Position
- Device-specific properties

---

# 🔗 Edge Representation

A connection between two devices can conceptually be represented as:

```javascript
{
  id: "connection-1",
  source: "computer-1",
  target: "switch-1"
}
```

This allows the application to understand:

```text
Source Device
      │
      ▼
Connection
      │
      ▼
Target Device
```

---

# 🎨 Styling Architecture

The project uses **Tailwind CSS** for styling.

Tailwind provides utility-based styling for the application's interface.

The project contains:

```text
tailwind.config.js
```

for Tailwind-specific configuration.

---

# 🧩 Component-Based Design

The React application follows a component-based architecture.

Conceptually:

```text
React Application
│
├── 🧭 Topology Interface
│
├── 🎨 Canvas
│
├── 🖥️ Device Components
│
├── 🔗 Connection Components
│
├── 🎛️ Controls
│
├── 🔍 Navigation
│
└── ⚙️ Configuration UI
```

This modular approach makes the application easier to maintain and extend.

---

# 🛠️ Development Configuration

The project contains several configuration files.

### ⚡ Vite

```text
vite.config.js
```

Vite provides:

- Development server
- Fast development workflow
- Hot module replacement
- Production build support

---

### 🧹 ESLint

```text
eslint.config.js
```

ESLint helps identify potential JavaScript and React code-quality issues.

---

### ✨ Prettier

```text
.prettierrc
.prettierignore
```

Prettier helps maintain consistent source-code formatting.

---

### 🟨 JavaScript Configuration

```text
jsconfig.json
```

Provides JavaScript project configuration for the development environment.

---

# 📁 Project Structure

The current repository is organized as follows:

```text
NetBuilder/
│
├── .vscode/
│
├── client/
│   │
│   ├── node_modules/
│   │
│   ├── public/
│   │
│   ├── src/
│   │
│   ├── .env
│   ├── .gitignore
│   ├── .prettierignore
│   ├── .prettierrc
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

### Directory Description

| File / Folder | Purpose |
|---|---|
| `.vscode/` | VS Code project configuration |
| `client/` | Main frontend application |
| `client/public/` | Static/public assets |
| `client/src/` | React source code |
| `client/.env` | Environment configuration |
| `package.json` | Dependencies and project scripts |
| `package-lock.json` | Locked dependency versions |
| `vite.config.js` | Vite configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `eslint.config.js` | ESLint configuration |
| `.prettierrc` | Prettier configuration |
| `.prettierignore` | Prettier exclusion rules |
| `components.json` | UI/component configuration |
| `jsconfig.json` | JavaScript configuration |
| `index.html` | Application HTML entry point |
| `README.md` | Project documentation |

> `node_modules/` contains installed dependencies and should normally remain excluded from Git.

---

# 🔄 Application Workflow

The overall workflow of NetBuilder is:

```text
                    ┌─────────────┐
                    │    USER     │
                    └──────┬──────┘
                           │
                           ▼
                  Open NetBuilder
                           │
                           ▼
                 Open Topology Canvas
                           │
                           ▼
                  Select Network Device
                           │
                           ▼
                    Place Device
                           │
                           ▼
                   Position Device
                           │
                           ▼
                  Connect Devices
                           │
                           ▼
                  Modify Topology
                           │
                           ▼
                  Visualize Network
```

---

# 🧠 Network Topology Representation

NetBuilder treats the network topology as a graph.

Example:

```text
PC1 ─── Switch ─── Router ─── Server
          │
          │
         PC2
```

### Vertices

```text
PC1
Switch
Router
Server
PC2
```

### Edges

```text
PC1 ─ Switch
Switch ─ Router
Router ─ Server
Switch ─ PC2
```

This graph-based representation provides a foundation for future algorithms involving:

- Path finding
- Connectivity
- Network traversal
- Routing
- Packet forwarding

---

# 🌐 Networking Concepts

NetBuilder provides a visual foundation for understanding:

### Network Concepts

- Network topology
- Network devices
- Device connections
- Network paths
- Graph-based network representation
- Network visualization

### Networking Devices

- Computers
- Switches
- Routers
- Servers

### Future Networking Concepts

- Switching
- Routing
- ARP
- Packet forwarding
- Packet transmission

The current implementation primarily focuses on **interactive topology creation and visualization**.

---

# 📊 Example Topologies

## ⭐ Star Topology

```text
                 💻 PC
                  │
                  │
        💻 PC ─ 🔀 Switch ─ 💻 PC
                  │
                  │
              🖥️ Server
```

---

## 🌳 Tree Topology

```text
                  🌐 Router
                 /        \
                /          \
           🔀 Switch      🔀 Switch
            /    \          /    \
           /      \        /      \
         💻 PC   💻 PC   💻 PC   🖥️ Server
```

---

## 🌐 Multi-Device Network

```text
💻 PC
 │
 ▼
🔀 Switch
 │
 ▼
🌐 Router
 │
 ▼
🔀 Switch
 │
 ▼
🖥️ Server
```

---

# 🔬 Simulation Foundation

The current project focuses on **interactive topology creation and visualization**.

However, the graph-based topology provides a foundation for implementing deeper network simulation features in future versions.

A possible future architecture is:

```text
                         React UI
                            │
                            ▼
                      Topology Graph
                            │
                            ▼
                    Simulation Engine
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         Switching       Routing         ARP
              │             │             │
              └─────────────┼─────────────┘
                            │
                            ▼
                     Packet Events
                            │
                            ▼
                    Visual Animation
```

---

# 📦 Future Packet Simulation

A future version could represent a packet using information such as:

```text
Packet
│
├── Source
├── Destination
├── Source IP
├── Destination IP
├── Protocol
├── Payload
└── TTL
```

The packet could travel through the topology:

```text
💻 Computer
     │
     ▼
🔀 Switch
     │
     ▼
🌐 Router
     │
     ▼
🖥️ Server
```

The movement could be visualized directly on the topology canvas.

---

# 🔀 Future Switching Simulation

Future versions could introduce:

- MAC address learning
- MAC address tables
- Frame forwarding
- Broadcast handling
- Unknown destination handling

Possible flow:

```text
Incoming Frame
      │
      ▼
    Switch
      │
      ▼
Read Destination MAC
      │
      ▼
MAC Table Lookup
      │
      ▼
Forward Frame
```

---

# 🌐 Future Routing Simulation

Future router functionality could include routing information such as:

```text
Destination Network     Next Hop
----------------------------------
Network A                Direct
Network B                Router 2
Network C                Router 3
```

The simulator could use routing information to determine paths through the topology.

---

# 🔎 Future ARP Simulation

ARP behavior could be introduced to visually demonstrate the relationship between IP addresses and MAC addresses.

```text
Host A
  │
  │ ARP Request
  ▼
Network
  │
  ▼
Host B
  │
  │ ARP Reply
  ▼
Host A
```

---

# 📡 Future Packet Visualization

A future version can visualize packets moving between devices.

```text
┌─────────┐
│  💻 PC  │
└────┬────┘
     │
     │ 🟢 Packet
     ▼
┌─────────┐
│ 🔀Switch│
└────┬────┘
     │
     │ 🟢 Packet
     ▼
┌─────────┐
│🌐 Router│
└────┬────┘
     │
     │ 🟢 Packet
     ▼
┌─────────┐
│🖥️ Server│
└─────────┘
```

This would extend NetBuilder from a topology editor toward a more complete interactive networking laboratory.

---

# 🧪 Use Cases

### 🎓 Learning Network Topologies

Students can visually construct different topologies instead of relying only on static diagrams.

### 👨‍🏫 Classroom Demonstrations

The application can be used to demonstrate network structures interactively.

### 🧪 Experimentation

Users can quickly create, modify, and remove different network configurations.

### 🧠 Concept Visualization

The project provides a visual foundation for understanding:

- Topologies
- Devices
- Connections
- Network paths
- Switching
- Routing

---

# 🛠️ Technology Stack

<table>
<tr>
<th>Technology</th>
<th>Purpose</th>
</tr>

<tr>
<td>⚛️ React</td>
<td>Frontend framework and UI development</td>
</tr>

<tr>
<td>⚡ Vite</td>
<td>Development server and build tool</td>
</tr>

<tr>
<td>🟨 JavaScript</td>
<td>Application logic</td>
</tr>

<tr>
<td>🔀 React Flow</td>
<td>Interactive graph and topology editor</td>
</tr>

<tr>
<td>🎨 Tailwind CSS</td>
<td>Interface styling</td>
</tr>

<tr>
<td>🧹 ESLint</td>
<td>Code quality and linting</td>
</tr>

<tr>
<td>✨ Prettier</td>
<td>Code formatting</td>
</tr>

<tr>
<td>📦 npm</td>
<td>Package management</td>
</tr>

<tr>
<td>🔧 Git</td>
<td>Version control</td>
</tr>

<tr>
<td>🐙 GitHub</td>
<td>Source-code hosting</td>
</tr>

</table>

---

# 📋 Prerequisites

Before running NetBuilder, make sure the following are installed:

- Node.js
- npm
- Git
- A modern web browser
- Visual Studio Code or another suitable code editor

---

# ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Chethana45/NetBuilder.git
```

### 2. Enter the Project

```bash
cd NetBuilder
```

### 3. Enter the Client

```bash
cd client
```

### 4. Install Dependencies

```bash
npm install
```

---

# ▶️ Running the Project

Start the development server:

```bash
npm run dev
```

Vite will provide a local development URL, generally:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

---

# 🧹 Code Quality

Run the configured linting command:

```bash
npm run lint
```

The project also contains Prettier configuration for maintaining consistent code formatting.

---

# 🔐 Environment Configuration

The client contains:

```text
client/.env
```

Environment-specific values can be placed inside this file when required.

### ⚠️ Important

Never commit sensitive credentials, API keys, tokens, or secrets to GitHub.

---

# 🗺️ Development Roadmap

```text
                         NETBUILDER
                              │
                              ▼
                 ┌──────────────────────┐
                 │       Phase 1         │
                 │ Interactive Topology │
                 │       Editor         │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │       Phase 2         │
                 │ Device Management    │
                 │ & Configuration      │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │       Phase 3         │
                 │ Network Simulation   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │       Phase 4         │
                 │ Packet Visualization │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │       Phase 5         │
                 │ Advanced Networking  │
                 └──────────────────────┘
```

---

# 🌱 Future Scope

NetBuilder can eventually evolve into a complete browser-based networking laboratory.

## 📡 Network Simulation

- Packet generation
- Packet forwarding
- Frame transmission
- Switching logic
- Routing logic
- ARP simulation
- ICMP simulation
- Ping simulation

## 🖥️ Device Configuration

- IP address configuration
- MAC address configuration
- Interface configuration
- Device status
- Routing tables
- MAC address tables

## 📊 Visualization

- Animated packet movement
- Traffic indicators
- Network events
- Packet inspection
- Connection status
- Network statistics

## 🌐 Advanced Networking

- VLANs
- Subnetting
- DHCP
- DNS
- NAT
- Firewall concepts
- Routing protocols

## 🤝 Collaboration

- Shared topologies
- Topology export/import
- Network sharing
- Real-time collaboration
- Cloud-based topology storage

---

# 🎓 Academic Relevance

NetBuilder combines concepts from multiple areas of Computer Science.

## 💻 Computer Networks

- Network topology
- Networking devices
- Network communication
- Switching
- Routing
- Packet transmission

## 🌐 Web Development

- React
- Component-based architecture
- Interactive interfaces
- State management
- Graph-based UI

## 🧠 Data Structures

The network topology can be represented as a graph:

```text
             GRAPH
               │
       ┌───────┴───────┐
       │               │
    Vertices          Edges
       │               │
       ▼               ▼
   Devices         Connections
```

This representation can later support algorithms such as:

- Path finding
- Shortest path
- Connectivity
- Network traversal
- Routing

---

# 📌 Current Project Focus

The current implementation focuses on three major areas:

```text
┌──────────────────────────────────────────┐
│                                          │
│     INTERACTIVE TOPOLOGY CREATION       │
│                    +                     │
│       VISUAL NETWORK REPRESENTATION     │
│                    +                     │
│      DEVICE & CONNECTION MANAGEMENT     │
│                                          │
└──────────────────────────────────────────┘
```

The project provides the interactive foundation required for progressively introducing more advanced networking behavior.

---

# 🔮 Vision

The long-term vision of NetBuilder is to evolve from an interactive topology editor into a browser-based networking laboratory.

```text
                         🌐 NETBUILDER
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
        🧩 Build Networks             🎨 Visualize Networks
               │                             │
               └──────────────┬──────────────┘
                              │
                              ▼
                       🔬 Simulate Networks
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
              📦 Packets   🌐 Routing   🔀 Switching
                 │            │            │
                 └────────────┼────────────┘
                              │
                              ▼
                       🎓 Learn Networking
                              │
                              ▼
                  🚀 Interactive Network Lab
```

---

<div align="center">

# 🌐 NetBuilder

### Build Your Topology. Visualize Your Network. Understand Networking.

<br>

<p>
  <b>React</b> • <b>Vite</b> • <b>React Flow</b> • <b>Tailwind CSS</b>
</p>

</div>

---

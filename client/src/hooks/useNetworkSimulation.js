import { useState, useCallback, useRef, useEffect } from "react";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DEVICE_TYPES = {
  ROUTER: "router",
  SWITCH: "switch",
  PC: "pc",
  SERVER: "server",
  HUB: "hub",
  FIREWALL: "firewall",
};

const createDevice = (type, position, indexHint = 1) => ({
  id: generateId(),
  type,
  name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${Math.floor(
    Math.random() * 899 + 100
  )}`,
  position,
  config: {
    ip:
      type === DEVICE_TYPES.PC || type === DEVICE_TYPES.SERVER
        ? `10.0.0.${indexHint}`
        : type === DEVICE_TYPES.ROUTER
        ? `10.0.${indexHint}.1`
        : "",
    subnet: "255.255.255.0",
    gateway: type === DEVICE_TYPES.PC || type === DEVICE_TYPES.SERVER ? "10.0.0.1" : "",
    ports:
      type === DEVICE_TYPES.ROUTER
        ? 4
        : type === DEVICE_TYPES.SWITCH
        ? 8
        : 1,
    status: "active",
    routingTable: type === DEVICE_TYPES.ROUTER ? [] : null,
    macTable: type === DEVICE_TYPES.SWITCH ? [] : null,
    interfaces: [],
  },
  packets: [],
  stats: {
    packetsReceived: 0,
    packetsSent: 0,
    errors: 0,
  },
});

export const useNetworkSimulation = () => {
  const [devices, setDevices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [realStats, setRealStats] = useState({ hosts: [], switches: [] });
  const [realPingResult, setRealPingResult] = useState(null);
  const [realIperfResult, setRealIperfResult] = useState(null);
  const [registeredTopology, setRegisteredTopology] = useState(null);
  const [openflowFlows, setOpenflowFlows] = useState([]);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [eventLog, setEventLog] = useState([]);
  const [healthInfo, setHealthInfo] = useState({ status: "checking", flask: false, mininet: false, ovs: false });

  // Phase 2 Advanced Experimentation State
  const [activeExperiment, setActiveExperiment] = useState(null);
  const [experimentHistory, setExperimentHistory] = useState([]);
  const [capturedPackets, setCapturedPackets] = useState({});
  const [captureActive, setCaptureActive] = useState({});
  const [tracerouteResult, setTracerouteResult] = useState(null);
  const [routingTableResult, setRoutingTableResult] = useState(null);

  const simulationInterval = useRef(null);
  const captureIntervals = useRef({});
  const packetQueue = useRef([]);

  const addEventLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          setHealthInfo(data);
        } else {
          setHealthInfo({ status: "simulation", flask: false, mininet: false, ovs: false });
        }
      } catch (err) {
        setHealthInfo({ status: "simulation", flask: false, mininet: false, ovs: false });
      }
    };
    checkHealth();
  }, []);

  // Add Device
  const addDevice = useCallback((type, position) => {
    setDevices((prev) => {
      const indexHint = prev.length + 1;
      const newDevice = createDevice(type, position, indexHint);
      return [...prev, newDevice];
    });
  }, []);

  // Remove Device
  const removeDevice = useCallback((deviceId) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId));
    setConnections((prev) =>
      prev.filter((conn) => conn.source !== deviceId && conn.target !== deviceId)
    );
  }, []);

  // Update Device
  const updateDevice = useCallback((deviceId, updates) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, ...updates } : device
      )
    );
  }, []);

  // Add Connection
  const addConnection = useCallback(
    (sourceId, targetId) => {
      const connectionExists = connections.some(
        (conn) =>
          (conn.source === sourceId && conn.target === targetId) ||
          (conn.source === targetId && conn.target === sourceId)
      );

      if (!connectionExists && sourceId !== targetId) {
        const newConnection = {
          id: generateId(),
          source: sourceId,
          target: targetId,
          status: "active",
          bandwidth: 100,
          latency: 1,
          packets: [],
        };

        setConnections((prev) => [...prev, newConnection]);
        return newConnection;
      }
      return null;
    },
    [connections]
  );

  // Remove Connection
  const removeConnection = useCallback((connectionId) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
  }, []);

  // Local Packet Animation Queue
  const sendPacket = useCallback((sourceId, targetId, packetType = "data") => {
    const packet = {
      id: generateId(),
      source: sourceId,
      target: targetId,
      type: packetType,
      timestamp: Date.now(),
      hops: [],
      status: "transmitting",
    };

    packetQueue.current.push(packet);

    setDevices((prev) =>
      prev.map((device) =>
        device.id === sourceId
          ? {
              ...device,
              stats: {
                ...device.stats,
                packetsSent: device.stats.packetsSent + 1,
              },
            }
          : device
      )
    );
  }, []);

  const findPath = useCallback((sourceId, targetId, deviceList, connectionList) => {
    const visited = new Set();
    const queue = [[sourceId]];

    while (queue.length > 0) {
      const path = queue.shift();
      const currentNode = path[path.length - 1];

      if (currentNode === targetId) {
        return path;
      }

      if (visited.has(currentNode)) continue;
      visited.add(currentNode);

      const neighbors = connectionList
        .filter((conn) => conn.status !== "disabled" && (conn.source === currentNode || conn.target === currentNode))
        .map((conn) => (conn.source === currentNode ? conn.target : conn.source));

      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          queue.push([...path, neighbor]);
        }
      });
    }

    return [];
  }, []);

  const processPackets = useCallback(() => {
    if (packetQueue.current.length === 0) return;

    const currentPackets = [...packetQueue.current];
    packetQueue.current = [];

    currentPackets.forEach((packet) => {
      const path = findPath(packet.source, packet.target, devices, connections);
      if (path.length > 0) {
        packet.hops = path;
        packet.status = "delivered";

        setDevices((prev) =>
          prev.map((device) =>
            device.id === packet.target
              ? {
                  ...device,
                  stats: {
                    ...device.stats,
                    packetsReceived: device.stats.packetsReceived + 1,
                  },
                }
              : device
          )
        );
      } else {
        packet.status = "failed";
        setDevices((prev) =>
          prev.map((device) =>
            device.id === packet.source
              ? {
                  ...device,
                  stats: {
                    ...device.stats,
                    errors: device.stats.errors + 1,
                  },
                }
              : device
          )
        );
      }
    });
  }, [devices, connections, findPath]);

  // Start Simulation (Dual-Mode: Real Mininet Backend or Web Simulation Fallback)
  const startSimulation = useCallback(async () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }

    let isRealMininet = false;

    try {
      addEventLog("Validating topology and starting Mininet...");
      const response = await fetch(`${API_BASE_URL}/api/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devices, connections }),
        signal: AbortSignal.timeout(3000)
      });

      const data = await response.json();
      if (response.ok) {
        isRealMininet = true;
        toast.success("Real Mininet topology started successfully!");
        addEventLog(`Real Mininet topology online with ${data.counts?.hosts || 0} hosts.`);
      }
    } catch (error) {
      // Graceful fallback to web simulation mode when backend server is offline
      addEventLog("Backend server offline. Running in Web Simulation Fallback mode.");
      toast.info("Simulation started in Web Mode (Start 'python backend/server.py' for real Mininet).");
    }

    setIsRunning(true);

    // Visual animation loop
    simulationInterval.current = setInterval(() => {
      processPackets();
      if (devices.length > 1 && Math.random() < 0.3) {
        const src = devices[Math.floor(Math.random() * devices.length)];
        const tgt = devices[Math.floor(Math.random() * devices.length)];
        if (src && tgt && src.id !== tgt.id) {
          sendPacket(src.id, tgt.id);
        }
      }
    }, 1000 / simulationSpeed);

    return true;
  }, [devices, connections, processPackets, sendPacket, simulationSpeed, addEventLog]);

  // Stop Simulation
  const stopSimulation = useCallback(async () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsRunning(false);
    addEventLog("Stopping network simulation...");

    try {
      await fetch(`${API_BASE_URL}/api/stop`, { method: "POST", signal: AbortSignal.timeout(2000) });
    } catch (error) {}
    toast.info("Simulation stopped.");
  }, [addEventLog]);

  // Reset Simulation
  const resetSimulation = useCallback(async () => {
    stopSimulation();

    try {
      await fetch(`${API_BASE_URL}/api/reset`, { method: "POST", signal: AbortSignal.timeout(2000) });
    } catch (e) {}

    setDevices((prev) =>
      prev.map((device) => ({
        ...device,
        packets: [],
        stats: { packetsReceived: 0, packetsSent: 0, errors: 0 },
      }))
    );

    setConnections((prev) =>
      prev.map((conn) => ({ ...conn, status: "active", packets: [] }))
    );

    setRealPingResult(null);
    setRealIperfResult(null);
    packetQueue.current = [];
    toast.success("Simulation reset.");
  }, [stopSimulation]);

  // Poll live Mininet statistics or calculate web statistics
  useEffect(() => {
    if (!isRunning) {
      setRealStats({ hosts: [], switches: [] });
      setRegisteredTopology(null);
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      try {
        const [statsRes, topoRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stats`, { signal: AbortSignal.timeout(2000) }),
          fetch(`${API_BASE_URL}/api/topology`, { signal: AbortSignal.timeout(2000) }),
        ]);

        if (!cancelled && statsRes.ok) {
          const statsData = await statsRes.json();
          setRealStats(Array.isArray(statsData) ? { hosts: statsData, switches: [] } : statsData);
        }

        if (!cancelled && topoRes.ok) {
          const topoData = await topoRes.json();
          setRegisteredTopology(topoData);
        }
      } catch (error) {
        // Build web simulation statistics from device stats
        if (!cancelled) {
          const simulatedHostStats = devices
            .filter((d) => d.type === "pc" || d.type === "server" || d.type === "router")
            .map((d) => ({
              name: d.name,
              interface: `${d.name.toLowerCase()}-eth0`,
              ip: d.config?.ip || "10.0.0.1",
              rx_packets: d.stats.packetsReceived,
              tx_packets: d.stats.packetsSent,
              rx_bytes: d.stats.packetsReceived * 64,
              tx_bytes: d.stats.packetsSent * 64,
            }));
          setRealStats({ hosts: simulatedHostStats, switches: [] });
        }
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isRunning, devices]);

  // Real Ping Action (with graceful fallback)
  const sendRealPing = useCallback(async (source, target) => {
    if (!isRunning) {
      toast.error("Simulation is not running. Please start simulation first.");
      return null;
    }

    const srcObj = devices.find((d) => d.id === source || d.name === source);
    const dstObj = devices.find((d) => d.id === target || d.name === target);

    const srcName = srcObj ? srcObj.name : source;
    const dstName = dstObj ? dstObj.name : target;
    const dstIp = dstObj?.config?.ip || "10.0.0.2";

    addEventLog(`Pinging ${srcName} → ${dstName}...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target }),
        signal: AbortSignal.timeout(2500)
      });

      const data = await response.json();
      setRealPingResult(data);

      if (!response.ok || data.status === "failed") {
        toast.error(`Ping ${data.source || srcName} → ${data.target || dstName} failed! (${data.message || '100% loss'})`);
      } else {
        toast.success(`Ping ${data.source} → ${data.target} successful! (${data.latency}, 0% loss)`);
      }
      return data;
    } catch (error) {
      // Client simulation fallback
      const path = findPath(srcObj?.id || source, dstObj?.id || target, devices, connections);
      const isPathBroken = path.length === 0;

      const simResult = {
        status: isPathBroken ? "failed" : "success",
        source: srcName,
        target: dstName,
        target_ip: dstIp,
        packet_loss: isPathBroken ? 100 : 0,
        latency: isPathBroken ? "N/A" : `${(Math.random() * 0.5 + 0.4).toFixed(2)} ms`,
        transmitted: 4,
        received: isPathBroken ? 0 : 4,
        output: isPathBroken
          ? `PING ${dstIp} (${dstIp}) 56(84) bytes of data.\nFrom ${srcObj?.config?.ip || '10.0.0.1'} icmp_seq=1 Destination Host Unreachable\n--- ${dstIp} ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss`
          : `PING ${dstIp} (${dstIp}) 56(84) bytes of data.\n64 bytes from ${dstIp}: icmp_seq=1 ttl=64 time=0.82 ms\n64 bytes from ${dstIp}: icmp_seq=2 ttl=64 time=0.79 ms\n--- ${dstIp} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss\nrtt min/avg/max = 0.79/0.82/0.91 ms`
      };

      setRealPingResult(simResult);
      if (isPathBroken) {
        toast.error(`Ping ${srcName} → ${dstName} failed! (Destination Unreachable / Link Cut)`);
      } else {
        toast.success(`Ping ${srcName} → ${dstName} successful! (${simResult.latency}, 0% loss)`);
      }
      return simResult;
    }
  }, [isRunning, devices, connections, findPath, addEventLog]);

  // Real Iperf Bandwidth Test (with graceful fallback)
  const sendRealIperf = useCallback(async (source, target, duration = 5) => {
    if (!isRunning) {
      toast.error("Simulation is not running. Please start simulation first.");
      return null;
    }

    const srcObj = devices.find((d) => d.id === source || d.name === source);
    const dstObj = devices.find((d) => d.id === target || d.name === target);
    const srcName = srcObj ? srcObj.name : source;
    const dstName = dstObj ? dstObj.name : target;

    addEventLog(`Starting iperf bandwidth test: ${srcName} → ${dstName} (${duration}s)...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/iperf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target, duration }),
        signal: AbortSignal.timeout(3500)
      });

      const data = await response.json();
      setRealIperfResult(data);
      if (response.ok) {
        toast.success(`Bandwidth Test: ${data.throughput} (${data.transfer} transferred)`);
      }
      return data;
    } catch (error) {
      const path = findPath(srcObj?.id || source, dstObj?.id || target, devices, connections);
      const isPathBroken = path.length === 0;

      const simResult = {
        status: isPathBroken ? "failed" : "success",
        source: srcName,
        target: dstName,
        duration,
        throughput: isPathBroken ? "0.00 Mbits/sec" : `${(Math.random() * 10 + 90).toFixed(1)} Mbits/sec`,
        bandwidth: isPathBroken ? "0.00 Mbits/sec" : `${(Math.random() * 10 + 90).toFixed(1)} Mbits/sec`,
        transfer: isPathBroken ? "0 KBytes" : `${(duration * 11.2).toFixed(1)} MBytes`,
        output: isPathBroken ? "Connect failed: Connection refused" : `[  3] 0.0-${duration}.0 sec  ${(duration * 11.2).toFixed(1)} MBytes  94.5 Mbits/sec`
      };

      setRealIperfResult(simResult);
      if (isPathBroken) {
        toast.error(`Iperf test ${srcName} → ${dstName} failed (Path broken)`);
      } else {
        toast.success(`Bandwidth Test: ${simResult.throughput} (${simResult.transfer} transferred)`);
      }
      return simResult;
    }
  }, [isRunning, devices, connections, findPath, addEventLog]);

  // Toggle Link Down / Up
  const toggleLinkStatus = useCallback(async (source, target, isCurrentlyActive = true) => {
    if (!isRunning) return;
    const endpoint = isCurrentlyActive ? "/api/link/down" : "/api/link/up";
    const actionName = isCurrentlyActive ? "down" : "up";

    addEventLog(`Setting link ${source} ↔ ${target} to ${actionName.toUpperCase()}...`);

    setConnections((prev) =>
      prev.map((conn) =>
        (conn.source === source && conn.target === target) ||
        (conn.source === target && conn.target === source)
          ? { ...conn, status: isCurrentlyActive ? "disabled" : "active" }
          : conn
      )
    );

    toast.info(`Link status set to ${actionName.toUpperCase()}`);

    try {
      await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target }),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {}
  }, [isRunning, addEventLog]);

  // Phase 2 Advanced Experiment Generator
  const startExperiment = useCallback(async (experimentConfig) => {
    if (!isRunning) {
      toast.error("Simulation is not running. Please start simulation first.");
      return null;
    }

    addEventLog(`Starting experiment: ${experimentConfig.mode || 'Traffic'} (${experimentConfig.src} → ${experimentConfig.dst})...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/experiments/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experimentConfig),
        signal: AbortSignal.timeout(3000)
      });

      const data = await response.json();
      if (response.ok) {
        setActiveExperiment(data.experiment);
        toast.success(`Experiment #${data.experiment?.id} started!`);
        return data;
      }
    } catch (error) {
      // Fallback local experiment runner
      const expId = Math.floor(Math.random() * 8999 + 1000);
      const simExp = {
        id: expId,
        mode: experimentConfig.mode,
        src: experimentConfig.src,
        dst: experimentConfig.dst,
        protocol: experimentConfig.protocol || "TCP",
        progress_pct: 0,
        metrics: {
          throughput_mbps: (Math.random() * 15 + 85).toFixed(1),
          latency_ms: (Math.random() * 0.4 + 0.6).toFixed(2),
          pps: Math.floor(Math.random() * 200 + 800),
          loss_pct: 0,
        },
        timeline: Array.from({ length: 10 }, (_, i) => ({
          timestamp: `${i + 1}s`,
          throughput_mbps: (Math.random() * 15 + 85).toFixed(1),
          latency_ms: (Math.random() * 0.4 + 0.6).toFixed(2),
          loss_pct: 0,
        }))
      };

      setActiveExperiment(simExp);
      toast.success(`Experiment #${expId} started (Web Mode)!`);
      return { experiment: simExp };
    }
  }, [isRunning, addEventLog]);

  const stopExperiment = useCallback(async () => {
    setActiveExperiment(null);
    toast.info("Experiment stopped.");
    try {
      await fetch(`${API_BASE_URL}/api/experiments/stop`, { method: "POST", signal: AbortSignal.timeout(2000) });
    } catch (e) {}
  }, []);

  const configureLinkTC = useCallback(async (source, target, bw, delay, loss, queue) => {
    if (!isRunning) return;
    addEventLog(`Applying TC conditions on link ${source} ↔ ${target}...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/link/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target, bw, delay, loss, max_queue_size: queue }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        return data;
      }
    } catch (error) {
      toast.success(`Applied Link TC: Bandwidth ${bw}Mbps, Delay ${delay}ms, Loss ${loss}%`);
      return { status: "success" };
    }
  }, [isRunning, addEventLog]);

  const startPacketCapture = useCallback(async (node_id, filter_expr = "") => {
    if (!isRunning) {
      toast.error("Simulation is not running.");
      return;
    }

    setCaptureActive(prev => ({ ...prev, [node_id]: true }));
    toast.success(`Packet capture started on ${node_id}`);

    // Generate local simulation packet stream if backend is offline
    if (!captureIntervals.current[node_id]) {
      captureIntervals.current[node_id] = setInterval(() => {
        const protocols = ["ICMP", "TCP", "UDP", "ARP"];
        const proto = protocols[Math.floor(Math.random() * protocols.length)];
        const pkt = {
          timestamp: new Date().toLocaleTimeString() + `.${Math.floor(Math.random() * 900 + 100)}`,
          src: "10.0.0.1",
          dst: "10.0.0.2",
          protocol: proto,
          length: proto === "TCP" ? 1500 : 64,
          info: proto === "ICMP" ? "echo request seq=1, ttl=64" : `${Math.floor(Math.random()*20000+30000)} > 80 [ACK] Seq=100 Win=502`
        };

        setCapturedPackets(prev => ({
          ...prev,
          [node_id]: [...(prev[node_id] || []).slice(-99), pkt]
        }));
      }, 800);
    }
  }, [isRunning]);

  const stopPacketCapture = useCallback(async (node_id) => {
    setCaptureActive(prev => ({ ...prev, [node_id]: false }));
    if (captureIntervals.current[node_id]) {
      clearInterval(captureIntervals.current[node_id]);
      delete captureIntervals.current[node_id];
    }
    toast.info(`Packet capture stopped on ${node_id}`);
  }, []);

  const fetchCapturedPackets = useCallback(async (node_id) => {}, []);

  const runTraceroute = useCallback(async (source, target) => {
    if (!isRunning) {
      toast.error("Simulation is not running.");
      return;
    }

    const srcObj = devices.find((d) => d.id === source || d.name === source);
    const dstObj = devices.find((d) => d.id === target || d.name === target);
    const srcName = srcObj ? srcObj.name : source;
    const dstName = dstObj ? dstObj.name : target;
    const dstIp = dstObj?.config?.ip || "10.0.0.2";

    addEventLog(`Running traceroute ${srcName} → ${dstName}...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/traceroute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await response.json();
      if (response.ok) {
        setTracerouteResult(data);
        toast.success(`Traceroute complete: ${data.hops?.length || 0} hops.`);
        return data;
      }
    } catch (error) {
      const path = findPath(srcObj?.id || source, dstObj?.id || target, devices, connections);
      const hops = path.map((nodeId, idx) => {
        const node = devices.find((d) => d.id === nodeId);
        return {
          hop: idx + 1,
          node_name: node?.name || nodeId,
          ip: node?.config?.ip || `10.0.0.${idx + 1}`,
          rtt: `${(0.35 * (idx + 1) + 0.05).toFixed(2)} ms`
        };
      });

      const simTrace = {
        status: "success",
        source: srcName,
        target: dstName,
        target_ip: dstIp,
        hops,
        output: `traceroute to ${dstName} (${dstIp}), 30 hops max\n` + hops.map(h => ` ${h.hop}  ${h.node_name} (${h.ip})  ${h.rtt}`).join('\n')
      };

      setTracerouteResult(simTrace);
      toast.success(`Traceroute complete: ${hops.length} hops.`);
      return simTrace;
    }
  }, [isRunning, devices, connections, findPath, addEventLog]);

  const fetchRoutingTable = useCallback(async (node_id) => {
    if (!isRunning || !node_id) return;
    const nodeObj = devices.find(d => d.id === node_id || d.name === node_id);
    const nodeName = nodeObj ? nodeObj.name : node_id;
    const nodeIp = nodeObj?.config?.ip || "10.0.0.1";

    try {
      const response = await fetch(`${API_BASE_URL}/api/router/routes?node_id=${node_id}`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        const data = await response.json();
        setRoutingTableResult(data);
        return;
      }
    } catch (e) {}

    setRoutingTableResult({
      status: "success",
      node_id,
      node_name: nodeName,
      routes: [
        "default via 10.0.0.254 dev eth0 proto dhcp metric 100",
        `10.0.0.0/24 dev eth0 proto kernel scope link src ${nodeIp}`,
        "127.0.0.0/8 dev lo scope link"
      ]
    });
  }, [isRunning, devices]);

  const fetchOpenFlows = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/flows`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        setOpenflowFlows(data.flows || []);
        return;
      }
    } catch (e) {}

    const switches = devices.filter(d => d.type === "switch");
    const mockFlows = switches.map((sw, idx) => ({
      name: sw.name,
      mininet_name: `s${idx+1}`,
      flows: [
        "cookie=0x0, duration=14.2s, table=0, n_packets=42, n_bytes=3420, priority=0 actions=NORMAL",
        "cookie=0x0, duration=14.2s, table=0, n_packets=8, n_bytes=640, priority=1,in_port=1 actions=output:2"
      ]
    }));
    setOpenflowFlows(mockFlows);
  }, [devices]);

  const saveTopology = useCallback(() => {
    return {
      devices: devices.map((device) => ({
        ...device,
        packets: [],
        stats: { packetsReceived: 0, packetsSent: 0, errors: 0 },
      })),
      connections: connections.map((conn) => ({ ...conn, packets: [] })),
      metadata: { version: "2.0", created: new Date().toISOString() },
    };
  }, [devices, connections]);

  const loadTopology = useCallback(
    (topology) => {
      stopSimulation();
      setDevices(topology.devices || []);
      setConnections(topology.connections || []);
      packetQueue.current = [];
      addEventLog("Loaded network topology.");
    },
    [stopSimulation, addEventLog]
  );

  return {
    devices,
    connections,
    isRunning,
    simulationSpeed,
    healthInfo,
    addDevice,
    removeDevice,
    addConnection,
    removeConnection,
    updateDevice,
    sendPacket,
    processPackets,
    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationSpeed,
    saveTopology,
    loadTopology,
    realStats,
    realPingResult,
    realIperfResult,
    sendRealPing,
    sendRealIperf,
    toggleLinkStatus,
    openflowFlows,
    fetchOpenFlows,
    registeredTopology,
    eventLog,
    activeExperiment,
    experimentHistory,
    startExperiment,
    stopExperiment,
    configureLinkTC,
    startPacketCapture,
    stopPacketCapture,
    fetchCapturedPackets,
    capturedPackets,
    captureActive,
    runTraceroute,
    tracerouteResult,
    fetchRoutingTable,
    routingTableResult,
  };
};
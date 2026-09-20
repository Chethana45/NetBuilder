import { useState, useCallback, useRef, useEffect } from "react";
import { generateId } from "@/lib/utils";

const DEVICE_TYPES = {
  ROUTER: "router",
  SWITCH: "switch",
  PC: "pc",
  SERVER: "server",
  HUB: "hub",
  FIREWALL: "firewall",
};

const createDevice = (type, position) => ({
  id: generateId(),
  type,
  name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${Math.floor(Math.random() * 1000)}`,
  position,
  config: {
    ip: type === DEVICE_TYPES.PC || type === DEVICE_TYPES.SERVER ? "192.168.1.1" : "",
    subnet: "255.255.255.0",
    gateway: "192.168.1.1",
    ports: type === DEVICE_TYPES.ROUTER ? 4 : type === DEVICE_TYPES.SWITCH ? 8 : 1,
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
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const simulationInterval = useRef(null);
  const packetQueue = useRef([]);

  const addDevice = useCallback((type, position) => {
    const newDevice = createDevice(type, position);
    setDevices((prev) => [...prev, newDevice]);
    return newDevice;
  }, []);

  const removeDevice = useCallback((deviceId) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId));
    setConnections((prev) =>
      prev.filter((conn) => conn.source !== deviceId && conn.target !== deviceId)
    );
  }, []);

  const updateDevice = useCallback((deviceId, updates) => {
    setDevices((prev) =>
      prev.map((device) => (device.id === deviceId ? { ...device, ...updates } : device))
    );
  }, []);

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
          bandwidth: 100, // Mbps
          latency: 1, // ms
          packets: [],
        };
        setConnections((prev) => [...prev, newConnection]);
        return newConnection;
      }
      return null;
    },
    [connections]
  );

  const removeConnection = useCallback((connectionId) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
  }, []);

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

    // Update source device stats
    setDevices((prev) =>
      prev.map((device) =>
        device.id === sourceId
          ? { ...device, stats: { ...device.stats, packetsSent: device.stats.packetsSent + 1 } }
          : device
      )
    );
  }, []);

  const processPackets = useCallback(() => {
    if (packetQueue.current.length === 0) return;

    const currentPackets = [...packetQueue.current];
    packetQueue.current = [];

    currentPackets.forEach((packet) => {
      // Find path from source to target
      const path = findPath(packet.source, packet.target, devices, connections);

      if (path.length > 0) {
        // Simulate packet transmission through the path
        packet.hops = path;
        packet.status = "delivered";

        // Update target device stats
        setDevices((prev) =>
          prev.map((device) =>
            device.id === packet.target
              ? {
                  ...device,
                  stats: { ...device.stats, packetsReceived: device.stats.packetsReceived + 1 },
                }
              : device
          )
        );
      } else {
        packet.status = "failed";
        // Update error stats
        setDevices((prev) =>
          prev.map((device) =>
            device.id === packet.source
              ? { ...device, stats: { ...device.stats, errors: device.stats.errors + 1 } }
              : device
          )
        );
      }
    });
  }, [devices, connections]);

  const findPath = (sourceId, targetId, devices, connections) => {
    // Simple BFS pathfinding
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

      const neighbors = connections
        .filter((conn) => conn.source === currentNode || conn.target === currentNode)
        .map((conn) => (conn.source === currentNode ? conn.target : conn.source));

      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          queue.push([...path, neighbor]);
        }
      });
    }

    return [];
  };

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    simulationInterval.current = setInterval(() => {
      processPackets();

      // Generate random traffic for demonstration
      if (devices.length > 1 && Math.random() < 0.3) {
        const sourceDevice = devices[Math.floor(Math.random() * devices.length)];
        const targetDevice = devices[Math.floor(Math.random() * devices.length)];
        if (sourceDevice.id !== targetDevice.id) {
          sendPacket(sourceDevice.id, targetDevice.id);
        }
      }
    }, 1000 / simulationSpeed);
  }, [devices, processPackets, sendPacket, simulationSpeed]);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setDevices((prev) =>
      prev.map((device) => ({
        ...device,
        packets: [],
        stats: { packetsReceived: 0, packetsSent: 0, errors: 0 },
      }))
    );
    setConnections((prev) => prev.map((conn) => ({ ...conn, packets: [] })));
    packetQueue.current = [];
  }, [stopSimulation]);

  const saveTopology = useCallback(() => {
    return {
      devices: devices.map((device) => ({
        ...device,
        packets: [], // Don't save runtime data
        stats: { packetsReceived: 0, packetsSent: 0, errors: 0 },
      })),
      connections: connections.map((conn) => ({
        ...conn,
        packets: [], // Don't save runtime data
      })),
      metadata: {
        version: "1.0",
        created: new Date().toISOString(),
      },
    };
  }, [devices, connections]);

  const loadTopology = useCallback(
    (topology) => {
      stopSimulation();
      setDevices(topology.devices || []);
      setConnections(topology.connections || []);
      packetQueue.current = [];
    },
    [stopSimulation]
  );

  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  return {
    devices,
    connections,
    isRunning,
    simulationSpeed,
    addDevice,
    removeDevice,
    updateDevice,
    addConnection,
    removeConnection,
    sendPacket,
    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationSpeed,
    saveTopology,
    loadTopology,
  };
};

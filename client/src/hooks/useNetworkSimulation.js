import { useState, useCallback, useRef, useEffect } from "react";
import { generateId } from "@/lib/utils";

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

const createDevice = (type, position) => ({
  id: generateId(),
  type,
  name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${Math.floor(
    Math.random() * 1000
  )}`,
  position,
  config: {
    ip:
      type === DEVICE_TYPES.PC || type === DEVICE_TYPES.SERVER
        ? "192.168.1.1"
        : "",
    subnet: "255.255.255.0",
    gateway: "192.168.1.1",
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
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const simulationInterval = useRef(null);
  const packetQueue = useRef([]);

  // --------------------------------------------------
  // ADD DEVICE
  // --------------------------------------------------

  const addDevice = useCallback((type, position) => {
    const newDevice = createDevice(type, position);

    setDevices((prev) => [...prev, newDevice]);

    return newDevice;
  }, []);

  // --------------------------------------------------
  // REMOVE DEVICE
  // --------------------------------------------------

  const removeDevice = useCallback((deviceId) => {
    setDevices((prev) =>
      prev.filter((device) => device.id !== deviceId)
    );

    setConnections((prev) =>
      prev.filter(
        (conn) =>
          conn.source !== deviceId &&
          conn.target !== deviceId
      )
    );
  }, []);

  // --------------------------------------------------
  // UPDATE DEVICE
  // --------------------------------------------------

  const updateDevice = useCallback((deviceId, updates) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? { ...device, ...updates }
          : device
      )
    );
  }, []);

  // --------------------------------------------------
  // ADD CONNECTION
  // --------------------------------------------------

  const addConnection = useCallback(
    (sourceId, targetId) => {
      const connectionExists = connections.some(
        (conn) =>
          (conn.source === sourceId &&
            conn.target === targetId) ||
          (conn.source === targetId &&
            conn.target === sourceId)
      );

      if (
        !connectionExists &&
        sourceId !== targetId
      ) {
        const newConnection = {
          id: generateId(),
          source: sourceId,
          target: targetId,
          status: "active",
          bandwidth: 100,
          latency: 1,
          packets: [],
        };

        setConnections((prev) => [
          ...prev,
          newConnection,
        ]);

        return newConnection;
      }

      return null;
    },
    [connections]
  );

  // --------------------------------------------------
  // REMOVE CONNECTION
  // --------------------------------------------------

  const removeConnection = useCallback(
    (connectionId) => {
      setConnections((prev) =>
        prev.filter(
          (conn) => conn.id !== connectionId
        )
      );
    },
    []
  );

  // --------------------------------------------------
  // SEND PACKET
  // --------------------------------------------------

  const sendPacket = useCallback(
    (sourceId, targetId, packetType = "data") => {
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

      // Update source device statistics
      setDevices((prev) =>
        prev.map((device) =>
          device.id === sourceId
            ? {
                ...device,
                stats: {
                  ...device.stats,
                  packetsSent:
                    device.stats.packetsSent + 1,
                },
              }
            : device
        )
      );
    },
    []
  );

  // --------------------------------------------------
  // FIND PATH
  // --------------------------------------------------

  const findPath = useCallback(
    (sourceId, targetId, deviceList, connectionList) => {
      const visited = new Set();
      const queue = [[sourceId]];

      while (queue.length > 0) {
        const path = queue.shift();

        const currentNode =
          path[path.length - 1];

        if (currentNode === targetId) {
          return path;
        }

        if (visited.has(currentNode)) {
          continue;
        }

        visited.add(currentNode);

        const neighbors = connectionList
          .filter(
            (conn) =>
              conn.source === currentNode ||
              conn.target === currentNode
          )
          .map((conn) =>
            conn.source === currentNode
              ? conn.target
              : conn.source
          );

        neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            queue.push([
              ...path,
              neighbor,
            ]);
          }
        });
      }

      return [];
    },
    []
  );

  // --------------------------------------------------
  // PROCESS PACKETS
  // --------------------------------------------------

  const processPackets = useCallback(() => {
    if (packetQueue.current.length === 0) {
      return;
    }

    const currentPackets = [
      ...packetQueue.current,
    ];

    packetQueue.current = [];

    currentPackets.forEach((packet) => {
      const path = findPath(
        packet.source,
        packet.target,
        devices,
        connections
      );

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
                    packetsReceived:
                      device.stats.packetsReceived +
                      1,
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
                    errors:
                      device.stats.errors + 1,
                  },
                }
              : device
          )
        );
      }
    });
  }, [devices, connections, findPath]);

  // --------------------------------------------------
  // START SIMULATION
  // FRONTEND + MININET
  // --------------------------------------------------

  const startSimulation = useCallback(async () => {
    // Prevent multiple simulation intervals
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }

    console.log("Starting NetBuilder simulation...");

    // ==================================================
    // 1. START FRONTEND VISUAL SIMULATION
    // ==================================================

    setIsRunning(true);

    simulationInterval.current = setInterval(() => {
      // Process packets already in the queue
      processPackets();

      // Generate visual network traffic
      if (devices.length > 1 && Math.random() < 0.3) {
        const sourceDevice =
          devices[
            Math.floor(Math.random() * devices.length)
          ];

        const targetDevice =
          devices[
            Math.floor(Math.random() * devices.length)
          ];

        // Don't send a packet from a device to itself
        if (
          sourceDevice &&
          targetDevice &&
          sourceDevice.id !== targetDevice.id
        ) {
          sendPacket(
            sourceDevice.id,
            targetDevice.id
          );
        }
      }
    }, 1000 / simulationSpeed);

    console.log(
      "Frontend packet simulation started."
    );

    // ==================================================
    // 2. START REAL MININET SIMULATION
    // ==================================================

    try {
      console.log(
        "Starting Mininet with topology:",
        {
          devices,
          connections,
        }
      );

      const response = await fetch(
        `${API_BASE_URL}/api/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            devices,
            connections,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to start Mininet"
        );
      }

      console.log(
        "Mininet network started:",
        data
      );
    } catch (error) {
      console.error(
        "Mininet start error:",
        error
      );

      // IMPORTANT:
      // Don't stop the frontend simulation
      // if Mininet has a problem.
      //
      // The visual simulation should still work.
      console.warn(
        "Frontend simulation is still running."
      );
    }
  }, [
    devices,
    connections,
    processPackets,
    sendPacket,
    simulationSpeed,
  ]);

  // --------------------------------------------------
  // STOP SIMULATION
  // FRONTEND + MININET
  // --------------------------------------------------

  const stopSimulation = useCallback(async () => {
    console.log(
      "Stopping NetBuilder simulation..."
    );

    // Stop frontend animation
    if (simulationInterval.current) {
      clearInterval(
        simulationInterval.current
      );

      simulationInterval.current = null;
    }

    setIsRunning(false);

    // Stop real Mininet
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stop`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log(
        "Mininet network stopped:",
        data
      );
    } catch (error) {
      console.error(
        "Mininet stop error:",
        error
      );
    }
  }, []);

  // --------------------------------------------------
  // RESET SIMULATION
  // --------------------------------------------------

  const resetSimulation = useCallback(() => {
    stopSimulation();

    setDevices((prev) =>
      prev.map((device) => ({
        ...device,
        packets: [],
        stats: {
          packetsReceived: 0,
          packetsSent: 0,
          errors: 0,
        },
      }))
    );

    setConnections((prev) =>
      prev.map((conn) => ({
        ...conn,
        packets: [],
      }))
    );

    packetQueue.current = [];
  }, [stopSimulation]);

  // --------------------------------------------------
  // SAVE TOPOLOGY
  // --------------------------------------------------

  const saveTopology = useCallback(() => {
    return {
      devices: devices.map((device) => ({
        ...device,
        packets: [],
        stats: {
          packetsReceived: 0,
          packetsSent: 0,
          errors: 0,
        },
      })),

      connections: connections.map((conn) => ({
        ...conn,
        packets: [],
      })),

      metadata: {
        version: "1.0",
        created: new Date().toISOString(),
      },
    };
  }, [devices, connections]);

  // --------------------------------------------------
  // LOAD TOPOLOGY
  // --------------------------------------------------

  const loadTopology = useCallback(
    (topology) => {
      stopSimulation();

      setDevices(
        topology.devices || []
      );

      setConnections(
        topology.connections || []
      );

      packetQueue.current = [];
    },
    [stopSimulation]
  );

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(
          simulationInterval.current
        );

        simulationInterval.current = null;
      }
    };
  }, []);

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  return {
    devices,
    connections,

    isRunning,
    simulationSpeed,

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
  };
};

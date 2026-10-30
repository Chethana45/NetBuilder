import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, RotateCcw, Save, Upload, HelpCircle, LayoutGrid, Activity, ChevronDown, Terminal } from "lucide-react";
import NetworkCanvas from "@/components/network/NetworkCanvas";
import DevicePanel from "@/components/network/DevicePanel";
import ConfigPanel from "@/components/network/ConfigPanel";
import SimulationControls from "@/components/network/SimulationControls";
import WelcomeModal from "@/components/network/WelcomeModal";
import DemoInstructions from "@/components/network/DemoInstructions";
import TutorialOverlay from "@/components/network/TutorialOverlay";
import NodeTerminalModal from "@/components/network/NodeTerminalModal";
import { useNetworkSimulation } from "@/hooks/useNetworkSimulation";
import { SAMPLE_NETWORKS } from "@/data/sampleNetworks";
import { toast } from "sonner";

const NetworkSimulator = () => {
  const canvasRef = useRef(null);
  const {
    devices,
    connections,
    isRunning,
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
    simulationSpeed,
    addDevice,
    removeDevice,
    addConnection,
    removeConnection,
    updateDevice,
    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationSpeed,
    saveTopology,
    loadTopology,
    healthInfo,
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
  } = useNetworkSimulation();

  const handleAutoLayout = useCallback((mode = "hierarchical") => {
    if (devices.length === 0) return;
    const width = 850;
    const height = 500;

    if (mode === "grid") {
      const cols = Math.ceil(Math.sqrt(devices.length));
      const paddingX = 160;
      const paddingY = 130;
      devices.forEach((dev, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        updateDevice(dev.id, {
          position: { x: 140 + col * paddingX, y: 110 + row * paddingY }
        });
      });
    } else if (mode === "circular") {
      const centerX = width / 2 + 100;
      const centerY = height / 2 + 50;
      const radius = Math.min(width, height) / 2.6;
      const angleStep = (2 * Math.PI) / devices.length;
      devices.forEach((dev, idx) => {
        const angle = idx * angleStep;
        updateDevice(dev.id, {
          position: {
            x: Math.round(centerX + radius * Math.cos(angle)),
            y: Math.round(centerY + radius * Math.sin(angle))
          }
        });
      });
    } else {
      const routers = devices.filter(d => d.type === "router" || d.type === "firewall");
      const switches = devices.filter(d => d.type === "switch" || d.type === "hub");
      const hosts = devices.filter(d => d.type === "pc" || d.type === "server");

      const layoutLayer = (layerDevices, yPos) => {
        const step = (width + 200) / (layerDevices.length + 1);
        layerDevices.forEach((dev, idx) => {
          updateDevice(dev.id, {
            position: { x: Math.round(step * (idx + 1)), y: yPos }
          });
        });
      };

      if (routers.length > 0) layoutLayer(routers, 90);
      if (switches.length > 0) layoutLayer(switches, 240);
      if (hosts.length > 0) layoutLayer(hosts, 410);
    }
    toast.success(`Applied ${mode} auto-layout`);
  }, [devices, updateDevice]);


  const [selectedDevice, setSelectedDevice] = useState(null);
  const [activeTab, setActiveTab] = useState("design");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDemoInstructions, setShowDemoInstructions] = useState(false);
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [currentDemoName, setCurrentDemoName] = useState("");

  const handleDeviceMove = useCallback((deviceId, position) => {
    updateDevice(deviceId, { position });
  }, [updateDevice]);

  const handleDeviceDrop = useCallback(
    (deviceType, position) => {
      const newDevice = addDevice(deviceType, position);
      toast.success(`${deviceType.toUpperCase()} added to network canvas`);
      return newDevice;
    },
    [addDevice]
  );

  const handleSaveTopology = async () => {
    try {
      const topology = saveTopology();
      const blob = new Blob([JSON.stringify(topology, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "network-topology.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Topology saved successfully");
    } catch (error) {
      toast.error("Failed to save topology");
    }
  };

  const handleLoadTopology = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const topology = JSON.parse(e.target.result);
          loadTopology(topology);
          toast.success("Topology loaded successfully");
        } catch (error) {
          toast.error("Failed to load topology");
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSampleNetwork = (networkKey) => {
    const sampleNetwork = SAMPLE_NETWORKS[networkKey];
    if (sampleNetwork) {
      loadTopology(sampleNetwork);
      toast.success(`${sampleNetwork.name} loaded successfully`);
      setShowWelcome(false);
      setCurrentDemoName(sampleNetwork.name);
      setShowDemoInstructions(true);
    }
  };

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome && devices.length === 0}
        onClose={() => setShowWelcome(false)}
        onLoadDemo={loadSampleNetwork}
      />

      <DemoInstructions
        networkName={currentDemoName}
        isVisible={showDemoInstructions}
        onClose={() => setShowDemoInstructions(false)}
      />

      <TutorialOverlay
        isActive={showTutorial}
        onComplete={() => setShowTutorial(false)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Modern Clean Header */}
        <header className="h-16 border-b bg-card/95 backdrop-blur px-6 flex items-center justify-between z-30 shrink-0 shadow-sm">
          {/* Brand Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">NetBuilder</h1>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">Interactive Mininet & OVS Network Simulator</p>
            </div>
          </div>

          {/* Integrated Header View Tabs */}
          <TabsList className="grid grid-cols-2 w-72 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="design" className="gap-2 text-xs font-semibold rounded-lg data-[state=active]:shadow-sm">
              <LayoutGrid className="w-3.5 h-3.5" />
              Design Canvas
            </TabsTrigger>
            <TabsTrigger value="simulation" className="gap-2 text-xs font-semibold rounded-lg data-[state=active]:shadow-sm">
              <Activity className="w-3.5 h-3.5" />
              Dashboard & Traffic
            </TabsTrigger>
          </TabsList>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <Button
              variant={isRunning ? "destructive" : "default"}
              onClick={isRunning ? stopSimulation : startSimulation}
              size="sm"
              className="gap-2 shadow-sm font-semibold px-4"
            >
              {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? "Stop Simulation" : "Start Simulation"}
            </Button>

            <Button variant="outline" size="sm" onClick={resetSimulation} className="gap-1.5 text-xs font-medium">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>

            {/* Templates Dropdown */}
            <div className="relative group">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                📚 Templates
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-card border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground border-b mb-1">
                  Sample Network Templates
                </div>
                <button
                  onClick={() => loadSampleNetwork("basicLAN")}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-accent rounded-lg transition-colors space-y-0.5"
                >
                  <div className="font-semibold">Basic LAN Network</div>
                  <div className="text-[11px] text-muted-foreground">Router + Switch + PCs</div>
                </button>
                <button
                  onClick={() => loadSampleNetwork("multiSubnetRouter")}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-accent rounded-lg transition-colors space-y-0.5"
                >
                  <div className="font-semibold">Multi-Subnet Router</div>
                  <div className="text-[11px] text-muted-foreground">Linux Router + 2 Subnets</div>
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!selectedDevice) {
                  toast.error("Please select a device on the canvas first!");
                  return;
                }
                setShowTerminalModal(true);
              }}
              className="gap-1.5 text-xs font-semibold border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
            >
              <Terminal className="w-3.5 h-3.5" />
              Node Terminal
            </Button>

            <Button variant="outline" size="sm" onClick={handleSaveTopology} className="gap-1.5 text-xs font-medium">
              <Save className="w-3.5 h-3.5" />
              Save
            </Button>

            <label className="cursor-pointer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Upload className="w-3.5 h-3.5" />
                Load File
              </Button>
              <input type="file" accept=".json" onChange={handleLoadTopology} className="hidden" />
            </label>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTutorial(true)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Help & Tutorial"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* System Infrastructure Status Bar */}
        <div className="bg-muted/40 border-b px-6 py-1.5 flex items-center justify-between text-xs shrink-0 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-muted-foreground">Frontend:</span> <strong className="text-foreground">Online</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${healthInfo?.flask ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-muted-foreground">Flask API:</span> <strong className="text-foreground">{healthInfo?.flask ? 'Connected (:5000)' : 'Web Mode'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${healthInfo?.mininet || healthInfo?.real_mininet_active ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
              <span className="text-muted-foreground">Mininet Kernel:</span> <strong className="text-foreground">{healthInfo?.mininet || healthInfo?.real_mininet_active ? 'Linux Kernel Active' : 'Simulated Engine'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${healthInfo?.ovs ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span className="text-muted-foreground">OVS Daemon:</span> <strong className="text-foreground">{healthInfo?.ovs ? 'OpenFlow 1.3 Active' : 'Standby'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${activeExperiment ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              <span className="text-muted-foreground">Experiment Engine:</span> <strong className="text-foreground">{activeExperiment ? 'RUNNING' : 'IDLE'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>Devices: <strong className="text-foreground">{devices.length}</strong></span>
            <span>Links: <strong className="text-foreground">{connections.length}</strong></span>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden relative">
          <TabsContent value="design" className="h-full m-0 flex">
            {/* Left Sidebar - Device Panel */}
            <div className="w-64 border-r bg-card/50 shrink-0">
              <DevicePanel onDeviceSelect={handleDeviceDrop} />
            </div>

            {/* Center Canvas */}
            <div className="flex-1 relative h-full">
              <NetworkCanvas
                ref={canvasRef}
                devices={devices}
                connections={connections}
                onDeviceDrop={handleDeviceDrop}
                onDeviceSelect={setSelectedDevice}
                onDeviceMove={handleDeviceMove}
                onConnectionCreate={addConnection}
                isRunning={isRunning}
                onSendPing={sendRealPing}
                onAutoLayout={handleAutoLayout}
              />
            </div>

            {/* Right Sidebar - Config Panel */}
            <div className="w-80 border-l bg-card/50 shrink-0">
              <ConfigPanel
                selectedDevice={selectedDevice}
                onDeviceUpdate={updateDevice}
                onDeviceRemove={removeDevice}
              />
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="h-full m-0">
            <SimulationControls
              realStats={realStats}
              realPingResult={realPingResult}
              realIperfResult={realIperfResult}
              onRealPing={sendRealPing}
              onRealIperf={sendRealIperf}
              toggleLinkStatus={toggleLinkStatus}
              openflowFlows={openflowFlows}
              fetchOpenFlows={fetchOpenFlows}
              registeredTopology={registeredTopology}
              eventLog={eventLog}
              devices={devices}
              connections={connections}
              isRunning={isRunning}
              simulationSpeed={simulationSpeed}
              onSpeedChange={setSimulationSpeed}
              activeExperiment={activeExperiment}
              experimentHistory={experimentHistory}
              startExperiment={startExperiment}
              stopExperiment={stopExperiment}
              configureLinkTC={configureLinkTC}
              startPacketCapture={startPacketCapture}
              stopPacketCapture={stopPacketCapture}
              fetchCapturedPackets={fetchCapturedPackets}
              capturedPackets={capturedPackets}
              captureActive={captureActive}
              runTraceroute={runTraceroute}
              tracerouteResult={tracerouteResult}
              fetchRoutingTable={fetchRoutingTable}
              routingTableResult={routingTableResult}
            />

          </TabsContent>
        </div>
      </Tabs>

      <NodeTerminalModal
        isOpen={showTerminalModal}
        onClose={() => setShowTerminalModal(false)}
        selectedNode={selectedDevice}
        isRunning={isRunning}
      />
    </>
  );
};

export default NetworkSimulator;

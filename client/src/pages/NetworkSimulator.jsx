import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, RotateCcw, Save, Upload, HelpCircle, LayoutGrid, Activity, ChevronDown } from "lucide-react";
import NetworkCanvas from "@/components/network/NetworkCanvas";
import DevicePanel from "@/components/network/DevicePanel";
import ConfigPanel from "@/components/network/ConfigPanel";
import SimulationControls from "@/components/network/SimulationControls";
import WelcomeModal from "@/components/network/WelcomeModal";
import DemoInstructions from "@/components/network/DemoInstructions";
import TutorialOverlay from "@/components/network/TutorialOverlay";
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


  const [selectedDevice, setSelectedDevice] = useState(null);
  const [activeTab, setActiveTab] = useState("design");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDemoInstructions, setShowDemoInstructions] = useState(false);
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
    </>
  );
};

export default NetworkSimulator;

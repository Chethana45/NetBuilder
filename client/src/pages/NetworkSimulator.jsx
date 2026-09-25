import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, RotateCcw, Save, Upload, HelpCircle } from "lucide-react";
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
      toast.success(`${deviceType} added to network`);
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

      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">NetBuilder</h1>
              <p className="text-xs text-muted-foreground">Design • Connect • Simulate</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isRunning ? "destructive" : "default"}
                onClick={isRunning ? stopSimulation : startSimulation}
                className="gap-2"
              >
                {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? "Stop" : "Start"} Simulation
              </Button>
              <Button variant="outline" onClick={resetSimulation} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>

              {/* Demo Networks Dropdown */}
              <div className="relative group">
                <Button variant="outline" className="gap-2">
                  📚 Templates
                </Button>
                <div className="absolute right-0 top-full mt-1 w-64 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">
                      Sample Networks
                    </div>
                    <button
                      onClick={() => loadSampleNetwork("basicLAN")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded transition-colors"
                    >
                      <div className="font-medium">Basic LAN Network</div>
                      <div className="text-xs text-muted-foreground">Router + Switch + PCs</div>
                    </button>
                    <button
                      onClick={() => loadSampleNetwork("enterpriseNetwork")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded transition-colors"
                    >
                      <div className="font-medium">Enterprise Network</div>
                      <div className="text-xs text-muted-foreground">
                        Firewall + Multiple Subnets
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <Button variant="outline" onClick={handleSaveTopology} className="gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Load File
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleLoadTopology}
                  className="hidden"
                />
              </label>

              <Button
                variant="outline"
                onClick={() => setShowTutorial(true)}
                className="gap-2"
                title="Show Tutorial"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Sidebar - Device Panel */}
          <div className="w-64 border-r bg-muted/30 device-panel">
            <DevicePanel onDeviceSelect={handleDeviceDrop} />
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 relative">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="absolute top-4 left-1/2 z-40 -translate-x-1/2">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="simulation">Traffic Monitor</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="h-full m-0 network-canvas">
                <NetworkCanvas
                  ref={canvasRef}
                  devices={devices}
                  connections={connections}
                  onDeviceDrop={handleDeviceDrop}
                  onDeviceSelect={setSelectedDevice}
                  onDeviceMove={handleDeviceMove}
                  onConnectionCreate={addConnection}
                  isRunning={isRunning}
                />
              </TabsContent>

              <TabsContent value="simulation" className="h-full m-0">
                <SimulationControls
                  devices={devices}
                  connections={connections}
                  isRunning={isRunning}
                  simulationSpeed={simulationSpeed}
                  onSpeedChange={setSimulationSpeed}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Configuration Panel */}
          <div className="w-80 border-l bg-muted/30 config-panel">
            <ConfigPanel
              selectedDevice={selectedDevice}
              onDeviceUpdate={updateDevice}
              onDeviceRemove={removeDevice}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NetworkSimulator;

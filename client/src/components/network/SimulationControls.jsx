import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const SimulationControls = ({
  devices,
  connections,
  isRunning,
  simulationSpeed,
  onSpeedChange,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const scenarios = [
    {
      id: "ping",
      name: "Ping Test",
      description: "Test connectivity between devices",
      icon: Activity,
      color: "bg-blue-500",
    },
    {
      id: "broadcast",
      name: "Broadcast Storm",
      description: "Simulate network broadcast traffic",
      icon: Zap,
      color: "bg-yellow-500",
    },
    {
      id: "routing",
      name: "Routing Update",
      description: "Test routing table updates",
      icon: Network,
      color: "bg-green-500",
    },
    {
      id: "failure",
      name: "Link Failure",
      description: "Simulate connection failures",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  const getNetworkStats = () => {
    const totalPackets = devices.reduce(
      (sum, device) => sum + device.stats.packetsSent + device.stats.packetsReceived,
      0
    );
    const totalErrors = devices.reduce((sum, device) => sum + device.stats.errors, 0);
    const activeDevices = devices.filter((device) => device.config.status === "active").length;
    const activeConnections = connections.filter((conn) => conn.status === "active").length;

    return {
      totalPackets,
      totalErrors,
      activeDevices,
      activeConnections,
      errorRate: totalPackets > 0 ? ((totalErrors / totalPackets) * 100).toFixed(2) : 0,
    };
  };

  const stats = getNetworkStats();

  const runScenario = (scenario) => {
    setSelectedScenario(scenario.id);
    // Implement scenario logic here
    console.log(`Running scenario: ${scenario.name}`);
  };

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      {/* Network Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{devices.length}</div>
              <div className="text-sm text-muted-foreground">Total Devices</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{connections.length}</div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeDevices}</div>
              <div className="text-sm text-muted-foreground">Active Devices</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.activeConnections}</div>
              <div className="text-sm text-muted-foreground">Active Links</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Simulation Speed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Speed: {simulationSpeed}x</span>
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "Running" : "Stopped"}
              </Badge>
            </div>
            <Slider
              value={[simulationSpeed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              min={0.1}
              max={5}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.1x</span>
              <span>5x</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Traffic Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Packets</span>
              <Badge variant="outline">{stats.totalPackets}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Errors</span>
              <Badge variant={stats.totalErrors > 0 ? "destructive" : "outline"}>
                {stats.totalErrors}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Error Rate</span>
              <Badge variant={stats.errorRate > 5 ? "destructive" : "outline"}>
                {stats.errorRate}%
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Network Health</div>
            <div className="flex items-center gap-2">
              {stats.errorRate < 1 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">
                {stats.errorRate < 1 ? "Excellent" : stats.errorRate < 5 ? "Good" : "Poor"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Test Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Button
                key={scenario.id}
                variant={selectedScenario === scenario.id ? "default" : "outline"}
                className="w-full justify-start gap-3 h-auto p-3"
                onClick={() => runScenario(scenario)}
                disabled={!isRunning || devices.length < 2}
              >
                <div className={`p-2 rounded ${scenario.color} text-white`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-xs text-muted-foreground">{scenario.description}</div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Device Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {devices.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              No devices in network
            </div>
          ) : (
            devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      device.config.status === "active" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium">{device.name}</span>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    ↑{device.stats.packetsSent}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ↓{device.stats.packetsReceived}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationControls;

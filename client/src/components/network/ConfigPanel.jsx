import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Settings, Activity, Network, Info, Zap } from "lucide-react";
import { toast } from "sonner";

const ConfigPanel = ({ selectedDevice, onDeviceUpdate, onDeviceRemove }) => {
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedDevice) {
      setConfig({ ...selectedDevice.config });
    }
  }, [selectedDevice]);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);

    if (selectedDevice) {
      onDeviceUpdate(selectedDevice.id, {
        ...selectedDevice,
        config: newConfig,
      });
    }
  };

  const handleNameChange = (newName) => {
    if (selectedDevice) {
      onDeviceUpdate(selectedDevice.id, {
        ...selectedDevice,
        name: newName,
      });
    }
  };

  const handleRemoveDevice = () => {
    if (selectedDevice) {
      onDeviceRemove(selectedDevice.id);
      toast.success(`${selectedDevice.name} removed from network`);
    }
  };

  const validateIP = (ip) => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  if (!selectedDevice) {
    return (
      <div className="h-full p-4 flex items-center justify-center text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">No Device Selected</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Click on a device to configure its settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Device Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{selectedDevice.name}</CardTitle>
            <Badge variant="outline" className="capitalize">
              {selectedDevice.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="device-name">Device Name</Label>
            <Input
              id="device-name"
              value={selectedDevice.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter device name"
            />
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant={selectedDevice.config.status === "active" ? "default" : "secondary"}
              className="gap-1"
            >
              <Activity className="w-3 h-3" />
              {selectedDevice.config.status}
            </Badge>
            <Button variant="destructive" size="sm" onClick={handleRemoveDevice} className="gap-1">
              <Trash2 className="w-3 h-3" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Network className="w-4 h-4" />
                Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(selectedDevice.type === "pc" ||
                selectedDevice.type === "server" ||
                selectedDevice.type === "laptop") && (
                <>
                  <div>
                    <Label htmlFor="ip-address">IP Address</Label>
                    <Input
                      id="ip-address"
                      value={config.ip || ""}
                      onChange={(e) => handleConfigChange("ip", e.target.value)}
                      placeholder="192.168.1.1"
                      className={!validateIP(config.ip || "") && config.ip ? "border-red-500" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subnet">Subnet Mask</Label>
                    <Input
                      id="subnet"
                      value={config.subnet || ""}
                      onChange={(e) => handleConfigChange("subnet", e.target.value)}
                      placeholder="255.255.255.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gateway">Default Gateway</Label>
                    <Input
                      id="gateway"
                      value={config.gateway || ""}
                      onChange={(e) => handleConfigChange("gateway", e.target.value)}
                      placeholder="192.168.1.1"
                    />
                  </div>
                </>
              )}

              {(selectedDevice.type === "router" || selectedDevice.type === "switch") && (
                <div>
                  <Label htmlFor="ports">Number of Ports</Label>
                  <Input
                    id="ports"
                    type="number"
                    min="1"
                    max="48"
                    value={config.ports || 1}
                    onChange={(e) => handleConfigChange("ports", parseInt(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Device Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedDevice.stats.packetsReceived}
                  </div>
                  <div className="text-xs text-muted-foreground">Packets Received</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedDevice.stats.packetsSent}
                  </div>
                  <div className="text-xs text-muted-foreground">Packets Sent</div>
                </div>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-600">{selectedDevice.stats.errors}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-mono">24h 15m</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span className="font-mono">12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="font-mono">256MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDevice.type === "router" && (
                <div>
                  <Label>Routing Table</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono">
                    <div>0.0.0.0/0 → 192.168.1.1</div>
                    <div>192.168.1.0/24 → Connected</div>
                    <div>10.0.0.0/8 → 192.168.1.254</div>
                  </div>
                </div>
              )}

              {selectedDevice.type === "switch" && (
                <div>
                  <Label>MAC Address Table</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono">
                    <div>Port 1: AA:BB:CC:DD:EE:01</div>
                    <div>Port 2: AA:BB:CC:DD:EE:02</div>
                    <div>Port 3: AA:BB:CC:DD:EE:03</div>
                  </div>
                </div>
              )}

              <div>
                <Label>Device Information</Label>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>Model: {selectedDevice.type.toUpperCase()}-2024</div>
                  <div>Firmware: v2.1.0</div>
                  <div>Serial: SN{selectedDevice.id.slice(-8)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigPanel;

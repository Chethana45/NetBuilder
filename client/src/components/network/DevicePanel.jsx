import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Router, Network, Monitor, Server, Wifi, Shield, Smartphone, Printer } from "lucide-react";

const DEVICE_CATEGORIES = {
  NETWORK: {
    title: "Network Devices",
    devices: [
      {
        type: "router",
        name: "Router",
        icon: Router,
        description: "Routes packets between networks",
        color: "bg-blue-500",
      },
      {
        type: "switch",
        name: "Switch",
        icon: Network,
        description: "Connects devices in a LAN",
        color: "bg-green-500",
      },
      {
        type: "hub",
        name: "Hub",
        icon: Wifi,
        description: "Basic network hub (legacy)",
        color: "bg-yellow-500",
      },
      {
        type: "firewall",
        name: "Firewall",
        icon: Shield,
        description: "Network security device",
        color: "bg-red-500",
      },
    ],
  },
  ENDPOINTS: {
    title: "End Devices",
    devices: [
      {
        type: "pc",
        name: "PC/Workstation",
        icon: Monitor,
        description: "Desktop computer",
        color: "bg-gray-500",
      },
      {
        type: "server",
        name: "Server",
        icon: Server,
        description: "Network server",
        color: "bg-purple-500",
      },
      {
        type: "laptop",
        name: "Laptop",
        icon: Smartphone,
        description: "Portable computer",
        color: "bg-indigo-500",
      },
      {
        type: "printer",
        name: "Printer",
        icon: Printer,
        description: "Network printer",
        color: "bg-orange-500",
      },
    ],
  },
};

const DeviceItem = ({ device }) => {
  const Icon = device.icon;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("deviceType", device.type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className={`p-2 rounded-md ${device.color} text-white`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{device.name}</div>
        <div className="text-xs text-muted-foreground truncate">{device.description}</div>
      </div>
    </div>
  );
};

const DevicePanel = () => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="text-lg font-semibold">Device Library</div>

      {Object.entries(DEVICE_CATEGORIES).map(([key, category]) => (
        <Card key={key}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{category.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {category.devices.map((device) => (
              <DeviceItem key={device.type} device={device} />
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div>• Drag devices to the canvas</div>
          <div>• Use Connect Devices to link two devices</div>
          <div>• Configure devices in the right panel</div>
          <div>• Use simulation mode to test network</div>
        </CardContent>
      </Card>

      <div className="pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            Interactive Mode
          </Badge>
          <span>Drag & Drop Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default DevicePanel;

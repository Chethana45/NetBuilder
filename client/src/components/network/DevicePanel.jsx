import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Router, Network, Monitor, Server, Wifi, Shield, Smartphone, Printer, GripVertical } from "lucide-react";

const DEVICE_CATEGORIES = {
  NETWORK: {
    title: "Network Devices",
    devices: [
      {
        type: "router",
        name: "Router",
        icon: Router,
        description: "Layer 3 packet routing",
        color: "bg-blue-500",
      },
      {
        type: "switch",
        name: "Switch",
        icon: Network,
        description: "Layer 2 LAN switch",
        color: "bg-emerald-500",
      },
      {
        type: "hub",
        name: "Hub",
        icon: Wifi,
        description: "Multi-port repeater",
        color: "bg-amber-500",
      },
      {
        type: "firewall",
        name: "Firewall",
        icon: Shield,
        description: "Packet filter firewall",
        color: "bg-rose-500",
      },
    ],
  },
  ENDPOINTS: {
    title: "End Devices",
    devices: [
      {
        type: "pc",
        name: "PC / Host",
        icon: Monitor,
        description: "Workstation computer",
        color: "bg-slate-500",
      },
      {
        type: "server",
        name: "Server",
        icon: Server,
        description: "Network host server",
        color: "bg-purple-500",
      },
      {
        type: "laptop",
        name: "Laptop",
        icon: Smartphone,
        description: "Portable endpoint",
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
      className="group flex items-center gap-2.5 p-2.5 rounded-xl border bg-card hover:bg-accent/60 hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all shadow-sm"
    >
      <div className={`p-2 rounded-lg ${device.color} text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-xs leading-tight">{device.name}</div>
        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{device.description}</div>
      </div>
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0" />
    </div>
  );
};

const DevicePanel = () => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold tracking-tight">Device Library</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Drag & drop devices onto canvas</p>
      </div>

      {Object.entries(DEVICE_CATEGORIES).map(([key, category]) => (
        <Card key={key} className="border-border/60 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {category.devices.map((device) => (
              <DeviceItem key={device.type} device={device} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DevicePanel;

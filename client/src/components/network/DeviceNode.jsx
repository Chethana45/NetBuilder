import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Router,
  Network,
  Monitor,
  Server,
  Wifi,
  Shield,
  Smartphone,
  Printer,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DEVICE_ICONS = {
  router: Router,
  switch: Network,
  pc: Monitor,
  server: Server,
  hub: Wifi,
  firewall: Shield,
  laptop: Smartphone,
  printer: Printer,
};

const DEVICE_COLORS = {
  router: "bg-blue-500",
  switch: "bg-green-500",
  pc: "bg-gray-500",
  server: "bg-purple-500",
  hub: "bg-yellow-500",
  firewall: "bg-red-500",
  laptop: "bg-indigo-500",
  printer: "bg-orange-500",
};

const DeviceNode = ({
  device,
  isSelected,
  isConnectionStart,
  onClick,
  onDoubleClick,
  onMove,
  isRunning,
}) => {
  const [position, setPosition] = useState(device.position);
  const dragState = useRef({ dragging: false, didDrag: false, offset: { x: 0, y: 0 } });
  const latestPosition = useRef(device.position);
  const nodeRef = useRef(null);

  const Icon = DEVICE_ICONS[device.type] || Monitor;
  const colorClass = DEVICE_COLORS[device.type] || "bg-gray-500";

  useEffect(() => {
    setPosition(device.position);
    latestPosition.current = device.position;
  }, [device.position]);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !nodeRef.current?.parentElement) return;

    const rect = nodeRef.current.getBoundingClientRect();
    dragState.current = {
      dragging: true,
      didDrag: false,
      offset: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    };

    // Do not preventDefault here. The old implementation suppressed normal
    // browser click behavior in some browsers, which made device clicks fail.
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState.current.dragging || !nodeRef.current?.parentElement) return;

      const parentRect = nodeRef.current.parentElement.getBoundingClientRect();
      const offset = dragState.current.offset;
      const next = {
        x: e.clientX - parentRect.left - offset.x,
        y: e.clientY - parentRect.top - offset.y,
      };

      const halfW = 40;
      const halfH = 40;
      next.x = Math.max(halfW, Math.min(parentRect.width - halfW, next.x + halfW));
      next.y = Math.max(halfH, Math.min(parentRect.height - halfH, next.y + halfH));

      dragState.current.didDrag = true;
      latestPosition.current = next;
      setPosition(next);
    };

    const handleMouseUp = () => {
      if (!dragState.current.dragging) return;
      const wasDrag = dragState.current.didDrag;
      dragState.current.dragging = false;

      if (wasDrag) {
        onMove?.(device.id, latestPosition.current);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [device.id, onMove]);

  const handleClick = (e) => {
    if (dragState.current.didDrag) {
      dragState.current.didDrag = false;
      return;
    }
    onClick?.(e);
  };

  const hasActivity = isRunning && (device.stats?.packetsSent > 0 || device.stats?.packetsReceived > 0);
  const hasErrors = device.stats?.errors > 0;

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none",
        "transition-[filter] hover:brightness-110",
        dragState.current.dragging && "z-50"
      )}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 shadow-lg transition-all duration-150",
          colorClass,
          isSelected && "ring-4 ring-primary/40 ring-offset-2 ring-offset-background",
          isConnectionStart && "ring-4 ring-yellow-400/80 ring-offset-2 ring-offset-background animate-pulse",
          "hover:scale-105"
        )}
      >
        <Icon className="h-8 w-8 text-white drop-shadow" />

        <div className="absolute -right-1.5 -top-1.5 flex gap-1">
          {hasActivity && <div className="h-3.5 w-3.5 rounded-full bg-green-300 animate-ping" />}
          {hasErrors && (
            <div className="h-4 w-4 rounded-full bg-red-500">
              <AlertTriangle className="m-0.5 h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {device.config?.ports > 1 && (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: Math.min(device.config.ports, 4) }).map((_, i) => {
              const angle = i * 90 - 45;
              const radian = (angle * Math.PI) / 180;
              const x = Math.cos(radian) * 32 + 40;
              const y = Math.sin(radian) * 32 + 40;
              return (
                <div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-white/40"
                  style={{ left: x - 4, top: y - 4 }}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-center">
        <div className="rounded-lg border bg-background/95 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
          {device.name}
        </div>
        {device.config?.ip && (
          <div className="mt-1 text-xs text-muted-foreground">{device.config.ip}</div>
        )}
        {isRunning && hasActivity && (
          <div className="mt-1 flex justify-center gap-1">
            <Badge variant="secondary" className="px-1 py-0 text-[10px]">↑{device.stats.packetsSent}</Badge>
            <Badge variant="secondary" className="px-1 py-0 text-[10px]">↓{device.stats.packetsReceived}</Badge>
          </div>
        )}
      </div>

      {hasActivity && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-green-300 animate-ping opacity-30" />
      )}
    </div>
  );
};

export default DeviceNode;

import { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { Link2, MousePointer2, Send, Activity, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import DeviceNode from "./DeviceNode";
import ConnectionLine from "./ConnectionLine";

const NetworkCanvas = forwardRef(
  (
    {
      devices,
      connections,
      onDeviceDrop,
      onDeviceSelect,
      onDeviceMove,
      onConnectionCreate,
      isRunning,
      onSendPing,
      className,
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const [connectionStart, setConnectionStart] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [selectedDevices, setSelectedDevices] = useState(new Set());
    const [connectionMode, setConnectionMode] = useState(false);
    const [showHelpBox, setShowHelpBox] = useState(false);

    // Fast packet sending state
    const [packetSrc, setPacketSrc] = useState("");
    const [packetDst, setPacketDst] = useState("");

    const hostDevices = devices.filter((d) => d.type === "pc" || d.type === "server" || d.type === "router");

    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") ref(canvasRef.current);
        else ref.current = canvasRef.current;
      }
    }, [ref]);

    const handleDragOver = useCallback((e) => e.preventDefault(), []);

    const handleDrop = useCallback(
      (e) => {
        e.preventDefault();
        const deviceType = e.dataTransfer.getData("deviceType");
        if (!deviceType || !onDeviceDrop || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        onDeviceDrop(deviceType, {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      },
      [onDeviceDrop]
    );

    const beginConnection = useCallback((device) => {
      setConnectionStart(device.id);
      setConnectionMode(true);
      setSelectedDevices(new Set([device.id]));
      onDeviceSelect?.(device);
    }, [onDeviceSelect]);

    const handleDeviceClick = useCallback(
      (device, e) => {
        e.stopPropagation();

        if (e.ctrlKey || e.metaKey) {
          setSelectedDevices((prev) => {
            const next = new Set(prev);
            if (next.has(device.id)) next.delete(device.id);
            else next.add(device.id);
            return next;
          });
          onDeviceSelect?.(device);
          return;
        }

        if (connectionMode) {
          if (!connectionStart) {
            setConnectionStart(device.id);
            setSelectedDevices(new Set([device.id]));
            onDeviceSelect?.(device);
            return;
          }

          if (connectionStart !== device.id) {
            onConnectionCreate?.(connectionStart, device.id);
          }
          setConnectionStart(null);
          setConnectionMode(false);
          setSelectedDevices(new Set([device.id]));
          onDeviceSelect?.(device);
          return;
        }

        setSelectedDevices(new Set([device.id]));
        onDeviceSelect?.(device);
      },
      [connectionMode, connectionStart, onConnectionCreate, onDeviceSelect]
    );

    const handleDeviceDoubleClick = useCallback(
      (device, e) => {
        e.stopPropagation();
        beginConnection(device);
      },
      [beginConnection]
    );

    const handleCanvasClick = useCallback(
      (e) => {
        if (e.target === canvasRef.current && !connectionMode) {
          setSelectedDevices(new Set());
          setConnectionStart(null);
          onDeviceSelect?.(null);
        }
      },
      [connectionMode, onDeviceSelect]
    );

    const handleMouseMove = useCallback((e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    const handleKeyDown = useCallback((e) => {
      if (e.key === "Escape") {
        setConnectionStart(null);
        setConnectionMode(false);
        setSelectedDevices(new Set());
      }
    }, []);

    useEffect(() => {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const toggleConnectionMode = () => {
      setConnectionMode((active) => {
        if (active) setConnectionStart(null);
        return !active;
      });
    };

    const handleSendCanvasPing = () => {
      const src = packetSrc || (hostDevices[0]?.id || "");
      const dst = packetDst || (hostDevices[1]?.id || hostDevices[0]?.id || "");
      if (src && dst && onSendPing) {
        onSendPing(src, dst);
      }
    };

    return (
      <div
        ref={canvasRef}
        className={cn(
          "relative w-full h-full overflow-hidden bg-grid-pattern select-none",
          connectionMode ? "cursor-crosshair" : "cursor-default",
          className
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="netbuilder-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#netbuilder-grid)" />
          </svg>
        </div>

        {/* Top-Left Canvas Action Bar */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-xl border bg-card/90 p-1.5 shadow-md backdrop-blur">
          <button
            type="button"
            onClick={toggleConnectionMode}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm",
              connectionMode
                ? "bg-primary text-primary-foreground shadow-primary/30"
                : "bg-muted/80 hover:bg-accent text-foreground"
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            {connectionMode ? "Connecting mode..." : "Connect Devices"}
          </button>

          <button
            type="button"
            onClick={() => setShowHelpBox(!showHelpBox)}
            className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Toggle Quick Guide"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Send Packet Bar when simulation is running */}
        {isRunning && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 rounded-xl border bg-card/95 px-3 py-1.5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Send Packet:</span>
            </div>

            <select
              value={packetSrc || (hostDevices[0]?.id || "")}
              onChange={(e) => setPacketSrc(e.target.value)}
              className="text-xs p-1 rounded-md border bg-background font-medium focus:ring-1 focus:ring-primary"
            >
              {hostDevices.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <span className="text-xs font-bold text-muted-foreground">→</span>

            <select
              value={packetDst || (hostDevices[1]?.id || hostDevices[0]?.id || "")}
              onChange={(e) => setPacketDst(e.target.value)}
              className="text-xs p-1 rounded-md border bg-background font-medium focus:ring-1 focus:ring-primary"
            >
              {hostDevices.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSendCanvasPing}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1 text-xs font-semibold transition-all shadow"
            >
              <Send className="h-3 w-3" />
              Send Ping
            </button>
          </div>
        )}

        {/* Collapsible Canvas Guide Box */}
        {showHelpBox && (
          <div className="absolute top-16 left-4 z-30 max-w-xs rounded-xl border bg-card/95 p-3.5 text-xs shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between font-semibold border-b pb-1.5 mb-2">
              <span>Canvas Quick Guide</span>
              <button onClick={() => setShowHelpBox(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-muted-foreground">
              <div>• Drag & drop devices from left panel</div>
              <div>• Click <b>Connect Devices</b> then click two nodes</div>
              <div>• Double-click any device to connect</div>
              <div>• Click device to inspect IP & configuration</div>
            </div>
          </div>
        )}

        {/* Connections SVG Layer */}
        <svg className="absolute inset-0 z-10 h-full w-full pointer-events-none overflow-visible">
          {connections.map((connection) => {
            const sourceDevice = devices.find((d) => d.id === connection.source);
            const targetDevice = devices.find((d) => d.id === connection.target);
            if (!sourceDevice || !targetDevice) return null;

            return (
              <ConnectionLine
                key={connection.id}
                connection={connection}
                sourcePosition={sourceDevice.position}
                targetPosition={targetDevice.position}
                isActive={isRunning && connection.status === "active"}
              />
            );
          })}

          {connectionStart && (
            <line
              x1={devices.find((d) => d.id === connectionStart)?.position.x || 0}
              y1={devices.find((d) => d.id === connectionStart)?.position.y || 0}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="text-primary opacity-80"
            />
          )}
        </svg>

        {/* Device Nodes Layer */}
        {devices.map((device) => (
          <DeviceNode
            key={device.id}
            device={device}
            isSelected={selectedDevices.has(device.id)}
            isConnectionStart={connectionStart === device.id}
            onClick={(e) => handleDeviceClick(device, e)}
            onDoubleClick={(e) => handleDeviceDoubleClick(device, e)}
            onMove={onDeviceMove}
            isRunning={isRunning}
          />
        ))}

        {connectionStart && (
          <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-primary/30 bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-2xl animate-bounce">
            Click target device to complete connection
          </div>
        )}
      </div>
    );
  }
);

NetworkCanvas.displayName = "NetworkCanvas";
export default NetworkCanvas;

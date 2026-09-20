import { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { Link2, MousePointer2 } from "lucide-react";
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
      className,
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const [connectionStart, setConnectionStart] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [selectedDevices, setSelectedDevices] = useState(new Set());
    const [connectionMode, setConnectionMode] = useState(false);

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

        // In Connect mode, clicking two devices creates the connection.
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
        {/* Grid */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="netbuilder-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#netbuilder-grid)" />
          </svg>
        </div>

        {/* Canvas toolbar */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={toggleConnectionMode}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              connectionMode
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-accent"
            )}
          >
            <Link2 className="h-4 w-4" />
            {connectionMode ? "Connecting…" : "Connect Devices"}
          </button>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground px-2">
            <MousePointer2 className="h-3.5 w-3.5" />
            {connectionMode ? "Click source → target" : "Click to select"}
          </div>
        </div>

        {/* Connections */}
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
              strokeWidth="3"
              strokeDasharray="8 7"
              opacity="0.8"
            />
          )}
        </svg>

        {/* Devices */}
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

        {/* Help card */}
        <div className="absolute top-4 right-4 z-20 max-w-sm rounded-xl border bg-background/95 p-4 text-sm shadow-lg backdrop-blur">
          <div className="mb-2 font-semibold">Build your network</div>
          <div className="space-y-1.5 text-muted-foreground">
            <div>• Drag devices from the left panel</div>
            <div>• Click a device to inspect it</div>
            <div>• Click <b>Connect Devices</b>, then click two devices</div>
            <div>• Double-click a device also starts a connection</div>
            <div>• Drag devices to rearrange the topology</div>
            <div>• Press Escape to cancel connection mode</div>
          </div>
        </div>

        {connectionStart && (
          <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-primary/30 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xl">
            Now click the device you want to connect to
          </div>
        )}
      </div>
    );
  }
);

NetworkCanvas.displayName = "NetworkCanvas";
export default NetworkCanvas;

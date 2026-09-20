import { useMemo } from "react";
import { cn } from "@/lib/utils";

const ConnectionLine = ({ connection, sourcePosition, targetPosition, isActive }) => {
  const geometry = useMemo(() => {
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const angle = Math.atan2(dy, dx);

    // Keep the cable visually clear even when two devices are placed close together.
    const minLength = 150;
    const extra = Math.max(0, minLength - length) / 2;
    const ux = dx / length;
    const uy = dy / length;

    return {
      x1: sourcePosition.x - ux * extra,
      y1: sourcePosition.y - uy * extra,
      x2: targetPosition.x + ux * extra,
      y2: targetPosition.y + uy * extra,
      length: Math.max(length, minLength),
    };
  }, [sourcePosition, targetPosition]);

  const quality = connection.bandwidth >= 1000 ? "excellent" : connection.bandwidth >= 100 ? "good" : "fair";
  const qualityColors = {
    excellent: "stroke-emerald-400",
    good: "stroke-sky-400",
    fair: "stroke-amber-400",
  };

  const duration = Math.max(0.9, Math.min(3.2, geometry.length / 180));
  const path = `M ${geometry.x1} ${geometry.y1} L ${geometry.x2} ${geometry.y2}`;
  const midX = (geometry.x1 + geometry.x2) / 2;
  const midY = (geometry.y1 + geometry.y2) / 2;

  return (
    <g>
      {/* Soft cable glow */}
      <line
        x1={geometry.x1}
        y1={geometry.y1}
        x2={geometry.x2}
        y2={geometry.y2}
        className={cn("stroke-primary/10", isActive ? "stroke-[10]" : "stroke-[6]")}
      />

      {/* Main cable */}
      <line
        x1={geometry.x1}
        y1={geometry.y1}
        x2={geometry.x2}
        y2={geometry.y2}
        className={cn(
          qualityColors[quality],
          connection.status === "active" ? "opacity-100" : "opacity-40",
          isActive ? "stroke-[4]" : "stroke-[3]"
        )}
        strokeDasharray={connection.status === "active" ? undefined : "8 8"}
      />

      {isActive && connection.status === "active" && (
        <>
          {/* Multiple packets make transfer obvious and continuous. */}
          <circle r="5" className="fill-primary">
            <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={path} />
          </circle>
          <circle r="4" className="fill-primary/80">
            <animateMotion dur={`${duration}s`} begin={`${duration * 0.34}s`} repeatCount="indefinite" path={path} />
          </circle>
          <circle r="4" className="fill-secondary">
            <animateMotion dur={`${duration * 1.12}s`} begin={`${duration * 0.5}s`} repeatCount="indefinite" path={`M ${geometry.x2} ${geometry.y2} L ${geometry.x1} ${geometry.y1}`} />
          </circle>
        </>
      )}

      <circle cx={geometry.x1} cy={geometry.y1} r="6" className="fill-background stroke-primary stroke-2" />
      <circle cx={geometry.x2} cy={geometry.y2} r="6" className="fill-background stroke-primary stroke-2" />

      <g>
        <rect x={midX - 34} y={midY - 11} width="68" height="22" rx="11" className="fill-background/95 stroke-border" />
        <text x={midX} y={midY + 4} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          {connection.bandwidth} Mbps
        </text>
      </g>
    </g>
  );
};

export default ConnectionLine;

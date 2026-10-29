import { useMemo } from "react";
import { cn } from "@/lib/utils";

const ConnectionLine = ({ connection, sourcePosition, targetPosition, isActive, isHighlighted = false }) => {
  const geometry = useMemo(() => {
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

    const minLength = 150;
    const extra = Math.max(0, minLength - length) / 2;
    const ux = dx / length;
    const uy = dy / length;

    return {
      dx,
      dy,
      x1: sourcePosition.x - ux * extra,
      y1: sourcePosition.y - uy * extra,
      x2: targetPosition.x + ux * extra,
      y2: targetPosition.y + uy * extra,
      length: Math.max(length, minLength),
    };
  }, [sourcePosition, targetPosition]);

  const isDisabled = connection.status === "disabled";

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

  const isNearlyVertical = Math.abs(geometry.dx) < 50;
  const isNearlyHorizontal = Math.abs(geometry.dy) < 50;

  const badgeX = isNearlyVertical ? midX + 42 : midX;
  const badgeY = isNearlyHorizontal ? midY - 18 : midY;

  return (
    <g>
      {/* Soft cable glow */}
      <line
        x1={geometry.x1}
        y1={geometry.y1}
        x2={geometry.x2}
        y2={geometry.y2}
        className={cn(
          isHighlighted ? "stroke-emerald-400/50 stroke-[12]" : (isActive && !isDisabled ? "stroke-primary/10 stroke-[10]" : "stroke-[6]")
        )}
      />

      {/* Main cable */}
      <line
        x1={geometry.x1}
        y1={geometry.y1}
        x2={geometry.x2}
        y2={geometry.y2}
        className={cn(
          isDisabled ? "stroke-red-500 opacity-80" : (isHighlighted ? "stroke-emerald-400 stroke-[5]" : qualityColors[quality]),
          isActive && !isDisabled ? "stroke-[4]" : "stroke-[3]"
        )}
        strokeDasharray={isDisabled ? "8 8" : undefined}
      />

      {isActive && !isDisabled && (
        <>
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

      <circle cx={geometry.x1} cy={geometry.y1} r="6" className={cn("fill-background stroke-2", isDisabled ? "stroke-red-500" : "stroke-primary")} />
      <circle cx={geometry.x2} cy={geometry.y2} r="6" className={cn("fill-background stroke-2", isDisabled ? "stroke-red-500" : "stroke-primary")} />

      {/* Cable Bandwidth Badge */}
      <g>
        <rect
          x={badgeX - 34}
          y={badgeY - 11}
          width="68"
          height="22"
          rx="11"
          className={cn("fill-background/95 stroke-border shadow-sm", isDisabled && "stroke-red-500 fill-red-950/20")}
        />
        <text
          x={badgeX}
          y={badgeY + 4}
          textAnchor="middle"
          className={cn("text-[10px] font-semibold tracking-tight", isDisabled ? "fill-red-500" : "fill-foreground")}
        >
          {isDisabled ? "DOWN" : `${connection.bandwidth} Mbps`}
        </text>
      </g>
    </g>
  );
};

export default ConnectionLine;

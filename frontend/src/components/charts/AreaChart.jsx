import React, { useState } from "react";

export function AreaChart({
  data = [], // [{ label: "06:00", value: 85 }]
  height = 180,
  color = "#8C5B23",
  gradientId = "areaGradient",
  unit = "%"
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length < 2) return null;

  const min = Math.min(...data.map((d) => d.value)) * 0.9;
  const max = Math.max(...data.map((d) => d.value)) * 1.05;
  const range = max - min || 1;

  const width = 600;
  const chartHeight = height - 30;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 40) + 20;
    const y = chartHeight - ((d.value - min) / range) * (chartHeight - 20) + 10;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x},${p.y}`, "");
  const areaD = `${pathD} L ${points[points.length - 1].x},${chartHeight + 10} L ${points[0].x},${chartHeight + 10} Z`;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: `${height}px`, overflow: "visible" }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="20" y1={chartHeight * 0.25} x2={width - 20} y2={chartHeight * 0.25} stroke="#E5E0D8" strokeDasharray="3 3" />
        <line x1="20" y1={chartHeight * 0.5} x2={width - 20} y2={chartHeight * 0.5} stroke="#E5E0D8" strokeDasharray="3 3" />
        <line x1="20" y1={chartHeight * 0.75} x2={width - 20} y2={chartHeight * 0.75} stroke="#E5E0D8" strokeDasharray="3 3" />

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Smooth line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === i ? 6 : 4}
              fill="#FFFFFF"
              stroke={color}
              strokeWidth="2.5"
              style={{ cursor: "pointer", transition: "r 0.15s ease" }}
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            <text
              x={p.x}
              y={height - 5}
              fill="#786C5E"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {hoveredPoint !== null && (
        <div
          style={{
            position: "absolute",
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            top: `${(points[hoveredPoint].y / height) * 100}%`,
            transform: "translate(-50%, -125%)",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2D9CC",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--text-primary)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(44, 30, 15, 0.16), 0 2px 6px rgba(44, 30, 15, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            zIndex: 30
          }}
        >
          <span style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 600 }}>{points[hoveredPoint].label}:</span>
          <span style={{ color: color || "#8C5B23", fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
            {points[hoveredPoint].value}{unit}
          </span>
        </div>
      )}
    </div>
  );
}

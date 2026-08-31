import React, { useState } from "react";

export function BarChart({
  data = [], // [{ label: '06:00', actual: 580, target: 600 }]
  height = 200,
  barColor = "#38BDF8",
  targetColor = "#F59E0B",
  yAxisUnit = "BPM"
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.actual || 0, d.target || 0))) * 1.15 || 100;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", height: `${height}px`, gap: "12px", paddingBottom: "24px", position: "relative", borderBottom: "1px solid var(--border-subtle)" }}>
        {/* Background grid lines */}
        <div style={{ position: "absolute", inset: "0 0 24px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", opacity: 0.15 }}>
          <div style={{ borderTop: "1px dashed var(--text-muted)", width: "100%" }} />
          <div style={{ borderTop: "1px dashed var(--text-muted)", width: "100%" }} />
          <div style={{ borderTop: "1px dashed var(--text-muted)", width: "100%" }} />
        </div>

        {data.map((item, idx) => {
          const actualHeight = ((item.actual || 0) / maxVal) * (height - 30);
          const targetHeight = ((item.target || 0) / maxVal) * (height - 30);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                justifyContent: "flex-end",
                position: "relative",
                cursor: "pointer"
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    bottom: `${Math.max(actualHeight, targetHeight) + 10}px`,
                    backgroundColor: "#0F172A",
                    border: "1px solid var(--border-highlight)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    zIndex: 20,
                    whiteSpace: "nowrap",
                    fontSize: "11px",
                    pointerEvents: "none"
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.label}</div>
                  <div style={{ color: barColor }}>Actual: {item.actual} {yAxisUnit}</div>
                  {item.target && <div style={{ color: targetColor }}>Target: {item.target} {yAxisUnit}</div>}
                </div>
              )}

              {/* Bars group */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", width: "100%", justifyContent: "center" }}>
                {item.target && (
                  <div
                    style={{
                      width: "35%",
                      maxWidth: "14px",
                      height: `${targetHeight}px`,
                      backgroundColor: "rgba(245, 158, 11, 0.3)",
                      borderTop: `2px solid ${targetColor}`,
                      borderRadius: "2px 2px 0 0"
                    }}
                  />
                )}
                <div
                  style={{
                    width: item.target ? "45%" : "70%",
                    maxWidth: "20px",
                    height: `${actualHeight}px`,
                    backgroundColor: isHovered ? "#0284C7" : barColor,
                    borderRadius: "3px 3px 0 0",
                    transition: "all 0.2s ease"
                  }}
                />
              </div>

              {/* X Axis Label */}
              <span
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  fontSize: "10px",
                  color: isHovered ? "var(--text-primary)" : "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: isHovered ? 700 : 500
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "16px", fontSize: "11px", color: "var(--text-secondary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "10px", height: "10px", backgroundColor: barColor, borderRadius: "2px" }} />
          <span>Actual Throughput ({yAxisUnit})</span>
        </div>
        {data.some((d) => d.target) && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", backgroundColor: "rgba(245, 158, 11, 0.4)", borderTop: `2px solid ${targetColor}`, borderRadius: "2px" }} />
            <span>Target Plan</span>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";

export function BarChart({
  data = [], // [{ label: '06:00', actual: 580, target: 600 }]
  height = 200,
  barColor = "#8C5B23",
  targetColor = "#D97706",
  yAxisUnit,
  unit = "BPM",
  color,
  showLegend = true,
  actualLabel = "Actual Run Rate",
  targetLabel = "Target Plan"
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  const resolvedUnit = yAxisUnit || unit;
  const defaultBarColor = color || barColor;
  const hasAnyTarget = data.some((d) => d.target !== undefined && d.target !== null);
  const maxVal = Math.max(...data.map((d) => Math.max(d.actual ?? d.value ?? 0, d.target || 0))) * 1.15 || 100;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", height: `${height}px`, gap: "12px", paddingBottom: "24px", position: "relative", borderBottom: "1px solid var(--border-subtle)" }}>
        {/* Background grid lines */}
        <div style={{ position: "absolute", inset: "0 0 24px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", opacity: 0.25 }}>
          <div style={{ borderTop: "1px dashed var(--border-subtle)", width: "100%" }} />
          <div style={{ borderTop: "1px dashed var(--border-subtle)", width: "100%" }} />
          <div style={{ borderTop: "1px dashed var(--border-subtle)", width: "100%" }} />
        </div>

        {data.map((item, idx) => {
          const actualVal = item.actual ?? item.value ?? 0;
          const actualHeight = (actualVal / maxVal) * (height - 35);
          const targetHeight = ((item.target || 0) / maxVal) * (height - 30);
          const isHovered = hoveredIdx === idx;
          const currentBarColor = item.color || defaultBarColor;

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
                    bottom: `${Math.max(actualHeight, targetHeight) + 12}px`,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2D9CC",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    boxShadow: "0 8px 24px rgba(44, 30, 15, 0.16), 0 2px 6px rgba(44, 30, 15, 0.08)",
                    zIndex: 30,
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    pointerEvents: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{item.label}</div>
                  {item.category && (
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>{item.category}</div>
                  )}
                  <div style={{ color: currentBarColor, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {actualLabel.replace(/Run Rate/i, "").trim() || "Actual"}: {actualVal} {resolvedUnit}
                  </div>
                  {item.durationMins && (
                    <div style={{ color: "#D97706", fontWeight: 600, fontSize: "11px" }}>
                      Lost Time: {item.durationMins} mins
                    </div>
                  )}
                  {item.target !== undefined && item.target !== null && (
                    <div style={{ color: targetColor, fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {targetLabel}: {item.target} {resolvedUnit}
                    </div>
                  )}
                </div>
              )}

              {/* Bars group */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", width: "100%", justifyContent: "center" }}>
                {item.target !== undefined && item.target !== null && (
                  <div
                    style={{
                      width: "35%",
                      maxWidth: "14px",
                      height: `${targetHeight}px`,
                      backgroundColor: "rgba(217, 119, 6, 0.25)",
                      borderTop: `2px solid ${targetColor}`,
                      borderRadius: "2px 2px 0 0"
                    }}
                  />
                )}
                <div
                  style={{
                    width: item.target ? "45%" : "70%",
                    maxWidth: "24px",
                    height: `${Math.max(actualHeight, 4)}px`,
                    backgroundColor: isHovered ? currentBarColor : currentBarColor,
                    opacity: isHovered ? 1 : 0.85,
                    borderRadius: "3px 3px 0 0",
                    transition: "all 0.2s ease"
                  }}
                />
              </div>

              {/* Value indicator above bar on hover or static */}
              <span
                style={{
                  position: "absolute",
                  bottom: `${actualHeight + 4}px`,
                  fontSize: "9px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: isHovered ? currentBarColor : "var(--text-muted)",
                  transition: "color 0.15s ease",
                  pointerEvents: "none"
                }}
              >
                {actualVal}{resolvedUnit === "%" ? "%" : ""}
              </span>

              {/* X Axis Label */}
              <span
                title={item.label}
                style={{
                  position: "absolute",
                  bottom: "-22px",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "10px",
                  fontWeight: "600",
                  color: isHovered ? "var(--text-primary)" : "#786C5E",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono)"
                }}
              >
                {item.shortLabel || item.label}
              </span>
            </div>
          );
        })}
      </div>

      {showLegend && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: defaultBarColor, display: "inline-block" }} />
            {actualLabel}
          </span>
          {hasAnyTarget && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "rgba(217, 119, 6, 0.5)", borderTop: `2px solid ${targetColor}`, display: "inline-block" }} />
              {targetLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

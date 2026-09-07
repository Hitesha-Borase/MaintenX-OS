import React, { useState } from "react";

export function ParetoChart({
  items = [
    { label: "Bearing Failure", count: 16, percentage: 35.5 },
    { label: "Optical Sensor Glare", count: 12, percentage: 62.2 },
    { label: "Gasket Leakage", count: 8, percentage: 80.0 },
    { label: "Solenoid Sticking", count: 5, percentage: 91.1 },
    { label: "Belt Jam / Sluggish", count: 4, percentage: 100.0 }
  ],
  height = 200
}) {
  const [hovered, setHovered] = useState(null);
  const maxCount = Math.max(...items.map((i) => i.count)) * 1.2 || 20;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ position: "relative", height: `${height}px`, display: "flex", alignItems: "flex-end", gap: "16px", paddingBottom: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
        {/* 80% Cumulative Cutoff Line */}
        <div style={{ position: "absolute", bottom: `${(80 / 100) * (height - 30) + 24}px`, left: 0, right: 0, borderTop: "1px dashed #DC2626", pointerEvents: "none", zIndex: 10 }}>
          <span style={{ position: "absolute", right: "0", top: "-16px", fontSize: "10px", color: "#DC2626", fontWeight: 800 }}>
            80% Pareto Cutoff
          </span>
        </div>

        {items.map((item, idx) => {
          const barHeight = (item.count / maxCount) * (height - 40);
          const isHovered = hovered === idx;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
                position: "relative",
                cursor: "pointer"
              }}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    bottom: `${barHeight + 12}px`,
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
                  <div style={{ color: "#8C5B23", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    Occurrences: {item.count}
                  </div>
                  <div style={{ color: "#D97706", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    Cumulative: {item.percentage}%
                  </div>
                </div>
              )}

              <div
                style={{
                  width: "65%",
                  maxWidth: "32px",
                  height: `${barHeight}px`,
                  backgroundColor: idx < 3 ? "#8C5B23" : "#D1C7B7",
                  borderTop: idx < 3 ? "2px solid #E2B670" : "none",
                  borderRadius: "4px 4px 0 0",
                  transition: "all 0.2s ease"
                }}
              />

              <span
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  fontSize: "10px",
                  fontWeight: "600",
                  color: isHovered ? "var(--text-primary)" : "#786C5E",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "80px"
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)" }}>
        <span>Top Defect Drivers (Pareto Distribution)</span>
        <span style={{ color: "#DC2626", fontWeight: 700 }}>Vital Few: Top 3 Modes</span>
      </div>
    </div>
  );
}

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
        <div style={{ position: "absolute", bottom: `${(80 / 100) * (height - 30) + 24}px`, left: 0, right: 0, borderTop: "1px dashed #EF4444", pointerEvents: "none", zIndex: 10 }}>
          <span style={{ position: "absolute", right: "0", top: "-16px", fontSize: "10px", color: "#EF4444", fontWeight: 700 }}>
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
                    bottom: `${barHeight + 10}px`,
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
                  <div style={{ color: "#38BDF8" }}>Occurrences: {item.count}</div>
                  <div style={{ color: "#F59E0B" }}>Cumulative: {item.percentage}%</div>
                </div>
              )}

              <div
                style={{
                  width: "65%",
                  maxWidth: "32px",
                  height: `${barHeight}px`,
                  backgroundColor: idx < 3 ? "#0284C7" : "#334155",
                  borderTop: idx < 3 ? "2px solid #38BDF8" : "none",
                  borderRadius: "4px 4px 0 0",
                  transition: "all 0.2s ease"
                }}
              />

              <span
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  fontSize: "10px",
                  color: isHovered ? "var(--text-primary)" : "var(--text-muted)",
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
        <span>Top 3 Root Causes account for 80.0% of total plant downtime events</span>
        <span style={{ color: "#EF4444", fontWeight: 600 }}>RCA Mandatory for P1 Failures</span>
      </div>
    </div>
  );
}

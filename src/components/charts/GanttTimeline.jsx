import React, { useState } from "react";
import { Badge } from "../common/Badge";

export function GanttTimeline({
  lines = [
    {
      lineName: "Line 1 (Aseptic Bottling)",
      jobs: [
        { id: "J1", title: "PO-904: Organic Orange Juice 500ml", startHour: 6, duration: 9.5, status: "Running", color: "#0284C7" },
        { id: "J2", title: "CIP Wash & Sanitization", startHour: 15.5, duration: 1.5, status: "Scheduled", color: "#64748B" },
        { id: "J3", title: "PO-907: Lemon Ginger Elixir 500ml", startHour: 17, duration: 7, status: "Scheduled", color: "#10B981" }
      ]
    },
    {
      lineName: "Line 2 (Formulation & Blending)",
      jobs: [
        { id: "J4", title: "PO-905: Ginger-Lime Concentrate", startHour: 4, duration: 6, status: "Breakdown Paused", color: "#EF4444" },
        { id: "J5", title: "Emergency Gasket Replacement", startHour: 10, duration: 4, status: "In Maintenance", color: "#F59E0B" },
        { id: "J6", title: "PO-905: Resume Blend Batch", startHour: 14, duration: 8, status: "Scheduled", color: "#0284C7" }
      ]
    },
    {
      lineName: "Line 3 (Canning Line)",
      jobs: [
        { id: "J7", title: "PO-906: Sparkling Yuzu Tea 330ml", startHour: 0, duration: 14, status: "Completed", color: "#10B981" },
        { id: "J8", title: "PO-908: Matcha Sparkling 330ml", startHour: 14.5, duration: 9.5, status: "Scheduled", color: "#6366F1" }
      ]
    }
  ]
}) {
  const [hoveredJob, setHoveredJob] = useState(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div style={{ width: "100%", overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px", backgroundColor: "var(--bg-card)" }}>
      {/* Time Header */}
      <div style={{ display: "flex", minWidth: "900px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
        <div style={{ width: "220px", padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", borderRight: "1px solid var(--border-subtle)" }}>
          Production Line / Machine
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          {hours.map((h) => (
            <div
              key={h}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                padding: "10px 0",
                borderRight: "1px dashed rgba(255,255,255,0.05)"
              }}
            >
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
      </div>

      {/* Line Rows */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: "900px" }}>
        {lines.map((line, lIdx) => (
          <div
            key={lIdx}
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: lIdx < lines.length - 1 ? "1px solid var(--border-subtle)" : "none",
              minHeight: "68px"
            }}
          >
            {/* Line Title */}
            <div
              style={{
                width: "220px",
                padding: "14px 16px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-primary)",
                borderRight: "1px solid var(--border-subtle)",
                flexShrink: 0
              }}
            >
              {line.lineName}
            </div>

            {/* Timeline Track */}
            <div style={{ flex: 1, position: "relative", height: "46px", margin: "0 8px" }}>
              {/* Hour Grid lines */}
              <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
                {hours.map((h) => (
                  <div key={h} style={{ flex: 1, borderRight: "1px dashed rgba(255,255,255,0.04)" }} />
                ))}
              </div>

              {/* Current Time Indicator (08:30) */}
              <div
                style={{
                  position: "absolute",
                  left: `${(8.5 / 24) * 100}%`,
                  top: "-10px",
                  bottom: "-10px",
                  width: "2px",
                  backgroundColor: "#38BDF8",
                  zIndex: 20,
                  boxShadow: "0 0 8px #38BDF8"
                }}
              >
                <div style={{ position: "absolute", top: 0, left: "-3px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#38BDF8" }} />
              </div>

              {/* Job Blocks */}
              {line.jobs.map((job) => {
                const leftPercent = (job.startHour / 24) * 100;
                const widthPercent = (job.duration / 24) * 100;

                return (
                  <div
                    key={job.id}
                    style={{
                      position: "absolute",
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: "4px",
                      bottom: "4px",
                      backgroundColor: job.color,
                      borderRadius: "6px",
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 600,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                      cursor: "pointer",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      border: "1px solid rgba(255,255,255,0.2)"
                    }}
                    onMouseEnter={() => setHoveredJob(job)}
                    onMouseLeave={() => setHoveredJob(null)}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</span>
                    <span style={{ fontSize: "9px", opacity: 0.8, fontFamily: "var(--font-mono)" }}>
                      {job.duration}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

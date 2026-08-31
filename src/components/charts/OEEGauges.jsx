import React from "react";

export function OEEGauges({ oee = 86.4, availability = 91.2, performance = 96.6, quality = 98.1 }) {
  // SVG Circular Gauge helper
  const renderCircle = (val, radius, strokeWidth, color, bgTrack = "#1E293B") => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (val / 100) * circumference;

    return (
      <>
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke={bgTrack}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: "24px" }}>
      {/* Main Multi-Ring OEE Circle */}
      <div style={{ position: "relative", width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Quality Ring (Outer) */}
          {renderCircle(quality, 85, 8, "#10B981")}
          {/* Performance Ring (Middle) */}
          {renderCircle(performance, 70, 8, "#38BDF8")}
          {/* Availability Ring (Inner) */}
          {renderCircle(availability, 55, 8, "#F59E0B")}
        </svg>

        <div style={{ position: "absolute", textAlign: "center" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            Total OEE
          </span>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 800, color: "#38BDF8", lineHeight: 1 }}>
            {oee}%
          </div>
          <span style={{ fontSize: "10px", color: "#34D399", fontWeight: 600 }}>World Class &gt; 85%</span>
        </div>
      </div>

      {/* Component Breakdown Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minWidth: "220px" }}>
        {/* Availability */}
        <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B", marginRight: "6px" }} />
              Availability
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "#F59E0B" }}>
              {availability}%
            </span>
          </div>
          <div style={{ width: "100%", height: "4px", backgroundColor: "#1E293B", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${availability}%`, height: "100%", backgroundColor: "#F59E0B", borderRadius: "2px" }} />
          </div>
        </div>

        {/* Performance */}
        <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#38BDF8", marginRight: "6px" }} />
              Performance
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "#38BDF8" }}>
              {performance}%
            </span>
          </div>
          <div style={{ width: "100%", height: "4px", backgroundColor: "#1E293B", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${performance}%`, height: "100%", backgroundColor: "#38BDF8", borderRadius: "2px" }} />
          </div>
        </div>

        {/* Quality */}
        <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981", marginRight: "6px" }} />
              Quality Rate
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "#10B981" }}>
              {quality}%
            </span>
          </div>
          <div style={{ width: "100%", height: "4px", backgroundColor: "#1E293B", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${quality}%`, height: "100%", backgroundColor: "#10B981", borderRadius: "2px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

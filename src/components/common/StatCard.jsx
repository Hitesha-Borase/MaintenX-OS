import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";

export function StatCard({
  title,
  value,
  unit = "",
  description = "", // Added description
  trend = null, // { value: "+3.2%", isPositive: true, text: "vs target" }
  icon: Icon,
  badge = null,
  colorVariant = "blue", // cyan, blue, emerald, amber, rose, indigo
  sparkline = null,
  onClick,
  className = ""
}) {
  const colorMap = {
    cyan: "#06B6D4",
    blue: "#38BDF8",
    emerald: "#10B981",
    amber: "#F59E0B",
    rose: "#EF4444",
    indigo: "#6366F1"
  };

  const accentColor = colorMap[colorVariant] || "#38BDF8";

  return (
    <Card
      className={`stat-card ${className}`}
      interactive={!!onClick}
      onClick={onClick}
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: "6px",
              borderRadius: "8px",
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "4px 0" }}>
        <span className="stat-value" style={{ fontFamily: "var(--font-sans)" }}>{value}</span>
        {unit && (
          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "4px" }}>
        {description && !trend && !badge && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
            {description}
          </div>
        )}
        
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
            <span
              style={{
                color: trend.isPositive ? "#34D399" : "#F87171",
                fontWeight: 600
              }}
            >
              {trend.value}
            </span>
            <span style={{ color: "var(--text-muted)" }}>{trend.text}</span>
          </div>
        )}

        {badge && (
          <Badge variant={badge.variant || "slate"} dot={badge.dot}>
            {badge.label}
          </Badge>
        )}
      </div>
    </Card>
  );
}

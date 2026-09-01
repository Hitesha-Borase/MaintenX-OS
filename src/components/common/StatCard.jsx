import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";

export function StatCard({
  title,
  value,
  unit = "",
  description = "",
  trend = null, // { value: "+3.2%", isPositive: true, text: "vs target" }
  icon: Icon,
  badge = null,
  colorVariant = "blue",
  onClick,
  className = ""
}) {
  const colorMap = {
    cyan: "#06B6D4",
    blue: "#8C5B23",
    emerald: "#059669",
    amber: "#D97706",
    rose: "#DC2626",
    indigo: "#6366F1"
  };

  const accentColor = colorMap[colorVariant] || "#8C5B23";

  return (
    <Card
      className={`stat-card ${className}`}
      interactive={!!onClick}
      onClick={onClick}
      style={{
        borderLeft: `3px solid ${accentColor}`,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4px",
        borderRadius: "8px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: "4px",
              borderRadius: "6px",
              backgroundColor: `${accentColor}14`,
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon size={14} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "2px 0 0 0" }}>
        <span className="stat-value" style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 800, lineHeight: 1.2, color: "var(--text-primary)" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
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
          <div style={{ marginTop: "2px" }}>
          <Badge variant={badge.variant || "slate"} dot={badge.dot}>
            {badge.label}
          </Badge>
        </div>
      )}
    </Card>
  );
}

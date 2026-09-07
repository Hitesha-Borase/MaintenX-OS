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
  color,
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

  const accentColor = color || colorMap[colorVariant] || "#8C5B23";

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
        borderRadius: "8px",
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px" }}>
        <span
          className="stat-title"
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            lineHeight: 1.25,
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
          title={title}
        >
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
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Icon size={14} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px", margin: "2px 0 0 0" }}>
        <span className="stat-value" style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 800, lineHeight: 1.2, color: "var(--text-primary)", wordBreak: "keep-all" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "4px" }}>
        {description && !trend && !badge && (
          <div className="stat-desc" style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.2 }}>
            {description}
          </div>
        )}
        
        {trend && (
          <div className="stat-trend" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", flexWrap: "wrap" }}>
            <span
              style={{
                color: trend.isPositive ? "#059669" : "#DC2626",
                fontWeight: 600
              }}
            >
              {trend.value}
            </span>
            {trend.text && <span style={{ color: "var(--text-muted)" }}>{trend.text}</span>}
          </div>
        )}

        {badge && (
          <div style={{ marginTop: "2px" }}>
            <Badge variant={badge.variant || "slate"} dot={badge.dot}>
              {badge.label}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

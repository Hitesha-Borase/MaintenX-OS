import React from "react";

export function Badge({ children, variant = "slate", className = "", dot = false }) {
  const variantMap = {
    emerald: "badge-emerald",
    green: "badge-emerald",
    amber: "badge-amber",
    yellow: "badge-amber",
    rose: "badge-rose",
    red: "badge-rose",
    cyan: "badge-cyan",
    blue: "badge-cyan",
    indigo: "badge-indigo",
    purple: "badge-indigo",
    slate: "badge-slate",
    gray: "badge-slate"
  };

  const badgeClass = variantMap[variant] || "badge-slate";

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {dot && (
        <span
          className="status-dot"
          style={{
            backgroundColor:
              variant === "emerald"
                ? "#10B981"
                : variant === "amber"
                ? "#F59E0B"
                : variant === "rose"
                ? "#EF4444"
                : variant === "cyan"
                ? "#06B6D4"
                : "#94A3B8"
          }}
        />
      )}
      {children}
    </span>
  );
}

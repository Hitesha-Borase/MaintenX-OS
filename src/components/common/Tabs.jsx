import React from "react";

export function Tabs({ tabs, activeTab, onChange, className = "" }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        borderBottom: "1px solid var(--border-subtle)",
        overflowX: "auto",
        paddingBottom: "1px"
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
              background: "transparent",
              border: "none",
              borderBottom: isActive ? "2px solid var(--accent-blue)" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              marginBottom: "-1px"
            }}
          >
            {Icon && <Icon size={15} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "rgba(56, 189, 248, 0.2)" : "var(--bg-card-subtle)",
                  color: isActive ? "#38BDF8" : "var(--text-muted)",
                  fontWeight: 600
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

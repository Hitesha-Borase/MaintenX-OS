import React from "react";
import { Layers } from "lucide-react";

export function BinsRacks() {
  const bins = [
    { code: "A-01-B", desc: "Aisle A, Rack 1, Bin B", item: "Organic Orange Caps", status: "Staged" },
    { code: "B-04-A", desc: "Aisle B, Rack 4, Bin A", item: "Aseptic Glass Bottles", status: "Staged" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Bins & Storage Racks
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Monitor storage slots allocation status
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {bins.map((b, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e8e6e1",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Layers size={24} color="#a855f7" strokeWidth={2} />
              <span style={{ fontSize: "15px", color: "#71717a" }}>
                {b.desc} <span style={{ margin: "0 4px" }}>•</span> Contains: {b.item}
              </span>
            </div>
            
            <span style={{ 
              padding: "6px 12px", 
              backgroundColor: "#e8fbf0", 
              color: "#10b981", 
              border: "1px solid #a7e6c4",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              {b.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

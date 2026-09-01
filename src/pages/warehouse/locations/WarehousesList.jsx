import React from "react";
import { Factory } from "lucide-react";

export function WarehousesList() {
  const warehouses = [
    { name: "Raw Feeds Warehouse A", code: "WH-A", capacity: "78% Capacity utilized" },
    { name: "Finished Cargo Warehouse B", code: "WH-B", capacity: "45% Capacity utilized" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Warehouses Directory
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Monitor utilization capacities across regional warehouse facilities
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {warehouses.map((w, idx) => (
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
              <Factory size={24} color="#38bdf8" strokeWidth={2} />
              <span style={{ fontSize: "15px", color: "#71717a" }}>
                Code: {w.code}
              </span>
            </div>
            
            <span style={{ 
              padding: "6px 12px", 
              backgroundColor: "#e0f2fe", 
              color: "#0ea5e9", 
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              {w.capacity.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

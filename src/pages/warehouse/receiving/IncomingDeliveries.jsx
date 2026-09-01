import React from "react";
import { Truck } from "lucide-react";

export function IncomingDeliveries() {
  const deliveries = [
    { id: "DEL-8802", vendor: "Amcor Packaging Solutions", item: "Glass Bottles 1L", qty: "20,000 Pcs", status: "Transit" },
    { id: "DEL-8803", vendor: "ADM Sweetener Lots", item: "Liquid Cane Sugar Sugar 500L", qty: "2 Drums", status: "Arrived" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Incoming Shipments & Deliveries
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Monitor inbound raw feedstock deliveries and status updates
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {deliveries.map((d) => (
          <div 
            key={d.id} 
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
              <Truck size={24} color="#38BDF8" strokeWidth={2} />
              <span style={{ fontSize: "15px", color: "#71717a" }}>
                Item: {d.item} <span style={{ margin: "0 4px" }}>•</span> Volume: {d.qty}
              </span>
            </div>
            
            {d.status === "Transit" ? (
              <span style={{ 
                padding: "6px 12px", 
                backgroundColor: "#f4f4f5", 
                color: "#52525b", 
                border: "1px solid #e4e4e7",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}>
                TRANSIT
              </span>
            ) : (
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
                ARRIVED
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

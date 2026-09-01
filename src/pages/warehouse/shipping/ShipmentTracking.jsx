import React from "react";
import { Clock } from "lucide-react";

export function ShipmentTracking() {
  const trackingList = [
    { id: "TRK-9011", dest: "Walmart Logistics - Houston", status: "In Transit", eta: "2026-09-01 10:00" },
    { id: "TRK-9010", dest: "Target regional Chicago", status: "Delivered", eta: "Delivered 2026-08-31" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Shipment Tracking
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Operations overview of dispatched carriers and regional ETA times
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {trackingList.map((t) => {
          const isDelivered = t.status === "Delivered";
          return (
            <div 
              key={t.id} 
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
                <Clock size={24} color="#10b981" strokeWidth={2} />
                <span style={{ fontSize: "15px", color: "#71717a" }}>
                  ETA / Delivery: {t.eta}
                </span>
              </div>
              
              <span style={{ 
                padding: "6px 12px", 
                backgroundColor: isDelivered ? "#e8fbf0" : "#e0f2fe", 
                color: isDelivered ? "#10b981" : "#0ea5e9", 
                border: `1px solid ${isDelivered ? "#a7e6c4" : "#bae6fd"}`,
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}>
                {t.status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

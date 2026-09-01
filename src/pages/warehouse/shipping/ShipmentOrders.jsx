import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function ShipmentOrders() {
  const { addToast } = useApp();

  const [shipments, setShipments] = useState([
    { id: "SO-9002", dest: "Target regional Chicago", cargo: "12 Pallets", date: "2026-09-02", status: "Allocated Carrier" },
    { id: "SO-9003", dest: "Kroger regional Dallas", cargo: "24 Pallets", date: "2026-09-04", status: "Pending Freight" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        if (currentStatus === "Allocated Carrier") {
          addToast("Shipment marked as Pending Freight.", "warning");
          return { ...s, status: "Pending Freight" };
        } else {
          addToast("Carrier allocated successfully.", "success");
          return { ...s, status: "Allocated Carrier" };
        }
      }
      return s;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Shipment Purchase Orders
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Reconcile customer shipment schedules and carrier allocations
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {shipments.map((s, idx) => (
          <div 
            key={s.id || idx} 
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
              <FileText size={24} color="#38bdf8" strokeWidth={2} />
              <span style={{ fontSize: "15px", color: "#71717a" }}>
                Payload: {s.cargo} <span style={{ margin: "0 4px" }}>•</span> Target shipping: {s.date}
              </span>
            </div>
            
            <div 
              onClick={() => handleToggleStatus(s.id, s.status)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <span style={{ 
                padding: "6px 12px", 
                backgroundColor: s.status === "Allocated Carrier" ? "#e0f2fe" : "#fef3c7", 
                color: s.status === "Allocated Carrier" ? "#0ea5e9" : "#d97706", 
                border: `1px solid ${s.status === "Allocated Carrier" ? "#bae6fd" : "#fde68a"}`,
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}>
                {s.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

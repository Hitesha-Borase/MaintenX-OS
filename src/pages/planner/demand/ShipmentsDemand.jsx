import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShoppingBag } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function ShipmentsDemand() {
  const { addToast } = useApp();

  const [shipments, setShipments] = useState([
    { id: "SH-9002", dest: "Chicago DCs - Target", volume: "12 Pallets", mode: "Reefer LTL", date: "2026-09-02", status: "Booked" },
    { id: "SH-9003", dest: "Dallas regional - Kroger", volume: "24 Pallets", mode: "FTL Carrier", date: "2026-09-04", status: "Pending Release" }
  ]);

  const handleToggleStatus = (id) => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === "Booked" ? "Pending Release" : "Booked";
        addToast(`Shipment ${id} status updated to ${newStatus.toUpperCase()}`, "success");
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Shipments & Freight Allocation
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {shipments.map((s) => (
          <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px" }}>
                <ShoppingBag size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{s.dest} ({s.id})</h4>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Payload: {s.volume} • Freight Mode: {s.mode} • Date: {s.date}
                </span>
              </div>
            </div>
            <div 
              onClick={() => handleToggleStatus(s.id)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={s.status === "Booked" ? "emerald" : "slate"}>
                {s.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

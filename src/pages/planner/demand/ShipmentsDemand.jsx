import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShoppingBag } from "lucide-react";

export function ShipmentsDemand() {
  const shipments = [
    { id: "SH-9002", dest: "Chicago DCs - Target", volume: "12 Pallets", mode: "Reefer LTL", date: "2026-09-02", status: "Booked" },
    { id: "SH-9003", dest: "Dallas regional - Kroger", volume: "24 Pallets", mode: "FTL Carrier", date: "2026-09-04", status: "Pending Release" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Shipments & Freight Allocation
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Coordinate dispatch schedules and verify carrier allocations
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {shipments.map((s) => (
          <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShoppingBag size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{s.dest} ({s.id})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Payload: {s.volume} • Freight Mode: {s.mode} • Date: {s.date}
                </span>
              </div>
            </div>
            <Badge variant={s.status === "Booked" ? "emerald" : "warning"}>{s.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

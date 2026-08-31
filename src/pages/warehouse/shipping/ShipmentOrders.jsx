import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { FileText } from "lucide-react";

export function ShipmentOrders() {
  const shipments = [
    { id: "SO-9002", dest: "Target regional Chicago", cargo: "12 Pallets", date: "2026-09-02", status: "Allocated Carrier" },
    { id: "SO-9003", dest: "Kroger regional Dallas", cargo: "24 Pallets", date: "2026-09-04", status: "Pending Freight" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Shipment Purchase Orders
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Reconcile customer shipment schedules and carrier allocations
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {shipments.map((s) => (
          <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{s.dest} ({s.id})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Payload: {s.cargo} • Target shipping: {s.date}
                </span>
              </div>
            </div>
            <Badge variant="cyan">{s.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

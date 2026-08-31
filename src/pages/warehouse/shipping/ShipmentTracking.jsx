import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Clock } from "lucide-react";

export function ShipmentTracking() {
  const trackingList = [
    { id: "TRK-9011", dest: "Walmart Logistics - Houston", status: "In Transit", eta: "2026-09-01 10:00" },
    { id: "TRK-9010", dest: "Target regional Chicago", status: "Delivered", eta: "Delivered 2026-08-31" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Shipment Tracking
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of dispatched carriers and regional ETA times
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {trackingList.map((t) => (
          <Card key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={18} color="#10B981" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{t.dest} ({t.id})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>ETA / Delivery: {t.eta}</span>
              </div>
            </div>
            <Badge variant={t.status === "Delivered" ? "emerald" : "cyan"}>{t.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Truck } from "lucide-react";

export function IncomingDeliveries() {
  const deliveries = [
    { id: "DEL-8802", vendor: "Amcor Packaging Solutions", item: "Glass Bottles 1L", qty: "20,000 Pcs", status: "Transit" },
    { id: "DEL-8803", vendor: "ADM Sweetener Lots", item: "Liquid Cane Sugar Sugar 500L", qty: "2 Drums", status: "Arrived" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Incoming Shipments & Deliveries
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor inbound raw feedstock deliveries and status updates
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {deliveries.map((d) => (
          <Card key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{d.vendor} ({d.id})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Item: {d.item} • Volume: {d.qty}
                </span>
              </div>
            </div>
            <Badge variant={d.status === "Arrived" ? "emerald" : "warning"}>{d.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

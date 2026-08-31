import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Factory } from "lucide-react";

export function WarehousesList() {
  const warehouses = [
    { name: "Raw Feeds Warehouse A", code: "WH-A", capacity: "78% Capacity utilized" },
    { name: "Finished Cargo Warehouse B", code: "WH-B", capacity: "45% Capacity utilized" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Warehouses Directory
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor utilization capacities across regional warehouse facilities
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {warehouses.map((w, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Factory size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{w.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Code: {w.code}</span>
              </div>
            </div>
            <Badge variant="cyan">{w.capacity}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

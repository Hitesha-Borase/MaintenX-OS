import React, { useState } from "react";
import {
  Package,
  Plus,
  CheckCircle2,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function StorageResourcesPage() {
  const [resources] = useState([
    { id: "STR-01", name: "Bulk Liquid Syrup Tank 01", type: "Jacketed Silo", capacity: "20,000 Liters", tempControl: "4°C - 8°C Chilled", zone: "Zone C - Silo Farm", status: "Active" },
    { id: "STR-02", name: "Bulk Liquid Syrup Tank 02", type: "Jacketed Silo", capacity: "20,000 Liters", tempControl: "4°C - 8°C Chilled", zone: "Zone C - Silo Farm", status: "Active" },
    { id: "STR-03", name: "Warehouse High-Bay Racking A1", type: "Selective Pallet Rack", capacity: "450 Pallet Positions", tempControl: "Ambient", zone: "Zone B - Finished Goods", status: "Active" },
    { id: "STR-04", name: "Cold Storage Staging Bay 04", type: "Refrigerated Dock", capacity: "120 Pallet Positions", tempControl: "2°C - 4°C", zone: "Zone D - Cold Dock", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Storage Resources & Warehouse Master
            </h1>
            <Badge variant="cyan">{resources.length} Storage Locations</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Bulk holding silos, jacketed ingredient tanks, high-bay racking bins, and cold staging rooms.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource Code</th>
                <th>Storage Name</th>
                <th>Resource Type</th>
                <th>Capacity</th>
                <th>Thermal Envelope</th>
                <th>Warehouse Zone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{r.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{r.type}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{r.capacity}</td>
                  <td style={{ fontSize: "12px", color: "#F59E0B" }}>{r.tempControl}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.zone}</td>
                  <td>
                    <Badge variant="emerald">{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

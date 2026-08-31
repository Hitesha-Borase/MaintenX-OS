import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function WorkCentersMasterPage() {
  const [workCenters] = useState([
    { id: "WC-01", name: "Filling & Capping Monoblock", line: "Line 1", costPerHour: "$120.00/hr", maxCapacity: "4,250 BPH", status: "Active" },
    { id: "WC-02", name: "Rotary Labeling Station", line: "Line 1", costPerHour: "$85.00/hr", maxCapacity: "4,500 BPH", status: "Active" },
    { id: "WC-03", name: "Thermal Pasteurization Skid", line: "Line 2", costPerHour: "$160.00/hr", maxCapacity: "5,000 LPH", status: "Active" },
    { id: "WC-04", name: "Can Seamer Station", line: "Line 3", costPerHour: "$140.00/hr", maxCapacity: "6,000 CPH", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Work Centers Master Registry
            </h1>
            <Badge variant="cyan">{workCenters.length} Master Work Centers</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Master data configuration of manufacturing work centers, machine rates, and hourly operating absorption costs.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>WC Code</th>
                <th>Work Center Description</th>
                <th>Line Attachment</th>
                <th>Standard Absorption Rate</th>
                <th>Max Rated Throughput</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workCenters.map((w) => (
                <tr key={w.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{w.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{w.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{w.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{w.costPerHour}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{w.maxCapacity}</td>
                  <td>
                    <Badge variant="emerald">{w.status}</Badge>
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

import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Layers } from "lucide-react";

export function BinsRacks() {
  const bins = [
    { code: "A-01-B", desc: "Aisle A, Rack 1, Bin B", item: "Organic Orange Caps", status: "Staged" },
    { code: "B-04-A", desc: "Aisle B, Rack 4, Bin A", item: "Aseptic Glass Bottles", status: "Staged" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Bins & Storage Racks
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor storage slots allocation status
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {bins.map((b, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Layers size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Slot: {b.code}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {b.desc} • Contains: {b.item}
                </span>
              </div>
            </div>
            <Badge variant="emerald">{b.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

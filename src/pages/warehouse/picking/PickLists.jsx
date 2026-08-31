import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { FileText } from "lucide-react";

export function PickLists() {
  const lists = [
    { id: "PK-102", order: "ORD-904", itemsCount: "2 Items (Caps, Bottles)", date: "2026-08-31", status: "Active" },
    { id: "PK-103", order: "ORD-905", itemsCount: "1 Item (Concentrate)", date: "2026-08-31", status: "Staged" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Warehouse Pick Lists
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor staging requirements for scheduled production line runs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {lists.map((l) => (
          <Card key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{l.id} (Order: {l.order})</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Payload: {l.itemsCount} • Created: {l.date}
                </span>
              </div>
            </div>
            <Badge variant={l.status === "Active" ? "cyan" : "emerald"}>{l.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

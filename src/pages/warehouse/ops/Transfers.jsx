import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Shuffle } from "lucide-react";

export function Transfers() {
  const transfers = [
    { lot: "LOT-CAP-ORG-442", qty: "1,500 Pcs", from: "WH-A Bin B", to: "STG-L1-IN", status: "Completed" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Transfers History
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operations overview of completed and staging transfers
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {transfers.map((t, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shuffle size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Lot: {t.lot}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Quantity: {t.qty} • Route: {t.from} ➔ {t.to}
                </span>
              </div>
            </div>
            <Badge variant="emerald">{t.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

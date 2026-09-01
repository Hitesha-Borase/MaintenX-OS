import React, { useState } from "react";
import { AlertTriangle, Send } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function MaterialShortages() {
  const { addToast } = useApp();

  const [shortages, setShortages] = useState([
    { id: 1, part: "Orange Cap SKU-CAP-ORG-01", deficit: "-1,500 Units", weekDeficit: "Week 2 (Sept 7)", supplier: "Crown Packing Corp", status: "Critical" }
  ]);

  const handleExpedite = (id, part) => {
    setShortages(prev =>
      prev.map(s => s.id === id ? { ...s, status: "Expedited" } : s)
    );
    addToast(`Expedite supplier shipping notice dispatched for ${part}.`, "warning");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Supply Shortages Alert
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Critical inventory safety shortages detected on scheduled manufacturing runs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {shortages.map((s) => (
          <Card key={s.id} style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center", borderLeft: s.status === "Critical" ? "4px solid #EF4444" : "4px solid #38BDF8", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                <AlertTriangle size={24} color="#EF4444" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{s.part}</span>
                  <Badge variant={s.status === "Critical" ? "danger" : "cyan"}>{s.status}</Badge>
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px", fontWeight: 500 }}>
                  Deficit Quantity: <strong style={{ color: "#EF4444" }}>{s.deficit}</strong> | Deficit Period: {s.weekDeficit}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Vendor: {s.supplier}
                </div>
              </div>
            </div>

            {s.status === "Critical" && (
              <Button variant="warning" size="sm" icon={Send} onClick={() => handleExpedite(s.id, s.part)}>
                Expedite Order
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Layers, AlertOctagon, Check } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Lots() {
  const { addToast } = useApp();

  const [lots, setLots] = useState([
    { code: "LOT-ORG-442", name: "Aseptic Orange Caps", status: "Approved" },
    { code: "LOT-SW-0812", name: "Liquid Cane Sugar Sugar", status: "Approved" }
  ]);

  const handleQuarantine = (code) => {
    setLots(prev =>
      prev.map(l => l.code === code ? { ...l, status: "Quarantined" } : l)
    );
    addToast(`Lot ${code} quarantined. Material movement blocked.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Inventory Lot Controls
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track and trace material lot codes and verify Quality releases
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {lots.map((l) => (
          <Card key={l.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: l.status === "Quarantined" ? "4px solid #EF4444" : "4px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} color="#A855F7" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{l.code}</span>
                <Badge variant={l.status === "Approved" ? "emerald" : "danger"}>{l.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Material: {l.name}
              </div>
            </div>

            {l.status === "Approved" && (
              <Button variant="danger" size="sm" icon={AlertOctagon} onClick={() => handleQuarantine(l.code)}>
                Quarantine
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

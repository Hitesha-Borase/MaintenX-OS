import React, { useState } from "react";
import { Boxes, Plus, Check } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function PalletsContainers() {
  const { addToast } = useApp();

  const [pallets, setPallets] = useState([
    { id: "PLT-1020", sku: "SKU-AJ-1L-ORG", description: "Organic Orange Juice 1L (1,000 Bottles)", status: "Staged WH-B" },
    { id: "PLT-1021", sku: "SKU-AJ-500ML-ORG", description: "Organic Orange Juice 500ml (2,000 Bottles)", status: "Loaded Carrier" }
  ]);

  const handleStage = (id) => {
    setPallets(prev =>
      prev.map(p => p.id === id ? { ...p, status: "Loaded Carrier" } : p)
    );
    addToast(`Pallet ${id} marked as Loaded. Outbound dispatch updated.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Pallets & Cargo Containers
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor finished cargo pallets staged in shipping docks
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {pallets.map((p) => (
          <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Boxes size={16} color="#10B981" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{p.id}</span>
                <Badge variant={p.status === "Loaded Carrier" ? "emerald" : "warning"}>{p.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                SKU: {p.sku} • Contents: {p.description}
              </div>
            </div>

            {p.status === "Staged WH-B" && (
              <Button variant="success" size="sm" icon={Check} onClick={() => handleStage(p.id)}>
                Load Cargo
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

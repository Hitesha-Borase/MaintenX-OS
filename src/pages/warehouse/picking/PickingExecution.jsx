import React, { useState } from "react";
import { CheckSquare, ArrowRight } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function PickingExecution() {
  const { addToast } = useApp();

  const [items, setItems] = useState([
    { id: 1, name: "Organic Orange Caps SKU-CAP-ORG-01", bin: "Bin A-01-B", qty: "1,500 Pcs", status: "Pending" }
  ]);

  const handlePick = (id, name) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, status: "Picked" } : item)
    );
    addToast(`Material pick confirmed: ${name}. Staged at STG-L1-IN.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Picking Execution Console
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Reconcile staging requests by physically picking items from racks to staging bays
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item) => (
          <Card key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: item.status === "Pending" ? "4px solid #F59E0B" : "4px solid #10B981" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={16} color="#A855F7" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{item.name}</span>
                <Badge variant={item.status === "Pending" ? "warning" : "emerald"}>{item.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Location: {item.bin} • Pick Target: {item.qty}
              </div>
            </div>

            {item.status === "Pending" && (
              <Button variant="success" size="sm" icon={ArrowRight} onClick={() => handlePick(item.id, item.name)}>
                Confirm Pick
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

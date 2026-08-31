import React, { useState } from "react";
import { Send, FileText } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Dispatch() {
  const { addToast } = useApp();

  const [dispatches, setDispatches] = useState([
    { id: "SO-9002", dest: "Target regional Chicago", cargo: "12 Pallets", status: "Staged" }
  ]);

  const handleDispatch = (id, dest) => {
    setDispatches(prev => prev.filter(d => d.id !== id));
    addToast(`Shipment ${id} dispatched. Bill of Lading (BOL) signed off.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Outbound Cargo Dispatch
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Confirm outbound carrier loading and sign off carrier Bills of Lading
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {dispatches.map((d) => (
          <Card key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} color="#A855F7" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{d.dest} ({d.id})</span>
                <Badge variant="warning">{d.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Freight: {d.cargo}
              </div>
            </div>

            <Button variant="success" size="sm" icon={Send} onClick={() => handleDispatch(d.id, d.dest)}>
              Dispatch Cargo
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

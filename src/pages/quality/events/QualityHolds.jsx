import React, { useState } from "react";
import { AlertOctagon, Check, Trash } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function QualityHolds() {
  const { addToast } = useApp();

  const [holds, setHolds] = useState([
    { id: "HLD-202", batch: "BAT-2026-0890", reason: "CCP Excursion on Pasteurizer", status: "Active RED Tag" }
  ]);

  const handleRelease = (id, batch) => {
    setHolds(prev => prev.filter(h => h.id !== id));
    addToast(`Batch ${batch} released from Quality Hold by QA signature.`, "success");
  };

  const handleScrap = (id, batch) => {
    setHolds(prev => prev.filter(h => h.id !== id));
    addToast(`Batch ${batch} marked as SCRAPPED by QA signature.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Quality Quarantine Holds
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Confirm product dispositions for quarantine lots. Human QA signature is required.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {holds.map((h) => (
          <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #EF4444" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertOctagon size={16} color="#EF4444" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{h.id}: {h.batch}</span>
                <Badge variant="danger">{h.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Reason: {h.reason}
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <Button variant="success" size="sm" icon={Check} onClick={() => handleRelease(h.id, h.batch)}>
                Release Lot
              </Button>
              <Button variant="danger" size="sm" icon={Trash} onClick={() => handleScrap(h.id, h.batch)}>
                Scrap Lot
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

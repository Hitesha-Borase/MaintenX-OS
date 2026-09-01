import React, { useState } from "react";
import { ShieldAlert, Check, Trash } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Holds() {
  const { addToast } = useApp();

  const [holds, setHolds] = useState([
    { id: "HLD-102", batch: "BAT-2026-0890", reason: "Pasteurizer thermal excursion < 83.1°C", status: "Active Hold" },
    { id: "HLD-103", batch: "BAT-2026-0892", reason: "Brix concentration limit exceeded (12.4)", status: "Active Hold" }
  ]);

  const handleRelease = (id, batch) => {
    setHolds(prev => prev.filter(h => h.id !== id));
    addToast(`Batch ${batch} released from Quality Hold status.`, "success");
  };

  const handleScrap = (id, batch) => {
    setHolds(prev => prev.filter(h => h.id !== id));
    addToast(`Batch ${batch} marked as SCRAPPED. Operations inventory adjusted.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Quality Quarantine Holds
        </h1>

      </div>

      {holds.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Check size={32} color="#10B981" />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>0 Active Quality Holds. All batches released.</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {holds.map((h) => (
            <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderLeft: "4px solid #EF4444" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlert size={16} color="#EF4444" />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{h.id}: {h.batch}</span>
                  <Badge variant="danger">{h.status}</Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Reason: {h.reason}
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <Button variant="success" size="sm" icon={Check} onClick={() => handleRelease(h.id, h.batch)}>
                  Authorize Release
                </Button>
                <Button variant="danger" size="sm" icon={Trash} onClick={() => handleScrap(h.id, h.batch)}>
                  Scrap Batch
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

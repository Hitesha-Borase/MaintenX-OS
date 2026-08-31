import React, { useState } from "react";
import { CalendarRange, Check } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Staging() {
  const { addToast } = useApp();

  const [stagingList, setStagingList] = useState([
    { id: "STG-01", bay: "STG-L1-IN", line: "Line 1 Aseptic", item: "Organic Orange Caps (LOT-ORG-442)", status: "Awaiting Line Pull" }
  ]);

  const handlePullConfirm = (id) => {
    setStagingList(prev =>
      prev.map(s => s.id === id ? { ...s, status: "Pulled to HMI" } : s)
    );
    addToast(`Materials staging pull confirmed. Production Line 1 notified.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Shop Floor Staging Bays
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Confirm staging line pulls for scheduled production runs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {stagingList.map((s) => (
          <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: s.status.includes("Awaiting") ? "4px solid #F59E0B" : "4px solid #10B981" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarRange size={16} color="#38BDF8" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{s.bay}</span>
                <Badge variant={s.status.includes("Awaiting") ? "warning" : "emerald"}>{s.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Target: {s.line} • Staged item: {s.item}
              </div>
            </div>

            {s.status.includes("Awaiting") && (
              <Button variant="success" size="sm" icon={Check} onClick={() => handlePullConfirm(s.id)}>
                Confirm Pull
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

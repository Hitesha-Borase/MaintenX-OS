import React, { useState } from "react";
import { Zap, Check, TrendingUp, Clock, Gauge } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Recovery() {
  const { addToast } = useApp();

  const [countermeasures, setCountermeasures] = useState([
    { id: 1, name: "Reallocate Line 2 Operator to Line 1 Packer station", type: "Crew Allocation", impact: "+1,800 Bottles", active: false },
    { id: 2, name: "Authorize Line Speed Overclock to 620 BPM", type: "Speed Tune", impact: "+3,500 Bottles", active: false },
    { id: 3, name: "30-Minute Shift Extension Overtime", type: "Overtime Extension", impact: "+3,000 Bottles", active: false }
  ]);

  const handleActivate = (id, name) => {
    setCountermeasures(prev =>
      prev.map(c => c.id === id ? { ...c, active: true } : c)
    );
    addToast(`Supervisor authorized countermeasure: ${name}`, "success");
  };

  const handleApproveAll = () => {
    setCountermeasures(prev => prev.map(c => ({ ...c, active: true })));
    addToast("All shift recovery countermeasures authorized for Line Lead execution.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Departmental Recovery Steering
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Authorize Line Lead recovery actions, overtime extensions, and speed tunes to eliminate shift deficit
          </p>
        </div>

        <Button variant="primary" icon={Zap} onClick={handleApproveAll}>
          Authorize All Actions
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {countermeasures.map((c) => (
          <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                Classification: {c.type} • Target Yield Recovery: <strong style={{ color: "#059669" }}>{c.impact}</strong>
              </span>
            </div>

            {!c.active ? (
              <Button variant="primary" size="sm" icon={Zap} onClick={() => handleActivate(c.id, c.name)}>
                Authorize Action
              </Button>
            ) : (
              <Badge variant="emerald">Authorized</Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

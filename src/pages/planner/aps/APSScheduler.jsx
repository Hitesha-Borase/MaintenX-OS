import React, { useState } from "react";
import { BrainCircuit, Play, Check } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function APSScheduler() {
  const { addToast } = useApp();
  const [running, setRunning] = useState(false);

  const handleOptimize = () => {
    setRunning(true);
    addToast("Optimizing sequence to minimize changeover losses...", "info");
    setTimeout(() => {
      setRunning(false);
      addToast("Sequence optimized. Cleanest SKU order proposed in version V4.3.", "success");
    }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            APS Optimization Engine
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Run advanced algorithms to sequence runs and minimize changeover duration
          </p>
        </div>

        <Button variant="primary" icon={running ? Check : Play} onClick={handleOptimize} disabled={running}>
          {running ? "Sequencing..." : "Optimize Runs Sequence"}
        </Button>
      </div>

      <Card style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Current Optimization Constraints
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Minimizing allergen cleanups by sequencing allergen juices (Organic Orange) last.
          Filler guide plate swap sequence configured to run 500ml SKUs before 1L SKUs.
        </p>
      </Card>
    </div>
  );
}

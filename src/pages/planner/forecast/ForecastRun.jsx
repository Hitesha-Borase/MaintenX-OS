import React, { useState } from "react";
import { LineChart, Sparkles } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ForecastRun() {
  const { addToast } = useApp();
  const [running, setRunning] = useState(false);

  const handleRunForecast = () => {
    setRunning(true);
    addToast("Generating 90-day predictive demand forecast...", "info");
    setTimeout(() => {
      setRunning(false);
      addToast("90-day forecast updated using AI model weights.", "success");
    }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Demand Forecasting Console
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Review baseline statistical projections for the upcoming quarters
          </p>
        </div>

        <Button variant="primary" icon={running ? Sparkles : LineChart} onClick={handleRunForecast} disabled={running}>
          {running ? "Running Model..." : "Generate AI Forecast"}
        </Button>
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
          Quarter 3 Forecast Baselines
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)" }}>September Projected Demand:</span>
            <span style={{ fontWeight: 700, color: "#FFFFFF" }}>162,000 Cases</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)" }}>October Projected Demand:</span>
            <span style={{ fontWeight: 700, color: "#FFFFFF" }}>174,000 Cases</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

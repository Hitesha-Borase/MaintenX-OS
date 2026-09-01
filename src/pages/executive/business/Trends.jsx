import React, { useState } from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Trends() {
  const { addToast } = useApp();
  const [runningSim, setRunningSim] = useState(false);

  const handleSimulate = () => {
    setRunningSim(true);
    setTimeout(() => {
      setRunningSim(false);
      addToast("Predictive trends simulation completed.", "success");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Enterprise Trends & Forecasting
          </h1>

        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={handleSimulate} style={{ animation: runningSim ? "spin 1s linear infinite" : "none" }}>
          Run Trend Simulation
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="OEE Trend (30D)" value="+1.8%" description="Austin +2.4% | Chicago -0.6%" icon={TrendingUp} color="#10B981" />
        <StatCard title="Cost Variance Trend" value="-0.4%" description="Favorable MTD movement" icon={TrendingUp} color="#10B981" />
        <StatCard title="Demand Growth Trend" value="+4.2%" description="Inbound order growth" icon={TrendingUp} color="#38BDF8" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Predictive Operational Trends Mapping</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { metric: "Standard Batch Cost", current: "$33,500", predicted30d: "$33,100", change: "-1.2%", impact: "Positive" },
            { metric: "First Pass Yield (FPY)", current: "97.9%", predicted30d: "98.2%", change: "+0.3%", impact: "Positive" },
            { metric: "Utility Cost / Batch", current: "$3,400", predicted30d: "$3,520", change: "+3.5%", impact: "Negative" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.metric}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Current: {item.current}</span>
                  <span>Predicted (30D): {item.predicted30d}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: item.impact === "Positive" ? "#10B981" : "#EF4444" }}>{item.change}</span>
                <span style={{ fontSize: "12px", color: item.impact === "Positive" ? "#10B981" : "#EF4444", fontWeight: 600 }}>{item.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

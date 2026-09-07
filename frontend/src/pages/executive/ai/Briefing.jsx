import React, { useState } from "react";
import { BrainCircuit, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Briefing() {
  const { addToast } = useApp();
  const [generating, setGenerating] = useState(false);
  const [briefingText, setBriefingText] = useState(
    "Enterprise OEE is steady at 84.2%. Austin Plant exhibits the highest performance with 84.2% OEE, while Chicago lags slightly at 78.9% due to unplanned pasteurizer maintenance. Overall costing variance shows an unfavorable MTD variance of +$12,800, primarily driven by raw materials price drift and overtime labor premiums on Line 1. Recommend prioritizing maintenance allocation on Chicago East to prevent critical batch delays."
  );

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setBriefingText(
        "Briefing Refreshed: Austin Filler Line 1 sustained OEE performance lift has offsets Chicago's downtime. Direct labour overtime premiums have stabilized, reducing negative variance exposure. Raw milk supply backlog remains mitigating."
      );
      addToast("Executive AI Briefing regenerated with latest real-time enterprise data.", "success");
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Executive AI Briefing Hub
          </h1>

        </div>
        <Button variant="primary" icon={RefreshCw} onClick={handleGenerate} style={{ animation: generating ? "spin 1s linear infinite" : "none" }}>
          Regenerate Briefing
        </Button>
      </div>

      <Card style={{ border: "1px solid rgba(168, 85, 247, 0.4)", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(0, 0, 0, 0) 100%)", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <BrainCircuit size={24} color="#A855F7" />
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Enterprise Executive Briefing</h3>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
          {briefingText}
        </p>
      </Card>
    </div>
  );
}

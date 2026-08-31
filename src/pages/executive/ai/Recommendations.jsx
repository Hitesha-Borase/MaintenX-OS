import React, { useState } from "react";
import { Cpu, CheckCircle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Recommendations() {
  const { addToast } = useApp();

  const [recs, setRecs] = useState([
    { id: "REC-201", title: "Route excess raw milk inventory to Austin Skid 2", confidence: "94% Confidence", actionValue: "+1.2% OEE lift", status: "Proposed" },
    { id: "REC-202", title: "Apply proactive PM to Austin Filler nozzle seals", confidence: "89% Confidence", actionValue: "-$4,200 scrap cost", status: "Proposed" }
  ]);

  const handleApply = (id) => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: "Applied" } : r));
    addToast(`Successfully applied AI recommendation ${id} to line schedulers.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          AI Action Recommendations
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Predictive actions suggested to optimize throughput, lower direct costing variance, and balance backlog
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {recs.map((r, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: r.status === "Applied" ? "4px solid #10B981" : "4px solid #A855F7" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Cpu size={16} color={r.status === "Applied" ? "#10B981" : "#A855F7"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{r.id}: {r.title}</span>
                <Badge variant={r.status === "Applied" ? "emerald" : "purple"}>{r.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Confidence: <strong style={{ color: "#38BDF8" }}>{r.confidence}</strong> | Potential Impact: <strong style={{ color: "#10B981" }}>{r.actionValue}</strong>
              </p>
            </div>
            {r.status === "Proposed" && (
              <Button variant="success" size="sm" icon={CheckCircle} onClick={() => handleApply(r.id)}>
                Apply Action
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

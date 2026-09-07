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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          AI Action Recommendations
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {recs.map((r, idx) => (
          <Card key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            padding: "16px 20px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderLeft: r.status === "Applied" ? "4px solid #059669" : "4px solid #7C3AED"
          }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <Cpu size={16} color={r.status === "Applied" ? "#059669" : "#7C3AED"} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{r.id}: {r.title}</span>
                <Badge variant={r.status === "Applied" ? "emerald" : "purple"}>{r.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Confidence: <strong style={{ color: "#0284C7" }}>{r.confidence}</strong> | Potential Impact: <strong style={{ color: "#059669" }}>{r.actionValue}</strong>
              </p>
            </div>
            {r.status === "Proposed" && (
              <Button variant="success" size="sm" icon={CheckCircle} onClick={() => handleApply(r.id)} style={{ flexShrink: 0 }}>
                Apply Action
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

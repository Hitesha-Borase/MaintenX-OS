import React, { useState } from "react";
import { AlertOctagon, Cpu } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Constraints() {
  const { addToast } = useApp();
  const [solving, setSolving] = useState(false);

  const handleSolve = () => {
    setSolving(true);
    setTimeout(() => {
      setSolving(false);
      addToast("AI constraint optimization solver completed. Line schedules adjusted.", "success");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Operational Constraints & Bottlenecks
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Monitor and resolve line bottlenecks, raw material shortages, and labor schedule limits
          </p>
        </div>
        <Button variant="secondary" icon={Cpu} onClick={handleSolve} style={{ animation: solving ? "pulse 1s infinite" : "none" }}>
          Run Optimization Solver
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Active Bottlenecks" value="1 Bottleneck" description="Austin Line 1 Pasteurizer" icon={AlertOctagon} color="#EF4444" />
        <StatCard title="Material Shortages" value="0 Items" description="Safety stocks holding green" icon={AlertOctagon} color="#10B981" />
        <StatCard title="Labor Limitations" value="Optimal" description="No critical shift gaps" icon={AlertOctagon} color="#38BDF8" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Bottleneck Ledger</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { location: "Austin Plant — Line 1", constraint: "Pasteurizer thermal cycle speed limitation", impact: "Reduces maximum line output to 14,000/hr", status: "Critical" },
            { location: "Chicago Plant — Blending Room", constraint: "Tank 3 valve maintenance downtime window", impact: "Limits batch volume capacity on Tuesdays", status: "Mitigated" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.location}</span>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Constraint: {item.constraint}</p>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Impact: {item.impact}</span>
              </div>
              <span style={{ fontSize: "12px", color: item.status === "Critical" ? "#EF4444" : "#10B981", fontWeight: 700 }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

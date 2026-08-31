import React, { useState } from "react";
import { TrendingUp, Award } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function CISavings() {
  const { addToast } = useApp();

  const [savingProjects, setSavingProjects] = useState([
    { id: "CI-001", title: "OEE Improvement — Line 1 Filler", projected: "$42,000", actual: "$38,200", status: "Verified" },
    { id: "CI-002", title: "CIP Cycle Time Reduction", projected: "$18,000", actual: "$14,800", status: "Pending Verification" }
  ]);

  const handleVerify = (id) => {
    setSavingProjects(prev => prev.map(p => p.id === id ? { ...p, status: "Verified", actual: p.projected } : p));
    addToast(`Signed off and verified YTD savings for project ${id}`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Continuous Improvement (CI) Savings
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track realized cost savings across certified Kaizen and Six Sigma project actions
        </p>
      </div>

      <div className="grid-3">
        <StatCard title="Total YTD Savings" value="$53,000" description="Sustainment phase active" icon={TrendingUp} color="#10B981" />
        <StatCard title="Projected CI Savings" value="$60,000" description="YTD targets" icon={TrendingUp} color="#38BDF8" />
        <StatCard title="Benefits Verified" value="84.2%" description="Audit verified" icon={TrendingUp} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>CI Savings Portfolio</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {savingProjects.map((p, idx) => (
            <div key={idx} style={{ padding: "12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{p.id}: {p.title}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Projected: {p.projected}</span>
                  <span>Actual Realized: <strong style={{ color: "#10B981" }}>{p.actual}</strong></span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Badge variant={p.status === "Verified" ? "emerald" : "warning"}>{p.status}</Badge>
                {p.status === "Pending Verification" && (
                  <Button variant="success" size="xs" icon={Award} onClick={() => handleVerify(p.id)}>
                    Verify Benefits
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

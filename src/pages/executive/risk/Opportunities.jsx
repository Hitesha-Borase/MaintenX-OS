import React, { useState } from "react";
import { Zap, Plus, DollarSign } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Opportunities() {
  const { addToast } = useApp();

  const [opps, setOpps] = useState([
    { id: "OPP-301", title: "Filler Line 1 OEE upgrade", estSavings: "$42,000", costToImplement: "$8,000", payback: "2.3 Months", status: "Approved" },
    { id: "OPP-302", title: "Steam boiler thermal insulation", estSavings: "$12,400", costToImplement: "$3,200", payback: "3.1 Months", status: "Proposed" }
  ]);

  const handleApprove = (id) => {
    setOpps(prev => prev.map(o => o.id === id ? { ...o, status: "Approved" } : o));
    addToast(`Approved capital opportunity ${id} for immediate implementation.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Opportunities Registry
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track capital-back optimization projects, machine retrofits, and potential CI savings
        </p>
      </div>

      <div className="grid-3">
        <StatCard title="Est. Annualized Savings" value="$54,400" description="Across active opportunities" icon={Zap} color="#10B981" />
        <StatCard title="Implementation Costs" value="$11,200" description="Total CAPEX requirement" icon={Zap} color="#38BDF8" />
        <StatCard title="Avg Payback Period" value="2.7 Months" description="Highly favorable ROI profile" icon={Zap} color="#A855F7" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {opps.map((o, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: o.status === "Approved" ? "4px solid #10B981" : "4px solid #38BDF8" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Zap size={16} color={o.status === "Approved" ? "#10B981" : "#38BDF8"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{o.id}: {o.title}</span>
                <Badge variant={o.status === "Approved" ? "emerald" : "cyan"}>{o.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Est Savings: <strong style={{ color: "#10B981" }}>{o.estSavings}</strong> | Payback: {o.payback} | Capex Cost: {o.costToImplement}
              </p>
            </div>
            {o.status === "Proposed" && (
              <Button variant="success" size="sm" icon={DollarSign} onClick={() => handleApprove(o.id)}>
                Authorize Opportunity
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

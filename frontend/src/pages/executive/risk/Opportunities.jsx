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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Opportunities Registry
        </h1>

      </div>

      <div className="grid-3">
        <StatCard title="Est. Annualized Savings" value="$54,400" description="Across active opportunities" icon={Zap} color="#10B981" />
        <StatCard title="Implementation Costs" value="$11,200" description="Total CAPEX requirement" icon={Zap} color="#38BDF8" />
        <StatCard title="Avg Payback Period" value="2.7 Months" description="Highly favorable ROI profile" icon={Zap} color="#A855F7" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {opps.map((o, idx) => (
          <Card
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              padding: "16px 20px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              borderLeft: o.status === "Approved" ? "4px solid #059669" : "4px solid #0284C7"
            }}
          >
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <Zap size={16} color={o.status === "Approved" ? "#059669" : "#0284C7"} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{o.id}: {o.title}</span>
                <Badge variant={o.status === "Approved" ? "emerald" : "cyan"}>{o.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Est Savings: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{o.estSavings}</strong> | Payback: <strong>{o.payback}</strong> | Capex Cost: {o.costToImplement}
              </p>
            </div>
            {o.status === "Proposed" && (
              <Button variant="success" size="sm" icon={DollarSign} onClick={() => handleApprove(o.id)} style={{ flexShrink: 0 }}>
                Authorize Opportunity
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

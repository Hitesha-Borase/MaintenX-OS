import React, { useState } from "react";
import { DollarSign, FileText, Calculator } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ManufacturingCost() {
  const { addToast } = useApp();
  const [selectedBatch, setSelectedBatch] = useState("BAT-2026-0890");

  const costBreakdown = {
    "BAT-2026-0890": {
      material: "$18,500",
      packaging: "$4,200",
      labour: "$6,800",
      machineTime: "$3,400",
      overhead: "$2,100",
      total: "$35,000",
      standard: "$33,500",
      variance: "+$1,500"
    },
    "BAT-2026-0891": {
      material: "$17,200",
      packaging: "$3,900",
      labour: "$6,200",
      machineTime: "$3,100",
      overhead: "$1,900",
      total: "$32,300",
      standard: "$33,500",
      variance: "-$1,200"
    }
  };

  const current = costBreakdown[selectedBatch];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Manufacturing Cost Intelligence
          </h1>

        </div>
        <div className="mobile-flex-col" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Select Batch / Order:</span>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: "var(--bg-card-subtle)",
              color: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            <option value="BAT-2026-0890">BAT-2026-0890 (Apple Juice 1L)</option>
            <option value="BAT-2026-0891">BAT-2026-0891 (Apple Juice 500ML)</option>
          </select>
        </div>
      </div>

      <div className="grid-3">
        <StatCard title="Total Batch Cost (Actual)" value={current.total} description="Sum of raw cost inputs" icon={DollarSign} color="#38BDF8" />
        <StatCard title="Standard Cost Target" value={current.standard} description="Target standard reference" icon={DollarSign} color="#10B981" />
        <StatCard title="Cost Variance" value={current.variance} description="Standard vs Actual gap" icon={DollarSign} color={current.variance.startsWith("+") ? "#EF4444" : "#10B981"} />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Detailed Cost Components breakdown</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "Raw Materials", value: current.material, desc: "Ingredients, base liquids, flavorings" },
            { label: "Packaging Materials", value: current.packaging, desc: "Bottles, labels, caps, shrink-wrap" },
            { label: "Direct Labour Cost", value: current.labour, desc: "Operator & line lead wages per runtime hr" },
            { label: "Machine Time / Utilities", value: current.machineTime, desc: "Kilowatt hour energy & tooling usage cost" },
            { label: "Overhead Contribution", value: current.overhead, desc: "Facility lease, supervisor allocations" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.label}</span>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{item.desc}</p>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

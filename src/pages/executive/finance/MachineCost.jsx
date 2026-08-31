import React from "react";
import { Settings, Cpu } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function MachineCost() {
  const { addToast } = useApp();

  const handleUtilityAudit = () => {
    addToast("Utility and electric usage efficiency report requested.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Machine Time & Utility Costs
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Energy, equipment amortization, maintenance parts, and allocation rates
          </p>
        </div>
        <Button variant="secondary" icon={Cpu} onClick={handleUtilityAudit}>
          Analyze Utility Efficiency
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Machine Cost (MTD)" value="$52,300" description="Std target: $50,000" icon={Settings} color="#38BDF8" />
        <StatCard title="Electricity / Steam" value="$14,200" description="Actual utility allocation" icon={Settings} color="#10B981" />
        <StatCard title="Tooling Amortization" value="$18,000" description="Based on runtime hrs" icon={Settings} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Standard Machine Cost Rates</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { machine: "Pasteurizer Unit (Line 1)", stdRate: "$45.00/hr", actRate: "$47.50/hr", energy: "Steam / Power", status: "Variance Over" },
            { machine: "Nozzle Filler (Line 1)", stdRate: "$38.00/hr", actRate: "$38.20/hr", energy: "Compressed Air / Power", status: "Optimal" },
            { machine: "Case Packer (Line 1)", stdRate: "$25.00/hr", actRate: "$24.80/hr", energy: "Electrical / Power", status: "Optimal" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.machine}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Std Rate: {item.stdRate}</span>
                  <span>Act Rate: <strong>{item.actRate}</strong></span>
                  <span>Utility: {item.energy}</span>
                </div>
              </div>
              <span style={{ fontSize: "12px", color: item.status === "Optimal" ? "#10B981" : "#EF4444", fontWeight: 700 }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

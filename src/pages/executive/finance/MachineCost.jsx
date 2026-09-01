import React from "react";
import { Settings, Cpu, Zap } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useState } from "react";

export function MachineCost() {
  const { addToast } = useApp();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const handleUtilityAudit = () => {
    setIsAuditModalOpen(true);
  };

  const machineRates = [
    { machine: "Pasteurizer Unit (Line 1)", stdRate: "$45.00/hr", actRate: "$47.50/hr", energy: "Steam / Power", status: "Variance Over" },
    { machine: "Nozzle Filler (Line 1)", stdRate: "$38.00/hr", actRate: "$38.20/hr", energy: "Compressed Air / Power", status: "Optimal" },
    { machine: "Case Packer (Line 1)", stdRate: "$25.00/hr", actRate: "$24.80/hr", energy: "Electrical / Power", status: "Optimal" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Machine Time & Utility Costs
        </h1>
        <Button variant="secondary" icon={Cpu} onClick={handleUtilityAudit}>
          Analyze Utility Efficiency
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Machine Cost (MTD)" value="$52,300" description="Std target: $50,000" icon={Settings} color="#0284C7" />
        <StatCard title="Electricity / Steam" value="$14,200" description="Actual utility allocation" icon={Zap} color="#059669" />
        <StatCard title="Tooling Amortization" value="$18,000" description="Based on runtime hrs" icon={Settings} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Standard Machine Cost Rates
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {machineRates.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "14px 16px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div style={{ flex: 1, minWidth: "160px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.machine}</span>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span>Std Rate: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.stdRate}</strong></span>
                  <span>Act Rate: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.actRate}</strong></span>
                  <span>Utility: {item.energy}</span>
                </div>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 800, color: item.status === "Optimal" ? "#059669" : "#DC2626", flexShrink: 0 }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Utility Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Utility Efficiency Analysis"
        subtitle="Machine time and energy allocation review for current period"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>Close</Button>
            <Button variant="primary" icon={Cpu} onClick={() => { addToast("Utility efficiency report sent to executive inbox.", "success"); setIsAuditModalOpen(false); }}>
              Export Report
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>Machine Cost MTD: <strong>$52,300</strong></div>
            <div>Standard Budget: <strong>$50,000</strong></div>
            <div>Variance: <strong style={{ color: "#DC2626" }}>+$2,300 Over</strong></div>
            <div>Electricity: <strong>$14,200</strong></div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            Pasteurizer Unit on Line 1 showing $2.50/hr over-run due to steam pressure variance. Recommend CMMS PM inspection before next production run.
          </p>
        </div>
      </Modal>
    </div>
  );
}

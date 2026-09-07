import React, { useState } from "react";
import { Users, AlertCircle, Send, FileText } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function LabourCost() {
  const { addToast } = useApp();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const labourRates = [
    { role: "Line Operator", stdRate: "$22.00/hr", actRate: "$22.50/hr", variance: "+$0.50/hr", status: "Over" },
    { role: "Line Lead / Setup", stdRate: "$28.00/hr", actRate: "$28.00/hr", variance: "$0.00/hr", status: "Optimal" },
    { role: "Operations Supervisor", stdRate: "$35.00/hr", actRate: "$35.00/hr", variance: "$0.00/hr", status: "Optimal" },
    { role: "Overtime Premium (1.5x)", stdRate: "$33.00/hr", actRate: "$36.20/hr", variance: "+$3.20/hr", status: "Over" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Labour Cost Analysis
        </h1>
        <Button variant="secondary" icon={AlertCircle} onClick={() => setIsAuditModalOpen(true)}>
          Audit Labor Allocation
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Labor Cost (MTD)" value="$118,500" description="Std target: $110,000" icon={Users} color="#0284C7" />
        <StatCard title="Direct Labor Efficiency" value="94.2%" description="Resource utilization rate" icon={Users} color="#059669" />
        <StatCard title="Overtime Premiums" value="$8,500" description="Due to Line 1 breakdown delays" icon={Users} color="#DC2626" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Labor Standard vs. Actual Rates
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {labourRates.map((item, idx) => (
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
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.role}</span>
                <div style={{ display: "flex", gap: "14px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span>Std Rate: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.stdRate}</strong></span>
                  <span>Act Rate: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.actRate}</strong></span>
                </div>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 800, color: item.status === "Optimal" ? "#059669" : "#DC2626", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                {item.variance}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Labor Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Direct Labor Wage Allocation Audit"
        subtitle="Current month labor cost variance analysis and action plan"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>Close</Button>
            <Button variant="primary" icon={FileText} onClick={() => { addToast("Labor audit report exported to executive inbox.", "success"); setIsAuditModalOpen(false); }}>
              Export Audit Report
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>Total Labor MTD: <strong>$118,500</strong></div>
            <div>Standard Budget: <strong>$110,000</strong></div>
            <div>Variance: <strong style={{ color: "#DC2626" }}>+$8,500 Over</strong></div>
            <div>Efficiency Rate: <strong style={{ color: "#059669" }}>94.2%</strong></div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            Overtime premiums of $8,500 are the primary driver of the labor over-run, caused by Line 1 breakdown delays during the night shift. Recommend staffing buffer review.
          </p>
        </div>
      </Modal>
    </div>
  );
}

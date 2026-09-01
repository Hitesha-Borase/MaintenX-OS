import React, { useState } from "react";
import { ShieldCheck, HelpCircle, ClipboardCheck, Send } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Quality() {
  const { addToast } = useApp();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditScope, setAuditScope] = useState("all");
  const [dispatching, setDispatching] = useState(false);

  const plantQuality = [
    { plant: "Austin Main Plant", fpy: "98.5%", holds: 1, ccpEvents: 0, compliance: "100%" },
    { plant: "Chicago East Plant", fpy: "96.2%", holds: 1, ccpEvents: 0, compliance: "100%" },
    { plant: "Boston Logistics Hub", fpy: "99.1%", holds: 0, ccpEvents: 0, compliance: "100%" }
  ];

  const handleAudit = () => {
    setIsAuditModalOpen(true);
  };

  const handleDispatchAudit = () => {
    setDispatching(true);
    setTimeout(() => {
      setDispatching(false);
      addToast(`QA compliance inspection dispatched for ${auditScope === "all" ? "all plants" : auditScope + " plant"}.`, "success");
      setIsAuditModalOpen(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Quality & Compliance
        </h1>
        <Button variant="secondary" icon={ShieldCheck} onClick={handleAudit}>
          Trigger QA Audit
        </Button>
      </div>

      <div className="grid-4">
        <StatCard title="First Pass Yield" value="97.9%" description="Target: 98.0%" icon={ShieldCheck} color="#059669" />
        <StatCard title="Active Quality Holds" value="2 Batches" description="Austin (1), Chicago (1)" icon={ShieldCheck} color="#DC2626" />
        <StatCard title="CCP Excursions MTD" value="0 Events" description="Optimal status" icon={ShieldCheck} color="#0284C7" />
        <StatCard title="Compliance Rate" value="100%" description="FDA/HACCP target met" icon={ShieldCheck} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Plant Quality Metrics
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {plantQuality.map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{item.plant}</span>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap", alignItems: "center" }}>
                <span>FPY: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{item.fpy}</strong></span>
                <span>Holds: <strong style={{ color: item.holds > 0 ? "#DC2626" : "var(--text-secondary)" }}>{item.holds}</strong></span>
                <span>CCP Events: <strong>{item.ccpEvents}</strong></span>
                <Badge variant="emerald">Compliance: {item.compliance}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* QA Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Trigger QA Compliance Inspection"
        subtitle="Dispatch an unannounced quality audit across selected plant scope"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={Send} onClick={handleDispatchAudit}>
              {dispatching ? "Dispatching..." : "Dispatch QA Team"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Audit Scope
            </label>
            <select value={auditScope} onChange={(e) => setAuditScope(e.target.value)} className="input-field">
              <option value="all">All Plants</option>
              <option value="Austin">Austin Main Plant Only</option>
              <option value="Chicago">Chicago East Plant Only</option>
              <option value="Boston">Boston Logistics Hub Only</option>
            </select>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div>Enterprise FPY: <strong>97.9%</strong></div>
            <div>Active Quality Holds: <strong style={{ color: "#DC2626" }}>2 Batches</strong></div>
            <div>Compliance Rate: <strong style={{ color: "#059669" }}>100%</strong></div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            Dispatching a QA team will initiate an unannounced inspection of the selected plant scope covering all CCP checkpoints and quality hold review.
          </p>
        </div>
      </Modal>
    </div>
  );
}

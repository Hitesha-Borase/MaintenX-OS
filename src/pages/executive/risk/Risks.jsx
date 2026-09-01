import React, { useState } from "react";
import { AlertTriangle, Plus, ShieldCheck, FileText, Send, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function Risks() {
  const { addToast } = useApp();

  const [risks, setRisks] = useState([
    { id: "RSK-01", title: "Raw milk supplier delay (Chicago)", prob: "High", impact: "Critical", owner: "Supply Chain Team", status: "Mitigating" },
    { id: "RSK-02", title: "Austin Line 2 pasteurizer wear", prob: "Medium", impact: "High", owner: "Maintenance Team", status: "Open" }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newProb, setNewProb] = useState("Medium");
  const [newImpact, setNewImpact] = useState("High");

  // Modal State for Run Audit
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditNotes, setAuditNotes] = useState("");

  const handleOpenAudit = (riskObj) => {
    setSelectedRisk(riskObj);
    setAuditNotes("");
    setIsAuditModalOpen(true);
  };

  const handleConfirmRiskAudit = (e) => {
    e.preventDefault();
    if (!selectedRisk) return;

    setRisks(prev =>
      prev.map(r => r.id === selectedRisk.id ? { ...r, status: "Mitigating" } : r)
    );

    addToast(`Audit initiated for risk ${selectedRisk.id}. Mitigation log updated.`, "success");
    setIsAuditModalOpen(false);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const id = `RSK-0${risks.length + 1}`;
    setRisks(prev => [...prev, { id, title: newTitle, prob: newProb, impact: newImpact, owner: "Executive Committee", status: "Open" }]);
    addToast(`New risk ${id} logged and added to tracking ledger.`, "success");
    setNewTitle("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Risk Registry
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Critical Risks Logged" value="1 Critical" description="Supply Chain supplier delays" icon={AlertTriangle} color="#DC2626" />
        <StatCard title="Open Risks Registry" value={String(risks.length)} description="Across all active facilities" icon={AlertTriangle} color="#D97706" />
        <StatCard title="Mitigation Rate" value="50%" description="Active mitigation plans" icon={CheckCircle2} color="#059669" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {risks.map((r, idx) => (
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
              borderLeft: r.impact === "Critical" ? "4px solid #DC2626" : "4px solid #D97706"
            }}
          >
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <AlertTriangle size={16} color={r.impact === "Critical" ? "#DC2626" : "#D97706"} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{r.id}: {r.title}</span>
                <Badge variant={r.status === "Mitigating" ? "emerald" : "warning"}>{r.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Owner: <strong>{r.owner}</strong> | Probability: <strong>{r.prob}</strong> | Impact: <strong>{r.impact}</strong>
              </p>
            </div>

            <Button
              variant="secondary"
              size="xs"
              icon={ShieldCheck}
              onClick={() => handleOpenAudit(r)}
              style={{ flexShrink: 0 }}
            >
              Run Audit
            </Button>
          </Card>
        ))}
      </div>

      {/* Log New Risk Form */}
      <form onSubmit={handleAdd}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Log New Enterprise Risk
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <input
              type="text"
              placeholder="Risk description / title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-field"
              required
            />
            <select value={newProb} onChange={(e) => setNewProb(e.target.value)} className="input-field">
              <option value="Low">Low Prob</option>
              <option value="Medium">Medium Prob</option>
              <option value="High">High Prob</option>
            </select>
            <select value={newImpact} onChange={(e) => setNewImpact(e.target.value)} className="input-field">
              <option value="Medium">Medium Impact</option>
              <option value="High">High Impact</option>
              <option value="Critical">Critical Impact</option>
            </select>
          </div>

          <Button type="submit" variant="primary" icon={Plus} style={{ width: "fit-content", alignSelf: "flex-start", padding: "8px 20px" }}>
            Add Risk
          </Button>
        </Card>
      </form>

      {/* Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`Audit Risk Item: ${selectedRisk?.id || ""}`}
        subtitle={`Risk Title: ${selectedRisk?.title || ""}`}
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleConfirmRiskAudit}>
              Confirm Audit & Mitigate
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmRiskAudit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div>Risk Owner: <strong>{selectedRisk?.owner}</strong></div>
            <div>Probability Rating: <strong>{selectedRisk?.prob}</strong></div>
            <div>Impact Severity: <strong style={{ color: selectedRisk?.impact === "Critical" ? "#DC2626" : "#D97706" }}>{selectedRisk?.impact}</strong></div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Audit Findings & Directives
            </label>
            <textarea
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              rows={3}
              placeholder="Enter audit inspection results, required CAPA action, or mitigation steps..."
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

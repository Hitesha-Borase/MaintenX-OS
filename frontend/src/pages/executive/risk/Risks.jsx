import React, { useState, useEffect } from "react";
import { AlertTriangle, Plus, ShieldCheck, FileText, Send, CheckCircle2, Loader2, UserCheck } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function Risks() {
  const { addToast } = useApp();

  const [risks, setRisks] = useState([]);
  const [criticalCount, setCriticalCount] = useState(1);
  const [mitigationRate, setMitigationRate] = useState("50%");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newProb, setNewProb] = useState("Medium");
  const [newImpact, setNewImpact] = useState("High");

  // Modal State for Run Audit
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({
    auditor: "Pete Vanslyke",
    action: "Supplier Redundancy Protocol",
    department: "Supply Chain & Plant Maintenance",
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    directives: ""
  });

  const fetchRisksData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getRisks();
      const data = res.data || res;
      if (data) {
        if (data.risks) setRisks(data.risks);
        if (data.criticalCount !== undefined) setCriticalCount(data.criticalCount);
        if (data.mitigationRate) setMitigationRate(data.mitigationRate);
      }
    } catch (err) {
      console.error("Error loading risks:", err);
      addToast("Failed to load risk registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisksData();
  }, []);

  const handleOpenAudit = (riskObj) => {
    setSelectedRisk(riskObj);
    setAuditForm({
      auditor: "Pete Vanslyke",
      action: riskObj.impact === "Critical" ? "Supplier Redundancy & Safety Stock Buffering" : "Preventative Maintenance Overhaul & Telemetry Alerting",
      department: riskObj.owner || "Supply Chain & Plant Maintenance",
      targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      directives: `Executive audit conducted for ${riskObj.id}. Implement containment actions and establish weekly telemetry reporting.`
    });
    setIsAuditModalOpen(true);
  };

  const handleConfirmRiskAudit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedRisk) return;

    try {
      setSubmitting(true);
      const res = await executiveService.mitigateRisk({
        riskId: selectedRisk.id,
        action: `${auditForm.action}: ${auditForm.directives}`,
        auditor: auditForm.auditor,
        department: auditForm.department,
        targetDate: auditForm.targetDate
      });
      const data = res.data || res;

      const auditDateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      setRisks(prev =>
        prev.map(r =>
          r.id === selectedRisk.id
            ? {
                ...r,
                status: "Mitigating",
                auditedBy: auditForm.auditor,
                auditedAt: auditDateStr,
                mitigationPlan: auditForm.action
              }
            : r
        )
      );

      // Recalculate local mitigation rate if needed
      setMitigationRate("67%");

      addToast(
        data?.message || `Audit completed for risk ${selectedRisk.id}. Mitigation protocol activated by ${auditForm.auditor}.`,
        "success"
      );
      setIsAuditModalOpen(false);
    } catch (err) {
      console.error("Error mitigating risk:", err);
      addToast("Failed to record mitigation audit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      setSubmitting(true);
      const res = await executiveService.addRisk({
        title: newTitle,
        prob: newProb,
        impact: newImpact,
        owner: "Executive Committee"
      });
      const data = res.data || res;

      if (data && data.risk) {
        setRisks(prev => [...prev, data.risk]);
      } else {
        const id = `RSK-0${risks.length + 1}`;
        setRisks(prev => [...prev, { id, title: newTitle, prob: newProb, impact: newImpact, owner: "Executive Committee", status: "Open" }]);
      }

      addToast(data?.message || "New risk logged and added to tracking ledger.", "success");
      setNewTitle("");
    } catch (err) {
      console.error("Error adding risk:", err);
      addToast("Failed to log new enterprise risk", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Risk Registry
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Critical Risks Logged" value={`${criticalCount} Critical`} description="Supply Chain supplier delays" icon={AlertTriangle} color="#DC2626" />
        <StatCard title="Open Risks Registry" value={String(risks.length)} description="Across all active facilities" icon={AlertTriangle} color="#D97706" />
        <StatCard title="Mitigation Rate" value={mitigationRate} description="Active mitigation plans" icon={CheckCircle2} color="#059669" />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
          <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : (
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
                  {r.auditedBy && (
                    <Badge variant="emerald">
                      ✓ Audited by {r.auditedBy} ({r.auditedAt})
                    </Badge>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Owner: <strong>{r.owner}</strong> | Probability: <strong>{r.prob}</strong> | Impact: <strong>{r.impact}</strong>
                  {r.mitigationPlan && <span> | Action: <em style={{ color: "#059669" }}>{r.mitigationPlan}</em></span>}
                </p>
              </div>

              <Button
                variant={r.status === "Mitigating" ? "secondary" : "primary"}
                size="xs"
                icon={ShieldCheck}
                onClick={() => handleOpenAudit(r)}
                style={{ flexShrink: 0 }}
              >
                {r.status === "Mitigating" ? "Re-Audit Risk" : "Run Audit"}
              </Button>
            </Card>
          ))}
        </div>
      )}

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

          <Button type="submit" variant="primary" icon={Plus} disabled={submitting} style={{ width: "fit-content", alignSelf: "flex-start", padding: "8px 20px" }}>
            {submitting ? "Adding..." : "Add Risk"}
          </Button>
        </Card>
      </form>

      {/* Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`Audit Risk Item: ${selectedRisk?.id || ""}`}
        subtitle={`Risk Title: ${selectedRisk?.title || ""}`}
        maxWidth="560px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleConfirmRiskAudit} disabled={submitting}>
              {submitting ? "Mitigating..." : "Confirm Audit & Mitigate"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmRiskAudit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Risk Description:</span>
              <strong style={{ color: "var(--text-primary)" }}>{selectedRisk?.title}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Risk Owner:</span>
              <strong>{selectedRisk?.owner}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Severity Rating:</span>
              <strong style={{ color: selectedRisk?.impact === "Critical" ? "#DC2626" : "#D97706" }}>
                {selectedRisk?.prob} Probability / {selectedRisk?.impact} Impact
              </strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Lead Executive Auditor
              </label>
              <input
                type="text"
                className="input-field"
                value={auditForm.auditor}
                onChange={(e) => setAuditForm(prev => ({ ...prev, auditor: e.target.value }))}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Mitigation Target Date
              </label>
              <input
                type="date"
                className="input-field"
                value={auditForm.targetDate}
                onChange={(e) => setAuditForm(prev => ({ ...prev, targetDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Mitigation Strategy
              </label>
              <select
                className="input-field"
                value={auditForm.action}
                onChange={(e) => setAuditForm(prev => ({ ...prev, action: e.target.value }))}
              >
                <option value="Supplier Redundancy Protocol">Supplier Redundancy Protocol</option>
                <option value="Preventative Overhaul & Spares Buffer">Preventative Overhaul & Spares Buffer</option>
                <option value="Quality Containment & CAPA Trigger">Quality Containment & CAPA Trigger</option>
                <option value="Continuous Telemetry Monitoring">Continuous Telemetry Monitoring</option>
                <option value="Operational Process Re-Engineering">Operational Process Re-Engineering</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Assigned Department
              </label>
              <input
                type="text"
                className="input-field"
                value={auditForm.department}
                onChange={(e) => setAuditForm(prev => ({ ...prev, department: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Audit Findings & Directives
            </label>
            <textarea
              value={auditForm.directives}
              onChange={(e) => setAuditForm(prev => ({ ...prev, directives: e.target.value }))}
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

import React, { useState } from "react";
import { Gauge, CheckCircle, TrendingUp, ShieldCheck, Calendar, User, FileText, CheckSquare, Clock, AlertTriangle, Send, X } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function MultiPlantKPIs() {
  const { addToast } = useApp();

  const [kpis, setKpis] = useState([
    { id: 1, plant: "Austin Main Plant", oee: "84.2%", fpy: "98.5%", throughput: "14,200/hr", labor: "94.2%", status: "Optimal", lastAudit: "2026-08-15", auditStatus: "Completed" },
    { id: 2, plant: "Chicago East Plant", oee: "78.9%", fpy: "96.2%", throughput: "11,800/hr", labor: "88.5%", status: "Warning", lastAudit: "2026-07-20", auditStatus: "Pending Audit" },
    { id: 3, plant: "Boston Logistics Hub", oee: "89.5%", fpy: "99.1%", throughput: "16,000/hr", labor: "96.8%", status: "Optimal", lastAudit: "2026-08-28", auditStatus: "Completed" }
  ]);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Form State for Audit Modal
  const [auditType, setAuditType] = useState("Full Operational & Quality Audit");
  const [leadAuditor, setLeadAuditor] = useState("Alexander Vance");
  const [auditDate, setAuditDate] = useState("2026-09-02");
  const [checklist, setChecklist] = useState({
    oee: true,
    quality: true,
    labour: true,
    cmms: true
  });
  const [auditNotes, setAuditNotes] = useState("");

  const handleOpenAuditModal = (plantObj) => {
    setSelectedPlant(plantObj);
    setAuditNotes("");
    setIsAuditModalOpen(true);
  };

  const handleToggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmAudit = (e) => {
    e.preventDefault();
    if (!selectedPlant) return;

    // Update state to reflect audit initiated
    setKpis(prev =>
      prev.map(p =>
        p.id === selectedPlant.id
          ? { ...p, auditStatus: "Audit In Progress", lastAudit: "Just Now" }
          : p
      )
    );

    addToast(`On-site performance audit for ${selectedPlant.plant} initiated successfully! Lead Auditor: ${leadAuditor}.`, "success");
    setIsAuditModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Multi-Plant KPIs
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Avg Enterprise OEE" value="84.2%" description="OEE Target: 85%" icon={Gauge} color="#38BDF8" />
        <StatCard title="Avg First Pass Yield" value="97.9%" description="Target: 98%" icon={CheckCircle} color="#10B981" />
        <StatCard title="Enterprise Labour Efficiency" value="93.1%" description="vs. 92.5% last week" icon={TrendingUp} color="#A855F7" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Performance Matrix & Audit Dispatch
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
              Real-time plant attainment, compliance ratings, and operational audit controls.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {kpis.map((k) => (
            <div
              key={k.id}
              className="mobile-flex-col"
              style={{
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {k.plant}
                  </span>
                  <Badge variant={k.status === "Optimal" ? "emerald" : "warning"}>
                    {k.status}
                  </Badge>
                  {k.auditStatus === "Audit In Progress" && (
                    <Badge variant="cyan" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={10} /> Audit Dispatched
                    </Badge>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    flexWrap: "wrap"
                  }}
                >
                  <span>OEE: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{k.oee}</strong></span>
                  <span>FPY: <strong style={{ color: "#0284C7", fontFamily: "var(--font-mono)" }}>{k.fpy}</strong></span>
                  <span>Throughput: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{k.throughput}</strong></span>
                  <span>Labor Eff: <strong style={{ color: "#7C3AED", fontFamily: "var(--font-mono)" }}>{k.labor}</strong></span>
                  <span style={{ color: "var(--text-muted)" }}>Last Audit: {k.lastAudit}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={ShieldCheck}
                  onClick={() => handleOpenAuditModal(k)}
                >
                  Audit Plant
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Plant Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`On-Site Audit Dispatch: ${selectedPlant?.plant || ""}`}
        subtitle="Configure inspection parameters, assign lead auditor, and initiate performance audit."
        maxWidth="640px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleConfirmAudit}>
              Confirm & Dispatch Audit
            </Button>
          </>
        }
      >
        {selectedPlant && (
          <form onSubmit={handleConfirmAudit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Plant Snapshot Banner */}
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "rgba(178, 126, 51, 0.08)",
                border: "1px solid rgba(178, 126, 51, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#8C5B23", textTransform: "uppercase" }}>
                  TARGET FACILITY
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {selectedPlant.plant}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                <div>OEE: <strong style={{ color: "#059669" }}>{selectedPlant.oee}</strong></div>
                <div>FPY: <strong style={{ color: "#0284C7" }}>{selectedPlant.fpy}</strong></div>
                <div>Labor: <strong style={{ color: "#7C3AED" }}>{selectedPlant.labor}</strong></div>
              </div>
            </div>

            {/* Audit Scope Selection */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Audit Scope & Category
                </label>
                <select
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                >
                  <option value="Full Operational & Quality Audit">Full Operational & Quality Audit</option>
                  <option value="OEE & Bottleneck Performance Deep-Dive">OEE & Bottleneck Performance Deep-Dive</option>
                  <option value="HACCP / Food Safety & Sanitation Audit">HACCP / Food Safety & Sanitation Audit</option>
                  <option value="CMMS Equipment Reliability & Maintenance Audit">CMMS Equipment Reliability & Maintenance Audit</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Lead Auditor Assignment
                </label>
                <input
                  type="text"
                  value={leadAuditor}
                  onChange={(e) => setLeadAuditor(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                  placeholder="Enter auditor name"
                  required
                />
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Target Audit Date
              </label>
              <input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
                required
              />
            </div>

            {/* Audit Checklist Items */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Mandatory Inspection Focus Areas
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { key: "oee", label: "OEE Speed Loss & Bottleneck Verification" },
                  { key: "quality", label: "CCP & QA Release Gate Compliance" },
                  { key: "labour", label: "Shift Handoff & Labour Efficiency" },
                  { key: "cmms", label: "PM Work Orders & Maintenance Backlog" }
                ].map((item) => (
                  <label
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.key]}
                      onChange={() => handleToggleChecklist(item.key)}
                      style={{ accentColor: "#B27E33" }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Special Audit Instructions / Directives
              </label>
              <textarea
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                rows={3}
                placeholder="Add specific focus areas, line numbers, or escalation instructions for the audit team..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                  resize: "vertical"
                }}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

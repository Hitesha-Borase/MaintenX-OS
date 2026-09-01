import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchCode,
  CheckCircle,
  LineChart,
  Briefcase,
  DollarSign,
  ShieldCheck,
  FileCheck,
  Activity,
  Plus,
  Download,
  ArrowRight,
  Sparkles,
  TrendingDown,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function CIDashboard() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [isCreateRcaOpen, setIsCreateRcaOpen] = useState(false);
  const [rcaForm, setRcaForm] = useState({
    title: "",
    area: "Aseptic Bottling Line 1",
    severity: "High",
    owner: "David Kim (Lead CI)",
    description: ""
  });

  const handleCreateRca = (e) => {
    e.preventDefault();
    if (!rcaForm.title) {
      addToast("Please provide an investigation title.", "warning");
      return;
    }

    addToast(`RCA Incident "${rcaForm.title}" logged successfully!`, "success");
    setIsCreateRcaOpen(false);
    setRcaForm({
      title: "",
      area: "Aseptic Bottling Line 1",
      severity: "High",
      owner: "David Kim (Lead CI)",
      description: ""
    });
  };

  const handleExportReport = () => {
    const csvContent =
      "Metric,Value,Status\n" +
      "Active RCA Investigations,2,Active\n" +
      "Overdue CAPA Items,3,Overdue\n" +
      "Weekly OEE Loss,12.4%,Opportunity\n" +
      "CI Savings YTD,$148200,Verified\n" +
      "Downtime Loss,6.2%,Critical\n" +
      "Quality Loss,3.1%,Warning\n" +
      "Yield Loss,3.1%,Tracked\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Executive_Summary_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CI Executive summary exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI / Engineering Control Center
            </h1>
            <Badge variant="cyan">CONTINUOUS IMPROVEMENT</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportReport} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Report
          </Button>
          <Button variant="secondary" icon={Briefcase} onClick={() => navigate("/ci/projects/actions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Project Actions
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateRcaOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Log RCA Incident
          </Button>
        </div>
      </div>

      {/* KPI Stats - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Open RCA Investigations"
          value="2 Active"
          unit="RCA"
          trend={{ value: "CCP excursion + Cap NCR", isPositive: false, text: "" }}
          icon={SearchCode}
          colorVariant="rose"
          onClick={() => navigate("/ci/rca/investigations")}
        />
        <StatCard
          title="CAPA Actions Due"
          value="3 Overdue"
          unit="CAPA"
          trend={{ value: "Corrective actions past target", isPositive: false, text: "" }}
          icon={CheckCircle}
          colorVariant="amber"
          onClick={() => navigate("/ci/capa/owners")}
        />
        <StatCard
          title="Total OEE Loss (Week)"
          value="12.4%"
          unit="OEE Gap"
          trend={{ value: "Downtime + Quality + Speed", isPositive: false, text: "" }}
          icon={LineChart}
          colorVariant="cyan"
          onClick={() => navigate("/ci/loss/downtime")}
        />
        <StatCard
          title="CI Savings YTD"
          value="$148,200"
          unit="Verified"
          trend={{ value: "Verified project savings", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="emerald"
          onClick={() => navigate("/ci/projects/savings")}
        />
      </div>

      {/* Operational Modules Responsive Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "14px",
          width: "100%",
          minWidth: 0
        }}
      >
        {/* Module 1: RCA Investigations */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active RCA Investigations
              </h3>
              <Badge variant="rose">2 PENDING</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                onClick={() => navigate("/ci/rca/investigations")}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>INV-802 (CCP Excursion)</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pasteurizer Temp Drop</div>
                </div>
                <Badge variant="rose">ACTIVE</Badge>
              </div>

              <div
                onClick={() => navigate("/ci/rca/evidence")}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>INV-803 (Cap NCR)</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Capper Torque Fault</div>
                </div>
                <Badge variant="amber">EVIDENCE PHASE</Badge>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/ci/rca/investigations")}
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              border: "1px solid #E8C182",
              boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>View All RCAs</span>
            <ArrowRight size={14} />
          </button>
        </Card>

        {/* Module 2: Loss Waterfall */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Loss Analysis Summary
              </h3>
              <Badge variant="amber">12.4% GAP</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Downtime Loss:</span>
                <strong style={{ color: "#DC2626", fontFamily: "var(--font-mono)", fontSize: "13px" }}>6.2%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Quality Loss:</span>
                <strong style={{ color: "#D97706", fontFamily: "var(--font-mono)", fontSize: "13px" }}>3.1%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Yield Loss:</span>
                <strong style={{ color: "#0284C7", fontFamily: "var(--font-mono)", fontSize: "13px" }}>3.1%</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/ci/loss/downtime")}
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "var(--bg-card-subtle)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>Full Loss Waterfall</span>
            <ArrowRight size={14} />
          </button>
        </Card>

        {/* Module 3: CI Projects & Savings */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                CI Projects & Savings
              </h3>
              <Badge variant="emerald">ON TRACK</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Active Kaizen Projects:</span>
                <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>4 Active</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Verified Annualized Savings:</span>
                <strong style={{ color: "#059669", fontFamily: "var(--font-mono)", fontSize: "13px" }}>$148,200</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Implemented Standards:</span>
                <strong style={{ color: "#0284C7", fontSize: "13px" }}>12 SOPs</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/ci/projects/list")}
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              border: "1px solid #E8C182",
              boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>View CI Projects</span>
            <ArrowRight size={14} />
          </button>
        </Card>

        {/* Module 4: Engineering & Standards */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Standards & Governance
              </h3>
              <Badge variant="cyan">ISO 22000</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Verified Solutions:</span>
                <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>8 Verified</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Audited Standards:</span>
                <strong style={{ color: "#059669", fontSize: "13px" }}>100% Compliant</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Reliability Insights:</span>
                <strong style={{ color: "#8C5B23", fontSize: "13px" }}>MTBF +18%</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/ci/standards")}
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "var(--bg-card-subtle)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>Engineering Standards</span>
            <ArrowRight size={14} />
          </button>
        </Card>
      </div>

      {/* CREATE RCA MODAL */}
      {isCreateRcaOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateRcaOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SearchCode size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Log New Root Cause Investigation
                </h2>
              </div>
              <button onClick={() => setIsCreateRcaOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRca} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Investigation Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pasteurizer Holding Tube Temperature Excursion"
                  value={rcaForm.title}
                  onChange={(e) => setRcaForm({ ...rcaForm, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Process Area / Line</label>
                  <select
                    className="form-select"
                    value={rcaForm.area}
                    onChange={(e) => setRcaForm({ ...rcaForm, area: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Aseptic Bottling Line 1">Aseptic Bottling Line 1</option>
                    <option value="Thermal Processing Bay 2">Thermal Processing Bay 2</option>
                    <option value="CIP Sanitation Loop">CIP Sanitation Loop</option>
                    <option value="Packaging & Case Packing">Packaging & Case Packing</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Severity Level</label>
                  <select
                    className="form-select"
                    value={rcaForm.severity}
                    onChange={(e) => setRcaForm({ ...rcaForm, severity: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Critical">Critical (CCP / Quality Impact)</option>
                    <option value="High">High (High Scrap / Downtime)</option>
                    <option value="Medium">Medium (Speed Loss)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Lead Investigator</label>
                <input
                  type="text"
                  value={rcaForm.owner}
                  onChange={(e) => setRcaForm({ ...rcaForm, owner: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Incident Symptom & Preliminary Findings</label>
                <textarea
                  rows={3}
                  placeholder="Describe the initial non-conformance observation, affected batches, and immediate containment..."
                  value={rcaForm.description}
                  onChange={(e) => setRcaForm({ ...rcaForm, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsCreateRcaOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Initiate 8D Investigation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

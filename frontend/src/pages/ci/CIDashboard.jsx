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
  X,
  Gauge,
  Clock,
  Layers,
  Zap,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCI } from "../../context/CIContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";

export function CIDashboard() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { currentPlant } = useMasterData();
  const {
    fleetMTBF,
    fleetMTTR,
    realizedSavingsTotal,
    projectedSavingsTotal,
    badActorsCount,
    openRcaCount,
    activeProjectsCount,
    overdueCapaCount,
    openCapexCount,
    pendingBenefitsCount,
    investigations = [],
    lossRecords = [],
    ciProjects = [],
    standards = [],
    verifiedSolutions = [],
    initiateRCA
  } = useCI();

  const [isCreateRcaOpen, setIsCreateRcaOpen] = useState(false);
  const [rcaForm, setRcaForm] = useState({
    title: "",
    area: "Aseptic Bottling Line 1",
    severity: "High",
    description: ""
  });

  const handleCreateRca = (e) => {
    e.preventDefault();
    if (!rcaForm.title.trim()) {
      addToast("Please provide an investigation title.", "warning");
      return;
    }

    const newId = initiateRCA("AST-002", null, rcaForm.title);
    setIsCreateRcaOpen(false);
    setRcaForm({
      title: "",
      area: "Aseptic Bottling Line 1",
      severity: "High",
      description: ""
    });
    navigate(`/ci/rca/investigations`);
  };

  const handleExportReport = () => {
    const csvContent =
      "Metric,Value,Status\n" +
      `Fleet MTBF,${fleetMTBF} hrs,Dynamic\n` +
      `Fleet MTTR,${fleetMTTR} min,Dynamic\n` +
      `Active RCA Investigations,${openRcaCount},Active\n` +
      `Overdue CAPA Items,${overdueCapaCount},Overdue\n` +
      `Bad Actor Assets,${badActorsCount},Repeat Failures\n` +
      `Active CI Projects,${activeProjectsCount},Active\n` +
      `Realized YTD Savings,$${realizedSavingsTotal.toLocaleString()},Verified\n` +
      `Projected Annual Savings,$${projectedSavingsTotal.toLocaleString()},Target\n` +
      `Open Capex Projects,${openCapexCount},Engineering\n`;

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
            <Badge variant="cyan">CONTINUOUS IMPROVEMENT & RELIABILITY</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportReport} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Executive Report
          </Button>
          <Button variant="secondary" icon={Briefcase} onClick={() => navigate("/ci/projects/actions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            CAPA Actions
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateRcaOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Log RCA Incident
          </Button>
        </div>
      </div>

      {/* KPI Stats - Dynamic and Decision-Oriented */}
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
          title="Fleet MTBF"
          value={`${fleetMTBF} hrs`}
          unit="Mean Time Between Failures"
          trend={{ value: "+18% vs Last Quarter", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
          onClick={() => navigate("/ci/reliability")}
        />
        <StatCard
          title="Fleet MTTR"
          value={`${fleetMTTR} min`}
          unit="Mean Time To Repair"
          trend={{ value: "-12 min benchmark", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
          onClick={() => navigate("/ci/reliability")}
        />
        <StatCard
          title="Realized YTD Savings"
          value={`$${realizedSavingsTotal.toLocaleString()}`}
          unit="Verified Benefit"
          trend={{ value: `$${projectedSavingsTotal.toLocaleString()} Projected`, isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="emerald"
          onClick={() => navigate("/ci/projects/savings")}
        />
        <StatCard
          title="Open RCA Investigations"
          value={`${openRcaCount} Active`}
          unit="RCA 2.0"
          trend={{ value: `${badActorsCount} Bad Actors Identified`, isPositive: false, text: "" }}
          icon={SearchCode}
          colorVariant={openRcaCount > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/ci/rca/investigations")}
        />
      </div>

      {/* Secondary KPI Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <Card
          onClick={() => navigate("/ci/reliability")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Bad Actor Assets</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#EF4444", marginTop: "2px" }}>{badActorsCount} Critical</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Repeat Failures $\ge 2$</div>
          </div>
          <AlertTriangle size={24} color="#EF4444" />
        </Card>

        <Card
          onClick={() => navigate("/ci/projects/actions")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Overdue CAPA Items</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: overdueCapaCount > 0 ? "#D97706" : "#059669", marginTop: "2px" }}>
              {overdueCapaCount} Actions
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Target Date Passed</div>
          </div>
          <CheckCircle size={24} color={overdueCapaCount > 0 ? "#D97706" : "#059669"} />
        </Card>

        <Card
          onClick={() => navigate("/ci/projects/benefits")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Awaiting Verification</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0284C7", marginTop: "2px" }}>{pendingBenefitsCount} Projects</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Ready for GM Lock</div>
          </div>
          <ShieldCheck size={24} color="#0284C7" />
        </Card>

        <Card
          onClick={() => navigate("/ci/engineering")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Engineering Capex</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#8C5B23", marginTop: "2px" }}>{openCapexCount} Open</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Redesign Initiatives</div>
          </div>
          <Zap size={24} color="#C89547" />
        </Card>
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
              <Badge variant="rose">{openRcaCount} PENDING</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {investigations.slice(0, 2).map((inv) => (
                <div
                  key={inv.id}
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
                  <div style={{ minWidth: 0, flex: 1, paddingRight: "8px" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.id} — {inv.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{inv.assetName} • Phase: {inv.currentPhase}</div>
                  </div>
                  <Badge variant={inv.severity === "Critical" ? "rose" : "amber"}>{inv.status.toUpperCase()}</Badge>
                </div>
              ))}
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
            <span>Open RCA 2.0 Hub</span>
            <ArrowRight size={14} />
          </button>
        </Card>

        {/* Module 2: Loss Waterfall */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Operational Loss Waterfall
              </h3>
              <Badge variant="amber">{lossRecords.length} IMPACT ZONES</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {lossRecords.map((loss) => (
                <div key={loss.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{loss.category}:</span>
                  <strong style={{ color: loss.category.includes("Downtime") ? "#DC2626" : loss.category.includes("Quality") ? "#D97706" : "#0284C7", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                    ${loss.financialImpactUSD?.toLocaleString()} ({loss.hoursLost} hrs)
                  </strong>
                </div>
              ))}
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
              <Badge variant="emerald">{activeProjectsCount} ACTIVE</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Realized YTD Benefit:</span>
                <strong style={{ color: "#059669", fontFamily: "var(--font-mono)", fontSize: "13px" }}>${realizedSavingsTotal.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Projected Annual Target:</span>
                <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>${projectedSavingsTotal.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Controlled Standards:</span>
                <strong style={{ color: "#0284C7", fontSize: "13px" }}>{standards.length} SOPs</strong>
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
            <span>View Kaizen Projects</span>
            <ArrowRight size={14} />
          </button>
        </Card>

        {/* Module 4: Engineering & Standards */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Standards & Verified Solutions
              </h3>
              <Badge variant="cyan">ISO 22000</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Verified Solutions:</span>
                <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>{verifiedSolutions.length} Published</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Audited Standards:</span>
                <strong style={{ color: "#059669", fontSize: "13px" }}>100% Compliant</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Engineering Capex:</span>
                <strong style={{ color: "#8C5B23", fontSize: "13px" }}>{openCapexCount} Active</strong>
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
            <span>Controlled Standards</span>
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
                <SearchCode size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
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
                    <option value="Aseptic Bottling Line 1">Line 1 — Aseptic Bottling</option>
                    <option value="Line 2 — Formulation & Pasteurizer">Line 2 — Formulation & Pasteurizer</option>
                    <option value="Line 3 — Canning Line">Line 3 — Canning Line</option>
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

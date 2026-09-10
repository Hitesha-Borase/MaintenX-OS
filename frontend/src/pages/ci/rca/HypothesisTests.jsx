import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Save,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  ArrowRight,
  Plus,
  RotateCcw,
  Sparkles,
  FlaskConical,
  XCircle,
  Search,
  Filter,
  CheckCircle,
  X,
  Trash2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";
import ciService from "../../../services/ciService";

export function HypothesisTests() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { hypotheses = [], investigations = [], validateRootCause, addHypothesis, deleteHypothesis } = useCI();

  const [selectedRcaFilter, setSelectedRcaFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    ciService.getHypotheses(selectedRcaFilter).catch((err) => console.warn("Hypotheses load:", err.message));
  }, [selectedRcaFilter]);

  const [newHyp, setNewHyp] = useState({
    rcaId: investigations[0]?.id || "RCA-2026-001",
    statement: "",
    testMethod: ""
  });

  const handleValidate = async (rcaId, hypId, isConfirmed) => {
    await validateRootCause(rcaId, hypId, isConfirmed);
  };

  const handleDelete = async (id) => {
    await deleteHypothesis(id);
  };

  const handleCreateHypothesis = async (e) => {
    e.preventDefault();
    if (!newHyp.statement.trim() || !newHyp.testMethod.trim()) {
      addToast("Please provide both statement and test method.", "warning");
      return;
    }
    await addHypothesis({
      rcaId: newHyp.rcaId,
      statement: newHyp.statement.trim(),
      testMethod: newHyp.testMethod.trim()
    });
    setIsAddModalOpen(false);
    setNewHyp({
      rcaId: investigations[0]?.id || "RCA-2026-001",
      statement: "",
      testMethod: ""
    });
  };

  const handleExportCSV = () => {
    const headers = "Hypothesis ID,RCA ID,Statement,Test Method,Evidence Result,Validation Status,Validated By,Validated At\n";
    const rows = filteredHypotheses
      .map((h) => `"${h.id}","${h.rcaId}","${h.statement}","${h.testMethod}","${h.evidenceResult || "-"}","${h.validationStatus}","${h.validatedBy || "-"}","${h.validatedAt || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Root_Cause_Hypotheses_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Hypotheses test results exported to CSV.", "info");
  };

  const filteredHypotheses = useMemo(() => {
    return hypotheses.filter((h) => {
      const matchesRca = selectedRcaFilter === "ALL" || h.rcaId === selectedRcaFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        h.statement.toLowerCase().includes(q) ||
        h.testMethod.toLowerCase().includes(q) ||
        h.rcaId.toLowerCase().includes(q);

      return matchesRca && matchesSearch;
    });
  }, [hypotheses, selectedRcaFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              RCA 2.0 — Hypothesis Testing & Cause Validation
            </h1>
            <Badge variant="cyan">CAUSE VALIDATION ENGINE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Formulate Hypothesis
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Test Results
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/evidence")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            View Evidence
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/capa/corrective")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Proceed to CAPA Actions
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
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
          title="Tested Hypotheses"
          value={hypotheses.length.toString()}
          unit="Formulated"
          icon={FlaskConical}
          colorVariant="cyan"
        />
        <StatCard
          title="Validated Root Causes"
          value={hypotheses.filter((h) => h.validationStatus === "Confirmed Root Cause").length.toString()}
          unit="Confirmed"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Refuted Causes"
          value={hypotheses.filter((h) => h.validationStatus === "Refuted").length.toString()}
          unit="Ruled Out"
          icon={XCircle}
          colorVariant="rose"
        />
        <StatCard
          title="Evidence Strength"
          value="Empirical"
          unit="SCADA + Physical"
          icon={Zap}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search hypothesis statement, test method or RCA ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={selectedRcaFilter}
              onChange={(e) => setSelectedRcaFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Active RCAs</option>
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 32)}...</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked RCA</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Hypothesis Statement</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Test Method / Protocol</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Evidence & Result</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Validation Verdict</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHypotheses.map((h) => (
                <tr key={h.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                    {h.rcaId}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                    {h.statement}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {h.testMethod}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: h.validationStatus === "Confirmed Root Cause" ? "#059669" : "var(--text-secondary)", fontWeight: 600 }}>
                    {h.evidenceResult || "Pending trial execution"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={h.validationStatus === "Confirmed Root Cause" ? "emerald" : h.validationStatus === "Refuted" ? "rose" : "amber"}>
                      {h.validationStatus}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => handleValidate(h.rcaId, h.id, true)}
                        title="Confirm & Validate Root Cause"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#059669",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleValidate(h.rcaId, h.id, false)}
                        title="Refute Hypothesis"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#EF4444",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <XCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        title="Delete Hypothesis"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Formulate Hypothesis Modal */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "540px",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FlaskConical size={18} color="#8C5B23" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Formulate Root Cause Hypothesis</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHypothesis} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Linked RCA Investigation</label>
                <select
                  value={newHyp.rcaId}
                  onChange={(e) => setNewHyp({ ...newHyp, rcaId: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)" }}
                >
                  {investigations.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 36)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Hypothesis Statement</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g., Pneumatic actuator air supply starvation caused slow divert response."
                  value={newHyp.statement}
                  onChange={(e) => setNewHyp({ ...newHyp, statement: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Test Method / Protocol</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g., Measure line pressure drop at regulator input during 100% steam call with calibrated digital gauge."
                  value={newHyp.testMethod}
                  onChange={(e) => setNewHyp({ ...newHyp, testMethod: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" icon={Save}>Save Hypothesis</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Save,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Activity,
  Search
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function Evidence() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [evidence, setEvidence] = useState([
    {
      id: 1,
      inv: "INV-802",
      category: "SCADA Telemetry Export",
      description: "SCADA temperature trend log showing 82.9°C at 14:20:15 — 45 sec dip below critical pasteurization threshold.",
      source: "Wonderware Historian SCADA Export (Node-HTST-01)",
      timestamp: "2026-08-28 14:35",
      verified: true
    },
    {
      id: 2,
      inv: "INV-803",
      category: "Laboratory QC Report",
      description: "Optical comparator inspection report of 28mm PCO1881 cap threads revealing 0.42mm pitch variance on Cavity #6.",
      source: "Mitutoyo Shadowgraph QA Station 3",
      timestamp: "2026-08-29 10:12",
      verified: true
    }
  ]);

  const [selectedInvFilter, setSelectedInvFilter] = useState("ALL");
  const [selectedInv, setSelectedInv] = useState("INV-802");
  const [category, setCategory] = useState("SCADA Telemetry Export");
  const [desc, setDesc] = useState("");
  const [source, setSource] = useState("");

  const filteredEvidence = evidence.filter((ev) => {
    return selectedInvFilter === "ALL" || ev.inv === selectedInvFilter;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!desc.trim() || !source.trim()) {
      addToast("Please provide both evidence description and source citation.", "warning");
      return;
    }

    const newItem = {
      id: Date.now(),
      inv: selectedInv,
      category,
      description: desc,
      source,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      verified: true
    };

    setEvidence((prev) => [newItem, ...prev]);
    addToast(`Evidence artifact added to ${selectedInv}!`, "success");
    setDesc("");
    setSource("");
  };

  const handleDelete = (id) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
    addToast("Evidence record archived.", "info");
  };

  const handleExportCSV = () => {
    const headers = "ID,Investigation,Category,Description,Source,Timestamp,Verified\n";
    const rows = filteredEvidence
      .map((ev) => `"${ev.id}","${ev.inv}","${ev.category}","${ev.description}","${ev.source}","${ev.timestamp}","${ev.verified}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Evidence_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Evidence log exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              RCA Evidence Log
            </h1>
            <Badge variant="cyan">{evidence.length} EVIDENCE ARTIFACTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Investigations
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/rca/hypothesis")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Hypothesis Phase
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          title="Total Evidence Items"
          value={evidence.length.toString()}
          unit="Artifacts"
          trend={{ value: "Chain of custody active", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="cyan"
          onClick={() => setSelectedInvFilter("ALL")}
        />
        <StatCard
          title="INV-802 Artifacts"
          value={evidence.filter((e) => e.inv === "INV-802").length.toString()}
          unit="CCP Temp"
          trend={{ value: "Pasteurizer investigation", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="rose"
          onClick={() => setSelectedInvFilter("INV-802")}
        />
        <StatCard
          title="INV-803 Artifacts"
          value={evidence.filter((e) => e.inv === "INV-803").length.toString()}
          unit="Cap NCR"
          trend={{ value: "Capping thread fault", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
          onClick={() => setSelectedInvFilter("INV-803")}
        />
        <StatCard
          title="Chain of Custody"
          value="100%"
          unit="Integrity"
          trend={{ value: "All sources verified & time-stamped", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Filter Row */}
      <Card style={{ padding: "14px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Filter by Case:</span>
            {["ALL", "INV-802", "INV-803"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedInvFilter(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: selectedInvFilter === f ? 800 : 600,
                  backgroundColor: selectedInvFilter === f ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  color: selectedInvFilter === f ? "#261603" : "var(--text-secondary)",
                  border: selectedInvFilter === f ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  background: selectedInvFilter === f ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  cursor: "pointer"
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Showing {filteredEvidence.length} of {evidence.length} records
          </div>
        </div>
      </Card>

      {/* Evidence Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {filteredEvidence.map((ev) => (
          <Card
            key={ev.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "14px",
              padding: "16px",
              boxSizing: "border-box",
              minWidth: 0,
              width: "100%"
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", minWidth: "220px", flex: 1 }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(200, 149, 71, 0.15)",
                  color: "#B27E33",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <FileText size={18} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {ev.inv}
                  </span>
                  <Badge variant="cyan">{ev.category}</Badge>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ev.timestamp}</span>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.5, fontWeight: 500 }}>
                  {ev.description}
                </p>

                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                  Source: <strong style={{ color: "var(--text-secondary)" }}>{ev.source}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge variant="emerald">VERIFIED</Badge>
              <button
                onClick={() => handleDelete(ev.id)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                  cursor: "pointer"
                }}
                title="Archive Evidence"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Evidence Item Form Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Attach & Log Physical Evidence or Digital Telemetry
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label className="form-label">Investigation Incident *</label>
              <select
                value={selectedInv}
                onChange={(e) => setSelectedInv(e.target.value)}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="INV-802">INV-802: HTST Pasteurizer CCP Temp Excursion</option>
                <option value="INV-803">INV-803: Orange Cap Thread Dimension Out-of-Spec</option>
                <option value="INV-804">INV-804: CIP Pump Seal Leakage Incident</option>
              </select>
            </div>

            <div>
              <label className="form-label">Evidence Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                style={{ backgroundColor: "#FFFFFF", height: "38px" }}
              >
                <option value="SCADA Telemetry Export">SCADA Telemetry Export</option>
                <option value="Laboratory QC Report">Laboratory QC Report</option>
                <option value="Physical Sample Photo">Physical Sample Photo / Micrograph</option>
                <option value="Witness Statement">Operator / Technician Witness Statement</option>
                <option value="Calibration Certificate">Calibration Certificate & As-Found Data</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            <div>
              <label className="form-label">Evidence Description & Specific Observation *</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe exact readings, timestamps, defective parameters, or physical wear patterns observed..."
                className="form-textarea"
                rows={3}
                style={{ backgroundColor: "#FFFFFF" }}
                required
              />
            </div>

            <div>
              <label className="form-label">Source System / Measurement Instrument *</label>
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Wonderware Historian DB, Mitutoyo Caliper SN-8812, Batch QC Lab Log..."
                className="form-textarea"
                rows={3}
                style={{ backgroundColor: "#FFFFFF" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
            <button
              type="submit"
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                color: "#261603",
                border: "1px solid #E8C182",
                boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={14} /> Log Evidence Artifact
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

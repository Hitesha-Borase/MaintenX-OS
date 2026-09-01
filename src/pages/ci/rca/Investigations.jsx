import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchCode,
  ChevronRight,
  Plus,
  Download,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function Investigations() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [investigations, setInvestigations] = useState([
    {
      id: "INV-802",
      title: "HTST Pasteurizer CCP Temp Excursion",
      batch: "BAT-2026-0890",
      phase: "Hypothesis & Tests",
      lead: "David Kim",
      daysActive: 3,
      criticality: "Critical"
    },
    {
      id: "INV-803",
      title: "Orange Cap Thread Dimension Out-of-Spec",
      batch: "NCR-402",
      phase: "Evidence",
      lead: "Elena Rostova",
      daysActive: 1,
      criticality: "High"
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("BAT-2026-0892");

  const phases = ["Event", "Evidence", "Hypothesis & Tests", "Occurrence Cause", "Escape Cause", "CAPA"];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast("Please enter an investigation title.", "warning");
      return;
    }

    const id = `INV-${Math.floor(800 + Math.random() * 100)}`;
    setInvestigations((prev) => [
      ...prev,
      {
        id,
        title: newTitle,
        batch: selectedBatch,
        phase: "Event",
        lead: "Alexander Vance",
        daysActive: 0,
        criticality: "High"
      }
    ]);
    addToast(`RCA Investigation ${id} created. Workflow started at Event phase.`, "success");
    setNewTitle("");
  };

  const handleAdvance = (id) => {
    setInvestigations((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const currentIdx = phases.indexOf(inv.phase);
          const nextIdx = Math.min(currentIdx + 1, phases.length - 1);
          const nextPhase = phases[nextIdx];
          addToast(`Investigation ${id} advanced to "${nextPhase}".`, "success");
          return { ...inv, phase: nextPhase };
        }
        return inv;
      })
    );
  };

  const handleExportCSV = () => {
    const headers = "Investigation ID,Title,Source Batch,Current Phase,Lead Investigator,Days Active\n";
    const rows = investigations
      .map((inv) => `"${inv.id}","${inv.title}","${inv.batch}","${inv.phase}","${inv.lead}",${inv.daysActive}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Investigations_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("RCA investigations exported to CSV.", "info");
  };

  const getPhaseRoute = (phase) => {
    switch (phase) {
      case "Evidence":
        return "/ci/rca/evidence";
      case "Hypothesis & Tests":
        return "/ci/rca/hypothesis";
      case "Occurrence Cause":
        return "/ci/rca/occurrence";
      case "Escape Cause":
        return "/ci/rca/escape";
      case "CAPA":
        return "/ci/capa/corrective";
      default:
        return "/ci/rca/investigations";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              RCA 2.0 — Investigations
            </h1>
            <Badge variant="cyan">{investigations.length} ACTIVE INVESTIGATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/evidence")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Evidence Locker
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
          title="Active Investigations"
          value={investigations.length.toString()}
          unit="In-Flight"
          trend={{ value: "Root Cause 8D Workflow", isPositive: true, text: "" }}
          icon={SearchCode}
          colorVariant="rose"
        />
        <StatCard
          title="Critical Incidents"
          value={investigations.filter((i) => i.criticality === "Critical").length.toString()}
          unit="P1 Risk"
          trend={{ value: "CCP Excursion priority", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="amber"
        />
        <StatCard
          title="Avg Phase Velocity"
          value="2.1 Days"
          unit="/ Phase"
          trend={{ value: "Standard SLA: 3 Days", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="CAPA Resolution Rate"
          value="100%"
          unit="Verified"
          trend={{ value: "Zero recurrence in 90d", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Horizontal Scrollable Pipeline Phase Stepper */}
      <Card style={{ padding: "14px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
          Structured 8D Root Cause Workflow Stages
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "4px"
          }}
        >
          {phases.map((phase, idx, arr) => (
            <React.Fragment key={phase}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span style={{ color: "#C89547", fontWeight: 800 }}>D{idx + 1}</span>
                <span>{phase}</span>
              </div>
              {idx < arr.length - 1 && <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Investigation List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {investigations.map((inv) => {
          const isCritical = inv.criticality === "Critical";

          return (
            <Card
              key={inv.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px",
                borderLeft: `4px solid ${isCritical ? "#DC2626" : "#D97706"}`,
                boxSizing: "border-box",
                minWidth: 0,
                width: "100%"
              }}
            >
              <div style={{ minWidth: "220px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <SearchCode size={16} color={isCritical ? "#DC2626" : "#D97706"} />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {inv.id}: {inv.title}
                  </span>
                  <Badge variant={inv.phase === "CAPA" ? "emerald" : inv.phase === "Evidence" ? "amber" : "cyan"}>
                    {inv.phase}
                  </Badge>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span>Source: <strong style={{ color: "var(--text-primary)" }}>{inv.batch}</strong></span>
                  <span>Lead: <strong style={{ color: "var(--text-primary)" }}>{inv.lead}</strong></span>
                  <span>Active: <strong style={{ color: "#C89547" }}>{inv.daysActive}d</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate(getPhaseRoute(inv.phase))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-card-subtle)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <span>Open Phase Hub</span>
                  <ExternalLink size={12} />
                </button>

                <button
                  onClick={() => handleAdvance(inv.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                    color: "#261603",
                    border: "1px solid #E8C182",
                    boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <span>Advance Phase</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create New Investigation Form Card */}
      <Card style={{ padding: "16px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "10px" }}>
          Initiate New RCA 2.0 Investigation
        </div>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%" }}>
          <input
            type="text"
            placeholder="Enter incident non-conformance or defect title (e.g. Micro-Leak in Heat Exchanger)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: "220px", height: "38px", backgroundColor: "#FFFFFF", fontSize: "12px", borderRadius: "8px" }}
            required
          />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="form-select"
            style={{ minWidth: "140px", height: "38px", backgroundColor: "#FFFFFF", fontSize: "12px", borderRadius: "8px" }}
          >
            <option value="BAT-2026-0892">BAT-2026-0892</option>
            <option value="BAT-2026-0893">BAT-2026-0893</option>
            <option value="NCR-403">NCR-403</option>
            <option value="AUDIT-2026">AUDIT-2026</option>
          </select>
          <button
            type="submit"
            style={{
              padding: "0 16px",
              height: "38px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              border: "1px solid #E8C182",
              boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Plus size={14} /> Start Investigation
          </button>
        </form>
      </Card>
    </div>
  );
}

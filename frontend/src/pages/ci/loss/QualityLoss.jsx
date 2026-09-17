import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Download,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  SearchCode,
  ShieldCheck,
  Percent,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useCI } from "../../../context/CIContext";
import { ciService } from "../../../services/ciService";

export function QualityLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    lossRecords = [],
    createLoss,
    deleteLoss,
    refreshLosses,
    initiateRCA
  } = useCI();

  useEffect(() => {
    refreshLosses?.();
  }, [refreshLosses]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    category: "Quality Loss",
    stage: "PROCESSING",
    assetId: "AST-002",
    lineId: "LIN-01",
    hoursLost: "0",
    unitsLost: "",
    financialImpactUSD: ""
  });

  const qualityLosses = useMemo(() => {
    return lossRecords.filter((l) => {
      const cat = (l.category || "").toLowerCase();
      return cat.includes("quality") || cat.includes("defect") || cat.includes("reject");
    });
  }, [lossRecords]);

  const totalQualityCost = useMemo(() => {
    return qualityLosses.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [qualityLosses]);

  const totalUnitsLost = useMemo(() => {
    return qualityLosses.reduce((acc, l) => acc + (Number(l.unitsLost) || 0), 0);
  }, [qualityLosses]);

  const fpyPercentage = useMemo(() => {
    if (totalUnitsLost === 0) return "100.0%";
    const standardVolume = 50000;
    const rate = Math.max(90, ((standardVolume - totalUnitsLost) / standardVolume) * 100);
    return `${rate.toFixed(1)}%`;
  }, [totalUnitsLost]);

  const qualityCauses = useMemo(() => {
    if (qualityLosses.length === 0) return [];
    return qualityLosses.map((q) => ({
      id: q.id,
      cause: q.eventName || q.category,
      pct: totalQualityCost > 0 ? `${Math.round(((q.financialImpactUSD || 0) / totalQualityCost) * 100)}%` : "0%",
      batch: q.assetId || "Batch NCR",
      stage: q.stage || "PROCESSING",
      units: q.unitsLost || 0,
      cost: `$${(Number(q.financialImpactUSD) || 0).toLocaleString()}`,
      status: q.linkedRcaId ? "Under RCA 2.0" : "Quarantined",
      linkedRcaId: q.linkedRcaId
    }));
  }, [qualityLosses, totalQualityCost]);

  const handleExportCSV = () => {
    const headers = "Defect Cause,Stage,Affected Batch,Units Rejected,Financial Loss,OEE Impact %,Disposition\n";
    const rows = qualityCauses
      .map((q) => `"${q.cause}","${q.stage}","${q.batch}",${q.units},"${q.cost}","${q.pct}","${q.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quality_Loss_Analysis_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Quality loss analysis exported to CSV.", "info");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName.trim()) {
      addToast("Please provide a quality defect description.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await createLoss({
        eventName: formData.eventName.trim(),
        category: "Quality Loss",
        stage: formData.stage,
        assetId: formData.assetId || "AST-002",
        lineId: formData.lineId || "LIN-01",
        hoursLost: 0,
        unitsLost: Number(formData.unitsLost) || 0,
        financialImpactUSD: Number(formData.financialImpactUSD) || 0
      });
      setIsCreateModalOpen(false);
      setFormData({
        eventName: "",
        category: "Quality Loss",
        stage: "PROCESSING",
        assetId: "AST-002",
        lineId: "LIN-01",
        hoursLost: "0",
        unitsLost: "",
        financialImpactUSD: ""
      });
    } catch (err) {
      console.error("Create quality loss error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete quality defect record "${name || id}"?`)) {
      await deleteLoss(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Quality Loss Analysis
            </h1>
            <Badge variant={totalQualityCost > 0 ? "amber" : "emerald"}>
              {totalQualityCost > 0 ? `$${totalQualityCost.toLocaleString()} QUALITY GAP` : "100% QUALITY CONFORMANCE"}
            </Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            First Pass Yield (FPY), batch deviations, out-of-spec quarantine, and thermal hold defects.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Log Quality Incident
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            RCA Investigations
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/loss/yield")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Yield Loss Hub
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
          title="Total Quality Loss"
          value={`$${totalQualityCost.toLocaleString()}`}
          unit="Financial Loss"
          trend={{ value: totalQualityCost > 0 ? "Non-conformance cost logged" : "Zero quality loss logged", isPositive: totalQualityCost === 0, text: "" }}
          icon={ShieldAlert}
          colorVariant={totalQualityCost > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Batch Non-Conformances"
          value={qualityLosses.length.toString()}
          unit="Incidents"
          trend={{ value: qualityLosses.length > 0 ? "Under review / disposition" : "Zero non-conformances", isPositive: qualityLosses.length === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={qualityLosses.length > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="First Pass Yield (FPY)"
          value={fpyPercentage}
          unit="Quality Rate"
          trend={{ value: totalUnitsLost > 0 ? "Slight scrap/rework impact" : "100% Conformance", isPositive: totalUnitsLost === 0, text: "" }}
          icon={Percent}
          colorVariant="cyan"
        />
        <StatCard
          title="Defective Units"
          value={totalUnitsLost.toLocaleString()}
          unit="Units Rejected"
          trend={{ value: totalUnitsLost > 0 ? "Quarantined material" : "Zero scrap", isPositive: totalUnitsLost === 0, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Quality Loss Breakdown Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Root Quality Loss Pareto Causes
          </h3>
          <Badge variant="cyan">{qualityCauses.length} INCIDENTS LOGGED</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {qualityCauses.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No quality loss incidents recorded in current cycle.
            </div>
          ) : (
            qualityCauses.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {q.cause}
                    </span>
                    <Badge variant={q.stage === "PROCESSING" ? "amber" : "cyan"}>
                      {q.stage}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span>ID: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{q.id}</strong></span>
                    <span>Batch/Asset: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{q.batch}</strong></span>
                    <span>Units Rejected: <strong style={{ color: "var(--text-primary)" }}>{Number(q.units).toLocaleString()}</strong></span>
                    <span>Financial Loss: <strong style={{ color: "#DC2626" }}>{q.cost}</strong></span>
                    <span>Status: <strong style={{ color: "#8C5B23" }}>{q.status}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#DC2626", fontFamily: "var(--font-mono)" }}>
                    {q.pct}
                  </span>

                  <button
                    onClick={() => {
                      if (q.linkedRcaId) {
                        navigate("/ci/rca/investigations");
                      } else {
                        initiateRCA(q.batch, null, `Quality Deviation — ${q.cause}`);
                        navigate("/ci/rca/investigations");
                      }
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: "var(--bg-card-subtle)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <SearchCode size={12} />
                    <span>RCA 8D</span>
                  </button>

                  <button
                    onClick={() => handleDelete(q.id, q.cause)}
                    title="Delete quality incident"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      backgroundColor: "transparent",
                      color: "#DC2626",
                      border: "1px solid rgba(220, 38, 38, 0.2)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* LOG QUALITY INCIDENT MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "14px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={20} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log Quality Non-Conformance Incident
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Defect Cause / Non-Conformance *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pasteurizer Thermal Hold Deviation"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Plant Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="PROCESSING">Processing Hall</option>
                    <option value="PACKAGING">Packaging Lines</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Line ID
                  </label>
                  <select
                    value={formData.lineId}
                    onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="LIN-01">Line 1 — Production</option>
                    <option value="LIN-02">Line 2 — High Speed PET</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Affected Asset / Batch Equipment
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="PROC-PAST-01">PROC-PAST-01 (HTST Pasteurizer Unit)</option>
                  <option value="PROC-MIX-01">PROC-MIX-01 (High-Shear Batch Mixer)</option>
                  <option value="PROC-COOK-01">PROC-COOK-01 (Vacuum Deaerator)</option>
                  <option value="PACK-FILL-01">PACK-FILL-01 (Rotary Aseptic Filler)</option>
                  <option value="PACK-CAPP-01">PACK-CAPP-01 (High-Speed Capper)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Defective Units Quarantined *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1200"
                    value={formData.unitsLost}
                    onChange={(e) => setFormData({ ...formData, unitsLost: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Financial Loss ($) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1450"
                    value={formData.financialImpactUSD}
                    onChange={(e) => setFormData({ ...formData, financialImpactUSD: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Log Quality Incident to DB"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


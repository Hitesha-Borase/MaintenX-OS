import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  Download,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  Plus,
  Trash2,
  X,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useCI } from "../../../context/CIContext";
import { ciService } from "../../../services/ciService";

export function ProductionLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    lossRecords = [],
    createLoss,
    deleteLoss,
    refreshLosses,
    availableAssets = [],
    availableLines = []
  } = useCI();

  useEffect(() => {
    refreshLosses?.();
  }, [refreshLosses]);

  const [timeRange, setTimeRange] = useState("Active Operational Cycle");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    category: "Downtime Loss",
    stage: "PACKAGING",
    assetId: "AST-001",
    lineId: "LIN-01",
    hoursLost: "",
    unitsLost: "",
    financialImpactUSD: ""
  });

  const totalUnitsLost = useMemo(() => {
    return lossRecords.reduce((acc, l) => acc + (Number(l.unitsLost) || 0), 0);
  }, [lossRecords]);

  const totalFinancialLoss = useMemo(() => {
    return lossRecords.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [lossRecords]);

  const totalHoursLost = useMemo(() => {
    return lossRecords.reduce((acc, l) => acc + (Number(l.hoursLost) || 0), 0);
  }, [lossRecords]);

  const lossCauses = useMemo(() => {
    if (lossRecords.length === 0) return [];
    return lossRecords.map((item) => ({
      id: item.id,
      cause: item.eventName || item.category,
      category: item.category,
      stage: item.stage || "PACKAGING",
      assetId: item.assetId,
      percentage: totalFinancialLoss > 0
        ? `${Math.round(((item.financialImpactUSD || 0) / totalFinancialLoss) * 100)}%`
        : "0%",
      volume: `${(Number(item.unitsLost) || 0).toLocaleString()} Units`,
      cost: `$${(Number(item.financialImpactUSD) || 0).toLocaleString()}`,
      route: item.category?.toLowerCase().includes("quality")
        ? "/ci/loss/quality"
        : item.category?.toLowerCase().includes("yield")
        ? "/ci/loss/yield"
        : item.category?.toLowerCase().includes("scrap")
        ? "/ci/loss/scrap"
        : "/ci/loss/downtime"
    }));
  }, [lossRecords, totalFinancialLoss]);

  const handleExportCSV = () => {
    const headers = "Loss ID,Event Name,Category,Stage,Asset,Lost Units,Financial Loss ($),OEE Impact %\n";
    const rows = lossCauses
      .map((l) => `"${l.id}","${l.cause}","${l.category}","${l.stage}","${l.assetId}","${l.volume}","${l.cost}","${l.percentage}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Production_Loss_Waterfall_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Production Loss Waterfall exported to CSV.", "info");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName.trim()) {
      addToast("Please provide a loss event description.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await createLoss({
        eventName: formData.eventName.trim(),
        category: formData.category,
        stage: formData.stage,
        assetId: formData.assetId || "AST-001",
        lineId: formData.lineId || "LIN-01",
        hoursLost: Number(formData.hoursLost) || 0,
        unitsLost: Number(formData.unitsLost) || 0,
        financialImpactUSD: Number(formData.financialImpactUSD) || 0
      });
      setIsCreateModalOpen(false);
      setFormData({
        eventName: "",
        category: "Downtime Loss",
        stage: "PACKAGING",
        assetId: "AST-001",
        lineId: "LIN-01",
        hoursLost: "",
        unitsLost: "",
        financialImpactUSD: ""
      });
    } catch (err) {
      console.error("Create loss error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete loss record "${name || id}"?`)) {
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
              Production Loss Analysis
            </h1>
            <Badge variant={totalFinancialLoss > 0 ? "rose" : "emerald"}>
              {totalFinancialLoss > 0 ? `$${totalFinancialLoss.toLocaleString()} LOGGED LOSS` : "ZERO UNPLANNED LOSS"}
            </Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Enterprise six-loss waterfall: Direct downtime, quality defects, yield giveaway, and line scrap.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Log Loss Incident
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/loss/downtime")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Downtime Breakdown
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
          title="Recorded Incidents"
          value={lossRecords.length.toString()}
          unit="Events"
          trend={{ value: lossRecords.length > 0 ? "Under active tracking" : "Clean operational baseline", isPositive: lossRecords.length === 0, text: "" }}
          icon={Factory}
          colorVariant="cyan"
        />
        <StatCard
          title="Lost Production Hours"
          value={`${totalHoursLost.toFixed(1)} hrs`}
          unit="Aggregate Hours"
          trend={{ value: totalHoursLost > 0 ? "Production stoppage logged" : "Zero stoppage", isPositive: totalHoursLost === 0, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Units Lost"
          value={totalUnitsLost.toLocaleString()}
          unit="Units"
          trend={{ value: totalUnitsLost > 0 ? "Volume deficit" : "Zero unit loss", isPositive: totalUnitsLost === 0, text: "" }}
          icon={TrendingDown}
          colorVariant={totalUnitsLost > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Financial Loss"
          value={`$${totalFinancialLoss.toLocaleString()}`}
          unit="Direct Impact"
          trend={{ value: totalFinancialLoss > 0 ? "Direct downtime value" : "Zero loss logged", isPositive: totalFinancialLoss === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={totalFinancialLoss > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Loss Waterfall Breakdown Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={18} color="#B27E33" />
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              Weekly Production Loss Waterfall
            </h3>
          </div>
          <Badge variant="cyan">{lossCauses.length} INCIDENTS LOGGED</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {lossCauses.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No production loss events recorded in current cycle.
            </div>
          ) : (
            lossCauses.map((item) => (
              <div
                key={item.id}
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
                <div style={{ minWidth: "200px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {item.cause}
                    </span>
                    <Badge variant={item.stage === "PROCESSING" ? "amber" : "cyan"}>
                      {item.stage}
                    </Badge>
                    <Badge variant="slate">{item.category}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span>ID: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{item.id}</strong></span>
                    <span>Lost Units: <strong style={{ color: "var(--text-primary)" }}>{item.volume}</strong></span>
                    <span>Financial Impact: <strong style={{ color: "#DC2626" }}>{item.cost}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#DC2626", fontFamily: "var(--font-mono)" }}>
                    {item.percentage}
                  </span>

                  <button
                    onClick={() => navigate(item.route)}
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
                    <span>Drill Down</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.cause)}
                    title="Delete loss record"
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
      {/* LOG LOSS INCIDENT MODAL */}
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
                <AlertTriangle size={20} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log Production Loss Incident
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
                  Event / Incident Description *
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
                    Loss Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="Downtime Loss">Downtime Loss</option>
                    <option value="Quality Loss">Quality Loss</option>
                    <option value="Yield Loss">Yield Loss</option>
                    <option value="Scrap Loss">Scrap Loss</option>
                    <option value="Rework Loss">Rework Loss</option>
                    <option value="Mass-Balance Loss">Mass-Balance Loss</option>
                  </select>
                </div>

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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Asset / Equipment
                  </label>
                  <select
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="AST-001">AST-001 (High-Shear Batch Mixer)</option>
                    <option value="AST-002">AST-002 (HTST Pasteurizer Unit)</option>
                    <option value="AST-003">AST-003 (Vacuum Deaerator & Cooker)</option>
                    <option value="AST-004">AST-004 (Rotary Aseptic Filler)</option>
                    <option value="AST-005">AST-005 (High-Speed Capper)</option>
                    <option value="AST-006">AST-006 (Case Packer L1)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Line
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Hours Lost
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.5"
                    value={formData.hoursLost}
                    onChange={(e) => setFormData({ ...formData, hoursLost: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Units Lost
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.unitsLost}
                    onChange={(e) => setFormData({ ...formData, unitsLost: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Financial ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="750"
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
                  {isSubmitting ? "Saving..." : "Save to Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


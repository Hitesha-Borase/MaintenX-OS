import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Download,
  Percent,
  ArrowRight,
  TrendingUp,
  Droplets,
  Scale,
  Sparkles,
  Layers,
  FlaskConical,
  Package,
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

export function YieldLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    lossRecords = [],
    createLoss,
    deleteLoss,
    refreshLosses
  } = useCI();

  const [selectedStage, setSelectedStage] = useState("ALL"); // ALL | PROCESSING | PACKAGING
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    category: "Yield Loss",
    stage: "PROCESSING",
    assetId: "PROC-COOK-01",
    lineId: "LIN-01",
    hoursLost: "0",
    unitsLost: "",
    financialImpactUSD: ""
  });

  useEffect(() => {
    refreshLosses?.();
  }, [refreshLosses]);

  const yieldLossRecords = useMemo(() => {
    return lossRecords.filter((l) => {
      const cat = (l.category || "").toLowerCase();
      const matchCat = cat.includes("yield") || cat.includes("speed") || cat.includes("mass") || cat.includes("balance");
      const matchStage = selectedStage === "ALL" || (l.stage || "PROCESSING") === selectedStage;
      return matchCat && matchStage;
    });
  }, [lossRecords, selectedStage]);

  const totalYieldCost = useMemo(() => {
    return yieldLossRecords.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [yieldLossRecords]);

  const totalUnitsLost = useMemo(() => {
    return yieldLossRecords.reduce((acc, l) => acc + (Number(l.unitsLost) || 0), 0);
  }, [yieldLossRecords]);

  const yieldPercentage = useMemo(() => {
    if (totalUnitsLost === 0) return "100.0%";
    const baseline = selectedStage === "PROCESSING" ? 25000 : 35000;
    const rate = Math.max(90, ((baseline - totalUnitsLost) / baseline) * 100);
    return `${rate.toFixed(1)}%`;
  }, [totalUnitsLost, selectedStage]);

  const yieldLosses = useMemo(() => {
    if (yieldLossRecords.length === 0) return [];
    return yieldLossRecords.map((y) => ({
      id: y.id,
      source: y.eventName || y.category,
      stage: y.stage || (y.eventName?.toLowerCase().includes("filler") ? "PACKAGING" : "PROCESSING"),
      pct: totalYieldCost > 0 ? `${Math.round(((y.financialImpactUSD || 0) / totalYieldCost) * 100)}%` : "0%",
      volume: `${(Number(y.unitsLost) || 0).toLocaleString()} ${y.stage === "PROCESSING" ? "kg / L" : "Units"}`,
      cost: `$${(Number(y.financialImpactUSD) || 0).toLocaleString()}`,
      category: y.category || "Yield Deviation",
      assetId: y.assetId || "PROC-MIX-01"
    }));
  }, [yieldLossRecords, totalYieldCost]);

  const handleExportCSV = () => {
    const headers = "Loss ID,Yield Loss Point,Stage,Asset ID,Yield Loss %,Volume Lost,Financial Impact,Category\n";
    const rows = yieldLosses
      .map((y) => `"${y.id}","${y.source}","${y.stage}","${y.assetId}","${y.pct}","${y.volume}","${y.cost}","${y.category}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Yield_Loss_Analysis_${selectedStage}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Yield loss breakdown exported to CSV.", "info");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName.trim()) {
      addToast("Please provide a yield deviation name.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await createLoss({
        eventName: formData.eventName.trim(),
        category: formData.category,
        stage: formData.stage,
        assetId: formData.assetId || "PROC-COOK-01",
        lineId: formData.lineId || "LIN-01",
        hoursLost: 0,
        unitsLost: Number(formData.unitsLost) || 0,
        financialImpactUSD: Number(formData.financialImpactUSD) || 0
      });
      setIsCreateModalOpen(false);
      setFormData({
        eventName: "",
        category: "Yield Loss",
        stage: "PROCESSING",
        assetId: "PROC-COOK-01",
        lineId: "LIN-01",
        hoursLost: "0",
        unitsLost: "",
        financialImpactUSD: ""
      });
    } catch (err) {
      console.error("Create yield loss error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete yield loss stream "${name || id}"?`)) {
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
              Yield & Mass-Balance Loss
            </h1>
            <Badge variant={totalYieldCost > 0 ? "amber" : "emerald"}>{yieldPercentage} MATERIAL YIELD</Badge>
            <Badge variant={selectedStage === "PROCESSING" ? "amber" : selectedStage === "PACKAGING" ? "cyan" : "slate"}>
              {selectedStage === "ALL" ? "PLANT-WIDE" : selectedStage}
            </Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Mass-Balance accountability: Bulk ingredient intake vs Processing Hall yield vs Packaging overfill.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Stage Filter Buttons */}
          <div style={{ display: "flex", backgroundColor: "var(--bg-card-subtle)", padding: "2px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setSelectedStage("ALL")}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedStage === "ALL" ? "var(--bg-surface)" : "transparent",
                color: selectedStage === "ALL" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: selectedStage === "ALL" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              All Stages
            </button>
            <button
              onClick={() => setSelectedStage("PROCESSING")}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedStage === "PROCESSING" ? "#D97706" : "transparent",
                color: selectedStage === "PROCESSING" ? "#FFFFFF" : "var(--text-muted)",
                boxShadow: selectedStage === "PROCESSING" ? "0 1px 3px rgba(0,0,0,0.15)" : "none"
              }}
            >
              Processing Mass-Balance
            </button>
            <button
              onClick={() => setSelectedStage("PACKAGING")}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedStage === "PACKAGING" ? "#0284C7" : "transparent",
                color: selectedStage === "PACKAGING" ? "#FFFFFF" : "var(--text-muted)",
                boxShadow: selectedStage === "PACKAGING" ? "0 1px 3px rgba(0,0,0,0.15)" : "none"
              }}
            >
              Packaging Giveaway
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Log Yield Loss
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/loss/scrap")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Scrap & Rework Hub
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
          title={selectedStage === "PROCESSING" ? "Processing Recipe Mass" : "Theoretical Mass Baseline"}
          value="100%"
          unit="Stoichiometric"
          trend={{ value: "Ideal mass conversion baseline", isPositive: true, text: "" }}
          icon={Scale}
          colorVariant="cyan"
        />
        <StatCard
          title={selectedStage === "PROCESSING" ? "Batch Yield Achieved" : "Actual Material Yield"}
          value={yieldPercentage}
          unit="Achieved"
          trend={{ value: totalYieldCost > 0 ? "Loss streams detected" : "100% Conversion", isPositive: totalYieldCost === 0, text: "" }}
          icon={Sparkles}
          colorVariant="emerald"
        />
        <StatCard
          title="Mass-Balance Gap"
          value={totalYieldCost > 0 ? `${(100 - parseFloat(yieldPercentage)).toFixed(1)}%` : "0.0%"}
          unit={selectedStage === "PROCESSING" ? "Evaporation / Heel" : "Giveaway Gap"}
          trend={{ value: `${totalUnitsLost.toLocaleString()} units logged`, isPositive: totalUnitsLost === 0, text: "" }}
          icon={Droplets}
          colorVariant={totalYieldCost > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Yield Financial Loss"
          value={`$${totalYieldCost.toLocaleString()}`}
          unit="Direct Loss"
          trend={{ value: totalYieldCost > 0 ? "Recoverable ingredient value" : "Zero financial loss", isPositive: totalYieldCost === 0, text: "" }}
          icon={TrendingUp}
          colorVariant={totalYieldCost > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Processing Mass-Balance Deep Dive Callout */}
      {selectedStage !== "PACKAGING" && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "12px",
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FlaskConical size={20} style={{ color: "#B45309" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E" }}>
                Processing Mass-Balance Accountability Active
              </div>
              <div style={{ fontSize: "12px", color: "#B45309" }}>
                Tracks ingredient weighing scaling variance, thermal cooking evaporation shrinkage, and holding tank heel flushes.
              </div>
            </div>
          </div>
          <Badge variant="amber">WIP BUFFER TRACKED</Badge>
        </div>
      )}

      {/* Yield Loss Breakdown Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={16} style={{ color: "var(--text-secondary)" }} />
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              {selectedStage === "PROCESSING" ? "Processing Mass-Balance Loss Streams" : selectedStage === "PACKAGING" ? "Packaging Giveaway & Spillage Streams" : "Plant-Wide Yield Loss Breakdown"}
            </h3>
          </div>
          <Badge variant="cyan">{yieldLosses.length} LOSS STREAMS LOGGED</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {yieldLosses.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No yield loss streams or material deviations recorded for {selectedStage}.
            </div>
          ) : (
            yieldLosses.map((y) => (
              <div
                key={y.id}
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
                      {y.source}
                    </span>
                    <Badge variant={y.stage === "PROCESSING" ? "amber" : "cyan"}>
                      {y.stage}
                    </Badge>
                    <Badge variant="slate">{y.category}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span>ID: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{y.id}</strong></span>
                    <span>Asset: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{y.assetId}</strong></span>
                    <span>Volume Lost: <strong style={{ color: "var(--text-primary)" }}>{y.volume}</strong></span>
                    <span>Financial Impact: <strong style={{ color: "#8C5B23" }}>{y.cost}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                    {y.pct}
                  </span>

                  <button
                    onClick={() => navigate("/ci/projects/list")}
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
                    <span>Kaizen Project</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() => handleDelete(y.id, y.source)}
                    title="Delete yield stream"
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
      {/* LOG YIELD DEVIATION MODAL */}
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
                <TrendingUp size={20} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log Yield / Mass-Balance Deviation
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
                  Yield Deviation Stream Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacuum Deaerator Thermal Evaporation Shrinkage"
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
                    Deviation Type
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="Yield Loss">Yield Loss</option>
                    <option value="Mass-Balance Loss">Mass-Balance Loss</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Equipment / Asset
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="PROC-COOK-01">PROC-COOK-01 (Vacuum Deaerator & Cooker)</option>
                  <option value="PROC-MIX-01">PROC-MIX-01 (High-Shear Batch Mixer)</option>
                  <option value="PROC-PAST-01">PROC-PAST-01 (HTST Pasteurizer)</option>
                  <option value="PACK-FILL-01">PACK-FILL-01 (Rotary Aseptic Filler)</option>
                  <option value="HT-102">HT-102 (Holding Tank 02)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Volume Lost (kg / L / Units) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="850"
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
                    placeholder="1280"
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
                  {isSubmitting ? "Saving..." : "Log Yield Deviation to DB"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


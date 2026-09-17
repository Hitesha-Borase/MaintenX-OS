import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Download,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  SearchCode,
  Layers,
  Package,
  FlaskConical,
  Plus,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useCI } from "../../../context/CIContext";
import { ciService } from "../../../services/ciService";

export function ScrapReworkLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    lossRecords = [],
    createLoss,
    deleteLoss,
    refreshLosses,
    initiateRCA
  } = useCI();

  const [selectedStage, setSelectedStage] = useState("ALL"); // ALL | PACKAGING | PROCESSING
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    category: "Scrap Loss",
    stage: "PACKAGING",
    assetId: "PACK-FILL-01",
    lineId: "LIN-01",
    hoursLost: "0",
    unitsLost: "",
    financialImpactUSD: ""
  });

  useEffect(() => {
    refreshLosses?.();
  }, [refreshLosses]);

  const scrapLossRecords = useMemo(() => {
    return lossRecords.filter((l) => {
      const cat = (l.category || "").toLowerCase();
      const matchCat =
        cat.includes("scrap") ||
        cat.includes("rework") ||
        cat.includes("defect") ||
        cat.includes("reject");
      const matchStage = selectedStage === "ALL" || (l.stage || "PACKAGING") === selectedStage;
      return matchCat && matchStage;
    });
  }, [lossRecords, selectedStage]);

  const totalScrapCost = useMemo(() => {
    return scrapLossRecords.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [scrapLossRecords]);

  const totalUnitsLost = useMemo(() => {
    return scrapLossRecords.reduce((acc, l) => acc + (Number(l.unitsLost) || 0), 0);
  }, [scrapLossRecords]);

  const scrapEvents = useMemo(() => {
    if (scrapLossRecords.length === 0) return [];
    return scrapLossRecords.map((ev) => ({
      id: ev.id,
      batch: ev.assetId || "NCR Log",
      stage: ev.stage || (ev.eventName?.toLowerCase().includes("mix") || ev.eventName?.toLowerCase().includes("past") ? "PROCESSING" : "PACKAGING"),
      reason: ev.eventName || ev.category,
      cost: `$${(Number(ev.financialImpactUSD) || 0).toLocaleString()}`,
      units: Number(ev.unitsLost) || 0,
      disposition: ev.linkedRcaId ? "Quarantined for RCA Investigation" : "Disposition Pending",
      rcaRef: ev.linkedRcaId || "Pending",
      status: ev.category?.toLowerCase().includes("rework") ? "Rework" : "Scrap",
      linkedRcaId: ev.linkedRcaId
    }));
  }, [scrapLossRecords]);

  const handleExportCSV = () => {
    const headers = "Loss ID,Asset / Batch ID,Stage,Failure Reason,Units Lost,Financial Loss,Disposition,RCA Reference,Category\n";
    const rows = scrapEvents
      .map((s) => `"${s.id}","${s.batch}","${s.stage}","${s.reason}",${s.units},"${s.cost}","${s.disposition}","${s.rcaRef}","${s.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Scrap_Rework_Loss_${selectedStage}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Scrap & Rework logs exported to CSV.", "info");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName.trim()) {
      addToast("Please provide a reason / event description.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await createLoss({
        eventName: formData.eventName.trim(),
        category: formData.category,
        stage: formData.stage,
        assetId: formData.assetId || "PACK-FILL-01",
        lineId: formData.lineId || "LIN-01",
        hoursLost: 0,
        unitsLost: Number(formData.unitsLost) || 0,
        financialImpactUSD: Number(formData.financialImpactUSD) || 0
      });
      setIsCreateModalOpen(false);
      setFormData({
        eventName: "",
        category: "Scrap Loss",
        stage: "PACKAGING",
        assetId: "PACK-FILL-01",
        lineId: "LIN-01",
        hoursLost: "0",
        unitsLost: "",
        financialImpactUSD: ""
      });
    } catch (err) {
      console.error("Create scrap loss error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete scrap/rework record "${name || id}"?`)) {
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
              Scrap & Rework Loss
            </h1>
            <Badge variant={totalScrapCost > 0 ? "rose" : "emerald"}>
              {totalScrapCost > 0 ? `$${totalScrapCost.toLocaleString()} DISPOSITION LOSS` : "ZERO SCRAP LOSS"}
            </Badge>
            <Badge variant={selectedStage === "PACKAGING" ? "cyan" : selectedStage === "PROCESSING" ? "amber" : "slate"}>
              {selectedStage === "ALL" ? "PLANT-WIDE" : selectedStage}
            </Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Packaging material defects (bottles, caps, corrugate) & Processing batch rework quarantine.
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
              Packaging Scrap & Rejects
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
              Processing Rework
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Log Scrap / Rework
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/loss/yield")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Yield Loss
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            CI Kaizen Projects
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
          title={selectedStage === "PACKAGING" ? "Packaging Scrap Impact" : "Total Scrap Impact"}
          value={`$${totalScrapCost.toLocaleString()}`}
          unit="Financial Loss"
          trend={{ value: totalScrapCost > 0 ? "Scrap write-off cost" : "Zero scrap logged", isPositive: totalScrapCost === 0, text: "" }}
          icon={Trash2}
          colorVariant={totalScrapCost > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title={selectedStage === "PACKAGING" ? "Defect Units Disposed" : "Scrapped Units"}
          value={totalUnitsLost.toLocaleString()}
          unit={selectedStage === "PROCESSING" ? "Liters / kg" : "Units"}
          trend={{ value: totalUnitsLost > 0 ? "Volume rejected" : "Zero unit loss", isPositive: totalUnitsLost === 0, text: "" }}
          icon={RotateCcw}
          colorVariant={totalUnitsLost > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Logged Events"
          value={scrapEvents.length.toString()}
          unit="NCRs / Events"
          trend={{ value: scrapEvents.length > 0 ? "Under active tracking" : "Clean operational run", isPositive: scrapEvents.length === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={scrapEvents.length > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Material Recovery"
          value={totalScrapCost === 0 ? "100.0%" : "96.5%"}
          unit="Yield Saved"
          trend={{ value: totalScrapCost === 0 ? "Zero material loss" : "Active salvage control", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Packaging Rejects Callout */}
      {selectedStage !== "PROCESSING" && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "12px",
            backgroundColor: "#F0F9FF",
            border: "1px solid #BAE6FD",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Package size={20} style={{ color: "#0284C7" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0369A1" }}>
                Packaging Line Scrap & Defect Monitoring Active
              </div>
              <div style={{ fontSize: "12px", color: "#0284C7" }}>
                Tracks preform neck ovality, capper stripped thread scrap, vision reject bottles, and outer case packer corrugate jams.
              </div>
            </div>
          </div>
          <Badge variant="cyan">LINE SCRAP COUNTERS LIVE</Badge>
        </div>
      )}

      {/* Scrap & Rework Events Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={16} style={{ color: "var(--text-secondary)" }} />
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              {selectedStage === "PACKAGING" ? "Packaging Line Scrap & Rejects" : selectedStage === "PROCESSING" ? "Processing Off-Spec Rework Records" : "Logged Scrap & Rework Disposition Records"}
            </h3>
          </div>
          <Badge variant="cyan">{scrapEvents.length} DISPOSITION EVENTS LOGGED</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {scrapEvents.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No scrap or rework disposition records logged for {selectedStage}.
            </div>
          ) : (
            scrapEvents.map((ev) => {
              const isScrap = ev.status === "Scrap";

              return (
                <div
                  key={ev.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: isScrap ? "1px solid rgba(220, 38, 38, 0.3)" : "1px solid rgba(217, 119, 6, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  <div style={{ minWidth: "220px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {ev.batch}
                      </span>
                      <Badge variant={ev.stage === "PROCESSING" ? "amber" : "cyan"}>
                        {ev.stage}
                      </Badge>
                      <Badge variant={isScrap ? "rose" : "amber"}>{ev.status}</Badge>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {ev.disposition}
                      </span>
                    </div>

                    <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", fontWeight: 600 }}>
                      {ev.reason}
                    </p>

                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <span>ID: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{ev.id}</strong></span>
                      <span>Units Lost: <strong style={{ color: "var(--text-primary)" }}>{ev.units.toLocaleString()}</strong></span>
                      <span>Financial Loss: <strong style={{ color: "#DC2626" }}>{ev.cost}</strong></span>
                      <span>RCA Reference: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{ev.rcaRef}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => {
                        if (ev.linkedRcaId) {
                          navigate("/ci/rca/investigations");
                        } else {
                          initiateRCA(ev.batch, null, `Scrap/Rework Investigation — ${ev.reason}`);
                          navigate("/ci/rca/investigations");
                        }
                      }}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                        color: "#261603",
                        border: "1px solid #E8C182",
                        boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <SearchCode size={12} />
                      <span>View 8D Dossier</span>
                    </button>

                    <button
                      onClick={() => handleDelete(ev.id, ev.reason)}
                      title="Delete record"
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
              );
            })
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* LOG SCRAP / REWORK EVENT MODAL */}
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
                <Trash2 size={20} color="#DC2626" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log Scrap / Rework Disposition Event
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
                  Failure Reason / Defect Event *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preform Neck Ovality Blow-Molder Rejects"
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
                    <option value="PACKAGING">Packaging Lines</option>
                    <option value="PROCESSING">Processing Hall</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Disposition Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="Scrap Loss">Scrap Loss (Disposed)</option>
                    <option value="Rework Loss">Rework Loss (Re-processed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Asset / Batch ID
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="PACK-FILL-01">PACK-FILL-01 (Rotary Aseptic Filler)</option>
                  <option value="PACK-CAPP-01">PACK-CAPP-01 (High-Speed Capper)</option>
                  <option value="PACK-CASE-01">PACK-CASE-01 (Case Packer L1)</option>
                  <option value="PROC-MIX-01">PROC-MIX-01 (High-Shear Mixer)</option>
                  <option value="PROC-PAST-01">PROC-PAST-01 (HTST Pasteurizer)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Units Scrapped / Reworked *
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
                    placeholder="1020"
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
                  {isSubmitting ? "Saving..." : "Save Scrap Event to DB"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


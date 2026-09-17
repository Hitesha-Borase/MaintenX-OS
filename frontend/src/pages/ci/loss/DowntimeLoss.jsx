import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Download,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Activity,
  Plus,
  SearchCode,
  DollarSign,
  Layers,
  Search,
  Filter,
  Trash2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";
import { ciService } from "../../../services/ciService";

export function DowntimeLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    lossRecords = [],
    initiateRCA,
    createLoss,
    deleteLoss,
    refreshLosses,
    availableAssets = [],
    availableLines = []
  } = useCI();

  useEffect(() => {
    refreshLosses?.();
  }, [refreshLosses]);

  const [searchQuery, setSearchQuery] = useState("");
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

  const downtimeLosses = useMemo(() => {
    return lossRecords.filter((l) => l.category?.toLowerCase().includes("downtime") || Number(l.hoursLost) > 0);
  }, [lossRecords]);

  const totalDowntimeHours = useMemo(() => {
    return downtimeLosses.reduce((acc, l) => acc + (Number(l.hoursLost) || 0), 0);
  }, [downtimeLosses]);

  const totalFinancialLoss = useMemo(() => {
    return downtimeLosses.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [downtimeLosses]);

  const availability = useMemo(() => {
    if (totalDowntimeHours === 0) return "100.0%";
    const standardOperatingHours = 720;
    const avail = Math.max(0, ((standardOperatingHours - totalDowntimeHours) / standardOperatingHours) * 100);
    return `${avail.toFixed(1)}%`;
  }, [totalDowntimeHours]);

  const filteredLosses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return downtimeLosses.filter((l) => {
      return (
        !q ||
        l.eventName?.toLowerCase().includes(q) ||
        l.id?.toLowerCase().includes(q) ||
        l.assetId?.toLowerCase().includes(q)
      );
    });
  }, [downtimeLosses, searchQuery]);

  const handleExportCSV = () => {
    const headers = "Loss ID,Event Name,Line ID,Asset ID,Stage,Hours Lost,Units Lost,Financial Impact USD,Linked RCA,Date\n";
    const rows = filteredLosses
      .map((l) => `"${l.id}","${l.eventName}","${l.lineId}","${l.assetId}","${l.stage || "PACKAGING"}",${l.hoursLost},${l.unitsLost},${l.financialImpactUSD},"${l.linkedRcaId || "-"}","${l.date}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Downtime_Loss_Ledger_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Downtime loss events exported to CSV.", "info");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName.trim()) {
      addToast("Please provide a downtime description.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await createLoss({
        eventName: formData.eventName.trim(),
        category: "Downtime Loss",
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
      console.error("Create downtime loss error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete downtime loss event "${name || id}"?`)) {
      await deleteLoss(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Downtime Loss Analysis
            </h1>
            <Badge variant={totalDowntimeHours > 0 ? "rose" : "emerald"}>{availability} AVAILABILITY</Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Unplanned equipment outages, emergency breakdowns, and OEE availability impact.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Log Downtime Event
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Loss CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            RCA Investigations
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/loss/quality")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Quality Loss Hub
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
          title="Total Downtime"
          value={`${totalDowntimeHours.toFixed(1)} hrs`}
          unit="Aggregate Outage"
          trend={{ value: totalDowntimeHours > 0 ? "Production stoppage logged" : "Zero downtime recorded", isPositive: totalDowntimeHours === 0, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Financial Loss"
          value={`$${totalFinancialLoss.toLocaleString()}`}
          unit="Direct Downtime Cost"
          trend={{ value: totalFinancialLoss > 0 ? "Direct stoppage impact" : "Zero financial impact", isPositive: totalFinancialLoss === 0, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="OEE Availability"
          value={availability}
          unit="Calculated Availability"
          trend={{ value: totalDowntimeHours > 0 ? "Target: > 95%" : "100% Operational", isPositive: parseFloat(availability) >= 95, text: "" }}
          icon={Activity}
          colorVariant={parseFloat(availability) >= 95 ? "emerald" : "amber"}
        />
        <StatCard
          title="Active Investigations"
          value={downtimeLosses.filter((l) => l.linkedRcaId).length.toString()}
          unit="Under RCA 2.0"
          trend={{ value: "Root cause linked", isPositive: true, text: "" }}
          icon={SearchCode}
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
              placeholder="Search downtime event, asset or ID..."
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
          <Badge variant="cyan">{filteredLosses.length} LOGGED EVENTS</Badge>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Downtime Event</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Asset / Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Hours Lost</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Units Lost</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Financial Loss</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked RCA</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLosses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No downtime loss events logged in the selected period.
                  </td>
                </tr>
              ) : (
                filteredLosses.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{l.eventName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                        {l.id} • {l.date} • <span style={{ color: l.stage === "PROCESSING" ? "#D97706" : "#0284C7", fontWeight: 700 }}>{l.stage || "PACKAGING"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{l.assetId}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.lineId}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#DC2626", fontSize: "13px" }}>
                      {l.hoursLost} hrs
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {Number(l.unitsLost)?.toLocaleString()} units
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#DC2626", fontSize: "13px" }}>
                      ${Number(l.financialImpactUSD)?.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#8C5B23", fontWeight: 700 }}>
                      {l.linkedRcaId || "Pending Trigger"}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => {
                            if (l.linkedRcaId) {
                              navigate("/ci/rca/investigations");
                            } else {
                              initiateRCA(l.assetId, null, `Investigation — ${l.eventName}`);
                              navigate("/ci/rca/investigations");
                            }
                          }}
                          title="Investigate Root Cause"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#C89547",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <SearchCode size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id, l.eventName)}
                          title="Delete downtime event"
                          style={{
                            width: "30px",
                            height: "30px",
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* LOG DOWNTIME EVENT MODAL */}
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
                <Clock size={20} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log Unplanned Downtime Event
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
                  Downtime Event Name / Symptom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capper Magnetic Clutch Slip Breakdown"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Hours Lost *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="0.75"
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
                    placeholder="1125"
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
                  {isSubmitting ? "Saving..." : "Log Downtime to DB"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


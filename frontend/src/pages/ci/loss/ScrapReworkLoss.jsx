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
  DollarSign
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useCI } from "../../../context/CIContext";
import ciService from "../../../services/ciService";

export function ScrapReworkLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { lossRecords = [] } = useCI();

  useEffect(() => {
    ciService.getLosses("ALL", "Scrap").catch((err) => console.warn("Scrap loss load:", err.message));
  }, []);

  const scrapLossRecords = useMemo(() => {
    return lossRecords.filter((l) =>
      l.category?.toLowerCase().includes("scrap") ||
      l.category?.toLowerCase().includes("rework") ||
      l.category?.toLowerCase().includes("quality")
    );
  }, [lossRecords]);

  const totalScrapCost = useMemo(() => {
    return scrapLossRecords.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [scrapLossRecords]);

  const totalUnitsLost = useMemo(() => {
    return scrapLossRecords.reduce((acc, l) => acc + (Number(l.unitsLost) || 0), 0);
  }, [scrapLossRecords]);

  const scrapEvents = useMemo(() => {
    if (scrapLossRecords.length === 0) return [];
    return scrapLossRecords.map((ev) => ({
      batch: ev.assetId || "NCR Log",
      reason: ev.eventName || ev.category,
      cost: `$${(ev.financialImpactUSD || 0).toLocaleString()}`,
      disposition: ev.linkedRcaId ? "Quarantined for RCA Investigation" : "Disposition Pending",
      rcaRef: ev.linkedRcaId || "Pending",
      status: ev.category?.toLowerCase().includes("rework") ? "Reworked" : "Scrap"
    }));
  }, [scrapLossRecords]);

  const handleExportCSV = () => {
    const headers = "Batch ID,Failure Reason,Financial Loss,Disposition,RCA Reference,Category\n";
    const rows = scrapEvents
      .map((s) => `"${s.batch}","${s.reason}","${s.cost}","${s.disposition}","${s.rcaRef}","${s.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Scrap_Rework_Loss_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Scrap & Rework logs exported to CSV.", "info");
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
              {totalScrapCost > 0 ? `$${totalScrapCost.toLocaleString()} SCRAP LOSS` : "ZERO SCRAP LOSS"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/loss/yield")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Yield Loss
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
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
          title="Total Scrap Impact"
          value={`$${totalScrapCost.toLocaleString()}`}
          unit="Financial Loss"
          trend={{ value: totalScrapCost > 0 ? "Scrap write-off cost" : "Zero scrap logged", isPositive: totalScrapCost === 0, text: "" }}
          icon={Trash2}
          colorVariant={totalScrapCost > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Scrapped Units"
          value={totalUnitsLost.toLocaleString()}
          unit="Units Disposed"
          trend={{ value: totalUnitsLost > 0 ? "Volume rejected" : "Zero unit loss", isPositive: totalUnitsLost === 0, text: "" }}
          icon={RotateCcw}
          colorVariant={totalUnitsLost > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Logged Events"
          value={scrapEvents.length.toString()}
          unit="NCRs / Events"
          trend={{ value: scrapEvents.length > 0 ? "Under investigation" : "Clean operational run", isPositive: scrapEvents.length === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={scrapEvents.length > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Material Recovery"
          value={totalScrapCost === 0 ? "100.0%" : "0.0%"}
          unit="Yield Saved"
          trend={{ value: totalScrapCost === 0 ? "Zero material loss" : "Salvage pending", isPositive: totalScrapCost === 0, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Scrap & Rework Events Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Logged Scrap & Rework Disposition Records
          </h3>
          <Badge variant="cyan">{scrapEvents.length} DISPOSITION EVENTS</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {scrapEvents.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No scrap or rework disposition records logged in current cycle.
            </div>
          ) : (
            scrapEvents.map((ev, idx) => {
              const isScrap = ev.status === "Scrap";

              return (
                <div
                  key={idx}
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
                      <Badge variant={isScrap ? "rose" : "amber"}>{ev.status}</Badge>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {ev.disposition}
                      </span>
                    </div>

                    <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "4px", fontWeight: 600 }}>
                      {ev.reason}
                    </p>

                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <span>Financial Loss: <strong style={{ color: "#DC2626" }}>{ev.cost}</strong></span>
                      <span>RCA Reference: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{ev.rcaRef}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => navigate("/ci/rca/investigations")}
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

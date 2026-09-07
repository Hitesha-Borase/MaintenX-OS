import React, { useState } from "react";
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

export function ScrapReworkLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const scrapEvents = [
    {
      batch: "BAT-2026-0890",
      reason: "CCP Pasteurizer thermal excursion (<83.5°C for 45 sec)",
      cost: "$4,200",
      disposition: "Destroyed & Disposed",
      rcaRef: "INV-802",
      status: "Scrap"
    },
    {
      batch: "NCR-402",
      reason: "Capping chuck dynamic seal torque out-of-spec (28mm PCO1881)",
      cost: "$1,200",
      disposition: "100% Offline Re-Torque Inspection",
      rcaRef: "INV-803",
      status: "Reworked"
    }
  ];

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
            <Badge variant="rose">0.8% SCRAP RATE</Badge>
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
          title="Scrap Loss (Week)"
          value="$4,200"
          unit="1 Batch"
          trend={{ value: "CCP thermal excursion reject", isPositive: false, text: "" }}
          icon={Trash2}
          colorVariant="rose"
        />
        <StatCard
          title="Rework Loss (Week)"
          value="$1,200"
          unit="1 Lot"
          trend={{ value: "Off-line seal re-torque lot", isPositive: false, text: "" }}
          icon={RotateCcw}
          colorVariant="amber"
        />
        <StatCard
          title="Scrap Rate %"
          value="0.8%"
          unit="Target: <0.5%"
          trend={{ value: "+0.3% over scrap limit", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Material Recovery"
          value="71.4%"
          unit="Yield Saved"
          trend={{ value: "Rework lot salvaged successfully", isPositive: true, text: "" }}
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
          {scrapEvents.map((ev, idx) => {
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
          })}
        </div>
      </Card>
    </div>
  );
}

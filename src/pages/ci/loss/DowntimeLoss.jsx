import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Download,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Activity,
  Plus,
  SearchCode
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function DowntimeLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [events, setEvents] = useState([
    {
      event: "Filler nozzle seal rupture & CIP loop pressure drop — Line 1",
      duration: "45 min",
      category: "Unplanned",
      cost: "$4,500",
      rootCauseRef: "INV-802"
    },
    {
      event: "Scheduled Size Changeover: SKU-AJ-500ML → SKU-AJ-1L PET",
      duration: "32 min",
      category: "Planned",
      cost: "$2,200",
      rootCauseRef: "SOP-CHG-102"
    },
    {
      event: "Capper infeed starwheel jam and micro-stoppage — Bay 2",
      duration: "22 min",
      category: "Unplanned",
      cost: "$1,800",
      rootCauseRef: "INV-803"
    }
  ]);

  const handleExportCSV = () => {
    const headers = "Downtime Event,Duration,Category,Financial Loss,Reference ID\n";
    const rows = events
      .map((e) => `"${e.event}","${e.duration}","${e.category}","${e.cost}","${e.rootCauseRef}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Downtime_Loss_Events_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Downtime events log exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Downtime Loss Analysis
            </h1>
            <Badge variant="rose">93.8% AVAILABILITY</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            RCA Investigations
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/loss/quality")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Quality Loss Hub
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
          title="Planned Downtime"
          value="112 min"
          unit="Changeovers"
          trend={{ value: "CIP and size format conversions", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Unplanned Outages"
          value="67 min"
          unit="Breakdowns"
          trend={{ value: "Emergency stops & triage", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
        <StatCard
          title="OEE Availability"
          value="93.8%"
          unit="Target: 95%"
          trend={{ value: "-1.2% vs world-class standard", isPositive: false, text: "" }}
          icon={Activity}
          colorVariant="amber"
        />
        <StatCard
          title="Downtime Cost"
          value="$8,500"
          unit="Direct Loss"
          trend={{ value: "Unscheduled maintenance impact", isPositive: false, text: "" }}
          icon={TrendingDown}
          colorVariant="rose"
        />
      </div>

      {/* Downtime Events Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Top Line Downtime Outage Events
          </h3>
          <Badge variant="cyan">{events.length} LOGGED EVENTS</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {events.map((ev, idx) => {
            const isUnplanned = ev.category === "Unplanned";

            return (
              <div
                key={idx}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: isUnplanned ? "1px solid rgba(220, 38, 38, 0.3)" : "1px solid var(--border-subtle)",
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
                      {ev.event}
                    </span>
                    <Badge variant={isUnplanned ? "rose" : "cyan"}>{ev.category}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span>Financial Loss: <strong style={{ color: "#DC2626" }}>{ev.cost}</strong></span>
                    <span>Ref: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{ev.rootCauseRef}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: isUnplanned ? "#DC2626" : "#0284C7", fontFamily: "var(--font-mono)" }}>
                    {ev.duration}
                  </span>

                  {isUnplanned && (
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
                      <span>Investigate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

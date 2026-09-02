import React, { useState, useMemo } from "react";
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
  Filter
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function DowntimeLoss() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { lossRecords = [], initiateRCA } = useCI();

  const [searchQuery, setSearchQuery] = useState("");

  const downtimeLosses = useMemo(() => {
    return lossRecords.filter((l) => l.category.toLowerCase().includes("downtime") || l.hoursLost > 0);
  }, [lossRecords]);

  const totalDowntimeHours = useMemo(() => {
    return downtimeLosses.reduce((acc, l) => acc + (Number(l.hoursLost) || 0), 0);
  }, [downtimeLosses]);

  const totalFinancialLoss = useMemo(() => {
    return downtimeLosses.reduce((acc, l) => acc + (Number(l.financialImpactUSD) || 0), 0);
  }, [downtimeLosses]);

  const handleExportCSV = () => {
    const headers = "Loss ID,Event Name,Line ID,Asset ID,Hours Lost,Units Lost,Financial Impact USD,Linked RCA,Linked Project,Date\n";
    const rows = filteredLosses
      .map((l) => `"${l.id}","${l.eventName}","${l.lineId}","${l.assetId}",${l.hoursLost},${l.unitsLost},${l.financialImpactUSD},"${l.linkedRcaId || "-"}","${l.linkedProjectId || "-"}","${l.date}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Downtime_Loss_Ledger_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Downtime loss events exported to CSV.", "info");
  };

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
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
            Export Loss CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            RCA Investigations
          </Button>
          <Button variant="primary" onClick={() => navigate("/ci/loss/quality")} style={{ fontSize: "12px", padding: "7px 12px" }}>
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
          trend={{ value: "Across fleet", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Financial Loss"
          value={`$${totalFinancialLoss.toLocaleString()}`}
          unit="Direct Downtime Cost"
          trend={{ value: "Production stoppage impact", isPositive: false, text: "" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="OEE Availability"
          value="93.8%"
          unit="Target: 95%"
          trend={{ value: "-1.2% gap vs benchmark", isPositive: false, text: "" }}
          icon={Activity}
          colorVariant="amber"
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
              {filteredLosses.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{l.eventName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{l.id} • {l.date}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{l.assetId}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.lineId}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#DC2626", fontSize: "13px" }}>
                    {l.hoursLost} hrs
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {l.unitsLost?.toLocaleString()} units
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#DC2626", fontSize: "13px" }}>
                    ${l.financialImpactUSD?.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#8C5B23", fontWeight: 700 }}>
                    {l.linkedRcaId || "Pending Trigger"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

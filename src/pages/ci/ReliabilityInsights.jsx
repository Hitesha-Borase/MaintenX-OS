import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Download,
  AlertOctagon,
  ArrowRight,
  Clock,
  SearchCode,
  Gauge,
  Search,
  Filter
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function ReliabilityInsights() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [assets] = useState([
    {
      asset: "HTST Pasteurizer — Line 1",
      mtbf: "88 hrs",
      mttr: "45 min",
      failures: 2,
      availability: 91.2,
      criticality: "Critical"
    },
    {
      asset: "Rotary Filler — Line 1",
      mtbf: "102 hrs",
      mttr: "38 min",
      failures: 1,
      availability: 94.6,
      criticality: "High"
    },
    {
      asset: "CIP Sanitation Skid Bay 2",
      mtbf: "148 hrs",
      mttr: "22 min",
      failures: 1,
      availability: 97.5,
      criticality: "Medium"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");

  const handleExportCSV = () => {
    const headers = "Asset Name,MTBF (hrs),MTTR (min),Failure Count,Availability %,Criticality\n";
    const rows = assets
      .map((a) => `"${a.asset}","${a.mtbf}","${a.mttr}",${a.failures},"${a.availability}%","${a.criticality}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Fleet_Reliability_MTBF_MTTR_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Reliability analytics exported to CSV.", "info");
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesCriticality = criticalityFilter === "ALL" || a.criticality === criticalityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.asset?.toLowerCase().includes(q) ||
        a.mtbf?.toLowerCase().includes(q) ||
        a.mttr?.toLowerCase().includes(q) ||
        a.criticality?.toLowerCase().includes(q);

      return matchesCriticality && matchesSearch;
    });
  }, [assets, searchQuery, criticalityFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Reliability Insights & Asset MTBF
            </h1>
            <Badge variant="cyan">FLEET ANALYTICS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Reliability CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/loss/downtime")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Downtime Loss
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/ci/reports")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Reports Hub
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
          title="Fleet MTBF"
          value="112 hrs"
          unit="MTBF"
          trend={{ value: "+17 hrs vs last month", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="emerald"
        />
        <StatCard
          title="Fleet MTTR"
          value="48 min"
          unit="MTTR"
          trend={{ value: "vs. 52 min SLA target", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Fleet Availability"
          value="93.8%"
          unit="OEE"
          trend={{ value: "vs. 95% benchmark", isPositive: false, text: "" }}
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="Repeat Failure Assets"
          value="2 Assets"
          unit="Triage"
          trend={{ value: "Pasteurizer probe & filler nozzle", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
      </div>

      {/* Top Assets Reliability Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value)}
                className="form-input"
                style={{ height: "36px", fontSize: "12px", width: "160px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Criticalities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredAssets.length}</strong> of {assets.length} Monitored Assets
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Asset / Machine Name</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Criticality</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>MTBF (Mean Time)</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>MTTR (Avg Repair)</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Weekly Outages</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", width: "170px" }}>Availability</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((a, idx) => {
                  const isCritical = a.criticality === "Critical";
                  const isHigh = a.criticality === "High";
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {a.asset}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Badge variant={isCritical ? "rose" : isHigh ? "amber" : "cyan"}>
                          {a.criticality}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>
                          {a.mtbf}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#0284C7" }}>
                          {a.mttr}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: isCritical ? "#DC2626" : "var(--text-primary)" }}>
                          {a.failures}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                            <div
                              style={{
                                width: `${a.availability}%`,
                                height: "100%",
                                background: a.availability >= 95
                                  ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                                  : "linear-gradient(90deg, #F59E0B 0%, #D97706 100%)",
                                borderRadius: "3px"
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", minWidth: "38px" }}>
                            {a.availability}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => navigate("/ci/rca/investigations")}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "7px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                            color: "#261603",
                            border: "1px solid #E8C182",
                            boxShadow: "0 2px 5px rgba(178, 126, 51, 0.22)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <SearchCode size={13} />
                          <span>Initiate RCA</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No fleet assets match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

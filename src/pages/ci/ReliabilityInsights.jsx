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
  Filter,
  AlertTriangle,
  Layers,
  Zap,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCI } from "../../context/CIContext";
import { useApp } from "../../context/AppContext";

export function ReliabilityInsights() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    reliabilityRecords = [],
    fleetMTBF,
    fleetMTTR,
    badActorsCount,
    initiateRCA
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");
  const [badActorFilter, setBadActorFilter] = useState("ALL");

  const handleExportCSV = () => {
    const headers = "Asset ID,Asset Name,Line,Plant,MTBF (hrs),MTTR (min),Failure Count,Downtime (min),Criticality,Bad Actor,Trigger Reason\n";
    const rows = filteredAssets
      .map((a) => `"${a.assetId}","${a.assetName}","${a.lineName}","${a.plantId}",${a.mtbfHrs},${a.mttrMin},${a.failuresCount},${a.totalDowntimeMin},"${a.criticality}",${a.isBadActor ? "YES" : "NO"},"${a.badActorReason}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Fleet_Reliability_Bad_Actors_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Reliability & Bad Actors analytics exported to CSV.", "info");
  };

  const handleInitiateRCA = (asset) => {
    const newId = initiateRCA(asset.assetId, null, `Investigation — ${asset.assetName} Repeat Failures`);
    navigate(`/ci/rca/investigations`);
  };

  const filteredAssets = useMemo(() => {
    return reliabilityRecords.filter((a) => {
      const matchesCriticality = criticalityFilter === "ALL" || a.criticality === criticalityFilter;
      const matchesBadActor =
        badActorFilter === "ALL" ||
        (badActorFilter === "BAD_ACTOR" && a.isBadActor) ||
        (badActorFilter === "NORMAL" && !a.isBadActor);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.assetName?.toLowerCase().includes(q) ||
        a.assetId?.toLowerCase().includes(q) ||
        a.lineName?.toLowerCase().includes(q) ||
        a.failureCategory?.toLowerCase().includes(q);

      return matchesCriticality && matchesBadActor && matchesSearch;
    });
  }, [reliabilityRecords, searchQuery, criticalityFilter, badActorFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Reliability Insights & Bad Actor Identification
            </h1>
            <Badge variant="cyan">REPEAT FAILURE ANALYSIS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Reliability CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/loss/downtime")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Loss Waterfall
          </Button>
          <Button variant="primary" icon={SearchCode} onClick={() => navigate("/ci/rca/investigations")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            RCA Investigations Hub
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
          title="Fleet MTBF"
          value={`${fleetMTBF} hrs`}
          unit="Mean Time Between Failures"
          trend={{ value: "+18% vs benchmark", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="Fleet MTTR"
          value={`${fleetMTTR} min`}
          unit="Mean Time To Repair"
          trend={{ value: "Target < 30 min", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Bad Actor Assets"
          value={`${badActorsCount} Machines`}
          unit="Threshold: $\ge 2$ Failures"
          trend={{ value: "RCA Required", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant={badActorsCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Reliability Rate"
          value="96.4%"
          unit="Fleet Availability"
          trend={{ value: "Continuous Monitoring", isPositive: true, text: "" }}
          icon={ShieldCheck}
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
              placeholder="Search asset name, ID, line or failure mode..."
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={badActorFilter}
              onChange={(e) => setBadActorFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Asset Health</option>
              <option value="BAD_ACTOR">Bad Actors Only (Failures $\ge 2$)</option>
              <option value="NORMAL">Normal Reliability</option>
            </select>

            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Criticality</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Asset Details</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Parent Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Failure Count (30d)</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>MTBF / MTTR</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Reliability Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Bad Actor Trigger</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((a) => (
                <tr key={a.assetId} style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: a.isBadActor ? "rgba(239, 68, 68, 0.02)" : "transparent" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{a.assetName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{a.assetId} • {a.criticality}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Layers size={12} color="#C89547" />
                      <span>{a.lineName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: a.failuresCount >= 2 ? "#EF4444" : "#059669", fontSize: "13px" }}>
                      {a.failuresCount} Breakdowns
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{a.totalDowntimeMin} min downtime</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--text-primary)", fontSize: "12px" }}>
                      MTBF: {a.mtbfHrs}h
                    </div>
                    <div style={{ fontSize: "11px", color: "#D97706", fontFamily: "var(--font-mono)" }}>
                      MTTR: {a.mttrMin}m
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={a.isBadActor ? "rose" : "emerald"}>
                      {a.isBadActor ? "BAD ACTOR" : "HEALTHY"}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: a.isBadActor ? "#DC2626" : "var(--text-secondary)" }}>
                    {a.badActorReason}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {a.isBadActor ? (
                      <button
                        onClick={() => handleInitiateRCA(a)}
                        title="Initiate RCA 2.0 Investigation"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          backgroundColor: "#EF4444",
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <SearchCode size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInitiateRCA(a)}
                        title="Log Preventive RCA"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <SearchCode size={13} />
                      </button>
                    )}
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

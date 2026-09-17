import React, { useState, useMemo, useEffect } from "react";
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
import ciService from "../../services/ciService";

export function ReliabilityInsights() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    reliabilityRecords = [],
    fleetMTBF,
    fleetMTTR,
    badActorsCount,
    initiateRCA,
    refreshReliability
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");
  const [badActorFilter, setBadActorFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL"); // ALL | PROCESSING | PACKAGING

  useEffect(() => {
    refreshReliability?.();
  }, [refreshReliability, stageFilter]);

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

  const handleInitiateRCA = async (asset) => {
    await initiateRCA(asset.assetId, null, `Investigation — ${asset.assetName} Repeat Failures`);
    navigate(`/ci/rca/investigations`);
  };

  const stageStats = useMemo(() => {
    const list = reliabilityRecords.filter((a) => stageFilter === "ALL" || (a.stage || "PACKAGING") === stageFilter);
    if (list.length === 0) return { mtbf: fleetMTBF, mttr: fleetMTTR, badActors: badActorsCount };
    const avgMtbf = Math.round(list.reduce((acc, a) => acc + (Number(a.mtbfHrs) || 0), 0) / list.length);
    const avgMttr = Math.round(list.reduce((acc, a) => acc + (Number(a.mttrMin) || 0), 0) / list.length);
    const badActors = list.filter((a) => a.isBadActor).length;
    return { mtbf: avgMtbf, mttr: avgMttr, badActors };
  }, [reliabilityRecords, stageFilter, fleetMTBF, fleetMTTR, badActorsCount]);

  const reliabilityRate = useMemo(() => {
    const list = reliabilityRecords.filter((a) => stageFilter === "ALL" || (a.stage || "PACKAGING") === stageFilter);
    if (list.length === 0) return "100%";
    const healthy = list.filter((r) => !r.isBadActor).length;
    return `${Math.round((healthy / list.length) * 100)}%`;
  }, [reliabilityRecords, stageFilter]);

  const filteredAssets = useMemo(() => {
    return reliabilityRecords.filter((a) => {
      const matchesStage = stageFilter === "ALL" || (a.stage || "PACKAGING") === stageFilter;
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

      return matchesStage && matchesCriticality && matchesBadActor && matchesSearch;
    });
  }, [reliabilityRecords, searchQuery, criticalityFilter, badActorFilter, stageFilter]);

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
          title={stageFilter === "PROCESSING" ? "Processing MTBF" : stageFilter === "PACKAGING" ? "Packaging MTBF" : "Fleet MTBF"}
          value={`${stageStats.mtbf} hrs`}
          unit="Mean Time Between Failures"
          trend={reliabilityRecords.length > 0 ? { value: stageFilter === "PROCESSING" ? "Heavy Thermal / Agitators" : "High-Speed Rotary", isPositive: true, text: "" } : undefined}
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title={stageFilter === "PROCESSING" ? "Processing MTTR" : stageFilter === "PACKAGING" ? "Packaging MTTR" : "Fleet MTTR"}
          value={`${stageStats.mttr} min`}
          unit="Mean Time To Repair"
          trend={reliabilityRecords.length > 0 ? { value: stageFilter === "PROCESSING" ? "Sanitary Seals / Valves" : "Pneumatic / Capper", isPositive: true, text: "" } : undefined}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Bad Actor Assets"
          value={`${stageStats.badActors} Machines`}
          unit="Threshold: >= 2 Failures"
          trend={stageStats.badActors > 0 ? { value: "RCA Required", isPositive: false, text: "" } : undefined}
          icon={AlertOctagon}
          colorVariant={stageStats.badActors > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Reliability Rate"
          value={reliabilityRate}
          unit="Fleet Availability"
          trend={reliabilityRecords.length > 0 ? { value: "Continuous Monitoring", isPositive: true, text: "" } : undefined}
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
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF", fontWeight: 700 }}
            >
              <option value="ALL">All Stages (Processing + Packaging)</option>
              <option value="PROCESSING">Processing Hall (Mixers, Pasteurizers, Silos)</option>
              <option value="PACKAGING">Packaging Lines (Fillers, Cappers, Packers)</option>
            </select>

            <select
              value={badActorFilter}
              onChange={(e) => setBadActorFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Asset Health</option>
              <option value="BAD_ACTOR">Bad Actors Only (Failures &ge; 2)</option>
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
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <Gauge size={32} style={{ opacity: 0.3 }} />
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)" }}>
                        No Reliability Records Logged
                      </div>
                      <div style={{ fontSize: "12px", maxWidth: "420px" }}>
                        There are currently no machine telemetry or failure recurrence logs in the database. Machine breakdowns and work order history will automatically populate MTBF and bad actor insights.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((a) => (
                <tr key={a.assetId} style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: a.isBadActor ? "rgba(239, 68, 68, 0.02)" : "transparent" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{a.assetName}</span>
                      <Badge variant={a.stage === "PROCESSING" ? "amber" : "cyan"}>
                        {a.stage || "PACKAGING"}
                      </Badge>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{a.assetId} • {a.criticality}</div>
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
              )))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

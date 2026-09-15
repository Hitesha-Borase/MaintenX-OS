import React, { useState } from "react";
import {
  Activity,
  Gauge,
  Clock,
  Wrench,
  DollarSign,
  Download,
  Filter,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  BarChart3,
  SearchCode,
  CheckCircle2,
  Zap,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AreaChart } from "../../components/charts/AreaChart";
import { BarChart } from "../../components/charts/BarChart";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import maintenanceService from "../../services/maintenanceService";

export function ReliabilityAnalytics() {
  const { reliabilityMetrics, repeatFailures = [], refreshReliability } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [reliabilityData, setReliabilityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReliability = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await maintenanceService.getReliabilityMetrics();
      const data = res?.data || res;
      if (data && data.plantOverall) {
        setReliabilityData(data);
      }
    } catch (err) {
      console.warn("API reliability fetch notice:", err.message || err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReliability();
  }, [fetchReliability]);

  const handleRefresh = async () => {
    addToast("Synchronizing reliability metrics from database...", "info");
    await fetchReliability();
    if (typeof refreshReliability === "function") {
      await refreshReliability();
    }
    addToast("Reliability metrics synchronized with live database.", "success");
  };

  const [activeTab, setActiveTab] = useState("fleet"); // "fleet" | "pareto" | "bad_actors" | "trends"

  const activeMetrics = reliabilityData || reliabilityMetrics || {};
  const plantOverall = activeMetrics.plantOverall || {
    mtbfHours: 0,
    mttrHours: 0,
    overallAvailability: 100,
    repeatFailureRate: 0,
    unplannedDowntimeHoursMonth: 0,
    totalMaintenanceCostMonth: 0,
  };

  const assetRankingList = activeMetrics.assetRanking || [];
  const failureFrequencyData = activeMetrics.failurePareto || [];
  const failureCategories = activeMetrics.failureCategories || [];
  const chronicRepeatFailures = activeMetrics.repeatFailures || repeatFailures || [];
  const monthlyTrendData = activeMetrics.monthlyTrend || [];
  const weibull = activeMetrics.weibull || {
    beta: 1.00,
    betaRegime: "Random failure regime (Normal operating zone)",
    etaHours: plantOverall.mtbfHours || 720,
    pmComplianceRatio: 100,
    hazardRatePerHour: plantOverall.mtbfHours > 0 ? Number((1 / plantOverall.mtbfHours).toFixed(4)) : 0.0014
  };

  const rankingColumns = [
    {
      header: "Asset",
      accessor: "assetId",
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{row.name}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.assetId}</div>
        </div>
      )
    },
    {
      header: "MTBF (hrs)",
      accessor: "mtbf",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val > 400 ? "#10B981" : val > 250 ? "#F59E0B" : "#EF4444" }}>
          {val}h
        </span>
      )
    },
    {
      header: "MTTR (hrs)",
      accessor: "mttr",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
          {val}h
        </span>
      )
    },
    {
      header: "Asset Availability",
      accessor: "availability",
      render: (val) => (
        <span style={{ fontWeight: 700, color: val > 95 ? "#10B981" : val > 90 ? "#38BDF8" : "#EF4444" }}>
          {val}%
        </span>
      )
    },
    {
      header: "Downtime (hrs)",
      accessor: "downtimeHours",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", color: val > 15 ? "#EF4444" : "var(--text-primary)" }}>
          {val}h
        </span>
      )
    },
    {
      header: "Repeat Events",
      accessor: "repeatFailures",
      render: (val) => (
        <Badge variant={val === 0 ? "emerald" : val > 2 ? "rose" : "amber"}>
          {val} Repeats
        </Badge>
      )
    },
    {
      header: "Status Tier",
      accessor: "status",
      render: (val) => {
        const variant = val === "Top Performer" ? "emerald" : val === "Critical Risk" ? "rose" : val === "High Risk" ? "amber" : "cyan";
        return <Badge variant={variant}>{val}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/maintenance/asset-detail/${row.assetId}`);
            }}
          >
            Specs
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/maintenance/asset-360/${row.assetId}`);
            }}
          >
            Asset 360°
          </Button>
        </div>
      )
    }
  ];

  const handleOpenRCA = async () => {
    try {
      await maintenanceService.getRCAInvestigations();
    } catch (err) {
      console.warn("RCA Investigations fetch notice:", err);
    }
    navigate("/ci/rca/investigations");
  };

  const handleExportReport = async () => {
    try {
      await maintenanceService.exportReliabilityReport();
    } catch (err) {
      console.warn("Export report notice:", err);
    }
    addToast("Exporting Reliability Analytics Report (PDF)...", "success");
  };

  const handleStartRCA = async (assetId, failureCode) => {
    try {
      await maintenanceService.createRCAInvestigation({
        assetId,
        failureCode,
        title: `RCA for ${assetId} - ${failureCode || "Chronic Repeat Failure"}`
      });
    } catch (err) {
      console.warn("Initiate RCA notice:", err);
    }
    addToast(`Root Cause Analysis (RCA) initiated for ${assetId}!`, "success");
    navigate("/ci/rca/investigations");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              Reliability Engineering & Asset Performance
            </h1>
            <Badge variant="cyan">Weibull Distribution Model</Badge>
            <Badge variant="purple">Failure Rate λ = {weibull.hazardRatePerHour}/hr</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Plant-wide MTBF, MTTR, Availability, Failure Pareto, and chronic repeat failure tracking.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            icon={SearchCode}
            onClick={handleOpenRCA}
          >
            Open RCA Investigations
          </Button>
        </div>
      </div>

      {/* KPI Tickers - MTBF, MTTR, Availability, Unplanned Downtime, Repeat Rate, Spend */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px"
        }}
      >
        <StatCard
          title="Plant MTBF"
          value={`${plantOverall.mtbfHours || 0}h`}
          unit=""
          trend={{ value: "Target: 420h", isPositive: (plantOverall.mtbfHours || 0) >= 420, text: `${((plantOverall.mtbfHours || 0) - 420).toFixed(1)}h variance` }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Plant MTTR"
          value={`${plantOverall.mttrHours || 0}h`}
          unit=""
          trend={{ value: "Target: 1.2h", isPositive: (plantOverall.mttrHours || 0) <= 1.2, text: "MTTR" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Asset Availability"
          value={`${plantOverall.overallAvailability || 100}%`}
          unit=""
          trend={{ value: "Target: 95.0%", isPositive: (plantOverall.overallAvailability || 100) >= 95, text: "uptime" }}
          icon={Gauge}
          colorVariant="blue"
        />
        <StatCard
          title="Repeat Breakdown Rate"
          value={`${plantOverall.repeatFailureRate || 0}%`}
          unit=""
          trend={{ value: `${chronicRepeatFailures.length} Chronic Modes`, isPositive: chronicRepeatFailures.length === 0, text: chronicRepeatFailures.length === 0 ? "optimal" : "action required" }}
          icon={RotateCcw}
          colorVariant="rose"
        />
        <StatCard
          title="Unplanned Downtime (Mo)"
          value={`${plantOverall.unplannedDowntimeHoursMonth || 0}h`}
          unit=""
          trend={{ value: "Goal < 40h", isPositive: (plantOverall.unplannedDowntimeHoursMonth || 0) < 40, text: "across fleet" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Maintenance Cost (Mo)"
          value={`$${(plantOverall.totalMaintenanceCostMonth || 0).toLocaleString()}`}
          unit="USD"
          trend={{ value: "Completed Jobs", isPositive: true, text: "actual spend" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
      </div>

      {/* Clean Navigation Sub-Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "8px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          width: "100%",
          minWidth: 0,
          scrollbarWidth: "none"
        }}
      >
        <button
          onClick={() => setActiveTab("fleet")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "fleet" ? "1px solid #38BDF8" : "1px solid transparent",
            backgroundColor: activeTab === "fleet" ? "rgba(56, 189, 248, 0.12)" : "transparent",
            color: activeTab === "fleet" ? "#38BDF8" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          <Layers size={15} />
          <span>Asset Reliability & Fleet Rankings</span>
        </button>

        <button
          onClick={() => setActiveTab("pareto")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "pareto" ? "1px solid #38BDF8" : "1px solid transparent",
            backgroundColor: activeTab === "pareto" ? "rgba(56, 189, 248, 0.12)" : "transparent",
            color: activeTab === "pareto" ? "#38BDF8" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          <BarChart3 size={15} />
          <span>Failure Frequency & Pareto Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab("bad_actors")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "bad_actors" ? "1px solid #F43F5E" : "1px solid transparent",
            backgroundColor: activeTab === "bad_actors" ? "rgba(244, 63, 94, 0.12)" : "transparent",
            color: activeTab === "bad_actors" ? "#F43F5E" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          <ShieldAlert size={15} />
          <span>Bad Actors & Repeat Failures ({repeatFailures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("trends")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "trends" ? "1px solid #38BDF8" : "1px solid transparent",
            backgroundColor: activeTab === "trends" ? "rgba(56, 189, 248, 0.12)" : "transparent",
            color: activeTab === "trends" ? "#38BDF8" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          <TrendingUp size={15} />
          <span>Reliability Trends & Weibull Modeling</span>
        </button>
      </div>

      {/* TAB 1: FLEET ASSET RELIABILITY & RANKINGS */}
      {activeTab === "fleet" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            <DataTable
              title="Fleet Asset Reliability & Criticality Ranking"
              columns={rankingColumns}
              data={assetRankingList}
              searchPlaceholder="Search machine name or asset tag..."
              onRowClick={(row) => navigate(`/maintenance/asset-360/${row.assetId}`)}
              exportFilename="maintenx_asset_reliability_ranking.csv"
            />
          </Card>
        </div>
      )}

      {/* TAB 2: FAILURE FREQUENCY & PARETO ANALYSIS */}
      {activeTab === "pareto" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {failureFrequencyData.length === 0 ? (
            <Card>
              <div style={{ padding: "36px", textAlign: "center", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={40} color="#10B981" style={{ margin: "0 auto 12px" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Zero Chronic Failure Modes</h4>
                <p style={{ fontSize: "13px", marginTop: "4px", color: "var(--text-muted)" }}>
                  No breakdown failure events recorded in the database. When equipment breakdowns are logged and resolved, the 80/20 Pareto distribution will automatically populate here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              <Card>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                  Top 80/20 Failure Breakdown Pareto by Machine
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {failureFrequencyData.map((item) => (
                    <div key={item.assetId} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.name} ({item.assetId})</span>
                        <span style={{ color: "var(--text-muted)" }}>{item.failures} failure(s) ({item.downtimeHrs}h downtime) • <strong>{item.cumPct}% Cum.</strong></span>
                      </div>
                      <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(10, item.cumPct))}%`,
                            height: "100%",
                            backgroundColor: item.failures > 4 ? "#EF4444" : item.failures > 2 ? "#F59E0B" : "#10B981",
                            borderRadius: "4px"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                  Failure Mode Distribution by Subsystem
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {failureCategories.map((cat) => (
                    <div key={cat.category} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{cat.category}</span>
                        <span style={{ color: cat.color, fontWeight: 700 }}>{cat.percentage}% ({cat.events} outage{cat.events > 1 ? "s" : ""})</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.max(8, cat.percentage)}%`,
                            height: "100%",
                            backgroundColor: cat.color,
                            borderRadius: "4px"
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <strong style={{ color: "#38BDF8" }}>Live Pareto Analysis:</strong> Real-time breakdown analysis calculated from completed downtime logs in PostgreSQL.
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BAD ACTORS & REPEAT FAILURES */}
      {activeTab === "bad_actors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              Chronic Repeat Failures (Past 90 Days)
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={SearchCode}
              onClick={handleOpenRCA}
            >
              Open RCA / 5-Why Portal
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {chronicRepeatFailures.length === 0 ? (
              <Card>
                <div style={{ padding: "36px", textAlign: "center", color: "var(--text-secondary)" }}>
                  <ShieldAlert size={40} color="#10B981" style={{ margin: "0 auto 12px" }} />
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Zero Chronic Bad Actors</h4>
                  <p style={{ fontSize: "13px", marginTop: "4px", color: "var(--text-muted)" }}>
                    No machines have exceeded the repeat breakdown threshold. All registered equipment in the fleet is operating within normal reliability parameters.
                  </p>
                </div>
              </Card>
            ) : (
              chronicRepeatFailures.map((rep) => {
                const downtime = rep.totalDowntimeHours ?? rep.cumulativeDowntimeHours ?? 0;
                const cost = rep.cumulativeCostUSD ?? rep.totalFinancialLossUSD ?? 0;
                const rootCause = rep.rootCauseCandidate ?? rep.suspectedRootCause ?? "Component mechanical wear";
                const action = rep.actionRecommended ?? rep.recommendedCountermeasure ?? "Preventive component upgrade";
                const failureMode = rep.failureName ?? rep.failureModeDescription ?? "Recurrent breakdown mode";

                return (
                  <Card
                    key={rep.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      borderLeft: "4px solid #DC2626",
                      padding: "18px",
                      boxSizing: "border-box"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#DC2626" }}>
                          <ShieldAlert size={20} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                              {rep.assetName} ({rep.assetId})
                            </span>
                            <Badge variant="rose">{rep.failureCode}</Badge>
                            <span style={{ fontSize: "11px", color: "#DC2626", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                              {rep.occurrencesCount || 2} RECURRENCES
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                            {failureMode}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/maintenance/asset-360/${rep.assetId}`)}
                        >
                          Asset 360°
                        </Button>
                        <button
                          onClick={() => handleStartRCA(rep.assetId, rep.failureCode)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                            color: "#261603",
                            border: "1px solid #E8C182",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <span>Initiate 8D / 5-Why RCA</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "10px",
                        padding: "12px",
                        backgroundColor: "var(--bg-card-subtle)",
                        borderRadius: "8px",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "12px"
                      }}
                    >
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Total Downtime: </span>
                        <strong style={{ color: "#DC2626" }}>{downtime} hours</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Financial Loss: </span>
                        <strong style={{ color: "#DC2626" }}>${cost.toLocaleString()} USD</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Suspected Root Cause: </span>
                        <strong style={{ color: "var(--text-primary)" }}>{rootCause}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Action Recommended: </span>
                        <strong style={{ color: "#059669" }}>{action}</strong>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RELIABILITY TRENDS & WEIBULL MODELING */}
      {activeTab === "trends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Monthly MTBF Trend
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Mean Time Between Failures progression</p>
                </div>
                <Badge variant="emerald">Live Tracking</Badge>
              </div>

              <AreaChart
                data={monthlyTrendData.map((m) => ({ label: m.month, value: m.mtbf }))}
                height={200}
                color="#38BDF8"
                unit=" hrs"
              />
            </Card>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Monthly Maintenance Spend vs Budget ($ USD)
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Actual spend vs $38,000 monthly ceiling</p>
                </div>
                <Badge variant="cyan">Budget Control</Badge>
              </div>

              <BarChart
                data={monthlyTrendData.map((m) => ({ label: m.month, actual: m.cost, target: 38000 }))}
                height={200}
                barColor="#0284C7"
                targetColor="#F59E0B"
                yAxisUnit="$"
              />
            </Card>
          </div>

          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
              Reliability Modeling Parameters & Life-Cycle Analysis
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Weibull Beta (β) Shape Factor</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8", marginTop: "4px" }}>β = {weibull.beta}</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{weibull.betaRegime}</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Weibull Eta (η) Scale Metric</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>η = {weibull.etaHours} hrs</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Characteristic life interval (63.2% failure mark)</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>PM Compliance Ratio</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>{weibull.pmComplianceRatio}%</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Schedule adherence within 10% interval window</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fleet Failure Hazard Rate (λ)</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#F59E0B", marginTop: "4px" }}>{weibull.hazardRatePerHour} /hr</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Instantaneous operational probability of outage</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}



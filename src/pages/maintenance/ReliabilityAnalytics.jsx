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

export function ReliabilityAnalytics() {
  const { reliabilityMetrics, repeatFailures = [], assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("fleet"); // "fleet" | "pareto" | "bad_actors" | "trends"

  // Failure Frequency & Pareto dataset
  const failureFrequencyData = [
    { assetId: "HT-105", name: "Plate Heat Exchanger HTST-300", failures: 12, downtimeHrs: 36.5, primaryMode: "Gasket Rupture / Leak", category: "Hydraulic", cumPct: 32 },
    { assetId: "FM-001", name: "High-Speed Rotary Filler 12-Head", failures: 9, downtimeHrs: 14.8, primaryMode: "Bearing Spindle Fatigue", category: "Mechanical", cumPct: 56 },
    { assetId: "LB-204", name: "Krones Autocol Rotary Labeler", failures: 8, downtimeHrs: 22.0, primaryMode: "Optical Sensor Drift", category: "Electrical/Sensor", cumPct: 78 },
    { assetId: "CP-102", name: "Arol Capper Rotary Capping", failures: 4, downtimeHrs: 8.4, primaryMode: "Clutch Torque Slippage", category: "Mechanical", cumPct: 88 },
    { assetId: "PK-401", name: "Robotic End-of-Line Palletizer", failures: 3, downtimeHrs: 6.2, primaryMode: "Pneumatic Gripper Leak", category: "Pneumatic", cumPct: 96 },
    { assetId: "AC-505", name: "Rotary Air Compressor Atlas Copco", failures: 1, downtimeHrs: 2.0, primaryMode: "Air Filter Differential", category: "Pneumatic", cumPct: 99 },
    { assetId: "MX-003", name: "Industrial Double-Cone Blender", failures: 1, downtimeHrs: 4.5, primaryMode: "Drive Belt Deflection", category: "Mechanical", cumPct: 100 }
  ];

  const failureCategories = [
    { category: "Mechanical", percentage: 41, events: 14, color: "#38BDF8" },
    { category: "Electrical & Sensors", percentage: 26, events: 9, color: "#818CF8" },
    { category: "Hydraulic", percentage: 18, events: 6, color: "#F59E0B" },
    { category: "Pneumatic", percentage: 12, events: 4, color: "#10B981" },
    { category: "Process / Thermal", percentage: 3, events: 1, color: "#EF4444" }
  ];

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
            <Badge variant="purple">Failure Rate λ = 0.0026/hr</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Plant-wide MTBF, MTTR, Availability, Failure Pareto, and chronic repeat failure tracking.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => addToast("Exporting Reliability Analytics Report (PDF)...", "success")}
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            icon={SearchCode}
            onClick={() => navigate("/ci/rca/investigations")}
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
          value={`${reliabilityMetrics?.plantOverall?.mtbfHours || 385.4}h`}
          unit=""
          trend={{ value: "Target: 420h", isPositive: false, text: "-34.6h variance" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Plant MTTR"
          value={`${reliabilityMetrics?.plantOverall?.mttrHours || 1.62}h`}
          unit=""
          trend={{ value: "Target: 1.2h", isPositive: false, text: "+25m variance" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Asset Availability"
          value={`${reliabilityMetrics?.plantOverall?.overallAvailability || 92.4}%`}
          unit=""
          trend={{ value: "Target: 95.0%", isPositive: false, text: "uptime" }}
          icon={Gauge}
          colorVariant="blue"
        />
        <StatCard
          title="Repeat Breakdown Rate"
          value={`${reliabilityMetrics?.plantOverall?.repeatFailureRate || 14.8}%`}
          unit=""
          trend={{ value: "3 Chronic Modes", isPositive: false, text: "action required" }}
          icon={RotateCcw}
          colorVariant="rose"
        />
        <StatCard
          title="Unplanned Downtime (Mo)"
          value={`${reliabilityMetrics?.plantOverall?.unplannedDowntimeHoursMonth || 48.5}h`}
          unit=""
          trend={{ value: "Goal < 40h", isPositive: false, text: "across fleet" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Maintenance Cost (Mo)"
          value={`$${(reliabilityMetrics?.plantOverall?.totalMaintenanceCostMonth || 34250).toLocaleString()}`}
          unit="USD"
          trend={{ value: "Under Budget", isPositive: true, text: "budget $38k" }}
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
              data={reliabilityMetrics?.assetRanking || []}
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
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            <Card>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                Top 80/20 Failure Breakdown Pareto by Machine
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {failureFrequencyData.map((item) => (
                  <div key={item.assetId} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                      <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{item.name} ({item.assetId})</span>
                      <span style={{ color: "var(--text-muted)" }}>{item.failures} failures ({item.downtimeHrs}h downtime) • <strong>{item.cumPct}% Cum.</strong></span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${(item.failures / 12) * 100}%`,
                          height: "100%",
                          backgroundColor: item.failures > 8 ? "#EF4444" : item.failures > 4 ? "#F59E0B" : "#10B981",
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
                      <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{cat.category}</span>
                      <span style={{ color: cat.color, fontWeight: 700 }}>{cat.percentage}% ({cat.events} outages)</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${cat.percentage}%`,
                          height: "100%",
                          backgroundColor: cat.color,
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "#38BDF8" }}>Pareto Insight:</strong> Mechanical wear (41%) and Electrical/Sensor drift (26%) account for 67% of all plant downtime. Focus PM lubrication and optical lens protection routines to eradicate top downtime drivers.
                </div>
              </div>
            </Card>
          </div>
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
              onClick={() => navigate("/ci/rca/investigations")}
            >
              Open RCA / 5-Why Portal
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {repeatFailures.map((rep) => {
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
                            {rep.occurrencesCount || 3} RECURRENCES
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
                        onClick={() => {
                          addToast(`Root Cause Analysis (RCA) initiated for ${rep.assetId}!`, "success");
                          navigate("/ci/rca/investigations");
                        }}
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
            })}
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
                    Monthly MTBF Growth Trend (6-Months)
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Mean Time Between Failures progression</p>
                </div>
                <Badge variant="emerald">+24.2% Growth</Badge>
              </div>

              <AreaChart
                data={reliabilityMetrics?.monthlyTrend?.map((m) => ({ label: m.month, value: m.mtbf })) || []}
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
                data={reliabilityMetrics?.monthlyTrend?.map((m) => ({ label: m.month, actual: m.cost, target: 38000 })) || []}
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
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8", marginTop: "4px" }}>β = 1.42</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Wear-out failure regime (Early fatigue warning)</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Weibull Eta (η) Scale Metric</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>η = 412.5 hrs</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Characteristic life interval (63.2% failure mark)</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>PM Compliance Ratio</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>96.2%</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Schedule adherence within 10% interval window</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fleet Failure Hazard Rate (λ)</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#F59E0B", marginTop: "4px" }}>0.0026 /hr</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Instantaneous operational probability of outage</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}



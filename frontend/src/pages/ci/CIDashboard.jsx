import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchCode,
  CheckCircle,
  LineChart,
  Briefcase,
  DollarSign,
  ShieldCheck,
  FileCheck,
  Activity,
  Plus,
  Download,
  ArrowRight,
  Sparkles,
  TrendingDown,
  X,
  Gauge,
  Clock,
  Layers,
  Zap,
  AlertTriangle,
  FlaskConical,
  Scale,
  Trash2,
  Wrench
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCI } from "../../context/CIContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import { ciService } from "../../services/ciService";
import { maintenanceService } from "../../services/maintenanceService";

export function CIDashboard() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { currentPlant } = useMasterData();

  const [selectedStage, setSelectedStage] = useState("ALL"); // "ALL" | "PROCESSING" | "PACKAGING"
  const [summaryData, setSummaryData] = useState(null);

  const [liveBreakdowns, setLiveBreakdowns] = useState([]);

  // Trigger live GET /api/v1/ci/dashboard/summary, GET /api/v1/ci/projects, and live maintenance breakdowns
  React.useEffect(() => {
    const plantId = currentPlant?.id || "PLT-01";
    ciService.getDashboardSummary(plantId, selectedStage)
      .then((res) => {
        const payload = res?.data?.data !== undefined ? res.data.data : (res?.data || res);
        setSummaryData(payload);
      })
      .catch((err) => console.warn("Live CI summary fetch:", err.message));

    ciService.getProjects(plantId).catch((err) => console.warn("Live CI projects fetch:", err.message));

    maintenanceService.getBreakdowns()
      .then((res) => {
        const list = res?.data?.data !== undefined ? res.data.data : (res?.data || res);
        if (Array.isArray(list)) setLiveBreakdowns(list);
      })
      .catch((err) => console.warn("Live breakdowns fetch:", err.message));
  }, [currentPlant, selectedStage]);

  const {
    fleetMTBF,
    fleetMTTR,
    realizedSavingsTotal,
    projectedSavingsTotal,
    badActorsCount,
    openRcaCount,
    activeProjectsCount,
    overdueCapaCount,
    capaActions = [],
    openCapexCount,
    pendingBenefitsCount,
    investigations = [],
    lossRecords = [],
    reliabilityRecords = [],
    ciProjects = [],
    standards = [],
    verifiedSolutions = [],
    initiateRCA,
    createLoss,
    deleteLoss,
    refreshAll,
    availableAssets = [],
    availableLines = []
  } = useCI();

  React.useEffect(() => {
    refreshAll?.();
  }, [refreshAll]);

  const [isCreateRcaOpen, setIsCreateRcaOpen] = useState(false);
  const [rcaForm, setRcaForm] = useState({
    title: "",
    stage: "PACKAGING",
    lineId: "",
    assetId: "",
    severity: "High",
    description: ""
  });

  const handleLaunchRcaFromBreakdown = (bd) => {
    setRcaForm({
      title: `RCA: ${bd.assetName || bd.assetId} — ${bd.symptom || bd.failureCode || "Emergency Breakdown"}`,
      stage: (bd.department || "").toUpperCase().includes("PROCESS") ? "PROCESSING" : "PACKAGING",
      lineId: bd.line || bd.lineId || "",
      assetId: bd.assetId || "",
      severity: bd.severity || "Critical",
      description: `Breakdown Reference: ${bd.id}\nAsset: ${bd.assetId} (${bd.assetName || ""})\nLine: ${bd.line || "Packaging"}\nFailure Code: ${bd.failureCode || "MEC-001"} (${bd.failureCategory || "Mechanical"})\nSymptom: ${bd.symptom || "Equipment failure"}\nStatus: ${bd.status}\nRelated Work Order: ${bd.workOrderId || "N/A"}`
    });
    setIsCreateRcaOpen(true);
  };

  const [isCreateLossOpen, setIsCreateLossOpen] = useState(false);
  const [lossForm, setLossForm] = useState({
    eventName: "",
    stage: "PROCESSING",
    category: "Yield Loss",
    lineId: "",
    assetId: "",
    hoursLost: "",
    unitsLost: "",
    financialImpactUSD: ""
  });

  const handleCreateRca = async (e) => {
    e.preventDefault();
    if (!rcaForm.title.trim()) {
      addToast("Please provide an investigation title.", "warning");
      return;
    }

    const selectedAsset = availableAssets.find((a) => a.id === rcaForm.assetId || a.assetCode === rcaForm.assetId) || availableAssets[0] || {};
    const selectedLine = availableLines.find((l) => l.id === rcaForm.lineId || l.code === rcaForm.lineId) || availableLines[0] || {};

    await initiateRCA({
      title: rcaForm.title.trim(),
      stage: rcaForm.stage || "PACKAGING",
      assetId: selectedAsset.assetCode || selectedAsset.id || rcaForm.assetId || "AST-001",
      assetName: selectedAsset.name || selectedAsset.assetName || "Selected Production Equipment",
      lineId: selectedLine.code || selectedLine.id || rcaForm.lineId || "LIN-01",
      lineName: selectedLine.name || "Line 1 — Production",
      severity: rcaForm.severity,
      problemStatement: rcaForm.description.trim() || rcaForm.title.trim(),
    });

    setIsCreateRcaOpen(false);
    setRcaForm({
      title: "",
      stage: "PACKAGING",
      lineId: "",
      assetId: "",
      severity: "High",
      description: ""
    });
    const plantId = currentPlant?.id || "PLT-01";
    ciService.getDashboardSummary(plantId, selectedStage).then((res) => {
      const payload = res?.data?.data !== undefined ? res.data.data : (res?.data || res);
      setSummaryData(payload);
    }).catch(() => {});
    navigate(`/ci/rca/investigations`);
  };

  const handleCreateLoss = async (e) => {
    e.preventDefault();
    if (!lossForm.eventName.trim()) {
      addToast("Please provide a loss event description.", "warning");
      return;
    }
    const selectedAsset = availableAssets.find((a) => a.id === lossForm.assetId || a.assetCode === lossForm.assetId) || {};
    const selectedLine = availableLines.find((l) => l.id === lossForm.lineId || l.code === lossForm.lineId) || {};

    await createLoss({
      eventName: lossForm.eventName.trim(),
      stage: lossForm.stage || "PROCESSING",
      category: lossForm.category || "Yield Loss",
      assetId: selectedAsset.assetCode || selectedAsset.id || lossForm.assetId || "AST-001",
      lineId: selectedLine.code || selectedLine.id || lossForm.lineId || "LIN-01",
      hoursLost: Number(lossForm.hoursLost) || 0,
      unitsLost: Number(lossForm.unitsLost) || 0,
      financialImpactUSD: Number(lossForm.financialImpactUSD) || 0,
    });

    setIsCreateLossOpen(false);
    setLossForm({
      eventName: "",
      stage: "PROCESSING",
      category: "Yield Loss",
      lineId: "",
      assetId: "",
      hoursLost: "",
      unitsLost: "",
      financialImpactUSD: ""
    });
    const plantId = currentPlant?.id || "PLT-01";
    ciService.getDashboardSummary(plantId, selectedStage).then((res) => {
      const payload = res?.data?.data !== undefined ? res.data.data : (res?.data || res);
      setSummaryData(payload);
    }).catch(() => {});
  };

  const handleExportReport = () => {
    const csvContent =
      "Metric,Value,Status\n" +
      `Fleet MTBF,${fleetMTBF || 0} hrs,Dynamic\n` +
      `Fleet MTTR,${fleetMTTR || 0} min,Dynamic\n` +
      `Active RCA Investigations,${openRcaCount},Active\n` +
      `Overdue CAPA Items,${overdueCapaCount},Overdue\n` +
      `Bad Actor Assets,${badActorsCount || 0},Repeat Failures\n` +
      `Active CI Projects,${activeProjectsCount},Active\n` +
      `Realized YTD Savings,$${realizedSavingsTotal.toLocaleString()},Verified\n` +
      `Projected Annual Savings,$${projectedSavingsTotal.toLocaleString()},Target\n` +
      `Open Capex Projects,${openCapexCount},Engineering\n`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CI_Executive_Summary_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CI Executive summary exported to CSV.", "info");
  };

  // Stage-Filtered lists
  const filteredInvestigations = useMemo(() => {
    if (selectedStage === "ALL") return investigations;
    return investigations.filter((i) => (i.stage || "").toUpperCase() === selectedStage);
  }, [investigations, selectedStage]);

  const filteredLosses = useMemo(() => {
    if (selectedStage === "ALL") return lossRecords;
    return lossRecords.filter((l) => (l.stage || "").toUpperCase() === selectedStage);
  }, [lossRecords, selectedStage]);

  const stageBreakdown = useMemo(() => {
    const fromSummary = summaryData?.stageBreakdown;
    const procLossSum = lossRecords
      .filter((l) => (l.stage || "").toUpperCase() === "PROCESSING")
      .reduce((s, l) => s + (Number(l.financialImpactUSD) || 0), 0);
    const packLossSum = lossRecords
      .filter((l) => (l.stage || "").toUpperCase() !== "PROCESSING")
      .reduce((s, l) => s + (Number(l.financialImpactUSD) || 0), 0);

    return {
      processing: {
        avgMtbfHrs: fromSummary?.processing?.avgMtbfHrs || 0,
        avgMttrMin: fromSummary?.processing?.avgMttrMin || 0,
        badActorsCount: fromSummary?.processing?.badActorsCount || 0,
        totalLossUSD: fromSummary?.processing?.totalLossUSD || procLossSum
      },
      packaging: {
        avgMtbfHrs: fromSummary?.packaging?.avgMtbfHrs || 0,
        avgMttrMin: fromSummary?.packaging?.avgMttrMin || 0,
        badActorsCount: fromSummary?.packaging?.badActorsCount || 0,
        totalLossUSD: fromSummary?.packaging?.totalLossUSD || packLossSum
      }
    };
  }, [summaryData, lossRecords]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              CI / Engineering Control Center
            </h1>
            <Badge variant="cyan">CONTINUOUS IMPROVEMENT & RELIABILITY</Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Processing Yield & Mass-Balance Loss, Packaging Defect Scrap, RCA 2.0 and MTBF/MTTR Reliability
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportReport} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Executive Report
          </Button>
          <Button variant="secondary" icon={Briefcase} onClick={() => navigate("/ci/capa/corrective")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            CAPA Actions
          </Button>
          <Button variant="secondary" icon={Plus} onClick={() => setIsCreateLossOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Log Loss Incident
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateRcaOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Log RCA Incident
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE SWITCHER & DUAL-ZONE RELIABILITY COMPARISON */}
      {/* ========================================================================= */}
      <Card style={{ padding: "16px 20px", borderLeft: "4px solid #C89547", backgroundColor: "var(--bg-card-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Gauge size={18} color="#C89547" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Operations Reliability & Loss Division by Stage
              </h3>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Separate tracking for Heavy Thermal/Mechanical Processing vs High-Speed Packaging Lines
            </div>
          </div>

          <div style={{ display: "flex", gap: "4px", backgroundColor: "#FFFFFF", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setSelectedStage("ALL")}
              style={{
                ...tabBtnStyle,
                backgroundColor: selectedStage === "ALL" ? "var(--bg-card-subtle)" : "transparent",
                color: selectedStage === "ALL" ? "#C89547" : "var(--text-secondary)",
                fontWeight: selectedStage === "ALL" ? 800 : 600
              }}
            >
              All Plant Operations
            </button>
            <button
              onClick={() => setSelectedStage("PROCESSING")}
              style={{
                ...tabBtnStyle,
                backgroundColor: selectedStage === "PROCESSING" ? "rgba(2, 132, 199, 0.1)" : "transparent",
                color: selectedStage === "PROCESSING" ? "#0284C7" : "var(--text-secondary)",
                fontWeight: selectedStage === "PROCESSING" ? 800 : 600
              }}
            >
              Processing Hall
            </button>
            <button
              onClick={() => setSelectedStage("PACKAGING")}
              style={{
                ...tabBtnStyle,
                backgroundColor: selectedStage === "PACKAGING" ? "rgba(5, 150, 105, 0.1)" : "transparent",
                color: selectedStage === "PACKAGING" ? "#059669" : "var(--text-secondary)",
                fontWeight: selectedStage === "PACKAGING" ? 800 : 600
              }}
            >
              Packaging Lines
            </button>
          </div>
        </div>

        {/* Comparative 2-Column Grid for Processing vs Packaging Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px", marginTop: "14px" }}>
          {/* PROCESSING ZONE METRICS */}
          <div style={{ border: "1.5px solid rgba(2, 132, 199, 0.3)", borderRadius: "10px", padding: "14px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FlaskConical size={16} color="#0284C7" />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0284C7", textTransform: "uppercase" }}>
                  1. Processing Hall Reliability & Mass-Balance
                </span>
              </div>
              <Badge variant="cyan">THERMAL / MECHANICAL</Badge>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
              Asset classes: High-pressure pumps, batch blend mixers, plate pasteurizers, and vacuum cookers.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div style={{ backgroundColor: "rgba(2, 132, 199, 0.05)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Processing MTBF</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0284C7", fontFamily: "var(--font-mono)" }}>
                  {stageBreakdown.processing.avgMtbfHrs || 0} hrs
                </div>
              </div>
              <div style={{ backgroundColor: "rgba(2, 132, 199, 0.05)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Processing MTTR</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {stageBreakdown.processing.avgMttrMin || 0} min
                </div>
              </div>
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Repeat Bad Actors</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: stageBreakdown.processing.badActorsCount > 0 ? "#DC2626" : "var(--text-primary)" }}>
                  {stageBreakdown.processing.badActorsCount > 0 ? `${stageBreakdown.processing.badActorsCount} Bad Actor${stageBreakdown.processing.badActorsCount > 1 ? "s" : ""}` : "0 Bad Actors"}
                </div>
              </div>
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Mass-Balance Loss</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#D97706", fontFamily: "var(--font-mono)" }}>
                  ${Number(stageBreakdown.processing.totalLossUSD || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Loss Focus: Scaling, evaporation & pipeline flush heels</span>
              <button onClick={() => navigate("/ci/loss/yield")} style={{ background: "transparent", border: "none", color: "#0284C7", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                View Yield Loss →
              </button>
            </div>
          </div>

          {/* PACKAGING ZONE METRICS */}
          <div style={{ border: "1.5px solid rgba(5, 150, 105, 0.3)", borderRadius: "10px", padding: "14px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Layers size={16} color="#059669" />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
                  2. Packaging Lines Reliability & Scrap Loss
                </span>
              </div>
              <Badge variant="emerald">HIGH-SPEED FILLING</Badge>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
              Asset classes: Rotary filling carousels, magnetic chuck cappers, vision rejectors & case packers.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div style={{ backgroundColor: "rgba(5, 150, 105, 0.05)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Packaging MTBF</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#059669", fontFamily: "var(--font-mono)" }}>
                  {stageBreakdown.packaging.avgMtbfHrs || 0} hrs
                </div>
              </div>
              <div style={{ backgroundColor: "rgba(5, 150, 105, 0.05)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Packaging MTTR</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {stageBreakdown.packaging.avgMttrMin || 0} min
                </div>
              </div>
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Repeat Bad Actors</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: stageBreakdown.packaging.badActorsCount > 0 ? "#DC2626" : "var(--text-primary)" }}>
                  {stageBreakdown.packaging.badActorsCount > 0 ? `${stageBreakdown.packaging.badActorsCount} Bad Actor${stageBreakdown.packaging.badActorsCount > 1 ? "s" : ""}` : "0 Bad Actors"}
                </div>
              </div>
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "8px", borderRadius: "6px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Scrap / Defect Loss</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#D97706", fontFamily: "var(--font-mono)" }}>
                  ${Number(stageBreakdown.packaging.totalLossUSD || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Loss Focus: Preform jams, bad capping torque & outer corrugate</span>
              <button onClick={() => navigate("/ci/loss/scrap")} style={{ background: "transparent", border: "none", color: "#059669", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                View Scrap Loss →
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Stats - Dynamic and Decision-Oriented */}
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
          title={selectedStage === "ALL" ? "Overall Fleet MTBF" : `${selectedStage} MTBF`}
          value={`${selectedStage === "PROCESSING" ? stageBreakdown.processing.avgMtbfHrs : (selectedStage === "PACKAGING" ? stageBreakdown.packaging.avgMtbfHrs : fleetMTBF || 0)} hrs`}
          unit="Mean Time Between Failures"
          trend={{ value: (fleetMTBF > 0 || stageBreakdown.processing.avgMtbfHrs > 0 || stageBreakdown.packaging.avgMtbfHrs > 0) ? "Target: > 120 hrs" : "Zero Failures Logged", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="emerald"
          onClick={() => navigate("/ci/reliability")}
        />
        <StatCard
          title={selectedStage === "ALL" ? "Overall Fleet MTTR" : `${selectedStage} MTTR`}
          value={`${selectedStage === "PROCESSING" ? stageBreakdown.processing.avgMttrMin : (selectedStage === "PACKAGING" ? stageBreakdown.packaging.avgMttrMin : fleetMTTR || 0)} min`}
          unit="Mean Time To Repair"
          trend={{ value: (fleetMTTR > 0 || stageBreakdown.processing.avgMttrMin > 0 || stageBreakdown.packaging.avgMttrMin > 0) ? "Target: < 30 min" : "Zero Repair Downtime", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
          onClick={() => navigate("/ci/reliability")}
        />
        <StatCard
          title="Active RCA Investigations"
          value={filteredInvestigations.length}
          unit="8D Root Cause Trees"
          trend={{ value: `${filteredInvestigations.filter((i) => i.status === "Root Cause Validated").length} Validated`, isPositive: true, text: "" }}
          icon={SearchCode}
          colorVariant="rose"
          onClick={() => navigate("/ci/rca/investigations")}
        />
        <StatCard
          title="Verified YTD Benefits"
          value={`$${realizedSavingsTotal.toLocaleString()}`}
          unit="21 CFR Part 11 Locked"
          trend={{ value: `$${projectedSavingsTotal.toLocaleString()} Target`, isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="amber"
          onClick={() => navigate("/ci/projects/benefits")}
        />
      </div>

      {/* Secondary KPI Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <Card
          onClick={() => navigate("/ci/reliability")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Bad Actor Assets</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: (badActorsCount || 0) > 0 ? "#EF4444" : "var(--text-primary)", marginTop: "2px" }}>
              {badActorsCount || 0} Critical
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {stageBreakdown.processing.badActorsCount || 0} Processing • {stageBreakdown.packaging.badActorsCount || 0} Packaging
            </div>
          </div>
          <AlertTriangle size={24} color={(badActorsCount || 0) > 0 ? "#EF4444" : "var(--text-muted)"} />
        </Card>

        <Card
          onClick={() => navigate("/ci/capa/corrective")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CAPA Action Items</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: overdueCapaCount > 0 ? "#D97706" : "#059669", marginTop: "2px" }}>
              {capaActions.filter((c) => c.status !== "Closed" && c.status !== "Verified").length} Active
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {overdueCapaCount > 0 ? `${overdueCapaCount} Overdue` : "All on track"} • {capaActions.filter((c) => c.status === "Verified").length} Verified
            </div>
          </div>
          <ShieldCheck size={24} color={overdueCapaCount > 0 ? "#D97706" : "#059669"} />
        </Card>

        <Card
          onClick={() => navigate("/ci/projects/benefits")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Awaiting Verification</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0284C7", marginTop: "2px" }}>{pendingBenefitsCount} Projects</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Ready for GM Lock</div>
          </div>
          <ShieldCheck size={24} color="#0284C7" />
        </Card>

        <Card
          onClick={() => navigate("/ci/engineering")}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Engineering Capex</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#8C5B23", marginTop: "2px" }}>{openCapexCount} Open</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Redesign Initiatives</div>
          </div>
          <Zap size={24} color="#C89547" />
        </Card>
      </div>

      {/* Operational Modules Responsive Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "14px",
          width: "100%",
          minWidth: 0
        }}
      >
        {/* Module 1: RCA Investigations */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active RCA Investigations ({selectedStage})
              </h3>
              <Badge variant="rose">{filteredInvestigations.length} PENDING</Badge>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredInvestigations.length > 0 ? (
                filteredInvestigations.slice(0, 3).map((inv) => {
                  const isProcessing = (inv.stage || "").toUpperCase() === "PROCESSING";
                  return (
                    <div
                      key={inv.id}
                      onClick={() => navigate("/ci/rca/investigations")}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, paddingRight: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <Badge variant={isProcessing ? "cyan" : "emerald"}>
                            {isProcessing ? "PROCESSING" : "PACKAGING"}
                          </Badge>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {inv.id} — {inv.title}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{inv.assetName} • Phase: {inv.currentPhase}</div>
                      </div>
                      <Badge variant={inv.severity === "Critical" ? "rose" : "amber"}>{inv.status?.toUpperCase() || "ACTIVE"}</Badge>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "16px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                  No active root cause investigations in this stage
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate("/ci/rca/investigations")}
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "var(--bg-card-subtle)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>Launch RCA Hub</span>
            <ArrowRight size={14} />
          </button>
        </Card>

        {/* Module 2: Loss Analysis */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", minWidth: 0, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Stage Loss Tracking ({selectedStage})
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Badge variant="amber">LOSS REGISTRY</Badge>
                <button
                  onClick={() => setIsCreateLossOpen(true)}
                  style={{
                    backgroundColor: "rgba(200, 149, 71, 0.15)",
                    border: "1px solid #C89547",
                    color: "#C89547",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  + Log Loss
                </button>
              </div>
            </div>

            <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredLosses.length > 0 ? (
                filteredLosses.slice(0, 4).map((loss) => {
                  const isProcessing = (loss.stage || "").toUpperCase() === "PROCESSING";
                  return (
                    <div
                      key={loss.id}
                      onClick={() => navigate(isProcessing ? "/ci/loss/yield" : "/ci/loss/scrap")}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, paddingRight: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <Badge variant={isProcessing ? "cyan" : "emerald"}>
                            {isProcessing ? "PROCESSING YIELD" : "PACKAGING SCRAP"}
                          </Badge>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {loss.eventName}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{loss.hoursLost} hrs lost • {loss.unitsLost} units</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ color: "#DC2626", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                          ${Number(loss.financialImpactUSD).toLocaleString()}
                        </strong>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLoss(loss.id);
                          }}
                          title="Delete Loss Record"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <Trash2 size={13} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "16px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                  No loss incidents recorded in this stage
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={() => navigate("/ci/loss/yield")}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
                background: "rgba(2, 132, 199, 0.08)",
                color: "#0284C7",
                border: "1px solid rgba(2, 132, 199, 0.2)",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              Yield Losses
            </button>
            <button
              onClick={() => navigate("/ci/loss/scrap")}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
                background: "rgba(5, 150, 105, 0.08)",
                color: "#059669",
                border: "1px solid rgba(5, 150, 105, 0.2)",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              Scrap Losses
            </button>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* OPERATIONAL BREAKDOWNS FEED (SYNCED FROM PLANT MANAGER & MAINTENANCE) */}
      {/* ========================================================================= */}
      <Card style={{ padding: "18px 20px", borderTop: "3px solid #EF4444", backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Wrench size={18} color="#EF4444" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Plant Floor Operational Breakdowns (Cross-Role Triage Feed)
              </h3>
              <Badge variant="rose">LIVE CMMS SYNC</Badge>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
              Unplanned downtime and emergency stops logged by Plant Managers, Operators, and Technicians flowing into CI for bad-actor triage & RCA.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge variant={liveBreakdowns.length > 0 ? "rose" : "emerald"}>
              {liveBreakdowns.length} Active Breakdown{liveBreakdowns.length !== 1 ? "s" : ""}
            </Badge>
            <Button
              variant="secondary"
              onClick={() => navigate("/ci/reliability")}
              style={{ fontSize: "11px", padding: "5px 10px" }}
            >
              View Bad Actor Analysis →
            </Button>
          </div>
        </div>

        {liveBreakdowns.length > 0 ? (
          <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "10.5px", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "10px 12px" }}>Breakdown ID</th>
                  <th style={{ padding: "10px 12px" }}>Asset & Line</th>
                  <th style={{ padding: "10px 12px" }}>Failure Mode / Category</th>
                  <th style={{ padding: "10px 12px" }}>Severity</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px" }}>Est. Downtime</th>
                  <th style={{ padding: "10px 12px" }}>Related WO</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {liveBreakdowns.map((bd) => {
                  const isCritical = bd.severity?.toLowerCase() === "critical";
                  return (
                    <tr
                      key={bd.id || bd.dbId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        backgroundColor: isCritical ? "rgba(239, 68, 68, 0.02)" : "transparent"
                      }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <AlertTriangle size={13} color={isCritical ? "#EF4444" : "#F59E0B"} />
                          <span>{bd.id}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                          {bd.assetId} — {bd.assetName || "Asset"}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {bd.line || bd.department || "Packaging Line"}
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge variant="cyan">{bd.failureCode || "MEC-001"}</Badge>
                        <span style={{ marginLeft: "6px", color: "var(--text-secondary)", fontSize: "11px" }}>
                          {bd.failureCategory || bd.symptom || "Mechanical"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge variant={isCritical ? "rose" : "amber"}>
                          {bd.severity?.toUpperCase() || "HIGH"}
                        </Badge>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge variant={bd.status?.toLowerCase() === "open" ? "amber" : "emerald"}>
                          ● {bd.status?.toUpperCase() || "OPEN"}
                        </Badge>
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {bd.durationMinutes > 0 ? `${bd.durationMinutes} mins` : "Active (< 1 hr)"}
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                        {bd.workOrderId ? (
                          <span style={{ color: "#0284C7", fontWeight: 600 }}>{bd.workOrderId}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <Button
                          variant="primary"
                          icon={SearchCode}
                          onClick={() => handleLaunchRcaFromBreakdown(bd)}
                          style={{ fontSize: "11px", padding: "5px 10px" }}
                        >
                          Launch 8D RCA
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
            No active operational breakdowns reported on the plant floor.
          </div>
        )}
      </Card>

      {/* CREATE RCA MODAL WITH STAGE SELECTOR */}
      {isCreateRcaOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateRcaOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SearchCode size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log New Root Cause Investigation
                </h2>
              </div>
              <button onClick={() => setIsCreateRcaOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRca} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Investigation Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pasteurizer Holding Tube Temperature Excursion"
                  value={rcaForm.title}
                  onChange={(e) => setRcaForm({ ...rcaForm, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              {/* OPERATIONAL STAGE SELECTOR */}
              <div>
                <label className="form-label">Manufacturing Operational Stage *</label>
                <select
                  className="form-select"
                  value={rcaForm.stage}
                  onChange={(e) => setRcaForm({ ...rcaForm, stage: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="PROCESSING">Processing Hall (Bulk Formulation / Thermal Kitchen)</option>
                  <option value="PACKAGING">Packaging Lines (Bottling / Filling / Canning Monobloc)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Process Area / Line</label>
                  <select
                    className="form-select"
                    value={rcaForm.lineId}
                    onChange={(e) => setRcaForm({ ...rcaForm, lineId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">-- Select Production Line --</option>
                    {availableLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name || line.line_name || line.code || line.id}
                      </option>
                    ))}
                    {availableLines.length === 0 && (
                      <option value="Line 1 — Production">Line 1 — Production</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label">Target Asset / Equipment</label>
                  <select
                    className="form-select"
                    value={rcaForm.assetId}
                    onChange={(e) => setRcaForm({ ...rcaForm, assetId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">-- Select Asset (Optional) --</option>
                    {availableAssets.map((ast) => (
                      <option key={ast.id} value={ast.id}>
                        {ast.name || ast.asset_name || ast.assetName || ast.id} ({ast.asset_code || ast.assetCode || ast.tag || "Asset"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Severity Level</label>
                <select
                  className="form-select"
                  value={rcaForm.severity}
                  onChange={(e) => setRcaForm({ ...rcaForm, severity: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Critical">Critical (CCP / Quality Impact)</option>
                  <option value="High">High (High Scrap / Downtime)</option>
                  <option value="Medium">Medium (Speed Loss)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Incident Symptom & Preliminary Findings</label>
                <textarea
                  rows={3}
                  placeholder="Describe the initial non-conformance observation, affected batches, and immediate containment..."
                  value={rcaForm.description}
                  onChange={(e) => setRcaForm({ ...rcaForm, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsCreateRcaOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Initiate 8D Investigation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LOSS MODAL WITH STAGE SELECTOR */}
      {isCreateLossOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateLossOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingDown size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log Operational Loss Incident
                </h2>
              </div>
              <button onClick={() => setIsCreateLossOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLoss} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Loss Event Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tank Bottom Heel Residual Loss / Defective Preform Rejection"
                  value={lossForm.eventName}
                  onChange={(e) => setLossForm({ ...lossForm, eventName: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Operational Stage *</label>
                  <select
                    className="form-select"
                    value={lossForm.stage}
                    onChange={(e) => setLossForm({ ...lossForm, stage: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="PROCESSING">Processing Hall (Mass-Balance / Kitchen)</option>
                    <option value="PACKAGING">Packaging Lines (Bottling / Filling / Capping)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Loss Category *</label>
                  <select
                    className="form-select"
                    value={lossForm.category}
                    onChange={(e) => setLossForm({ ...lossForm, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Yield Loss">Yield Loss / Mass-Balance</option>
                    <option value="Scrap / Rework Loss">Scrap / Defect Loss</option>
                    <option value="Downtime Loss">Unplanned Downtime</option>
                    <option value="Quality Loss">Quality Out-of-Spec</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Process Line</label>
                  <select
                    className="form-select"
                    value={lossForm.lineId}
                    onChange={(e) => setLossForm({ ...lossForm, lineId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">-- Select Line --</option>
                    {availableLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name || line.line_name || line.code || line.id}
                      </option>
                    ))}
                    {availableLines.length === 0 && (
                      <option value="Line 1 — Production">Line 1 — Production</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label">Equipment / Asset</label>
                  <select
                    className="form-select"
                    value={lossForm.assetId}
                    onChange={(e) => setLossForm({ ...lossForm, assetId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">-- Select Equipment --</option>
                    {availableAssets.map((ast) => (
                      <option key={ast.id} value={ast.id}>
                        {ast.name || ast.asset_name || ast.assetName || ast.id} ({ast.asset_code || ast.assetCode || ast.tag || "Asset"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Lost Time (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={lossForm.hoursLost}
                    onChange={(e) => setLossForm({ ...lossForm, hoursLost: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Lost Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={lossForm.unitsLost}
                    onChange={(e) => setLossForm({ ...lossForm, unitsLost: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Impact ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="0"
                    value={lossForm.financialImpactUSD}
                    onChange={(e) => setLossForm({ ...lossForm, financialImpactUSD: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsCreateLossOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Loss Incident
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtnStyle = {
  border: "none",
  borderRadius: "6px",
  padding: "5px 12px",
  fontSize: "12px",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

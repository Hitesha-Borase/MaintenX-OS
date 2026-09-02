import React, { useState, useMemo } from "react";
import { 
  Building, 
  DollarSign, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  BrainCircuit, 
  RefreshCw, 
  BarChart2, 
  Download, 
  CheckCircle2, 
  Send, 
  ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

// Contexts for Enterprise Data Integration
import { useMasterData } from "../../context/MasterDataContext";
import { useProduction } from "../../context/ProductionContext";
import { useCMMS } from "../../context/CMMSContext";
import { useCI } from "../../context/CIContext";
import { useQuality } from "../../context/QualityContext";
import { useInventory } from "../../context/InventoryContext";

export function ExecutiveDashboard() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Connect Contexts
  const { plants } = useMasterData();
  const { productionOrders } = useProduction();
  const { workOrders, assets } = useCMMS();
  const { 
    fleetMTBF, 
    fleetMTTR, 
    realizedSavingsTotal, 
    projectedSavingsTotal,
    ciProjects,
    lossRecords
  } = useCI();
  const { qualityChecks, holds } = useQuality();
  const { inventory } = useInventory();

  // Local State
  const [selectedPlantId, setSelectedPlantId] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [activePlantDetail, setActivePlantDetail] = useState(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      addToast("Executive portfolio data synced with operational modules.", "success");
    }, 800);
  };

  const handleExportBoardReport = () => {
    addToast("Generating Executive Board Summary Report (PDF)... Download started.", "success");
  };

  const handleOpenPlantModal = (plant) => {
    setActivePlantDetail(plant);
    setIsPlantModalOpen(true);
  };

  const handleApproveAiSubmit = () => {
    addToast("AI Routing Recommendation Approved! Production order routed to Austin Skid 2 (PDF Section 18 Governance).", "success");
    setIsAiModalOpen(false);
  };

  // --- Dynamic Enterprise Calculations ---
  
  // 1. Filtered active plants
  const activePlants = useMemo(() => {
    if (selectedPlantId === "ALL") return plants;
    return plants.filter(p => p.id === selectedPlantId);
  }, [plants, selectedPlantId]);

  // 2. Production Performance (Achievement %)
  const productionStats = useMemo(() => {
    let totalTarget = 0;
    let totalActual = 0;
    
    productionOrders.forEach(order => {
      // Apply plant filter if necessary
      if (selectedPlantId !== "ALL" && order.plantId !== selectedPlantId) return;
      
      totalTarget += (Number(order.targetQuantity) || 0);
      totalActual += (Number(order.actualQuantity) || 0);
    });

    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : "0.0";
    return { achievement, totalTarget, totalActual };
  }, [productionOrders, selectedPlantId]);

  // 3. Plant Performance Portfolio (Comparison Table)
  const plantPerformance = useMemo(() => {
    return activePlants.map(plant => {
      // Plant-specific Production
      const pOrders = productionOrders.filter(o => o.plantId === plant.id);
      const pTarget = pOrders.reduce((sum, o) => sum + (Number(o.targetQuantity) || 0), 0);
      const pActual = pOrders.reduce((sum, o) => sum + (Number(o.actualQuantity) || 0), 0);
      const pAch = pTarget > 0 ? ((pActual / pTarget) * 100).toFixed(1) : "0.0";

      // Plant-specific CI Projects
      const activeCI = ciProjects.filter(p => p.plantId === plant.id && p.status === "Active").length;

      // Determine Status
      let status = "Optimal";
      if (Number(pAch) < 85) status = "Warning";
      if (Number(pAch) < 70) status = "Critical";

      return {
        ...plant,
        achievement: pAch + "%",
        activeCI,
        status,
        lines: plant.lines || 4,
        oee: plant.oee || "84.2%",
        cost: plant.cost || "$142.5K",
        scrapRate: plant.scrapRate || "0.4%",
        mtbf: plant.mtbf || "142 hrs"
      };
    });
  }, [activePlants, productionOrders, ciProjects]);

  // 4. Executive Alerts Engine
  const executiveAlerts = useMemo(() => {
    const alerts = [];
    
    // Check Production Risk
    if (Number(productionStats.achievement) < 80 && productionStats.totalTarget > 0) {
      alerts.push({
        type: "Critical",
        title: "Production Volume Risk",
        desc: `Enterprise production achievement is critically low at ${productionStats.achievement}%.`,
        icon: AlertTriangle,
        color: "#DC2626",
        bg: "rgba(239, 68, 68, 0.06)",
        border: "rgba(239, 68, 68, 0.15)",
        link: "/production"
      });
    }

    // Check Quality Holds
    const activeHolds = holds ? holds.filter(h => h.status === "Open" || h.status === "Active") : [];
    if (activeHolds.length > 0) {
      alerts.push({
        type: "Warning",
        title: "Active Quality Holds",
        desc: `There are ${activeHolds.length} open quality holds requiring review.`,
        icon: AlertTriangle,
        color: "#D97706",
        bg: "rgba(217, 119, 6, 0.06)",
        border: "rgba(217, 119, 6, 0.15)",
        link: "/quality"
      });
    }

    // Default Opportunity (if no critical alerts)
    if (alerts.length === 0) {
      alerts.push({
        type: "Opportunity",
        title: "OEE Optimization Opportunity",
        desc: "Implement PM on critical assets to gain projected 1.8% OEE lift.",
        icon: Zap,
        color: "#059669",
        bg: "rgba(16, 185, 129, 0.06)",
        border: "rgba(16, 185, 129, 0.15)",
        link: "/ci/reliability"
      });
    }

    return alerts;
  }, [productionStats, holds]);

  // 5. Top Loss Analysis (Aggregated from CIContext)
  const topLosses = useMemo(() => {
    let filteredLosses = lossRecords;
    if (selectedPlantId !== "ALL") {
      filteredLosses = lossRecords.filter(l => !l.plantId || l.plantId === selectedPlantId);
    }
    
    // Sort by financial impact descending
    const sorted = [...filteredLosses].sort((a, b) => (b.financialImpactUSD || 0) - (a.financialImpactUSD || 0));
    return sorted.slice(0, 3);
  }, [lossRecords, selectedPlantId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            Enterprise Executive Command Center
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Multi-plant manufacturing performance, financial loss drivers, and predictive AI insights
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Plant Selector */}
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              fontWeight: 600,
              outline: "none",
              fontSize: "13px",
              cursor: "pointer",
              minWidth: "150px"
            }}
          >
            <option value="ALL">Enterprise (All Plants)</option>
            {plants.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <Button variant="success" icon={Download} onClick={handleExportBoardReport}>
            Export Board Report (PDF)
          </Button>

          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleRefresh}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none"
            }}
          >
            Sync Data
          </Button>
        </div>
      </div>

      {/* Top Executive Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div onClick={() => navigate("/production")} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
          <StatCard
            title="Production Attainment"
            value={`${productionStats.achievement}%`}
            description={`${productionStats.totalActual.toLocaleString()} / ${productionStats.totalTarget.toLocaleString()} units`}
            icon={TrendingUp}
            color="#0284C7"
          />
        </div>

        <div onClick={() => navigate("/maintenance")} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
          <StatCard
            title="Enterprise Fleet MTBF"
            value={`${fleetMTBF}h`}
            description="Mean Time Between Failures"
            icon={Zap}
            color="#D97706"
          />
        </div>

        <div onClick={() => navigate("/ci/projects")} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
          <StatCard
            title="Realized CI Savings"
            value={`$${(realizedSavingsTotal / 1000).toFixed(1)}K`}
            description={`Pipeline: $${(projectedSavingsTotal / 1000).toFixed(1)}K`}
            icon={DollarSign}
            color="#059669"
          />
        </div>

        <div onClick={() => navigate("/costing")} style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
          <StatCard
            title="Manufacturing Cost (MTD)"
            value="[PENDING]"
            description="Awaiting ERP Backend"
            icon={DollarSign}
            color="#DC2626"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-grid-layout">
        
        {/* Left Side: Plant Performance & Loss Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Plant Performance Table */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Plant Performance Portfolio
              </h3>
              <Badge variant="cyan">{activePlants.length} Facilities Active</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {plantPerformance.map((plant, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedPlantId(plant.id);
                    handleOpenPlantModal(plant);
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "#C89547";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(2, 132, 199, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7", flexShrink: 0 }}>
                      <Building size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{plant.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{plant.region}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Achievement</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{plant.achievement}</span>
                    </div>
                    <Badge variant={plant.status === "Optimal" ? "emerald" : (plant.status === "Warning" ? "warning" : "destructive")}>
                      {plant.status}
                    </Badge>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Loss Analysis */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Top Major Losses (YTD)
              </h3>
              <Button variant="secondary" size="sm" onClick={() => navigate("/ci/reports")}>View All</Button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topLosses.length > 0 ? topLosses.map((loss, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "13px",
                    flexWrap: "wrap",
                    gap: "8px"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700, display: "block" }}>
                      {loss.category}
                    </span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
                      {loss.eventName} — Line: {loss.lineId}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "14px", alignItems: "center", marginLeft: "auto" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px", textAlign: "right" }}>
                      Hours Lost: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{loss.hoursLost}h</strong>
                    </span>
                    <span style={{ color: "#DC2626", fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      -${(loss.financialImpactUSD / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No significant losses recorded for this period/plant.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: AI Briefing, Risks & Standard vs Actual (Pending) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Executive Alerts Engine */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px", margin: "0 0 12px 0" }}>Strategic Risks & Opportunities</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {executiveAlerts.map((alert, idx) => {
                const Icon = alert.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={() => navigate(alert.link)}
                    style={{ 
                      display: "flex", 
                      gap: "10px", 
                      alignItems: "flex-start", 
                      padding: "10px", 
                      borderRadius: "8px", 
                      backgroundColor: alert.bg, 
                      border: `1px solid ${alert.border}`,
                      cursor: "pointer",
                      transition: "opacity 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                  >
                    <Icon size={16} color={alert.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>{alert.title}</span>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{alert.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Briefing Card */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(124, 58, 237, 0.3)", background: "linear-gradient(135deg, rgba(124, 58, 237, 0.04) 0%, #FFFFFF 100%)", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <BrainCircuit size={18} color="#7C3AED" />
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Executive AI Briefing & Governance</h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              Enterprise production achievement is <strong style={{ color: "#0284C7" }}>{productionStats.achievement}%</strong>. 
              {Number(productionStats.achievement) < 90 ? " Focus on resolving top downtime events to meet monthly volume targets." : " Output is tracking well against targets."}
            </p>
            <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
              <Button variant="primary" size="sm" style={{ flex: 1 }} onClick={() => setIsAiModalOpen(true)}>
                Approve AI Recommendation
              </Button>
            </div>
          </Card>

          {/* Cost Variance (Pending Backend) */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px dashed var(--border-subtle)", padding: "20px", opacity: 0.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-muted)", margin: 0 }}>
                Standard vs. Actual Cost
              </h3>
              <Badge variant="neutral">BACKEND PENDING</Badge>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
                Waiting for ERP Finance API integration to populate real-time MTD variance data.
              </p>
            </div>
          </Card>
        </div>

      </div>

      {/* AI Recommendation Governance Approval Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="AI Routing Governance Approval"
        subtitle="PDF Page 5 Section 18 Governance: Observe → Analyze → Recommend → Human Approves"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAiModalOpen(false)}>
              Reject Recommendation
            </Button>
            <Button variant="primary" icon={Send} onClick={handleApproveAiSubmit}>
              Authorize AI Action
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(124, 58, 237, 0.08)", border: "1px solid rgba(124, 58, 237, 0.2)", fontSize: "13px" }}>
            <strong>Recommendation:</strong> Route 5,000 L raw inventory to Austin Skid 2 Filler to capture 1.8% OEE lift.
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Per <strong>Strict PDF Rule 18</strong>: AI must NOT independently execute critical decisions. Executive approval authorizes the APS scheduling engine to reassign batch routing.
          </div>
        </div>
      </Modal>

      {/* Plant Deep-Dive Drill-Down Modal */}
      <Modal
        isOpen={isPlantModalOpen}
        onClose={() => setIsPlantModalOpen(false)}
        title={`Plant Deep-Dive: ${activePlantDetail?.name}`}
        subtitle={`MTD Manufacturing Cost: ${activePlantDetail?.cost}`}
        maxWidth="540px"
        footer={
          <Button variant="secondary" onClick={() => setIsPlantModalOpen(false)}>
            Close Drill-Down View
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Active Lines:</span>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{activePlantDetail?.lines} Packaging Lines</div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Plant OEE Average:</span>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0284C7" }}>{activePlantDetail?.oee}</div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Scrap Rate:</span>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#059669" }}>{activePlantDetail?.scrapRate}</div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Equipment MTBF:</span>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{activePlantDetail?.mtbf}</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

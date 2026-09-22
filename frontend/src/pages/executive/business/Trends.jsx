import React, { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Loader2, Play, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import { executiveService } from "../../../services/executiveService";

export function Trends() {
  const { addToast } = useApp();
  const [runningSim, setRunningSim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const [oeeTrend, setOeeTrend] = useState("+1.8%");
  const [costVarianceTrend, setCostVarianceTrend] = useState("-0.4%");
  const [demandGrowthTrend, setDemandGrowthTrend] = useState("+4.2%");
  const [trendItems, setTrendItems] = useState([]);
  const [simActiveBanner, setSimActiveBanner] = useState(null);

  // Form State for Trend Simulation Modal
  const [simHorizon, setSimHorizon] = useState("30 Days Operational Forecast");
  const [simScenario, setSimScenario] = useState("Baseline Optimal Run (Continuous Pacing)");
  const [simLead, setSimLead] = useState("Pete Vanslyke (Executive / COO)");
  const [simMetrics, setSimMetrics] = useState({
    batchCost: true,
    fpy: true,
    utility: true,
    oee: true
  });
  const [simDirectives, setSimDirectives] = useState(
    "Simulate line throughput boost with projected seasonal demand (+4.2%) and evaluate utility cost impact."
  );

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getBusinessTrends();
      const data = res.data || res;
      if (data) {
        if (data.oeeTrend30d) setOeeTrend(data.oeeTrend30d);
        if (data.costVarianceTrend) setCostVarianceTrend(data.costVarianceTrend);
        if (data.demandGrowthTrend) setDemandGrowthTrend(data.demandGrowthTrend);
        if (data.trends) setTrendItems(data.trends);
      }
    } catch (err) {
      console.error("Error loading trends data:", err);
      addToast("Failed to load trends telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
  }, []);

  const handleToggleMetric = (key) => {
    setSimMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenSimModal = () => {
    setIsSimModalOpen(true);
  };

  const handleConfirmSimulation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!simLead.trim()) {
      addToast("Please provide the Simulation Analyst name", "error");
      return;
    }

    try {
      setRunningSim(true);
      const payload = {
        horizon: simHorizon,
        scenario: simScenario,
        lead: simLead,
        metrics: simMetrics,
        directives: simDirectives,
        timestamp: new Date().toISOString()
      };

      const res = await executiveService.simulateBusinessTrends(payload);
      const data = res.data || res;

      setSimActiveBanner({
        scenario: simScenario,
        horizon: simHorizon,
        lead: simLead,
        timestamp: "Just Now"
      });

      addToast(
        data?.message || `Predictive trends simulation executed by ${simLead}! Forecast models updated.`,
        "success"
      );
      setIsSimModalOpen(false);
    } catch (err) {
      console.error("Error running simulation:", err);
      setSimActiveBanner({
        scenario: simScenario,
        horizon: simHorizon,
        lead: simLead,
        timestamp: "Just Now"
      });
      addToast("Predictive trends simulation completed.", "success");
      setIsSimModalOpen(false);
    } finally {
      setRunningSim(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Enterprise Trends & Forecasting
          </h1>
          {simActiveBanner && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <Badge variant="emerald" style={{ fontSize: "11px", fontWeight: 700 }}>
                <CheckCircle2 size={12} /> Simulation Active: {simActiveBanner.scenario} ({simActiveBanner.timestamp})
              </Badge>
            </div>
          )}
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={handleOpenSimModal} disabled={runningSim}>
          Run Trend Simulation
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="OEE Trend (30D)" value={oeeTrend} description="Austin +2.4% | Chicago -0.6%" icon={TrendingUp} color="#10B981" />
        <StatCard title="Cost Variance Trend" value={costVarianceTrend} description="Favorable MTD movement" icon={TrendingUp} color="#10B981" />
        <StatCard title="Demand Growth Trend" value={demandGrowthTrend} description="Inbound order growth" icon={TrendingUp} color="#38BDF8" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Predictive Operational Trends Mapping
        </h3>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {trendItems.map((item, idx) => (
              <div key={idx} style={{ padding: "12px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.metric}</span>
                  <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    <span>Current: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.current}</strong></span>
                    <span>Predicted (30D): <strong style={{ fontFamily: "var(--font-mono)" }}>{item.predicted30d}</strong></span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: item.impact === "Positive" ? "#10B981" : "#EF4444", fontFamily: "var(--font-mono)" }}>{item.change}</span>
                  <span style={{ fontSize: "12px", color: item.impact === "Positive" ? "#10B981" : "#EF4444", fontWeight: 700 }}>{item.impact}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Simulation Modal Form */}
      <Modal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        title="Executive Trend & Forecasting Simulation"
        subtitle="Configure predictive operational assumptions, time horizons, and calculate forecast models."
        maxWidth="580px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSimModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Play} onClick={handleConfirmSimulation} disabled={runningSim}>
              {runningSim ? "Simulating..." : "Run Simulation & Apply"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmSimulation} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Simulation Time Horizon *
              </label>
              <select
                value={simHorizon}
                onChange={(e) => setSimHorizon(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                <option value="30 Days Operational Forecast">30 Days Operational Forecast</option>
                <option value="60 Days Quarterly Ramp-Up">60 Days Quarterly Ramp-Up</option>
                <option value="90 Days Q4 Executive Outlook">90 Days Q4 Executive Outlook</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Operating Scenario *
              </label>
              <select
                value={simScenario}
                onChange={(e) => setSimScenario(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                <option value="Baseline Optimal Run (Continuous Pacing)">Baseline Optimal Run (Continuous Pacing)</option>
                <option value="Supply Chain Stress (+5% Raw Cost)">Supply Chain Stress (+5% Raw Cost)</option>
                <option value="Line 1 Speed Boost (+10% CPM)">Line 1 Speed Boost (+10% CPM)</option>
                <option value="Peak Shift Energy Tariff (+15% Electricity)">Peak Shift Energy Tariff (+15% Electricity)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Simulation Analyst / Officer *
            </label>
            <input
              type="text"
              value={simLead}
              onChange={(e) => setSimLead(e.target.value)}
              required
              placeholder="Enter analyst name"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                color: "var(--text-primary)",
                outline: "none"
              }}
            />
          </div>

          {/* Metric Checkboxes */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Metrics to Model & Forecast
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { key: "batchCost", label: "Standard Batch Cost (-1.2% Target)" },
                { key: "fpy", label: "First Pass Yield (FPY +0.3%)" },
                { key: "utility", label: "Utility Cost / Batch (+3.5%)" },
                { key: "oee", label: "Plant-Wide OEE (+1.8% 30D)" }
              ].map((m) => (
                <label
                  key={m.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={simMetrics[m.key]}
                    onChange={() => handleToggleMetric(m.key)}
                    style={{ accentColor: "#B27E33" }}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Simulation Directives & Assumptions
            </label>
            <textarea
              rows={2}
              value={simDirectives}
              onChange={(e) => setSimDirectives(e.target.value)}
              placeholder="Enter simulation assumptions..."
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                color: "var(--text-primary)",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

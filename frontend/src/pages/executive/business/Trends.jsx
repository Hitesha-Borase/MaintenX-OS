import React, { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function Trends() {
  const { addToast } = useApp();
  const [runningSim, setRunningSim] = useState(false);
  const [loading, setLoading] = useState(true);

  const [oeeTrend, setOeeTrend] = useState("+1.8%");
  const [costVarianceTrend, setCostVarianceTrend] = useState("-0.4%");
  const [demandGrowthTrend, setDemandGrowthTrend] = useState("+4.2%");
  const [trendItems, setTrendItems] = useState([]);

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

  const handleSimulate = async () => {
    try {
      setRunningSim(true);
      const res = await executiveService.simulateBusinessTrends({ timestamp: new Date().toISOString() });
      const data = res.data || res;
      addToast(data?.message || "Predictive trends simulation completed.", "success");
    } catch (err) {
      console.error("Error running simulation:", err);
      addToast("Failed to run predictive trends simulation", "error");
    } finally {
      setRunningSim(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Enterprise Trends & Forecasting
          </h1>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={handleSimulate} disabled={runningSim}>
          {runningSim ? "Simulating..." : "Run Trend Simulation"}
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="OEE Trend (30D)" value={oeeTrend} description="Austin +2.4% | Chicago -0.6%" icon={TrendingUp} color="#10B981" />
        <StatCard title="Cost Variance Trend" value={costVarianceTrend} description="Favorable MTD movement" icon={TrendingUp} color="#10B981" />
        <StatCard title="Demand Growth Trend" value={demandGrowthTrend} description="Inbound order growth" icon={TrendingUp} color="#38BDF8" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Predictive Operational Trends Mapping</h3>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {trendItems.map((item, idx) => (
              <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.metric}</span>
                  <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span>Current: {item.current}</span>
                    <span>Predicted (30D): {item.predicted30d}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: item.impact === "Positive" ? "#10B981" : "#EF4444" }}>{item.change}</span>
                  <span style={{ fontSize: "12px", color: item.impact === "Positive" ? "#10B981" : "#EF4444", fontWeight: 600 }}>{item.impact}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

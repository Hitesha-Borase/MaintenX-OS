import React, { useState } from "react";
import { Building, DollarSign, AlertTriangle, Zap, TrendingUp, BrainCircuit, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function ExecutiveDashboard() {
  const { addToast } = useApp();
  const [selectedPlant, setSelectedPlant] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      addToast("Executive portfolio data updated.", "success");
    }, 800);
  };

  const plants = [
    { name: "Austin Main Plant", oee: "84.2%", cost: "$142.5K", status: "Optimal" },
    { name: "Chicago East Plant", oee: "78.9%", cost: "$198.2K", status: "Warning" },
    { name: "Boston Logistics Hub", oee: "89.5%", cost: "$92.1K", status: "Optimal" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Header */}
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Executive Dashboard
          </h1>

        </div>
        <div className="mobile-flex-col" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: "var(--bg-card-subtle)",
              color: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            <option value="All">All Plants</option>
            <option value="Austin">Austin Plant</option>
            <option value="Chicago">Chicago Plant</option>
            <option value="Boston">Boston Plant</option>
          </select>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleRefresh}
            style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
          >
            Sync Portfolio
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4">
        <StatCard
          title="Multi-Plant Avg OEE"
          value="84.2%"
          description="Enterprise average"
          icon={Building}
          color="#38BDF8"
        />
        <StatCard
          title="Manufacturing Cost (MTD)"
          value="$432,800"
          description="Standard: $420,000"
          icon={DollarSign}
          color="#EF4444"
        />
        <StatCard
          title="CI Savings Realized"
          value="$64,200"
          description="Target: $50,000"
          icon={TrendingUp}
          color="#10B981"
        />
        <StatCard
          title="Active Opportunities"
          value="5 Strategic"
          description="OEE optimization"
          icon={Zap}
          color="#A855F7"
        />
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-grid-layout">
        
        {/* Left Side: Plant Performance & Financial Impact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Plant Performance Table */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>Plant Performance Portfolio</h3>
              <Badge variant="cyan">3 Facilities Active</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {plants.map((plant, idx) => (
                <div
                  key={idx}
                  className="mobile-flex-col"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "var(--primary-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(56, 189, 248, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                      <Building size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "block" }}>{plant.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Manufacturing Cost MTD: {plant.cost}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", textAlign: "right" }}>OEE</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{plant.oee}</span>
                    </div>
                    <Badge variant={plant.status === "Optimal" ? "emerald" : "warning"}>{plant.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cost Variance / Standards Breakdown */}
          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Standard vs. Actual Manufacturing Cost</h3>
            <div style={{ overflowX: "auto", margin: "0 -4px", padding: "0 4px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "500px" }}>
                {[
                { category: "Raw Materials", std: "$180,000", act: "$185,200", var: "+$5,200", status: "Over" },
                { category: "Packaging Materials", std: "$45,000", act: "$44,100", var: "-$900", status: "Under" },
                { category: "Direct Labour", std: "$110,000", act: "$118,500", var: "+$8,500", status: "Over" },
                { category: "Machine Time / Utilities", std: "$50,000", act: "$52,300", var: "+$2,300", status: "Over" },
                { category: "Overhead", std: "$35,000", act: "$32,700", var: "-$2,300", status: "Under" }
              ].map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                  <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{item.category}</span>
                  <span style={{ color: "var(--text-secondary)" }}>Std: {item.std}</span>
                  <span style={{ color: "var(--text-secondary)" }}>Act: {item.act}</span>
                  <span style={{ color: item.status === "Over" ? "#EF4444" : "#10B981", fontWeight: 700, textAlign: "right" }}>{item.var}</span>
                </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: AI Briefing & Risks/Opportunities */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* AI Briefing Card */}
          <Card style={{ border: "1px solid rgba(168, 85, 247, 0.4)", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(0, 0, 0, 0) 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <BrainCircuit size={18} color="#A855F7" />
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>Executive AI Briefing</h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Enterprise OEE holds steady at <strong style={{ color: "#38BDF8" }}>84.2%</strong>. Materials variance is up <strong style={{ color: "#EF4444" }}>2.9%</strong> due to raw milk pricing fluctuations. Suggest routing additional raw inventory to Austin Skid 2 to capitalize on high reliability MTBF capacity.
            </p>
            <div style={{ marginTop: "16px" }}>
              <Button variant="primary" size="sm" style={{ width: "100%" }} onClick={() => addToast("Detailed Briefing Generated in AI Hub.", "info")}>
                Access Full AI Analysis
              </Button>
            </div>
          </Card>

          {/* Risks & Opportunities Widget */}
          <Card>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>Strategic Risks & Opportunities</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "8px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
                <AlertTriangle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>Supply Chain Delay Risk</span>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Chicago raw materials shipment delay could affect Line 2 output.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "8px", borderRadius: "6px", backgroundColor: "rgba(16, 185, 129, 0.05)" }}>
                <Zap size={16} color="#10B981" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>OEE Optimization Opportunity</span>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Implement PM on Austin Filler to gain 1.8% OEE lift.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Trends Summary */}
          <Card>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>Enterprise Trends</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { metric: "Service Level", value: "98.2%", trend: "+0.4%", status: "up" },
                { metric: "Yield Variance", value: "-0.8%", trend: "-0.2%", status: "down" },
                { metric: "Machine Scrap", value: "$4,200", trend: "-12.5%", status: "down" }
              ].map((t, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{t.metric}</span>
                  <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{t.value} (<strong style={{ color: t.status === "down" ? "#10B981" : "#EF4444" }}>{t.trend}</strong>)</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

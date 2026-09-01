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

        <div className="mobile-flex-col" style={{ display: "flex", gap: "12px", alignItems: "center", width: "fit-content" }}>
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="input-field"
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "13px",
              cursor: "pointer",
              minWidth: "130px"
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
          color="#0284C7"
        />
        <StatCard
          title="Manufacturing Cost (MTD)"
          value="$432,800"
          description="Standard: $420,000"
          icon={DollarSign}
          color="#DC2626"
        />
        <StatCard
          title="CI Savings Realized"
          value="$64,200"
          description="Target: $50,000"
          icon={TrendingUp}
          color="#059669"
        />
        <StatCard
          title="Active Opportunities"
          value="5 Strategic"
          description="OEE optimization"
          icon={Zap}
          color="#7C3AED"
        />
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-grid-layout">
        
        {/* Left Side: Plant Performance & Financial Impact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Plant Performance Table */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Plant Performance Portfolio
              </h3>
              <Badge variant="cyan">3 Facilities Active</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {plants.map((plant, idx) => (
                <div
                  key={idx}
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
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Manufacturing Cost MTD: {plant.cost}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", textAlign: "right" }}>OEE</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{plant.oee}</span>
                    </div>
                    <Badge variant={plant.status === "Optimal" ? "emerald" : "warning"}>{plant.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cost Variance / Standards Breakdown */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
              Standard vs. Actual Manufacturing Cost
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { category: "Raw Materials", std: "$180,000", act: "$185,200", var: "+$5,200", status: "Over" },
                { category: "Packaging Materials", std: "$45,000", act: "$44,100", var: "-$900", status: "Under" },
                { category: "Direct Labour", std: "$110,000", act: "$118,500", var: "+$8,500", status: "Over" },
                { category: "Machine Time / Utilities", std: "$50,000", act: "$52,300", var: "+$2,300", status: "Over" },
                { category: "Overhead", std: "$35,000", act: "$32,700", var: "-$2,300", status: "Under" }
              ].map((item, idx) => (
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
                  <span style={{ color: "var(--text-primary)", fontWeight: 700, minWidth: "140px" }}>
                    {item.category}
                  </span>

                  <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", marginLeft: "auto" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                      Std: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{item.std}</strong>
                    </span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                      Act: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{item.act}</strong>
                    </span>
                    <span style={{ color: item.status === "Over" ? "#DC2626" : "#059669", fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      {item.var}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: AI Briefing & Risks/Opportunities */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* AI Briefing Card */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(124, 58, 237, 0.3)", background: "linear-gradient(135deg, rgba(124, 58, 237, 0.04) 0%, #FFFFFF 100%)", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <BrainCircuit size={18} color="#7C3AED" />
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Executive AI Briefing</h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              Enterprise OEE holds steady at <strong style={{ color: "#0284C7" }}>84.2%</strong>. Materials variance is up <strong style={{ color: "#DC2626" }}>2.9%</strong> due to raw milk pricing fluctuations. Suggest routing additional raw inventory to Austin Skid 2 to capitalize on high reliability MTBF capacity.
            </p>
            <div style={{ marginTop: "16px" }}>
              <Button variant="primary" size="sm" style={{ width: "100%" }} onClick={() => addToast("Detailed Briefing Generated in AI Hub.", "info")}>
                Access Full AI Analysis
              </Button>
            </div>
          </Card>

          {/* Risks & Opportunities Widget */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px", margin: "0 0 12px 0" }}>Strategic Risks & Opportunities</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Supply Chain Delay Risk</span>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Chicago raw materials shipment delay could affect Line 2 output.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                <Zap size={16} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>OEE Optimization Opportunity</span>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Implement PM on Austin Filler to gain 1.8% OEE lift.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Trends Summary */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px", margin: "0 0 12px 0" }}>Enterprise Trends</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { metric: "Service Level", value: "98.2%", trend: "+0.4%", status: "up" },
                { metric: "Yield Variance", value: "-0.8%", trend: "-0.2%", status: "down" },
                { metric: "Machine Scrap", value: "$4,200", trend: "-12.5%", status: "down" }
              ].map((t, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", paddingBottom: "6px", borderBottom: idx < 2 ? "1px solid var(--border-subtle)" : "none" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{t.metric}</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {t.value} (<strong style={{ color: t.status === "down" ? "#059669" : "#DC2626" }}>{t.trend}</strong>)
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

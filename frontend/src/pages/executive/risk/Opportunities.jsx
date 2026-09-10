import React, { useState, useEffect } from "react";
import { Zap, Plus, DollarSign, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function Opportunities() {
  const { addToast } = useApp();

  const [opps, setOpps] = useState([]);
  const [estAnnualizedSavings, setEstAnnualizedSavings] = useState("$54,400");
  const [implementationCosts, setImplementationCosts] = useState("$11,200");
  const [avgPaybackPeriod, setAvgPaybackPeriod] = useState("2.7 Months");
  const [loading, setLoading] = useState(true);
  const [authorizingId, setAuthorizingId] = useState(null);

  const fetchOppsData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getOpportunities();
      const data = res.data || res;
      if (data) {
        if (data.opportunities) setOpps(data.opportunities);
        if (data.estAnnualizedSavings) setEstAnnualizedSavings(data.estAnnualizedSavings);
        if (data.implementationCosts) setImplementationCosts(data.implementationCosts);
        if (data.avgPaybackPeriod) setAvgPaybackPeriod(data.avgPaybackPeriod);
      }
    } catch (err) {
      console.error("Error loading opportunities:", err);
      addToast("Failed to load opportunities registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOppsData();
  }, []);

  const handleApprove = async (id) => {
    try {
      setAuthorizingId(id);
      const res = await executiveService.approveOpportunity({ opportunityId: id });
      const data = res.data || res;
      setOpps(prev => prev.map(o => o.id === id ? { ...o, status: "Approved" } : o));
      addToast(data?.message || `Approved capital opportunity ${id} for immediate implementation.`, "success");
    } catch (err) {
      console.error("Error approving opportunity:", err);
      addToast("Failed to authorize opportunity", "error");
    } finally {
      setAuthorizingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Opportunities Registry
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Est. Annualized Savings" value={estAnnualizedSavings} description="Across active opportunities" icon={Zap} color="#10B981" />
        <StatCard title="Implementation Costs" value={implementationCosts} description="Total CAPEX requirement" icon={Zap} color="#38BDF8" />
        <StatCard title="Avg Payback Period" value={avgPaybackPeriod} description="Highly favorable ROI profile" icon={Zap} color="#A855F7" />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
          <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {opps.map((o, idx) => (
            <Card
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                padding: "16px 20px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-subtle)",
                borderLeft: o.status === "Approved" ? "4px solid #059669" : "4px solid #0284C7"
              }}
            >
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <Zap size={16} color={o.status === "Approved" ? "#059669" : "#0284C7"} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{o.id}: {o.title}</span>
                  <Badge variant={o.status === "Approved" ? "emerald" : "cyan"}>{o.status}</Badge>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Est Savings: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{o.estSavings}</strong> | Payback: <strong>{o.payback}</strong> | Capex Cost: {o.costToImplement}
                </p>
              </div>
              {o.status === "Proposed" && (
                <Button variant="success" size="sm" icon={DollarSign} onClick={() => handleApprove(o.id)} disabled={authorizingId === o.id} style={{ flexShrink: 0 }}>
                  {authorizingId === o.id ? "Authorizing..." : "Authorize Opportunity"}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

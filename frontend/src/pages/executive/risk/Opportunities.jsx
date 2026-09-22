import React, { useState, useEffect } from "react";
import { Zap, DollarSign, Loader2, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function Opportunities() {
  const { addToast } = useApp();

  const [opps, setOpps] = useState([]);
  const [estAnnualizedSavings, setEstAnnualizedSavings] = useState("$54,400");
  const [implementationCosts, setImplementationCosts] = useState("$11,200");
  const [avgPaybackPeriod, setAvgPaybackPeriod] = useState("2.7 Months");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State for Authorizing Opportunity
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authForm, setAuthForm] = useState({
    officer: "Pete Vanslyke",
    approvedCapex: "",
    targetQuarter: "Q4 2026",
    priority: "High ROI Fast-Track",
    directives: ""
  });

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

  const handleOpenAuthModal = (opp) => {
    setSelectedOpp(opp);
    setAuthForm({
      officer: "Pete Vanslyke",
      approvedCapex: opp.costToImplement ? opp.costToImplement.replace(/[^0-9.]/g, "") : "3200",
      targetQuarter: "Q4 2026",
      priority: "High ROI Fast-Track",
      directives: `Approved for execution. Allocate initial CAPEX funding and coordinate with plant maintenance engineering.`
    });
    setIsAuthModalOpen(true);
  };

  const handleConfirmAuthorize = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedOpp) return;

    try {
      setSubmitting(true);
      const res = await executiveService.approveOpportunity({
        opportunityId: selectedOpp.id,
        officer: authForm.officer,
        approvedCapex: authForm.approvedCapex,
        targetQuarter: authForm.targetQuarter,
        priority: authForm.priority,
        directives: authForm.directives
      });
      const data = res.data || res;

      setOpps(prev =>
        prev.map(o =>
          o.id === selectedOpp.id
            ? {
                ...o,
                status: "Approved",
                authorizedBy: authForm.officer,
                authorizedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              }
            : o
        )
      );

      addToast(
        data?.message || `Capital opportunity ${selectedOpp.id} successfully authorized by ${authForm.officer}!`,
        "success"
      );
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error("Error approving opportunity:", err);
      addToast("Failed to authorize opportunity", "error");
    } finally {
      setSubmitting(false);
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
                  {o.authorizedBy && (
                    <Badge variant="emerald">
                      ✓ Authorized by {o.authorizedBy} ({o.authorizedAt})
                    </Badge>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Est Savings: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{o.estSavings}</strong> | Payback: <strong>{o.payback}</strong> | Capex Cost: {o.costToImplement}
                </p>
              </div>
              {o.status === "Proposed" ? (
                <Button
                  variant="success"
                  size="sm"
                  icon={DollarSign}
                  onClick={() => handleOpenAuthModal(o)}
                  style={{ flexShrink: 0 }}
                >
                  Authorize Opportunity
                </Button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#059669" }}>
                  <CheckCircle2 size={16} />
                  <span>Authorized & Funded</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Authorize Opportunity Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={`Authorize Capital Opportunity: ${selectedOpp?.id || ""}`}
        subtitle={`${selectedOpp?.title || ""}`}
        maxWidth="560px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuthModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="success" icon={ShieldCheck} onClick={handleConfirmAuthorize} disabled={submitting}>
              {submitting ? "Releasing Budget..." : "Confirm & Authorize CAPEX"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmAuthorize} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Target Opportunity:</span>
              <strong style={{ color: "var(--text-primary)" }}>{selectedOpp?.title}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Expected Annualized Savings:</span>
              <strong style={{ color: "#059669" }}>{selectedOpp?.estSavings}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Expected Payback Period:</span>
              <strong style={{ color: "var(--text-primary)" }}>{selectedOpp?.payback}</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Approving Executive Officer
              </label>
              <input
                type="text"
                className="input-field"
                value={authForm.officer}
                onChange={(e) => setAuthForm(prev => ({ ...prev, officer: e.target.value }))}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Approved CAPEX Allocation ($)
              </label>
              <input
                type="number"
                className="input-field"
                value={authForm.approvedCapex}
                onChange={(e) => setAuthForm(prev => ({ ...prev, approvedCapex: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Target Execution Schedule
              </label>
              <select
                className="input-field"
                value={authForm.targetQuarter}
                onChange={(e) => setAuthForm(prev => ({ ...prev, targetQuarter: e.target.value }))}
              >
                <option value="Q3 2026">Q3 2026 (Immediate)</option>
                <option value="Q4 2026">Q4 2026 (Upcoming Fiscal)</option>
                <option value="Q1 2027">Q1 2027 (Next Annual Capex)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Priority Level
              </label>
              <select
                className="input-field"
                value={authForm.priority}
                onChange={(e) => setAuthForm(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="High ROI Fast-Track">High ROI Fast-Track</option>
                <option value="Standard Capital Project">Standard Capital Project</option>
                <option value="Energy & Sustainability Strategic">Energy & Sustainability Strategic</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Capital Authorization Directives
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={authForm.directives}
              onChange={(e) => setAuthForm(prev => ({ ...prev, directives: e.target.value }))}
              placeholder="Enter capital release conditions, vendor procurement guidelines, or milestone targets..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

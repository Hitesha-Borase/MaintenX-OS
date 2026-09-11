import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Tag, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { PlanModal } from "./PlanModal";
import { useMasterAdmin } from "../../../context/MasterAdminContext";

export function PlansPricing() {
  const { addToast } = useApp();
  const { plans, updatePlanStatus, removePlan, fetchPlans } = useMasterAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);

  React.useEffect(() => {
    fetchPlans?.();
  }, [fetchPlans]);

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    updatePlanStatus(id, newStatus);
    addToast(`Plan ${newStatus === "Active" ? "activated" : "deactivated"}`, "success");
  };

  const handleRemovePlan = (id, name) => {
    if (window.confirm(`Delete plan "${name}"? This cannot be undone.`)) {
      removePlan(id);
      addToast("Plan removed successfully", "destructive");
    }
  };

  const handleCreatePlan = () => {
    setPlanToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan) => {
    setPlanToEdit(plan);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
            Plans &amp; Pricing
          </h1>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreatePlan}
          style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 700 }}
        >
          Create New Plan
        </Button>
      </div>

      {/* Plans Grid — 2x2 on mobile, 4 on desktop */}
      <div className="kpi-grid-responsive grid-4" style={{ gap: "10px" }}>
        {plans.map((plan) => (
          <Card key={plan.id} style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", minWidth: 0 }}>
            {plan.status === "Inactive" && (
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.6)", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Badge variant="secondary" style={{ fontSize: "12px", padding: "4px 10px" }}>INACTIVE</Badge>
              </div>
            )}

            {/* Plan Header */}
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: (plan.isPopular || plan.name === "Bundles")
                ? "rgba(200, 149, 71, 0.08)"
                : plan.name === "MaintenX OS Complete"
                ? "rgba(37, 99, 235, 0.05)"
                : "transparent"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <Badge variant={
                    plan.name === "MaintenX OS Complete" ? "primary"
                    : (plan.isPopular || plan.name === "Bundles") ? "amber"
                    : plan.name === "Individual Modules" ? "warning"
                    : "secondary"
                  }>
                    {plan.name}
                  </Badge>
                  {(plan.isPopular || plan.name === "Bundles") && (
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#B27E33", backgroundColor: "rgba(200,149,71,0.15)", padding: "1px 6px", borderRadius: "4px", flexShrink: 0 }}>POPULAR</span>
                  )}
                </div>
                {/* Actions — above the inactive overlay z-index */}
                <div style={{ display: "flex", gap: "4px", position: "relative", zIndex: 2 }}>
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(plan.id, plan.status)} title={plan.status === "Active" ? "Deactivate" : "Activate"} style={{ padding: "4px" }}>
                    {plan.status === "Active" ? <X size={14} /> : <Check size={14} color="#10B981" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)} title="Edit Plan" style={{ padding: "4px" }}>
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemovePlan(plan.id, plan.name)} title="Delete Plan" style={{ padding: "4px" }}>
                    <Trash2 size={14} color="#EF4444" />
                  </Button>
                </div>
              </div>

              {/* Subtitle */}
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px" }}>
                {plan.subtitle || (Number(plan.priceMonthly) === 0 ? "Free 7-Day Evaluation" : `${plan.duration || "Unlimited"} Production`)}
              </div>

              {/* Price */}
              <div style={{ marginTop: "10px", display: "flex", alignItems: "baseline", gap: "3px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                  {Number(plan.priceMonthly) === 0 ? "₹0" : `$${Number(plan.priceMonthly || 0).toLocaleString()}`}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {Number(plan.priceMonthly) === 0 ? " / 7 days" : ` ${plan.currency || "CAD"}/mo`}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                {Number(plan.priceMonthly) === 0
                  ? "Free Evaluation Period"
                  : `or $${(Number(plan.priceAnnual) || Number(plan.priceMonthly) * 10 || 0).toLocaleString()} ${plan.currency || "CAD"}/yr`}
              </div>
            </div>

            {/* Plan Details */}
            <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>User Limit</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{plan.userLimit || "Unlimited"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Duration</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{plan.duration || "Unlimited"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Access Level</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{plan.accessLevel || "Standard"}</span>
              </div>

              {/* Features */}
              <div style={{ marginTop: "4px", paddingTop: "10px", borderTop: "1px dashed var(--border-color)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.03em" }}>
                  Features
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--text-primary)" }}>
                      <Check size={12} color="#10B981" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{feature}</span>
                    </div>
                  ))}
                  {(Array.isArray(plan.features) ? plan.features : []).length === 0 && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>No features listed</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {plans.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", borderRadius: "12px", border: "1px dashed var(--border-subtle)" }}>
            <Tag size={32} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
            <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>No SaaS Subscription Plans Found</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>Click "+ Create New Plan" to add a new subscription tier.</div>
          </div>
        )}
      </div>

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planToEdit={planToEdit}
      />
    </div>
  );
}

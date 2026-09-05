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
  const { plans, addPlan, updatePlanStatus, removePlan, editPlan } = useMasterAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    updatePlanStatus(id, newStatus);
    addToast(`Plan ${newStatus === "Active" ? "activated" : "deactivated"}`, "success");
  };

  const handleRemovePlan = (id) => {
    if (window.confirm("Are you sure you want to remove this plan?")) {
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
            Plans & Pricing
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

      {/* Plans Grid - 2x2 on mobile (aamne-samne), 4 on desktop */}
      <div className="kpi-grid-responsive grid-4" style={{ gap: "10px" }}>
        {plans.map((plan) => (
          <Card key={plan.id} style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", minWidth: 0 }}>
            {plan.status === "Inactive" && (
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.6)", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Badge variant="secondary" style={{ fontSize: "12px", padding: "4px 10px" }}>INACTIVE</Badge>
              </div>
            )}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)", backgroundColor: plan.name === "Enterprise" ? "rgba(37, 99, 235, 0.05)" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                <Badge variant={plan.name === "Enterprise" ? "primary" : plan.name === "Professional" ? "emerald" : "secondary"}>{plan.name}</Badge>
                <div style={{ display: "flex", gap: "4px", position: "relative", zIndex: 2 }}>
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(plan.id, plan.status)} title={plan.status === "Active" ? "Deactivate Plan" : "Activate Plan"} style={{ padding: "4px" }}>
                    {plan.status === "Active" ? <X size={14} /> : <Check size={14} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)} title="Edit Plan" style={{ padding: "4px" }}><Edit2 size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemovePlan(plan.id)} title="Delete Plan" style={{ padding: "4px" }}><Trash2 size={14} color="#EF4444" /></Button>
                </div>
              </div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "3px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>${plan.priceMonthly}</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>/mo</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>or ${plan.priceAnnual}/yr</div>
            </div>
            
            <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>User Limit</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{plan.userLimit}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Trial Duration</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{plan.duration}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Access Level</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{plan.accessLevel}</span>
              </div>
              
              <div style={{ marginTop: "4px", paddingTop: "10px", borderTop: "1px dashed var(--border-color)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.03em" }}>Features</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {plan.features.map((feature, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--text-primary)" }}>
                      <Check size={12} color="#10B981" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <PlanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planToEdit={planToEdit}
      />
    </div>
  );
}

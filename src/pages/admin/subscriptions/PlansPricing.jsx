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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Plans & Pricing</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="primary" icon={Plus} onClick={handleCreatePlan}>Create New Plan</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        {plans.map((plan) => (
          <Card key={plan.id} style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
            {plan.status === "Inactive" && (
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.6)", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Badge variant="secondary" style={{ fontSize: "14px", padding: "8px 16px" }}>INACTIVE</Badge>
              </div>
            )}
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)", backgroundColor: plan.name === "Enterprise" ? "rgba(37, 99, 235, 0.05)" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge variant={plan.name === "Enterprise" ? "primary" : plan.name === "Professional" ? "emerald" : "secondary"}>{plan.name}</Badge>
                <div style={{ display: "flex", gap: "8px", position: "relative", zIndex: 2 }}>
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(plan.id, plan.status)} title={plan.status === "Active" ? "Deactivate Plan" : "Activate Plan"}>
                    {plan.status === "Active" ? <X size={16} /> : <Check size={16} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)} title="Edit Plan"><Edit2 size={16} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemovePlan(plan.id)} title="Delete Plan"><Trash2 size={16} color="#EF4444" /></Button>
                </div>
              </div>
              <div style={{ marginTop: "24px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-primary)" }}>${plan.priceMonthly}</span>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>/mo</span>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>or ${plan.priceAnnual}/year</div>
            </div>
            
            <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>User Limit</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{plan.userLimit}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Trial Duration</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{plan.duration}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Access Level</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{plan.accessLevel}</span>
              </div>
              
              <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px dashed var(--border-color)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "12px", letterSpacing: "0.5px" }}>Features</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((feature, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-primary)" }}>
                      <Check size={14} color="#10B981" />
                      <span>{feature}</span>
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

import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { Tag, CreditCard } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";

export function PlanModal({ isOpen, onClose, planToEdit = null }) {
  const { addPlan, editPlan } = useMasterAdmin();
  const { addToast } = useApp();
  
  const [formData, setFormData] = useState({
    name: "",
    priceMonthly: ""
  });

  useEffect(() => {
    if (planToEdit) {
      setFormData({ name: planToEdit.name, priceMonthly: planToEdit.priceMonthly });
    } else {
      setFormData({ name: "", priceMonthly: "" });
    }
  }, [planToEdit, isOpen]);

  const handleSubmit = () => {
    if (!formData.name && !planToEdit) {
      addToast("Please enter a plan name", "warning");
      return;
    }
    if (formData.priceMonthly === "" || isNaN(formData.priceMonthly)) {
      addToast("Please enter a valid monthly price", "warning");
      return;
    }
    
    if (planToEdit) {
      editPlan(planToEdit.id, parseInt(formData.priceMonthly));
      addToast(`${planToEdit.name} price updated`, "success");
    } else {
      addPlan({
        name: formData.name,
        priceMonthly: parseInt(formData.priceMonthly),
        priceAnnual: parseInt(formData.priceMonthly) * 10,
        duration: "Unlimited",
        userLimit: 25,
        accessLevel: "Standard",
        features: ["Standard Features", "Email Support"]
      });
      addToast(`${formData.name} plan created`, "success");
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? "Edit Plan Pricing" : "Create New Plan"}
      subtitle={planToEdit ? "Update pricing for existing tier" : "Define a new subscription tier"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{planToEdit ? "Save Changes" : "Create Plan"}</Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {!planToEdit && (
          <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <Tag size={14} color="var(--accent-amber)" /> Plan Details
            </label>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Plan Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Starter Plan" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="form-input"
              />
            </div>
          </div>
        )}

        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <CreditCard size={14} color="var(--accent-emerald)" /> Pricing Structure
          </label>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Monthly Price (USD) *</label>
            <input 
              type="number" 
              placeholder="e.g. 99" 
              value={formData.priceMonthly}
              onChange={e => setFormData({...formData, priceMonthly: e.target.value})}
              className="form-input"
              min="0"
            />
          </div>
        </div>

      </div>
    </Modal>
  );
}

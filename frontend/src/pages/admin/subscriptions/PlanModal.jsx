import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { Tag, CreditCard, Star, ListCheck } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";

export function PlanModal({ isOpen, onClose, planToEdit = null }) {
  const { addPlan, editPlan } = useMasterAdmin();
  const { addToast } = useApp();
  
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    priceMonthly: "",
    priceAnnual: "",
    currency: "CAD",
    isPopular: false,
    features: ""
  });

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name || "",
        subtitle: planToEdit.subtitle || "",
        priceMonthly: planToEdit.priceMonthly !== undefined ? planToEdit.priceMonthly : "",
        priceAnnual: planToEdit.priceAnnual !== undefined ? planToEdit.priceAnnual : "",
        currency: planToEdit.currency || "CAD",
        isPopular: !!planToEdit.isPopular,
        features: Array.isArray(planToEdit.features) ? planToEdit.features.join("\n") : (planToEdit.features || "")
      });
    } else {
      setFormData({
        name: "",
        subtitle: "",
        priceMonthly: "",
        priceAnnual: "",
        currency: "CAD",
        isPopular: false,
        features: ""
      });
    }
  }, [planToEdit, isOpen]);

  const handleSubmit = () => {
    if (!formData.name) {
      addToast("Please enter a plan name", "warning");
      return;
    }
    if (formData.priceMonthly === "" || isNaN(formData.priceMonthly)) {
      addToast("Please enter a valid monthly price (0 or higher)", "warning");
      return;
    }
    
    const monthly = parseInt(formData.priceMonthly, 10);
    const annual = formData.priceAnnual !== "" && !isNaN(formData.priceAnnual) 
      ? parseInt(formData.priceAnnual, 10) 
      : monthly * 10;
    
    const featuresList = formData.features.trim()
      ? formData.features.split("\n").map(f => f.trim()).filter(Boolean)
      : (planToEdit?.features || ["1 Dedicated Production Line", "Operator Console Access", "Standard Shift Analytics", "Email & Chat Support"]);

    const planPayload = {
      name: formData.name,
      subtitle: formData.subtitle || (monthly === 0 ? "Free 7-Day Evaluation" : "Dedicated Industrial Line"),
      priceMonthly: monthly,
      priceAnnual: annual,
      currency: formData.currency || "CAD",
      duration: monthly === 0 ? "7 Days" : "Unlimited",
      isPopular: formData.isPopular,
      ctaText: monthly === 0 ? "Start Free Pilot" : formData.name.toLowerCase().includes("bundle") ? "Launch Bundles" : formData.name.toLowerCase().includes("complete") ? "Contact Enterprise" : "Choose Modules",
      features: featuresList
    };

    if (planToEdit) {
      editPlan(planToEdit.id, planPayload);
      addToast(`${formData.name} plan updated successfully`, "success");
    } else {
      addPlan({
        ...planPayload,
        userLimit: 25,
        accessLevel: "Standard",
        modules: ["produce"]
      });
      addToast(`${formData.name} plan created successfully`, "success");
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? `Edit Plan: ${planToEdit.name}` : "Create New Plan"}
      subtitle={planToEdit ? "Changes will sync to both Master Admin and Landing Page" : "Add a configurable subscription plan"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{planToEdit ? "Save & Sync Changes" : "Create Plan"}</Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
        
        {/* Plan Name & Subtitle */}
        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <Tag size={14} color="var(--accent-amber)" /> Plan Identification
          </label>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Plan Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Bundles, Plant Pilot, MaintenX OS Complete" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="form-input"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Subtitle / Target Audience</label>
            <input 
              type="text" 
              placeholder="e.g. Full Multi-Line Bottling Plant" 
              value={formData.subtitle}
              onChange={e => setFormData({...formData, subtitle: e.target.value})}
              className="form-input"
            />
          </div>
        </div>

        {/* Pricing Structure */}
        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <CreditCard size={14} color="var(--accent-emerald)" /> Pricing & Currency
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Monthly Price *</label>
              <input 
                type="number" 
                placeholder="e.g. 1499 (0 for Free/Trial)" 
                value={formData.priceMonthly}
                onChange={e => {
                  const val = e.target.value;
                  const num = parseInt(val, 10);
                  setFormData({
                    ...formData,
                    priceMonthly: val,
                    priceAnnual: !isNaN(num) ? num * 10 : ""
                  });
                }}
                className="form-input"
                min="0"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Currency</label>
              <select 
                value={formData.currency}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="form-input"
              >
                <option value="CAD">CAD ($)</option>
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Annual Price (Optional)</label>
            <input 
              type="number" 
              placeholder="Auto-calculated (Monthly x 10)" 
              value={formData.priceAnnual}
              onChange={e => setFormData({...formData, priceAnnual: e.target.value})}
              className="form-input"
              min="0"
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", marginTop: "4px" }}>
            <input 
              type="checkbox" 
              checked={formData.isPopular}
              onChange={e => setFormData({...formData, isPopular: e.target.checked})}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Star size={13} color="#C89547" fill={formData.isPopular ? "#C89547" : "none"} /> Mark as "MOST POPULAR" Highlight
            </span>
          </label>
        </div>

        {/* Features list */}
        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <ListCheck size={14} color="#3B82F6" /> Features (One per line)
          </label>
          <textarea
            rows={5}
            placeholder="1 Packaging or Bottling Line&#10;Operator HMI Touchscreen Console&#10;Micro-Stop & Downtime Logging&#10;Standard Shift OEE Metrics"
            value={formData.features}
            onChange={e => setFormData({...formData, features: e.target.value})}
            className="form-input"
            style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", lineHeight: 1.5, resize: "vertical" }}
          />
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Har line ek checklist item banegi jo Landing Page aur Master Admin dono par dikhegi.
          </div>
        </div>

      </div>
    </Modal>
  );
}

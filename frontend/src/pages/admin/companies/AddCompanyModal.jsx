import React, { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";
import { Building2, User, Mail, CreditCard } from "lucide-react";

export function AddCompanyModal({ isOpen, onClose }) {
  const { addCompany } = useMasterAdmin();
  const { addToast } = useApp();
  
  const [formData, setFormData] = useState({
    name: "",
    admin: "",
    adminEmail: "",
    subscription: "MaintenX OS Complete"
  });

  const handleCreate = () => {
    if (!formData.name || !formData.admin || !formData.adminEmail) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    addCompany(formData);
    addToast(`${formData.name} company created successfully!`, "success");
    onClose();
    // Reset form
    setFormData({
      name: "",
      admin: "",
      adminEmail: "",
      subscription: "MaintenX OS Complete"
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Company"
      subtitle="Register a new tenant company on the platform"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate}>Create Company</Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        
        <div style={{ padding: "12px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <Building2 size={14} color="var(--accent-amber)" /> Company Details
          </label>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Company Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Acme Corp" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="form-input"
            />
          </div>
        </div>
        
        <div style={{ padding: "12px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <User size={14} color="var(--accent-cyan)" /> Administrator Account
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Primary Admin Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Jane Doe" 
                value={formData.admin}
                onChange={e => setFormData({...formData, admin: e.target.value})}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Admin Email Address *</label>
              <input 
                type="email" 
                placeholder="jane@example.com" 
                value={formData.adminEmail}
                onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div style={{ padding: "12px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <CreditCard size={14} color="var(--accent-emerald)" /> Billing & Subscription
          </label>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Initial Subscription Plan</label>
            <select 
              value={formData.subscription}
              onChange={e => setFormData({...formData, subscription: e.target.value})}
              className="form-select"
            >
              <option value="Plant Pilot">Plant Pilot (7 Days)</option>
              <option value="Individual Modules">Individual Modules ($1,499 CAD/mo)</option>
              <option value="Bundles">Bundles ($3,499 CAD/mo)</option>
              <option value="MaintenX OS Complete">MaintenX OS Complete ($5,499 CAD/mo)</option>
            </select>
          </div>
        </div>

      </div>
    </Modal>
  );
}

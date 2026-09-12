import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { User, Building2, Mail } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";

export function AdminModal({ isOpen, onClose, adminToEdit = null, availableCompanies = [] }) {
  const { addUser, editUser } = useMasterAdmin();
  const { addToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: ""
  });

  useEffect(() => {
    if (adminToEdit) {
      setFormData({ 
        name: adminToEdit.name, 
        email: adminToEdit.email || "", 
        company: adminToEdit.company 
      });
    } else {
      setFormData({ 
        name: "", 
        email: "", 
        company: availableCompanies[0] || "" 
      });
    }
  }, [adminToEdit, isOpen, availableCompanies]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.company) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      if (adminToEdit) {
        await editUser(adminToEdit.id, formData.name);
        addToast("Administrator details updated", "success");
      } else {
        await addUser({ 
          name: formData.name.trim(), 
          email: formData.email.trim(), 
          company: formData.company, 
          role: "Company Admin" 
        });
        addToast(`${formData.name} added as administrator for ${formData.company}`, "success");
      }
      onClose();
    } catch (err) {
      addToast(err?.message || "Failed to save administrator", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={adminToEdit ? "Edit Administrator" : "Add Administrator"}
      subtitle="Manage primary admin account for a tenant company"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : adminToEdit ? "Save Changes" : "Add Administrator"}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <User size={14} color="var(--accent-cyan)" /> Administrator Details
          </label>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Full Name *</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="form-input"
              disabled={submitting}
            />
          </div>
          <div style={{ marginTop: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              Email Address {adminToEdit ? "" : "(optional, auto-generated if empty)"}
            </label>
            <input 
              type="email" 
              placeholder="e.g. jdoe@company.com" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="form-input"
              disabled={submitting || !!adminToEdit}
            />
          </div>
        </div>
        
        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", opacity: adminToEdit ? 0.7 : 1, pointerEvents: adminToEdit ? 'none' : 'auto' }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <Building2 size={14} color="var(--accent-amber)" /> Associated Company
          </label>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Select Tenant Company *</label>
            <select 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              className="form-select"
              disabled={!!adminToEdit || submitting}
            >
              {availableCompanies.length === 0 && <option value="">No companies available</option>}
              {availableCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </Modal>
  );
}

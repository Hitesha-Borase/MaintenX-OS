import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { User, Building2 } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";

export function AdminModal({ isOpen, onClose, adminToEdit = null, availableCompanies = [] }) {
  const { addUser, editUser } = useMasterAdmin();
  const { addToast } = useApp();
  
  const [formData, setFormData] = useState({
    name: "",
    company: ""
  });

  useEffect(() => {
    if (adminToEdit) {
      setFormData({ name: adminToEdit.name, company: adminToEdit.company });
    } else {
      setFormData({ name: "", company: availableCompanies[0] || "" });
    }
  }, [adminToEdit, isOpen, availableCompanies]);

  const handleSubmit = () => {
    if (!formData.name || !formData.company) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    
    if (adminToEdit) {
      editUser(adminToEdit.id, formData.name);
      addToast("Administrator details updated", "success");
    } else {
      addUser({ name: formData.name, company: formData.company, role: "Company Admin" });
      addToast(`${formData.name} added as admin for ${formData.company}`, "success");
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={adminToEdit ? "Edit Administrator" : "Add Administrator"}
      subtitle="Manage primary admin account for a tenant company"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{adminToEdit ? "Save Changes" : "Add Administrator"}</Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
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
              disabled={!!adminToEdit}
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

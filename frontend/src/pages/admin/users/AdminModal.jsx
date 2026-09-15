import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { User, Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";

export function AdminModal({ isOpen, onClose, adminToEdit = null, availableCompanies = [] }) {
  const { addUser, editUser } = useMasterAdmin();
  const { addToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: ""
  });

  useEffect(() => {
    if (adminToEdit) {
      setFormData({ 
        name: adminToEdit.name, 
        email: adminToEdit.email || "", 
        password: "",
        company: adminToEdit.company 
      });
    } else {
      setFormData({ 
        name: "", 
        email: "", 
        password: "",
        company: availableCompanies[0] || "" 
      });
      setShowPassword(false);
    }
  }, [adminToEdit, isOpen, availableCompanies]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.company) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    if (!adminToEdit && (!formData.password || formData.password.length < 6)) {
      addToast("Administrator password is required (min 6 characters)", "warning");
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
          role: "Company Admin",
          password: formData.password
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
      subtitle="Manage administrator accounts for a tenant company"
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

          {!adminToEdit && (
            <div style={{ marginTop: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                <Lock size={12} style={{ display: "inline", marginRight: "4px" }} />
                Administrator Password *
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Set login password (min 6 chars)" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="form-input"
                  style={{ paddingRight: "40px", width: "100%" }}
                  autoComplete="new-password"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}
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

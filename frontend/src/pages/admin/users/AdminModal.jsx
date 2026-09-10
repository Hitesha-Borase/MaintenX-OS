import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { User, Building2, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";

export function AdminModal({ isOpen, onClose, adminToEdit = null, availableCompanies = [] }) {
  const { addUser, editUser } = useMasterAdmin();
  const { addToast } = useApp();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (adminToEdit) {
      setFormData({
        name: adminToEdit.name || "",
        email: adminToEdit.email || (adminToEdit.name ? `${adminToEdit.name.toLowerCase().replace(/\s+/g, ".")}@example.com` : ""),
        password: "",
        company: adminToEdit.company || availableCompanies[0] || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        company: availableCompanies[0] || ""
      });
    }
    setShowPassword(false);
  }, [adminToEdit, isOpen, availableCompanies]);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.name.trim() || !formData.company) {
      addToast("Please fill in administrator name and company", "warning");
      return;
    }

    if (!formData.email.trim()) {
      addToast("Please enter an administrator email address", "warning");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      addToast("Please enter a valid email address", "warning");
      return;
    }

    if (!adminToEdit && !formData.password.trim()) {
      addToast("Please enter a login password for the administrator", "warning");
      return;
    }

    if (formData.password.trim() && formData.password.trim().length < 6) {
      addToast("Password must be at least 6 characters long", "warning");
      return;
    }
    
    if (adminToEdit) {
      editUser(adminToEdit.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company,
        ...(formData.password.trim() ? { password: formData.password.trim() } : {})
      });
      addToast("Administrator details updated successfully", "success");
    } else {
      addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        company: formData.company,
        role: "Company Admin"
      });
      addToast(`${formData.name.trim()} added as admin for ${formData.company}`, "success");
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={adminToEdit ? "Edit Administrator" : "Add Administrator"}
      subtitle="Manage primary admin account and login credentials for a tenant company"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{adminToEdit ? "Save Changes" : "Add Administrator"}</Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        
        {/* Administrator Details Section */}
        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <User size={14} color="var(--accent-cyan)" /> Administrator Account Details
          </label>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Full Name *</label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Email Address *</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type="email" 
                  placeholder="e.g. admin@company.com" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                />
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Used as the primary login ID and for system notifications.
              </span>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {adminToEdit ? "Change Password (optional)" : "Password *"}
                </label>
                {adminToEdit && (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Leave blank to keep unchanged</span>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={adminToEdit ? "Enter new password to update..." : "Enter temporary or secure password..."} 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="form-input"
                  style={{ paddingLeft: "36px", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Minimum 6 characters. The administrator can update their password upon login.
              </span>
            </div>
          </div>
        </div>
        
        {/* Associated Company Section */}
        <div style={{ padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", opacity: adminToEdit ? 0.75 : 1, pointerEvents: adminToEdit ? 'none' : 'auto' }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <Building2 size={14} color="var(--accent-amber)" /> Associated Tenant Company
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

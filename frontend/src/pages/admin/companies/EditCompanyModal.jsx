import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";
import { Building2, User, Mail, Phone, CreditCard } from "lucide-react";

export function EditCompanyModal({ isOpen, onClose, company = null }) {
  const { updateCompanyDetails, plans } = useMasterAdmin();
  const { addToast } = useApp();

  const planOptions = plans && plans.length > 0
    ? plans.filter((p) => p.status === "Active" || p.status === "active").map((p) => ({
        value: p.name,
        label: `${p.name}${p.priceMonthly && Number(p.priceMonthly) > 0 ? ` ($${Number(p.priceMonthly).toLocaleString()} ${p.currency || "CAD"}/mo)` : " (Free)"}`,
      }))
    : [
        { value: "Plant Pilot", label: "Plant Pilot (Free – 7 Days)" },
        { value: "Individual Modules", label: "Individual Modules ($1,499 CAD/mo)" },
      ];

  const [formData, setFormData] = useState({
    name: "",
    admin: "",
    adminEmail: "",
    adminPhone: "",
    subscription: planOptions[0]?.value || "Plant Pilot",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        admin: company.admin || "",
        adminEmail: company.adminEmail || "",
        adminPhone: company.adminPhone || "",
        subscription: company.subscription || planOptions[0]?.value || "Plant Pilot",
      });
    }
  }, [company, isOpen, plans]);

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.admin.trim() || !formData.adminEmail.trim()) {
      addToast("Company name, company owner name, and email are required", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCompanyDetails(company.id, {
        name: formData.name.trim(),
        adminName: formData.admin.trim(),
        adminEmail: formData.adminEmail.trim(),
        adminPhone: formData.adminPhone.trim(),
        subscription: formData.subscription,
      });
      addToast(`Company & company owner updated successfully!`, "success");
      onClose();
    } catch (err) {
      addToast(err?.message || "Failed to update company details", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionStyle = {
    padding: "14px",
    backgroundColor: "var(--bg-main)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-subtle)",
  };

  const sectionLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--text-secondary)",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const fieldLabelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "4px",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Company & Owner"
      subtitle={company ? `Update profile and company owner for ${company.name}` : "Edit Company"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Company Details */}
        <div style={sectionStyle}>
          <div style={sectionLabelStyle}>
            <Building2 size={14} color="var(--accent-amber)" /> Company Details
          </div>
          <div>
            <label style={fieldLabelStyle}>Company Name *</label>
            <input
              type="text"
              placeholder="e.g. Acme Manufacturing Ltd"
              value={formData.name}
              onChange={set("name")}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Company Owner Account */}
        <div style={sectionStyle}>
          <div style={sectionLabelStyle}>
            <User size={14} color="var(--accent-cyan)" /> Company Owner Details
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={fieldLabelStyle}>Company Owner Name *</label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.admin}
                onChange={set("admin")}
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={fieldLabelStyle}>
                  <Mail size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Owner Email *
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.adminEmail}
                  onChange={set("adminEmail")}
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>
                  <Phone size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Owner Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.adminPhone}
                  onChange={set("adminPhone")}
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plan */}
        <div style={sectionStyle}>
          <div style={sectionLabelStyle}>
            <CreditCard size={14} color="var(--accent-indigo)" /> Subscription Plan
          </div>
          <div>
            <label style={fieldLabelStyle}>Assigned Plan</label>
            <select
              value={formData.subscription}
              onChange={set("subscription")}
              className="form-input"
              disabled={isSubmitting}
            >
              {planOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}

import React, { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";
import { Building2, User, Mail, Phone, CreditCard } from "lucide-react";

export function AddCompanyModal({ isOpen, onClose }) {
  const { addCompany, plans } = useMasterAdmin();
  const { addToast } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    admin: "",
    adminEmail: "",
    adminPhone: "",
    subscription: "MaintenX OS Complete",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCreate = async () => {
    if (!formData.name || !formData.admin || !formData.adminEmail) {
      addToast("Company name, admin name and email are required", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await addCompany(formData);
      addToast(`${formData.name} created successfully!`, "success");
      onClose();
      setFormData({ name: "", admin: "", adminEmail: "", adminPhone: "", subscription: "MaintenX OS Complete" });
    } catch (err) {
      addToast(err.message || "Failed to create company", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build plan options: use live plans from context if available, else static fallback
  const planOptions = plans && plans.length > 0
    ? plans.filter((p) => p.status === "Active" || p.status === "active").map((p) => ({
        value: p.name,
        label: `${p.name}${p.priceMonthly && Number(p.priceMonthly) > 0 ? ` ($${Number(p.priceMonthly).toLocaleString()} ${p.currency || "CAD"}/mo)` : " (Free)"}`,
      }))
    : [
        { value: "Plant Pilot", label: "Plant Pilot (Free – 7 Days)" },
        { value: "Individual Modules", label: "Individual Modules ($1,499 CAD/mo)" },
        { value: "Bundles", label: "Bundles ($3,499 CAD/mo)" },
        { value: "MaintenX OS Complete", label: "MaintenX OS Complete ($5,499 CAD/mo)" },
      ];

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
      title="Add New Company"
      subtitle="Register a new tenant company on the platform"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Company"}
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
            />
          </div>
        </div>

        {/* Administrator Account */}
        <div style={sectionStyle}>
          <div style={sectionLabelStyle}>
            <User size={14} color="var(--accent-cyan)" /> Administrator Account
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Row 1: Name */}
            <div>
              <label style={fieldLabelStyle}>Admin Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.admin}
                onChange={set("admin")}
                className="form-input"
              />
            </div>
            {/* Row 2: Email + Phone side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={fieldLabelStyle}>
                  <Mail size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Admin Email *
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.adminEmail}
                  onChange={set("adminEmail")}
                  className="form-input"
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>
                  <Phone size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.adminPhone}
                  onChange={set("adminPhone")}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Billing & Subscription */}
        <div style={sectionStyle}>
          <div style={sectionLabelStyle}>
            <CreditCard size={14} color="var(--accent-emerald)" /> Billing &amp; Subscription
          </div>
          <div>
            <label style={fieldLabelStyle}>Select Plan *</label>
            <select
              value={formData.subscription}
              onChange={set("subscription")}
              className="form-select"
            >
              {planOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", marginBottom: 0 }}>
              Default password <strong>Password@123</strong> will be set for the admin account.
            </p>
          </div>
        </div>

      </div>
    </Modal>
  );
}

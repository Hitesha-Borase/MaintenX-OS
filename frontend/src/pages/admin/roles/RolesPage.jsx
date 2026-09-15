import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  Plus,
  X,
  Lock,
  Unlock,
  Layers,
  CheckCircle2,
  Settings,
  ArrowRight
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../../services/adminService";

export function RolesPage() {
  const { roles = [], addRole, setRoles } = useAdmin();
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Trigger live GET /api/v1/admin/roles on mount
  React.useEffect(() => {
    adminService
      .getRoles()
      .then((data) => {
        if (Array.isArray(data) && setRoles) setRoles(data);
      })
      .catch((err) => console.warn("Live roles fetch:", err.message));
  }, [setRoles]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    isSystem: false
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) {
      addToast("Please provide a role title.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      if (addRole) {
        await addRole(newRole);
      }
      addToast(`Role "${newRole.name}" registered successfully!`, "success");
      setIsModalOpen(false);
      setNewRole({ name: "", description: "", isSystem: false });
    } catch (err) {
      addToast("Failed to create role: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  const totalUsers = roles.reduce((sum, r) => sum + (r.userCount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Role-Based Access Control (RBAC) Roles
            </h1>
            <Badge variant="emerald">{roles.length} DEFINED ROLES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => navigate("/roles/permissions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Permissions Matrix
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Custom Role
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active Roles"
          value={roles.length.toString()}
          unit="Profiles"
          trend={{ value: "100% RBAC coverage", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Assigned Users"
          value={totalUsers.toString()}
          unit="Accounts"
          trend={{ value: "Principle of Least Privilege", isPositive: true, text: "" }}
          icon={Users}
          colorVariant="cyan"
        />
        <StatCard
          title="System Roles"
          value={roles.filter(r => r.isSystem).length.toString()}
          unit="Built-in"
          trend={{ value: "Protected core profiles", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="amber"
        />
        <StatCard
          title="Audit Compliance"
          value="100%"
          unit="Audited"
          trend={{ value: "Zero unmapped permissions", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: roles.length === 0 ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", width: "100%", minWidth: 0 }}>
        {roles.length === 0 ? (
          <Card style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border-subtle)", background: "var(--bg-card)" }}>
            <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", marginBottom: "16px" }}>
              <ShieldCheck size={36} color="#10B981" />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              No Roles Defined Yet
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto 20px", lineHeight: 1.5 }}>
              This company currently has no custom roles created. Click below to add roles and configure your company's team structure.
            </p>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ margin: "0 auto" }}>
              + Create Custom Role
            </Button>
          </Card>
        ) : (
          roles.map((r) => (
            <Card key={r.id || r.name} style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={18} color="#059669" />
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{r.name}</h3>
                </div>
                <Badge variant={r.isSystem ? "cyan" : "amber"}>
                  {r.isSystem ? "System Built-in" : "Custom"}
                </Badge>
              </div>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px", minHeight: "36px", lineHeight: 1.4 }}>
                {r.description}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={14} /> <strong style={{ color: "var(--text-primary)" }}>{r.userCount || 0}</strong> assigned users
                </span>
                <button
                  onClick={() => navigate("/roles/permissions")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-card-subtle)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span>Edit Permissions</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* CREATE ROLE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Custom RBAC Role
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanitation Shift Lead"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Role Scope / Description</label>
                <textarea
                  rows={3}
                  placeholder="Define the primary operational scope for this profile..."
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

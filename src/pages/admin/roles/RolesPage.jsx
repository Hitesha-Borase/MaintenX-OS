import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  Users,
  Lock,
  Edit2,
  CheckCircle2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function RolesPage() {
  const { roles, setRoles } = useAdmin();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: ""
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRole.name) {
      addToast("Please provide role name", "warning");
      return;
    }
    const created = {
      id: `ROL-0${roles.length + 1}`,
      name: newRole.name,
      description: newRole.description,
      userCount: 0,
      isSystem: false
    };
    setRoles([...roles, created]);
    addToast(`Role "${created.name}" created!`, "success");
    setIsModalOpen(false);
    setNewRole({ name: "", description: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Role-Based Access Control (RBAC) Roles
            </h1>
            <Badge variant="emerald">{roles.length} Defined Roles</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            System-level access profiles, role definitions, permission scoping, and user tier assignments.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => navigate("/roles/permissions")}>
            Permissions Matrix
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Create Custom Role
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
        {roles.map((r) => (
          <Card key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#34D399" />
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{r.name}</h3>
              </div>
              <Badge variant={r.isSystem ? "cyan" : "amber"}>
                {r.isSystem ? "System Built-in" : "Custom"}
              </Badge>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px", minHeight: "36px" }}>
              {r.description}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Users size={14} /> <strong style={{ color: "#FFFFFF" }}>{r.userCount}</strong> assigned users
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/roles/permissions")}
              >
                Edit Permissions
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* CREATE ROLE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Custom RBAC Role
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanitation Shift Lead"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="form-input"
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
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

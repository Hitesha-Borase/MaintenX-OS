import React from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { User, Building2, Shield, Calendar, Mail, CheckCircle, Ban } from "lucide-react";
import { Badge } from "../../../components/common/Badge";

export function UserProfileModal({ isOpen, onClose, user = null, onToggleStatus }) {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      subtitle="Detailed information about the platform user"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {user.status === "Active" ? (
            <Button variant="outline" icon={Ban} onClick={() => onToggleStatus(user)}>Suspend User</Button>
          ) : (
            <Button variant="success" icon={CheckCircle} onClick={() => onToggleStatus(user)}>Activate User</Button>
          )}
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Header Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--accent-cyan)", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontSize: "24px", fontWeight: 800 }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>{user.name}</div>
              <Badge variant={user.status === "Active" ? "emerald" : "secondary"}>{user.status}</Badge>
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={14} /> {user.name.toLowerCase().replace(" ", ".")}@example.com
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ padding: "16px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
              <Building2 size={14} /> Company
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{user.company}</div>
          </div>
          
          <div style={{ padding: "16px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
              <Shield size={14} /> Role
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{user.role}</div>
          </div>

          <div style={{ padding: "16px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", gridColumn: "span 2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
              <Calendar size={14} /> Last Login Activity
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
              {user.lastLogin || "No recent activity recorded"}
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}

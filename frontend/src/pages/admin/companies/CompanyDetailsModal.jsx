import React from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { Building2, User, Calendar, Activity, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../../../components/common/Badge";

export function CompanyDetailsModal({ isOpen, onClose, company = null }) {
  if (!company) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Company Profile"
      subtitle={`Detailed overview for ${company.name}`}
      footer={
        <Button variant="outline" onClick={onClose}>Close</Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "12px", backgroundColor: "var(--accent-amber)", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontSize: "28px", fontWeight: 800 }}>
            {company.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>{company.name}</div>
              <Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status}</Badge>
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>Company ID: {company.id}</div>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>Total Users: {company.usersCount}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          
          <div style={{ padding: "16px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              <User size={14} /> Primary Administrator
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{company.admin}</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{company.adminEmail}</div>
          </div>
          
          <div style={{ padding: "16px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              <Calendar size={14} /> Timeline
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Registered: <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{company.createdAt}</span></div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Last Active: <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{company.lastActivity || "Unknown"}</span></div>
          </div>
          
        </div>

        {/* Modules Section */}
        <div style={{ padding: "20px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "16px" }}>
            <Activity size={14} /> Enabled Modules
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {Object.entries(company.modules || {}).map(([moduleName, isEnabled]) => (
              <div key={moduleName} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: isEnabled ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isEnabled ? 600 : 400 }}>
                {isEnabled ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="var(--text-muted)" />}
                {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  );
}

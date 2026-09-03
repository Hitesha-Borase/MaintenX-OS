import React from "react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Save } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function PlatformSettings() {
  const { addToast } = useApp();

  const handleSave = () => {
    addToast("Platform settings saved successfully", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Settings</h1>
      </div>

      <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>General Configuration</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Platform Name</label>
              <input type="text" defaultValue="MaintenX-OS" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Support Email</label>
              <input type="email" defaultValue="support@maintenx.com" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }} />
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>Security & Compliance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
              <span style={{ fontWeight: 500 }}>Require Two-Factor Authentication for Master Admins</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
              <span style={{ fontWeight: 500 }}>Enforce strong passwords for all tenant users</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
              <span style={{ fontWeight: 500 }}>Log all IP addresses for audit</span>
            </label>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>Maintenance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", color: "#EF4444" }}>
              <input type="checkbox" style={{ width: "18px", height: "18px" }} />
              <span style={{ fontWeight: 600 }}>Enable Global Maintenance Mode (Disables login for all tenants)</span>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <Button variant="primary" icon={Save} onClick={handleSave}>Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}

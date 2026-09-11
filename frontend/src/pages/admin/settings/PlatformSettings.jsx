import React, { useState, useEffect } from "react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Save, AlertTriangle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { masterAdminService } from "../../../services/masterAdminService";

export function PlatformSettings() {
  const { addToast } = useApp();
  const { settings, updateSettings, fetchSettings } = useMasterAdmin();

  React.useEffect(() => {
    fetchSettings?.();
  }, [fetchSettings]);
  
  const [formData, setFormData] = useState({
    platformName: "MaintenX-OS",
    supportEmail: "support@maintenx.com",
    require2fa: true,
    enforceStrongPasswords: true,
    logAllIps: true,
    maintenanceMode: false,
    maintenanceMessage: "Scheduled platform maintenance in progress.",
    defaultCurrency: "CAD",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const data = await masterAdminService.getSettings();
        if (isMounted && data) {
          setFormData({
            platformName: data.platformName || "MaintenX-OS",
            supportEmail: data.supportEmail || "support@maintenx.com",
            require2fa: data.require2fa !== undefined ? data.require2fa : true,
            enforceStrongPasswords: data.enforceStrongPasswords !== undefined ? data.enforceStrongPasswords : true,
            logAllIps: data.logAllIps !== undefined ? data.logAllIps : true,
            maintenanceMode: data.maintenanceMode !== undefined ? data.maintenanceMode : false,
            maintenanceMessage: data.maintenanceMessage || "Scheduled platform maintenance in progress.",
            defaultCurrency: data.defaultCurrency || "CAD",
          });
        }
      } catch (err) {
        console.error("Failed to load platform settings:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      addToast("Platform settings saved and persisted to PostgreSQL!", "success");
    } catch (err) {
      addToast(err.message || "Failed to persist settings", "destructive");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Settings</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Global SaaS governance configuration persisted in PostgreSQL
          </p>
        </div>
        {isLoading && <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Loading Settings...</span>}
      </div>

      <form onSubmit={handleSave}>
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              General Configuration
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platformName}
                  onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              Security & Compliance Policies
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.require2fa}
                  onChange={(e) => setFormData({ ...formData, require2fa: e.target.checked })}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontWeight: 500 }}>Require Two-Factor Authentication for Master Admins</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.enforceStrongPasswords}
                  onChange={(e) => setFormData({ ...formData, enforceStrongPasswords: e.target.checked })}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontWeight: 500 }}>Enforce 21 CFR Part 11 signature PINs and strong passwords</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.logAllIps}
                  onChange={(e) => setFormData({ ...formData, logAllIps: e.target.checked })}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontWeight: 500 }}>Log all IP addresses in PostgreSQL audit trail</span>
              </label>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px", color: "#EF4444", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} /> Global Maintenance Mode
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontWeight: 600, color: "#EF4444" }}>Enable Global Maintenance Mode (Disables access for all tenants)</span>
              </label>
              {formData.maintenanceMode && (
                <div style={{ marginTop: "6px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Maintenance Notice Message:
                  </label>
                  <textarea
                    value={formData.maintenanceMessage}
                    onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                    rows={2}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", fontSize: "13px" }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <Button type="submit" variant="primary" icon={Save} disabled={isSaving}>
              {isSaving ? "Persisting to PostgreSQL..." : "Save Platform Settings"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Save,
  Globe,
  Sliders,
  ShieldAlert,
  Server
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function SecurityPage() {
  const { addToast } = useApp();

  const [securityConfig, setSecurityConfig] = useState({
    enforceMFA: true,
    ssoEnabled: true,
    ssoProvider: "Okta SAML 2.0",
    sessionTimeoutMins: 30,
    passwordMinLength: 12,
    requireSpecialChar: true,
    ipWhitelist: "192.168.1.0/24, 10.0.0.0/16"
  });

  const handleSave = () => {
    addToast("Enterprise Security & 2FA Policies saved and enforced!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Enterprise Security & Authentication
            </h1>
            <Badge variant="emerald">SOC 2 TYPE II COMPLIANT</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Save} onClick={handleSave} style={{ fontSize: "12px", padding: "7px 14px" }}>
            Save Security Policies
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
          title="MFA Enforcement Rate"
          value="100%"
          unit="Enforced"
          trend={{ value: "All admin & operator accounts", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="emerald"
        />
        <StatCard
          title="Single Sign-On (SSO)"
          value="Active"
          unit="Okta SAML 2.0"
          trend={{ value: "Seamless corporate login", isPositive: true, text: "" }}
          icon={KeyRound}
          colorVariant="cyan"
        />
        <StatCard
          title="IP Protection"
          value="2 Subnets"
          unit="Whitelisted"
          trend={{ value: "Plant VLANs isolated", isPositive: true, text: "" }}
          icon={Globe}
          colorVariant="amber"
        />
        <StatCard
          title="SOC 2 Type II"
          value="Certified"
          unit="Audited"
          trend={{ value: "Annual third-party audit pass", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Security Form Card */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px" }}>
          Authentication & Access Control Policy Matrix
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>Enforce Multi-Factor Authentication (2FA/MFA)</strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Requires TOTP Authenticator app on all employee sign-ins</div>
            </div>
            <input
              type="checkbox"
              checked={securityConfig.enforceMFA}
              onChange={(e) => setSecurityConfig({ ...securityConfig, enforceMFA: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#8C5B23", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>Corporate SAML 2.0 Single Sign-On (SSO)</strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Authenticate against Okta / Microsoft Entra ID / Google Workspace</div>
            </div>
            <input
              type="checkbox"
              checked={securityConfig.ssoEnabled}
              onChange={(e) => setSecurityConfig({ ...securityConfig, ssoEnabled: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#8C5B23", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <div>
              <label className="form-label">Inactivity Session Timeout (Minutes)</label>
              <input
                type="number"
                value={securityConfig.sessionTimeoutMins}
                onChange={(e) => setSecurityConfig({ ...securityConfig, sessionTimeoutMins: Number(e.target.value) })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div>
              <label className="form-label">Minimum Password Length</label>
              <input
                type="number"
                value={securityConfig.passwordMinLength}
                onChange={(e) => setSecurityConfig({ ...securityConfig, passwordMinLength: Number(e.target.value) })}
                className="form-input"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Approved IP CIDR Subnet Whitelist</label>
            <input
              type="text"
              value={securityConfig.ipWhitelist}
              onChange={(e) => setSecurityConfig({ ...securityConfig, ipWhitelist: e.target.value })}
              className="form-input"
              style={{ backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

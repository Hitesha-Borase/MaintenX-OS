import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Save,
  Globe,
  Sliders
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Enterprise Security, SSO & Authentication Policies
            </h1>
            <Badge variant="emerald">SOC 2 Type II Compliant</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Multi-Factor Authentication (MFA), SAML 2.0 Single Sign-On, IP Whitelisting, and password complexity controls.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Security Policies
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
          value="Whitelisted"
          unit="2 Subnets"
          trend={{ value: "Plant VLANs isolated", isPositive: true, text: "" }}
          icon={Globe}
          colorVariant="emerald"
        />
      </div>

      {/* Security Form Card */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Authentication & Access Control Policy Matrix
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
            <div>
              <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Enforce Multi-Factor Authentication (2FA/MFA)</strong>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Requires TOTP Authenticator app on all employee sign-ins</div>
            </div>
            <input
              type="checkbox"
              checked={securityConfig.enforceMFA}
              onChange={(e) => setSecurityConfig({ ...securityConfig, enforceMFA: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#38BDF8", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
            <div>
              <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Corporate SAML 2.0 Single Sign-On (SSO)</strong>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Authenticate against Okta / Microsoft Entra ID / Google Workspace</div>
            </div>
            <input
              type="checkbox"
              checked={securityConfig.ssoEnabled}
              onChange={(e) => setSecurityConfig({ ...securityConfig, ssoEnabled: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#38BDF8", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Inactivity Session Timeout (Minutes)</label>
              <input
                type="number"
                value={securityConfig.sessionTimeoutMins}
                onChange={(e) => setSecurityConfig({ ...securityConfig, sessionTimeoutMins: Number(e.target.value) })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Minimum Password Length</label>
              <input
                type="number"
                value={securityConfig.passwordMinLength}
                onChange={(e) => setSecurityConfig({ ...securityConfig, passwordMinLength: Number(e.target.value) })}
                className="form-input"
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
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

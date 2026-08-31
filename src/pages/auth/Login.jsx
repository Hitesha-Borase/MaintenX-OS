import React, { useState } from "react";
import { useRole } from "../../context/RoleContext";
import { useApp } from "../../context/AppContext";
import {
  Cpu,
  Lock,
  User,
  Sparkles,
  Briefcase,
  Building2,
  FolderKanban,
  Users,
  Activity,
  ShieldCheck,
  Wrench,
  Package,
  ShoppingBag,
  CalendarRange,
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  Settings
} from "lucide-react";
import { Button } from "../../components/common/Button";

// Dynamic Lucide Icon Mapper
const iconMap = {
  Briefcase: Briefcase,
  Building2: Building2,
  FolderKanban: FolderKanban,
  Users: Users,
  Activity: Activity,
  ShieldCheck: ShieldCheck,
  Wrench: Wrench,
  Package: Package,
  ShoppingBag: ShoppingBag,
  CalendarRange: CalendarRange,
  GraduationCap: GraduationCap,
  ShieldAlert: ShieldAlert,
  Settings: Settings
};

export function Login() {
  const { login, ROLES } = useRole();
  const { addToast } = useApp();

  const [username, setUsername] = useState("admin@maintenx.ops");
  const [password, setPassword] = useState("••••••••");
  const [selectedRole, setSelectedRole] = useState("plant_manager");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(selectedRole);
    const roleObj = ROLES.find((r) => r.id === selectedRole);
    addToast(`Successfully authenticated as ${roleObj?.label || "User"}! Welcome to MaintenX OS.`, "success");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#060A13",
        backgroundImage: "radial-gradient(circle at 50% 50%, #131B2E 0%, #060A13 100%)",
        padding: "24px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          backgroundColor: "#0A0E17",
          borderRadius: "20px",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 50px rgba(6, 182, 212, 0.15)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr"
        }}
      >
        {/* Left Side: Beautiful Project Image & Branding */}
        <div
          style={{
            position: "relative",
            background: "url('/maintenx_control_room.jpg') center/cover no-repeat",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "40px",
            minHeight: "500px"
          }}
        >
          {/* Ambient Overlay Gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to top, rgba(6, 10, 19, 0.95) 20%, rgba(6, 10, 19, 0.4) 100%)",
              zIndex: 1
            }}
          />

          {/* Text Overlays */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "50px",
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#22D3EE",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "16px"
              }}
            >
              <Cpu size={14} /> Smart Manufacturing Operating System
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
              MaintenX OS
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "10px", lineHeight: 1.5, maxWidth: "380px" }}>
              Next-generation manufacturing operations, real-time OEE telemetry, reliability diagnostics, and autonomous AI agents.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form & Roles Selection */}
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "center" }}>
          {/* Logo & Sub-Branding Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0284C7, #06B6D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)"
              }}
            >
              <Cpu size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.03em", margin: 0 }}>
                MaintenX <span style={{ color: "#38BDF8" }}>OS</span>
              </h1>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
                Enterprise Operations Portal
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Inputs Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <User size={14} /> Corporate Username
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Lock size={14} /> Security Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Premium Role Grid Selector */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>
                Select Role Perspective to Simulate
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                  gap: "10px",
                  maxHeight: "220px",
                  overflowY: "auto",
                  padding: "8px",
                  backgroundColor: "var(--bg-main)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                {ROLES.map((role) => {
                  const IconComponent = iconMap[role.icon] || ShieldCheck;
                  const isSelected = selectedRole === role.id;

                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: isSelected ? "rgba(2, 132, 199, 0.15)" : "#131B2E",
                        border: isSelected ? "2px solid #38BDF8" : "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        textAlign: "center",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}
                    >
                      <IconComponent size={20} color={isSelected ? "#38BDF8" : "var(--text-muted)"} />
                      <span style={{ fontSize: "12px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#FFFFFF" : "var(--text-secondary)" }}>
                        {role.label}
                      </span>
                      {isSelected && (
                        <div style={{ position: "absolute", top: "4px", right: "4px", color: "#38BDF8" }}>
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              icon={Sparkles}
              style={{ width: "100%", height: "44px", justifyContent: "center", fontSize: "14px", fontWeight: 700, marginTop: "8px" }}
            >
              Authenticate & Start Session
            </Button>
          </form>

          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
            ISO 27001 Secured • Authorized Access Only
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [hoveredRole, setHoveredRole] = useState(null);

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
          maxWidth: "1200px",
          backgroundColor: "#0A0E17",
          borderRadius: "20px",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 60px rgba(6, 182, 212, 0.15)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr"
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
            padding: "48px",
            minHeight: "650px"
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
                padding: "6px 14px",
                borderRadius: "50px",
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#22D3EE",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "20px"
              }}
            >
              <Cpu size={14} /> Smart Manufacturing Operating System
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              MaintenX OS
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "12px", lineHeight: 1.6, maxWidth: "420px" }}>
              Next-generation manufacturing execution platform, real-time OEE telemetry, reliability diagnostics, and autonomous AI agents.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form & Roles Selection */}
        <div style={{ padding: "48px", display: "flex", flexDirection: "column", gap: "28px", justifyContent: "center" }}>
          {/* Logo & Sub-Branding Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0284C7, #06B6D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)"
              }}
            >
              <Cpu size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.02em", margin: 0 }}>
                MaintenX <span style={{ color: "#38BDF8" }}>OS</span>
              </h1>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                Enterprise Operations Portal
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Inputs Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  <User size={14} /> Corporate Username
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main)",
                    border: "1px solid var(--border-subtle)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    outline: "none"
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  <Lock size={14} /> Security Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main)",
                    border: "1px solid var(--border-subtle)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    outline: "none"
                  }}
                  required
                />
              </div>
            </div>

            {/* Premium Role Grid Selector */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", display: "block" }}>
                Select Dashboard Perspective to Launch
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "12px",
                  padding: "4px"
                }}
              >
                {ROLES.map((role) => {
                  const IconComponent = iconMap[role.icon] || ShieldCheck;
                  const isSelected = selectedRole === role.id;
                  const isHovered = hoveredRole === role.id;

                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      onMouseEnter={() => setHoveredRole(role.id)}
                      onMouseLeave={() => setHoveredRole(null)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "10px",
                        backgroundColor: isSelected 
                          ? "rgba(6, 182, 212, 0.12)" 
                          : isHovered 
                            ? "rgba(255, 255, 255, 0.03)" 
                            : "#111827",
                        border: isSelected 
                          ? "2px solid #06B6D4" 
                          : isHovered 
                            ? "1px solid #374151" 
                            : "1px solid #1F2937",
                        boxShadow: isSelected 
                          ? "0 0 15px rgba(6, 182, 212, 0.25)" 
                          : "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          backgroundColor: isSelected ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isSelected ? "#22D3EE" : "#9CA3AF",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "#FFFFFF" : "#D1D5DB" }}>
                          {role.label}
                        </span>
                        <span style={{ fontSize: "10px", color: isSelected ? "#22D3EE" : "#6B7280" }}>
                          {role.id === "plant_manager" ? "Command Center" : "Dashboard View"}
                        </span>
                      </div>
                      {isSelected && (
                        <div style={{ position: "absolute", top: "10px", right: "10px", color: "#06B6D4" }}>
                          <CheckCircle2 size={14} />
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
              style={{
                width: "100%",
                height: "48px",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                marginTop: "12px",
                background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
                border: "none",
                boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)",
                borderRadius: "8px",
                color: "#FFFFFF",
                cursor: "pointer"
              }}
            >
              Authenticate & Start Session
            </Button>
          </form>

          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            ISO 27001 Secured • Authorized Access Only
          </div>
        </div>
      </div>
    </div>
  );
}

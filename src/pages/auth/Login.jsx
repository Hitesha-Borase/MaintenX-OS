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
  CheckCircle2
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
  ShieldAlert: ShieldAlert
};

export function Login() {
  const { login, ROLES } = useRole();
  const { addToast } = useApp();

  const [username, setUsername] = useState("admin@flowstate.ops");
  const [password, setPassword] = useState("••••••••");
  const [selectedRole, setSelectedRole] = useState("plant_manager");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(selectedRole);
    const roleObj = ROLES.find((r) => r.id === selectedRole);
    addToast(`Successfully authenticated as ${roleObj?.label || "User"}! Welcome back.`, "success");
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
          maxWidth: "800px", // Expanded to accommodate the beautiful role grid layout
          backgroundColor: "#0A0E17",
          borderRadius: "16px",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 40px rgba(2, 132, 199, 0.1)",
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        {/* Logo and Branding Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0284C7, #06B6D4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)"
            }}
          >
            <Cpu size={26} />
          </div>

          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.03em" }}>
              FLOW<span style={{ color: "#38BDF8" }}>STATE</span>
            </h1>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
              Manufacturing Operating System
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Inputs Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Corporate Email / Username
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
                maxHeight: "260px",
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
  );
}

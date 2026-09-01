import React, { useState, useEffect } from "react";
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
  Settings,
  Flame
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

  // Generate warm floating particles
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 20; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2,
        delay: `${Math.random() * 8}s`,
        duration: `${Math.random() * 15 + 10}s`
      });
    }
    setParticles(list);
  }, []);

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
        backgroundColor: "#F6F3EE",
        background: "radial-gradient(circle at 30% 30%, #FCFAF7 0%, #F3ECE2 100%)",
        padding: "24px",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Inline styles for custom amber glassmorphism keyframes and responsiveness */}
      <style>{`
        @keyframes floatWeightless {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.25; }
          50% { transform: translateY(-35px) translateX(12px); opacity: 0.65; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.25; }
        }
        @keyframes subtleScale {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.008); }
        }
        .form-input-amber:focus {
          border-color: #C89547 !important;
          box-shadow: 0 0 0 3px rgba(200, 149, 71, 0.2) !important;
        }
        .custom-glass-card {
          animation: subtleScale 6s ease-in-out infinite;
        }
        .weightless-particle {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(200, 149, 71, 0.4);
          pointer-events: none;
          box-shadow: 0 0 8px rgba(200, 149, 71, 0.6);
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 900px) {
          .login-main-frame {
            grid-template-columns: 1fr !important;
            max-width: 600px !important;
          }
          .login-left-panel {
            display: none !important;
          }
          .login-right-panel {
            padding: 32px 24px !important;
          }
        }
        
        @media (max-width: 600px) {
          .login-inputs-row {
            grid-template-columns: 1fr !important;
          }
          .roles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 400px) {
          .roles-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Floating Amber Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="weightless-particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `floatWeightless ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay
          }}
        />
      ))}

      {/* Main Amber Glassmorphism Frame */}
      <div
        className="custom-glass-card login-main-frame"
        style={{
          width: "100%",
          maxWidth: "1280px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(200, 149, 71, 0.3)",
          boxShadow: "0 25px 60px rgba(70, 45, 15, 0.12), 0 0 60px rgba(200, 149, 71, 0.08)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.1fr 1.3fr",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Left Panel: Translucent Astro Smart Factory Analytics Layout */}
        <div
          className="login-left-panel"
          style={{
            position: "relative",
            background: "url('/maintenx_astro_factory.jpg') center/cover no-repeat",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px",
            minHeight: "720px",
            borderRight: "1px solid var(--border-subtle)"
          }}
        >
          {/* Amber-Tinted Warm Frosted Glass Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to top, rgba(43, 29, 17, 0.92) 15%, rgba(43, 29, 17, 0.3) 100%)",
              zIndex: 1
            }}
          />

          {/* Info Overlay */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "50px",
                backgroundColor: "rgba(200, 149, 71, 0.25)",
                border: "1px solid rgba(226, 182, 112, 0.6)",
                color: "#E2B670",
                fontSize: "12px",
                fontWeight: 800,
                alignSelf: "flex-start",
                boxShadow: "0 0 12px rgba(200, 149, 71, 0.3)"
              }}
            >
              <Cpu size={14} /> ZERO-GRAVITY ENTERPRISE PORTAL
            </div>

            <h2 style={{ fontSize: "36px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              MaintenX OS
            </h2>

            <p style={{ fontSize: "14px", color: "rgba(255, 245, 235, 0.85)", lineHeight: 1.6, maxWidth: "420px" }}>
              Orbiting Astro-Manufacturing Operations Suite. Synchronized OEE logistics routing, predictive machine wear tracking, and telemetry feedback.
            </p>
          </div>
        </div>

        {/* Right Panel: Floating Warm Acrylic Glass Login Box */}
        <div className="login-right-panel" style={{ padding: "48px 56px", display: "flex", flexDirection: "column", gap: "28px", justifyContent: "center", backgroundColor: "#FCFAF7" }}>
          {/* Logo & Sub-Branding Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#261603",
                boxShadow: "0 4px 14px rgba(200, 149, 71, 0.35)"
              }}
            >
              <Flame size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11", letterSpacing: "-0.3px", margin: 0 }}>
                MaintenX <span style={{ color: "#B27E33" }}>OS</span>
              </h1>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800 }}>
                Operations Console
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Inputs Row */}
            <div className="login-inputs-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                  <User size={12} color="#B27E33" /> Corporate Username
                </label>
                <input
                  type="email"
                  className="form-input-amber"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                  <Lock size={12} color="#B27E33" /> Security Password
                </label>
                <input
                  type="password"
                  className="form-input-amber"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  required
                />
              </div>
            </div>

            {/* Interactive Grid: 3x3 layout for simulated perspectives */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", display: "block" }}>
                Select Dashboard Perspective
              </label>
              <div
                className="roles-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  maxHeight: "260px",
                  overflowY: "auto",
                  padding: "2px"
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
                        padding: "12px 10px",
                        borderRadius: "12px",
                        backgroundColor: isSelected 
                          ? "rgba(200, 149, 71, 0.15)" 
                          : isHovered
                            ? "var(--bg-card-subtle)"
                            : "#FFFFFF",
                        border: isSelected 
                          ? "2px solid #C89547" 
                          : isHovered 
                            ? "1px solid #DCCFBF" 
                            : "1px solid var(--border-subtle)",
                        boxShadow: isSelected 
                          ? "0 2px 10px rgba(200, 149, 71, 0.25)" 
                          : "0 1px 3px rgba(70, 45, 15, 0.03)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        textAlign: "center",
                        transition: "all 0.18s ease",
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: isSelected 
                            ? "linear-gradient(135deg, #E2B670 0%, #C89547 100%)" 
                            : "var(--bg-card-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isSelected ? "#261603" : "var(--text-secondary)",
                          boxShadow: isSelected ? "0 2px 6px rgba(178, 126, 51, 0.25)" : "none"
                        }}
                      >
                        <IconComponent size={14} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: isSelected ? 800 : 600, color: isSelected ? "#2B1D11" : "var(--text-secondary)" }}>
                        {role.label}
                      </span>
                      {isSelected && (
                        <div style={{ position: "absolute", top: "6px", right: "6px", color: "#B27E33" }}>
                          <CheckCircle2 size={13} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metallic Amber Gold Submit Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 800,
                marginTop: "6px",
                background: "linear-gradient(180deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                border: "1px solid #E8C182",
                boxShadow: "0 4px 14px rgba(178, 126, 51, 0.35)",
                borderRadius: "50px",
                color: "#261603",
                cursor: "pointer",
                transition: "transform 0.15s ease",
                outline: "none"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.015)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <Sparkles size={16} /> Authenticate & Start Session
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", fontWeight: 600 }}>
            ISO 27001 Secured • Authorized Access Only
          </div>
        </div>
      </div>
    </div>
  );
}

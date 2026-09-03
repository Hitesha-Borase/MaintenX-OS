import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Flame,
  Eye,
  EyeOff,
  ArrowLeft
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
  const navigate = useNavigate();
  const { login, ROLES } = useRole();
  const { addToast } = useApp();

  const [username, setUsername] = useState("admin@maintenx.ops");
  const [password, setPassword] = useState("MaintenX@2026");
  const [showPassword, setShowPassword] = useState(false);
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
    navigate(roleObj?.defaultRoute || "/dashboard");
  };

  return (
    <div className="login-page-wrapper">
      {/* Inline styles for custom amber glassmorphism keyframes and responsive layout */}
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
        .login-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F6F3EE;
          background: radial-gradient(circle at 30% 30%, #FCFAF7 0%, #F3ECE2 100%);
          padding: 24px;
          overflow-x: hidden;
          position: relative;
        }
        .login-card-container {
          width: 100%;
          max-width: 1280px;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(200, 149, 71, 0.3);
          box-shadow: 0 25px 60px rgba(70, 45, 15, 0.12), 0 0 60px rgba(200, 149, 71, 0.08);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.1fr 1.3fr;
          position: relative;
          z-index: 10;
        }
        .login-left-panel {
          position: relative;
          background: url('/maintenx_astro_factory.jpg') center/cover no-repeat;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          min-height: 720px;
          border-right: 1px solid var(--border-subtle);
        }
        .login-hero-title {
          font-size: 36px;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .login-hero-desc {
          font-size: 14px;
          color: rgba(255, 245, 235, 0.85);
          line-height: 1.6;
          max-width: 420px;
          margin: 0;
        }
        .login-right-panel {
          padding: 48px 56px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          justify-content: center;
          background-color: #FCFAF7;
        }
        .login-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .login-roles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          max-height: 260px;
          overflow-y: auto;
          padding: 2px;
        }

        @media (max-width: 960px) {
          .login-page-wrapper {
            padding: 12px;
            align-items: flex-start;
            overflow-y: auto;
          }
          .login-card-container {
            display: flex;
            flex-direction: column;
            border-radius: 18px;
            margin: 8px 0;
          }
          .login-left-panel {
            min-height: 200px;
            padding: 24px 18px;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
          }
          .login-hero-title {
            font-size: 24px;
          }
          .login-hero-desc {
            font-size: 12px;
            line-height: 1.4;
          }
          .login-right-panel {
            padding: 24px 18px;
            gap: 20px;
          }
          .login-inputs-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .login-roles-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            max-height: 220px;
          }
        }
        @media (max-width: 480px) {
          .login-left-panel {
            min-height: 160px;
            padding: 18px 14px;
          }
          .login-hero-title {
            font-size: 20px;
          }
          .login-right-panel {
            padding: 18px 12px;
          }
          .login-roles-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
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
      <div className="custom-glass-card login-card-container">
        {/* Left Panel: Translucent Astro Smart Factory Analytics Layout */}
        <div className="login-left-panel">
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
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "12px" }}>
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
                fontSize: "11px",
                fontWeight: 800,
                alignSelf: "flex-start",
                boxShadow: "0 0 12px rgba(200, 149, 71, 0.3)"
              }}
            >
              <Cpu size={14} /> ZERO-GRAVITY ENTERPRISE PORTAL
            </div>

            <h2 className="login-hero-title">
              MaintenX OS
            </h2>
          </div>
        </div>

        {/* Right Panel: Floating Warm Acrylic Glass Login Box */}
        <div className="login-right-panel">
          {/* Header section with small back arrow button above MaintenX OS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Small Back Arrow Button to Landing Page */}
            <button
              type="button"
              onClick={() => navigate("/")}
              title="Back to Landing Page"
              aria-label="Back to Landing Page"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                backgroundColor: "rgba(200, 149, 71, 0.08)",
                border: "1px solid rgba(200, 149, 71, 0.25)",
                color: "#9A6B25",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.18)";
                e.currentTarget.style.borderColor = "#C89547";
                e.currentTarget.style.color = "#261603";
                e.currentTarget.style.transform = "translateX(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.08)";
                e.currentTarget.style.borderColor = "rgba(200, 149, 71, 0.25)";
                e.currentTarget.style.color = "#9A6B25";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
            </button>

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
                  boxShadow: "0 4px 14px rgba(200, 149, 71, 0.35)",
                  flexShrink: 0
                }}
              >
                <Flame size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#2B1D11", letterSpacing: "-0.3px", margin: 0 }}>
                  MaintenX <span style={{ color: "#B27E33" }}>OS</span>
                </h1>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800 }}>
                  Operations Console
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Inputs Row */}
            <div className="login-inputs-grid">
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
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input-amber"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 40px 11px 14px",
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px"
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} color="#8C5B23" /> : <Eye size={16} color="var(--text-muted)" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Grid: Sequential End-to-End Lifecycle Flow */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0, display: "block" }}>
                  Select Dashboard Perspective
                </label>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#8C5B23", backgroundColor: "rgba(200, 149, 71, 0.12)", padding: "2px 8px", borderRadius: "10px" }}>
                  Data Flow: Step 1 ➔ Step 11
                </span>
              </div>

              <div className="login-roles-grid">
                {ROLES.map((role, idx) => {
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
                        padding: "10px 8px",
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
                        gap: "5px",
                        textAlign: "center",
                        transition: "all 0.18s ease",
                        position: "relative"
                      }}
                    >
                      {/* Step Indicator Pill */}
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 800,
                          color: isSelected ? "#8C5B23" : "var(--text-muted)",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase"
                        }}
                      >
                        {role.step || `Step ${idx + 1}`}
                      </span>

                      <div
                        style={{
                          width: "28px",
                          height: "28px",
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
                        <IconComponent size={13} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: isSelected ? 800 : 600, color: isSelected ? "#2B1D11" : "var(--text-secondary)", lineHeight: 1.15 }}>
                        {role.label}
                      </span>
                      {isSelected && (
                        <div style={{ position: "absolute", top: "5px", right: "5px", color: "#B27E33" }}>
                          <CheckCircle2 size={12} />
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

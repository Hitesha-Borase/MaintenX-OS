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

  // Generate weightless glowing particles
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 25; i++) {
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
        backgroundColor: "#030712",
        // Deep space cosmic backplate
        background: "radial-gradient(circle at 30% 30%, #0c152b 0%, #030712 70%)",
        padding: "24px",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Inline styles for custom futuristic glassmorphism keyframes */}
      <style>{`
        @keyframes floatWeightless {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-40px) translateX(15px); opacity: 0.8; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
        }
        @keyframes pulseGlow {
          0%, 100% { border-color: rgba(6, 182, 212, 0.25); box-shadow: 0 0 15px rgba(6, 182, 212, 0.1); }
          50% { border-color: rgba(6, 182, 212, 0.6); box-shadow: 0 0 25px rgba(6, 182, 212, 0.3); }
        }
        @keyframes subtleScale {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.01); }
        }
        @keyframes movingEnergy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .form-input-glow:focus {
          border-color: #22d3ee !important;
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.35) !important;
        }
        .custom-glass-card {
          animation: subtleScale 6s ease-in-out infinite;
        }
        .weightless-particle {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(34, 211, 238, 0.4);
          pointer-events: none;
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.8);
        }
      `}</style>

      {/* Floating Space Particles */}
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

      {/* Main Glassmorphism Frame */}
      <div
        className="custom-glass-card"
        style={{
          width: "100%",
          maxWidth: "1280px",
          backgroundColor: "rgba(10, 17, 32, 0.6)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: "24px",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 80px rgba(6, 182, 212, 0.15)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.1fr 1.3fr",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Left Panel: Translucent Astro Smart Factory Analytics Layout */}
        <div
          style={{
            position: "relative",
            background: "url('/maintenx_astro_factory.jpg') center/cover no-repeat",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px",
            minHeight: "720px",
            borderRight: "1px solid rgba(6, 182, 212, 0.15)"
          }}
        >
          {/* Neon Frosted Glass Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to top, rgba(6, 10, 19, 0.95) 15%, rgba(6, 10, 19, 0.3) 100%)",
              zIndex: 1
            }}
          />

          {/* Holographic Factory Info Overlay */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "50px",
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                border: "1px solid rgba(6, 182, 212, 0.35)",
                color: "#22D3EE",
                fontSize: "12px",
                fontWeight: 700,
                alignSelf: "flex-start",
                boxShadow: "0 0 10px rgba(6, 182, 212, 0.2)"
              }}
            >
              <Cpu size={14} /> ZERO-GRAVITY ENTERPRISE PORTAL
            </div>

            <h2 style={{ fontSize: "36px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.02em", textShadow: "0 0 15px rgba(34, 211, 238, 0.3)" }}>
              MaintenX OS
            </h2>

            <p style={{ fontSize: "14px", color: "rgba(224, 242, 254, 0.8)", lineHeight: 1.6, maxWidth: "420px" }}>
              Orbiting Astro-Manufacturing Operations Suite. Synchronized OEE logistics routing, predictive machine wear tracking, and telemetry feedback.
            </p>
          </div>
        </div>

        {/* Right Panel: Floating Frosted Acrylic glass login box */}
        <div style={{ padding: "48px 56px", display: "flex", flexDirection: "column", gap: "32px", justifyContent: "center" }}>
          {/* Logo & Sub-Branding Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0891b2 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)"
              }}
            >
              <Cpu size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.02em", margin: 0, textShadow: "0 0 10px rgba(34, 211, 238, 0.2)" }}>
                MaintenX <span style={{ color: "#22D3EE" }}>OS</span>
              </h1>
              <span style={{ fontSize: "10px", color: "#67e8f9", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800 }}>
                Astro Operations Console
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Inputs Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>
                  <User size={12} color="#22d3ee" /> Corporate Username
                </label>
                <input
                  type="email"
                  className="form-input-glow"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(17, 24, 39, 0.6)",
                    border: "1px solid rgba(34, 211, 238, 0.25)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>
                  <Lock size={12} color="#22d3ee" /> Security Password
                </label>
                <input
                  type="password"
                  className="form-input-glow"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(17, 24, 39, 0.6)",
                    border: "1px solid rgba(34, 211, 238, 0.25)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  required
                />
              </div>
            </div>

            {/* Interactive Grid: 3x3 layout for simulated perspectives */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "11px", fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px", display: "block" }}>
                Select Orbiting Dashboard Perspective
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  maxHeight: "260px",
                  overflowY: "auto",
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
                        padding: "14px 12px",
                        borderRadius: "12px",
                        // Frosted Glass layout
                        backgroundColor: isSelected 
                          ? "rgba(34, 211, 238, 0.15)" 
                          : "rgba(17, 24, 39, 0.5)",
                        border: isSelected 
                          ? "2px solid #22D3EE" 
                          : isHovered 
                            ? "1px solid rgba(34, 211, 238, 0.4)" 
                            : "1px solid rgba(6, 182, 212, 0.15)",
                        boxShadow: isSelected 
                          ? "0 0 15px rgba(34, 211, 238, 0.3)" 
                          : "none",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        textAlign: "center",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          backgroundColor: isSelected ? "rgba(34, 211, 238, 0.25)" : "rgba(255, 255, 255, 0.03)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isSelected ? "#22D3EE" : "#9CA3AF",
                          boxShadow: isSelected ? "0 0 8px rgba(34, 211, 238, 0.4)" : "none"
                        }}
                      >
                        <IconComponent size={14} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: isSelected ? "#FFFFFF" : "#d1d5db" }}>
                        {role.label}
                      </span>
                      {/* Floating weightless selection badge */}
                      {isSelected && (
                        <div style={{ position: "absolute", top: "6px", right: "6px", color: "#22D3EE" }}>
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Glowing neon pill button with linear gradient animation */}
            <Button
              variant="primary"
              type="submit"
              icon={Sparkles}
              style={{
                width: "100%",
                height: "50px",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 800,
                marginTop: "12px",
                background: "linear-gradient(270deg, #0284c7, #06b6d4, #3b82f6)",
                backgroundSize: "200% 200%",
                animation: "movingEnergy 3s ease infinite",
                border: "1px solid rgba(34, 211, 238, 0.4)",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
                borderRadius: "50px",
                color: "#FFFFFF",
                cursor: "pointer",
                transition: "transform 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
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

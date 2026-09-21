import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { useApp } from "../../context/AppContext";
import {
  Cpu,
  Lock,
  User,
  Sparkles,
  Flame,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  X,
  ShieldCheck
} from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { loginWithCredentials } = useRole();
  const { addToast } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);

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

  // Real Credential Login: Validates against PostgreSQL users database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!username.trim() || !password) {
      setAuthError({
        title: "Required Credentials Missing",
        message: "Please enter both your corporate email and security password."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithCredentials(username.trim(), password);
      if (res?.success) {
        const displayName = res.user?.name || (res.user?.firstName ? `${res.user.firstName} ${res.user.lastName || ""}`.trim() : "User");
        addToast(`Authenticated as ${res.role?.label || "User"} (${displayName})! Welcome to MaintenX OS.`, "success");
        navigate(res.role?.defaultRoute || "/command-center");
        return;
      }
    } catch (err) {
      console.warn("Credential authentication failed:", err.message);
      const rawMsg = (err?.message || err?.data?.error?.message || "").trim();
      const rawCode = (err?.code || err?.data?.error?.code || "").toUpperCase();

      let title = "Authentication Failed";
      let message = rawMsg || "The username or security password entered could not be verified. Please try again.";

      if (rawCode === "ACCOUNT_SUSPENDED" || /suspended/i.test(rawMsg)) {
        title = "Account Suspended";
        message = "Your account has been suspended by the administrator. Please contact your system administrator.";
      } else if (rawCode === "ACCOUNT_DEACTIVATED" || rawCode === "ACCOUNT_INACTIVE" || /deactivated|inactive/i.test(rawMsg)) {
        title = "Account Deactivated";
        message = "Your account has been deactivated. Please contact your system administrator.";
      } else if (rawCode === "USER_NOT_FOUND" || rawCode === "NOT_FOUND" || /not found|no corporate account/i.test(rawMsg)) {
        title = "Account Not Found";
        message = "No corporate account was found with this email address. Please check your username and try again.";
      } else if (rawCode === "INCORRECT_PASSWORD" || /incorrect password|security password/i.test(rawMsg)) {
        title = "Incorrect Password";
        message = "The security password entered is incorrect. Please check and try again.";
      } else if (rawCode === "TENANT_SUSPENDED" || /company account has been suspended|organization account has been suspended/i.test(rawMsg)) {
        title = "Company Account Suspended";
        message = "Your company account has been suspended. Please contact your organization administrator.";
      } else if (rawCode === "TENANT_INACTIVE" || /company account is currently inactive|organization account is currently inactive/i.test(rawMsg)) {
        title = "Company Account Inactive";
        message = "Your company account is currently inactive. Please contact system administration.";
      } else if (rawCode === "SUBSCRIPTION_EXPIRED" || /subscription/i.test(rawMsg)) {
        title = "Subscription Expired";
        message = "Your organization's subscription has expired. Please contact your administrator to renew your plan.";
      } else if (/invalid email or password/i.test(rawMsg)) {
        title = "Invalid Corporate Credentials";
        message = "The username or security password entered does not match our records. Please verify and try again.";
      }

      setAuthError({ title, message });
      addToast(`${title}: ${message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
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
          max-width: 1020px;
          min-height: 580px;
          background-color: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(200, 149, 71, 0.3);
          box-shadow: 0 25px 60px rgba(70, 45, 15, 0.12), 0 0 60px rgba(200, 149, 71, 0.08);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          position: relative;
          z-index: 10;
        }
        .login-left-panel {
          position: relative;
          background: url('/maintenx_astro_factory.jpg') center/cover no-repeat;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 44px;
          min-height: 580px;
          border-right: 1px solid var(--border-subtle);
        }
        .login-hero-title {
          font-size: 34px;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .login-hero-desc {
          font-size: 13.5px;
          color: rgba(255, 245, 235, 0.88);
          line-height: 1.6;
          max-width: 380px;
          margin: 0;
        }
        .login-right-panel {
          padding: 44px 48px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          justify-content: center;
          background-color: #FCFAF7;
        }
        .login-inputs-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        @media (max-width: 900px) {
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
            min-height: auto;
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
            padding: 28px 20px;
            gap: 20px;
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
        {/* Left Panel: Translucent Factory Analytics Layout */}
        <div className="login-left-panel">
          {/* Amber-Tinted Warm Frosted Glass Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to top, rgba(43, 29, 17, 0.92) 20%, rgba(43, 29, 17, 0.35) 100%)",
              zIndex: 1
            }}
          />

          {/* Info Overlay */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="/great_canadian_meat_logo.png"
                alt="The Great Canadian Meat Company"
                style={{
                  height: "38px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))"
                }}
              />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "50px",
                  backgroundColor: "rgba(200, 149, 71, 0.25)",
                  border: "1px solid rgba(226, 182, 112, 0.6)",
                  color: "#E2B670",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  boxShadow: "0 0 12px rgba(200, 149, 71, 0.3)"
                }}
              >
                <Cpu size={13} /> OPERATIONS PORTAL
              </div>
            </div>

            <h2 className="login-hero-title">
              The Great Canadian Meat Company
            </h2>

            <p className="login-hero-desc">
              Next-generation manufacturing execution, autonomous maintenance, quality governance, and continuous improvement platform for The Great Canadian Meat Company Inc.
            </p>
          </div>
        </div>

        {/* Right Panel: Clean Direct Credentials Login Box */}
        <div className="login-right-panel">
          {/* Header section with back button */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              type="button"
              onClick={() => navigate("/")}
              title="Back to Landing Page"
              aria-label="Back to Landing Page"
              style={{
                width: "30px",
                height: "30px",
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
              <ArrowLeft size={15} strokeWidth={2.5} />
            </button>

            {/* Logo & Client Branding Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  padding: "4px 8px",
                  borderRadius: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(200, 149, 71, 0.25)",
                  boxShadow: "0 2px 8px rgba(70, 45, 15, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <img
                  src="/great_canadian_meat_logo.png"
                  alt="The Great Canadian Meat Company"
                  style={{
                    height: "46px",
                    maxWidth: "78px",
                    objectFit: "contain"
                  }}
                />
              </div>
              <div>
                <h1 style={{ fontSize: "21px", fontWeight: 900, color: "#2B1D11", letterSpacing: "-0.4px", margin: 0, lineHeight: 1.15 }}>
                  The Great Canadian <span style={{ color: "#B27E33" }}>Meat Co.</span>
                </h1>
                <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: "3px 0 0 0", fontWeight: 600 }}>
                  MaintenX OS Operations Portal • Oshawa/Whitby
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Error Alert Banner */}
            {authError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#FEF2F2",
                  border: "1.5px solid #F87171",
                  boxShadow: "0 4px 16px rgba(220, 38, 38, 0.12)",
                  animation: "subtleScale 0.25s ease-out"
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#FEE2E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px"
                  }}
                >
                  <AlertCircle size={17} color="#DC2626" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", lineHeight: 1.35 }}>
                    {authError.title}
                  </div>
                  <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#B91C1C", marginTop: "3px", opacity: 0.95 }}>
                    {authError.message}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthError(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#991B1B",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px"
                  }}
                  title="Dismiss error"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Direct Credentials Stack */}
            <div className="login-inputs-stack">
              {/* Corporate Email */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "7px" }}>
                  <User size={13} color="#B27E33" /> Corporate Email
                </label>
                <input
                  type="email"
                  className="form-input-amber"
                  placeholder="e.g. plant.manager@maintenx.com"
                  autoComplete="email"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "13px 15px",
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF",
                    border: authError ? "1.5px solid #F87171" : "1px solid var(--border-subtle)",
                    boxShadow: authError ? "0 0 0 3px rgba(239, 68, 68, 0.12)" : "none",
                    color: "var(--text-primary)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  required
                />
              </div>

              {/* Security Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "7px" }}>
                  <Lock size={13} color="#B27E33" /> Security Password
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input-amber"
                    placeholder="Enter security password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "13px 44px 13px 15px",
                      borderRadius: "12px",
                      backgroundColor: "#FFFFFF",
                      border: authError ? "1.5px solid #F87171" : "1px solid var(--border-subtle)",
                      boxShadow: authError ? "0 0 0 3px rgba(239, 68, 68, 0.12)" : "none",
                      color: "var(--text-primary)",
                      fontSize: "13.5px",
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
                      padding: "6px"
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} color="#8C5B23" /> : <Eye size={18} color="var(--text-muted)" />}
                  </button>
                </div>
              </div>

              {/* Auxiliary Row: Remember Me & Security Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "#C89547", cursor: "pointer", width: "14px", height: "14px" }}
                  />
                  Remember on this device
                </label>
                <span style={{ fontSize: "11.5px", color: "#8C5B23", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <ShieldCheck size={14} color="#C89547" /> Encrypted Session
                </span>
              </div>
            </div>

            {/* Sign In Button */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  fontSize: "14.5px",
                  fontWeight: 800,
                  background: isSubmitting
                    ? "#DCCFBF"
                    : "linear-gradient(180deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                  border: "1px solid #E8C182",
                  boxShadow: "0 4px 16px rgba(178, 126, 51, 0.35)",
                  borderRadius: "50px",
                  color: "#261603",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.18s ease",
                  outline: "none",
                  opacity: isSubmitting ? 0.7 : 1
                }}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(1.012)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Sparkles size={16} /> {isSubmitting ? "Verifying Credentials..." : "Sign In to MaintenX OS"}
              </button>
            </div>
          </form>

          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", fontWeight: 600 }}>
            ISO 27001 Secured • Authorized Corporate Access Only
          </div>
        </div>
      </div>
    </div>
  );
}

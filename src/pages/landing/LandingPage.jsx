import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Activity, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  TrendingUp, 
  Clock, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  ChevronDown, 
  Server, 
  BrainCircuit, 
  Check, 
  Flame, 
  Lock, 
  Boxes,
  MapPin,
  Phone,
  Mail,
  Factory
} from "lucide-react";
import "./landing.css";

import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useApp();
  const { isAuthenticated, currentRole, login } = useRole();

  // Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: "", email: "", plant: "" });

  // Plan Registration & Checkout Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({
    id: "pilot",
    name: "Plant Pilot",
    price: "₹0",
    period: "/ 7 days",
    isFree: true
  });
  const [planForm, setPlanForm] = useState({
    name: "",
    email: "",
    company: "",
    planId: "pilot"
  });

  // Legal & Compliance Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("privacy"); // "privacy" | "terms" | "compliance"

  const openLegalModal = (tab) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleOpenPlanModal = (plan) => {
    setSelectedPlan(plan);
    setPlanForm(prev => ({ ...prev, planId: plan.id }));
    setIsPlanModalOpen(true);
  };

  const handlePlanChange = (planId) => {
    const plansMap = {
      pilot: { id: "pilot", name: "Plant Pilot", price: "₹0", period: "/ 7 days", isFree: true },
      starter: { id: "starter", name: "Starter Line", price: "₹5,999", period: "/ month", isFree: false },
      standard: { id: "standard", name: "Standard Facility", price: "₹14,999", period: "/ month", isFree: false },
      enterprise: { id: "enterprise", name: "Enterprise Pro", price: "₹29,999", period: "/ month", isFree: false }
    };
    const chosen = plansMap[planId] || plansMap.pilot;
    setSelectedPlan(chosen);
    setPlanForm(prev => ({ ...prev, planId }));
  };

  const handlePlanSubmit = (e) => {
    e.preventDefault();
    const userName = planForm.name.trim() || "Operator";
    const userEmail = planForm.email.trim();
    if (!userEmail) return;

    if (selectedPlan.isFree) {
      addToast(`Account created for ${userName}! Your 7-day Plant Pilot is now active.`, "success");
      setIsPlanModalOpen(false);
      setPlanForm({ name: "", email: "", company: "", planId: "pilot" });
      if (login) {
        login("plant_manager");
      }
      navigate("/command-center");
    } else {
      addToast(`Account created for ${userName}! Proceeding to secure checkout for ${selectedPlan.name} (${selectedPlan.price})...`, "success");
      setIsPlanModalOpen(false);
      setPlanForm({ name: "", email: "", company: "", planId: "pilot" });
      if (login) {
        login("plant_manager");
      }
      navigate("/command-center");
    }
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    const userName = demoForm.name.trim() || "Enterprise Guest";
    const userEmail = demoForm.email.trim();
    if (!userEmail) return;

    addToast(`Demo scheduled for ${userName}! Launching live factory environment...`, "success");
    setIsDemoModalOpen(false);
    setDemoForm({ name: "", email: "", plant: "" });
    if (login) {
      login("plant_manager");
    }
    navigate("/command-center");
  };

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      navigate(currentRole?.defaultRoute || "/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleNavClick = (route, sectionId) => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    navigate(route);
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Live Telemetry Simulation for HUD
  const [liveBpm, setLiveBpm] = useState(582);
  const [liveYield, setLiveYield] = useState(99.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBpm(prev => 580 + Math.floor(Math.random() * 8) - 3);
      setLiveYield(prev => +(99.3 + Math.random() * 0.3).toFixed(1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Sync scroll with route and clean any malformed hash
  useEffect(() => {
    if (window.location.href.includes("//#") || window.location.hash.includes("//")) {
      window.history.replaceState(null, "", window.location.pathname || "/");
    }

    const path = location.pathname;
    if (path === "/features") {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    } else if (path === "/why-us") {
      document.getElementById("why-us")?.scrollIntoView({ behavior: "smooth" });
    } else if (path === "/pricing") {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    } else if (path === "/contact") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else if (path === "/" || path === "/landing" || path === "/home") {
      if (window.location.hash) {
        window.history.replaceState(null, "", "/");
      }
    }
  }, [location.pathname]);

  return (
    <div className="landing-root">
      {/* --------------------------------------------------------- */}
      {/* 1. Header Navigation                                      */}
      {/* --------------------------------------------------------- */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          {/* MaintenX OS Theme Logo */}
          <div 
            className="landing-brand-logo" 
            onClick={() => handleNavClick("/", "home")}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#261603",
                boxShadow: "0 3px 10px rgba(200, 149, 71, 0.35)",
                flexShrink: 0
              }}
            >
              <Flame size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  letterSpacing: "-0.3px",
                  color: "var(--text-primary, #261603)",
                  lineHeight: 1.1
                }}
              >
                MaintenX <span style={{ color: "#B27E33" }}>OS</span>
              </span>
              <span
                style={{
                  fontSize: "8px",
                  color: "var(--text-muted, #8C7B6E)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  lineHeight: 1,
                  marginTop: "2px"
                }}
              >
                MANUFACTURING CLOUD
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="landing-nav-links">
            <li><span onClick={() => handleNavClick("/", "home")} className="landing-nav-link">Home</span></li>
            <li><span onClick={() => handleNavClick("/features", "features")} className="landing-nav-link">Features</span></li>
            <li><span onClick={() => handleNavClick("/why-us", "why-us")} className="landing-nav-link">Why MaintenX</span></li>
            <li><span onClick={() => handleNavClick("/pricing", "pricing")} className="landing-nav-link">Pricing</span></li>
            <li><span onClick={() => handleNavClick("/contact", "contact")} className="landing-nav-link">Contact</span></li>
          </ul>

          {/* Right Actions */}
          <div className="landing-nav-actions">
            <button 
              onClick={() => setIsDemoModalOpen(true)} 
              className="landing-btn-demo"
            >
              Request a Demo
            </button>
            <button 
              onClick={handleLaunchApp} 
              className="landing-btn-login"
            >
              {isAuthenticated ? "Enter Console" : "Login"}
            </button>
          </div>
        </div>
      </nav>

      {/* --------------------------------------------------------- */}
      {/* 2. Hero Section (Split Layout with 4 Stats)               */}
      {/* --------------------------------------------------------- */}
      <section id="home" className="saas-hero-section">
        <div className="saas-hero-grid">
          {/* Left Hero Column */}
          <div>
            <div className="saas-pill-badge">
              <Sparkles size={13} color="#B27E33" />
              <span>ALL-IN-ONE SMART MANUFACTURING CLOUD</span>
            </div>

            <h1 className="saas-hero-title">
              Transform Your
              <span className="saas-hero-gradient-text">Manufacturing Productivity</span>
            </h1>

            <p className="saas-hero-desc">
              The all-in-one industrial Operating System for high-speed factories. Connect shop-floor machines, automate inline CCP quality quarantine, and govern shift recovery with authorized AI.
            </p>

            {/* 4 Quick Stat Badges in a Horizontal Row */}
            <div className="saas-hero-stats-row">
              <div className="saas-stat-item">
                <div className="saas-stat-icon-wrap">
                  <Activity size={15} />
                </div>
                <div className="saas-stat-value">{liveBpm} <span style={{ fontSize: "11px", color: "#6B5B4E" }}>BPM</span></div>
                <div className="saas-stat-label">Rotary Speed</div>
              </div>

              <div className="saas-stat-item">
                <div className="saas-stat-icon-wrap">
                  <Cpu size={15} />
                </div>
                <div className="saas-stat-value">100+</div>
                <div className="saas-stat-label">Work Centers</div>
              </div>

              <div className="saas-stat-item">
                <div className="saas-stat-icon-wrap">
                  <Zap size={15} />
                </div>
                <div className="saas-stat-value">{liveYield}%</div>
                <div className="saas-stat-label">Telemetry Sync</div>
              </div>

              <div className="saas-stat-item">
                <div className="saas-stat-icon-wrap">
                  <BrainCircuit size={15} />
                </div>
                <div className="saas-stat-value">24/7</div>
                <div className="saas-stat-label">AI Recovery</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Visual Smart Factory Image */}
          <div className="saas-hero-visual">
            <div className="saas-visual-frame">
              <img
                src="/assets/landing/hero_smart_factory.jpg"
                alt="MaintenX OS High-Speed Smart Bottling Factory"
                className="saas-visual-img"
              />

              {/* Floating Live Telemetry HUD */}
              <div className="hud-telemetry-pill">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0284C7", boxShadow: "0 0 8px #0284C7" }}></span>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#0284C7", textTransform: "uppercase" }}>
                    SCADA Telemetry • Line 1
                  </span>
                </div>
                <div style={{ fontSize: "17px", fontWeight: 900, color: "#261603", fontFamily: "var(--font-mono)" }}>
                  {liveBpm} <span style={{ fontSize: "11px", color: "#6B5B4E" }}>BPM</span>
                </div>
                <div style={{ fontSize: "10px", color: "#059669", fontWeight: 700, marginTop: "1px" }}>
                  Optimal Pacing • Target: 600 BPM
                </div>
              </div>

              {/* Floating AI Governance HUD */}
              <div className="hud-ai-pill">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <BrainCircuit size={13} color="#B27E33" />
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#B27E33", textTransform: "uppercase" }}>
                    AI Governance (Rule 18)
                  </span>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#261603" }}>
                  Autonomous Reroute: Skid 2
                </div>
                <div style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>
                  Lift: +1.8% Enterprise OEE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Industrial Integration Strip (Covers the gap with high-value proof) */}
        <div className="saas-trust-strip">
          <div className="saas-trust-container">
            <span className="saas-trust-title">
              <Cpu size={14} color="#B27E33" /> INDUSTRIAL PROTOCOLS & COMPLIANCE
            </span>
            <div className="saas-trust-badges">
              <div className="saas-trust-item">
                <Activity size={13} color="#B27E33" />
                <span>OPC-UA / MQTT 5.0</span>
              </div>
              <div className="saas-trust-item">
                <ShieldCheck size={13} color="#B27E33" />
                <span>FDA 21 CFR Part 11</span>
              </div>
              <div className="saas-trust-item">
                <Layers size={13} color="#B27E33" />
                <span>ISA-95 Level 3 MES</span>
              </div>
              <div className="saas-trust-item">
                <Boxes size={13} color="#B27E33" />
                <span>GS1-128 Lot Hold</span>
              </div>
              <div className="saas-trust-item">
                <Lock size={13} color="#B27E33" />
                <span>SOC 2 Type II Validated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- */}
      {/* 3. Features Section (Compact, Beautiful & Content-Dense)  */}
      {/* --------------------------------------------------------- */}
      <section id="features" className="saas-features-section">
        <div className="saas-section-header">
          <div className="saas-pill-badge">
            <Cpu size={12} color="#B27E33" />
            <span>POWERFUL CAPABILITIES</span>
          </div>
          <h2 className="saas-section-title">
            Everything You Need to <span className="saas-title-accent">Manage Your Plant Operations</span>
          </h2>
          <p className="saas-section-subtitle">
            Comprehensive industrial tools designed specifically for modern high-speed autonomous shop-floors.
          </p>
        </div>

        {/* Top Row: 3 Feature Cards */}
        <div className="saas-features-top-row">
          <div className="saas-feature-card">
            <div className="saas-feature-header">
              <div className="saas-feature-icon-box">
                <Activity size={18} />
              </div>
              <span className="card-kpi-pill">580+ BPM LIVE</span>
            </div>
            <h3 className="saas-feature-name">Sub-Second SCADA Telemetry</h3>
            <p className="saas-feature-desc">
              Live speed ingest, rotary filler pressures, and instantaneous micro-stop logging directly at machine consoles.
            </p>
            <span onClick={handleLaunchApp} className="saas-feature-arrow-link">
              Explore SCADA <ArrowRight size={13} />
            </span>
          </div>

          <div className="saas-feature-card">
            <div className="saas-feature-header">
              <div className="saas-feature-icon-box">
                <Gauge size={18} />
              </div>
              <span className="card-kpi-pill">PARETO LOSS</span>
            </div>
            <h3 className="saas-feature-name">Downtime & Loss Analytics</h3>
            <p className="saas-feature-desc">
              Hour-by-hour pace tracking with automatic financial loss calculation ($/min) and Pareto downtime categorization.
            </p>
            <span onClick={handleLaunchApp} className="saas-feature-arrow-link">
              Explore OEE <ArrowRight size={13} />
            </span>
          </div>

          <div className="saas-feature-card">
            <div className="saas-feature-header">
              <div className="saas-feature-icon-box">
                <ShieldCheck size={18} />
              </div>
              <span className="card-kpi-pill">INLINE CCP GATE</span>
            </div>
            <h3 className="saas-feature-name">Autonomous CCP Quality Gate</h3>
            <p className="saas-feature-desc">
              Inline Brix, pH, and seal verification with instant GS1-128 digital quarantine holds preventing out-of-spec leaks.
            </p>
            <span onClick={handleLaunchApp} className="saas-feature-arrow-link">
              Explore Quality <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* Bottom Row: 2 Feature Cards Centered */}
        <div className="saas-features-bottom-row">
          <div className="saas-feature-card">
            <div className="saas-feature-header">
              <div className="saas-feature-icon-box">
                <BrainCircuit size={18} />
              </div>
              <span className="card-kpi-pill">RULE 18 AI RECOVERY</span>
            </div>
            <h3 className="saas-feature-name">Governed AI Shift Recovery</h3>
            <p className="saas-feature-desc">
              Predictive bottleneck mitigation and dynamic line re-routing requiring mandatory human supervisor authorization.
            </p>
            <span onClick={handleLaunchApp} className="saas-feature-arrow-link">
              Explore Recovery <ArrowRight size={13} />
            </span>
          </div>

          <div className="saas-feature-card">
            <div className="saas-feature-header">
              <div className="saas-feature-icon-box">
                <Building2 size={18} />
              </div>
              <span className="card-kpi-pill">PORTFOLIO OEE</span>
            </div>
            <h3 className="saas-feature-name">Multi-Plant Executive Control</h3>
            <p className="saas-feature-desc">
              Cross-facility portfolio OEE benchmarking, 21 CFR Part 11 audit trails, and 1-click boardroom executive summaries.
            </p>
            <span onClick={handleLaunchApp} className="saas-feature-arrow-link">
              Explore Governance <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- */}
      {/* 4. Why MaintenX OS Stands Out (Benefits Split Section)    */}
      {/* --------------------------------------------------------- */}
      <section id="why-us" className="saas-why-section">
        <div className="saas-why-grid">
          {/* Left Column: Heading & 6-Point Checklist */}
          <div>
            <div className="saas-pill-badge">
              <Award size={12} color="#B27E33" />
              <span>WHY MAINTENX OS</span>
            </div>

            <h2 className="saas-section-title" style={{ textAlign: "left", margin: "12px 0 16px 0" }}>
              Why <span className="saas-title-accent">MaintenX OS</span> Stands Out
            </h2>

            <p style={{ fontSize: "15px", color: "var(--text-secondary, #6B5B4E)", lineHeight: 1.6, margin: 0 }}>
              Our industrial manufacturing platform is engineered to eliminate micro-stop losses, enforce strict regulatory compliance, and provide an uncompromising user experience for every shift role.
            </p>

            <div className="saas-why-checklist">
              <div className="saas-checklist-item">
                <div className="saas-checklist-icon"><Check size={14} strokeWidth={3} /></div>
                <span>Increase overall plant OEE by up to 18%</span>
              </div>
              <div className="saas-checklist-item">
                <div className="saas-checklist-icon"><Check size={14} strokeWidth={3} /></div>
                <span>Save 15+ hours per week on manual shift paperwork & logs</span>
              </div>
              <div className="saas-checklist-item">
                <div className="saas-checklist-icon"><Check size={14} strokeWidth={3} /></div>
                <span>Sub-second SCADA OPC-UA & MQTT sensor synchronization</span>
              </div>
              <div className="saas-checklist-item">
                <div className="saas-checklist-icon"><Check size={14} strokeWidth={3} /></div>
                <span>Instant GS1-128 barcode lot & pallet quarantine holds</span>
              </div>
              <div className="saas-checklist-item">
                <div className="saas-checklist-icon"><Check size={14} strokeWidth={3} /></div>
                <span>Enforce FDA 21 CFR Part 11 audit trails & digital signatures</span>
              </div>
              <div className="saas-checklist-item">
                <div className="saas-checklist-icon"><Check size={14} strokeWidth={3} /></div>
                <span>Governed human-in-the-loop AI shift re-routing with supervisor sign-off</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Metric Cards + Featured Impact Card */}
          <div>
            <div className="saas-why-metrics-grid">
              <div className="saas-metric-box">
                <div className="saas-metric-value">40%</div>
                <div className="saas-metric-title">Downtime Reduced</div>
              </div>
              <div className="saas-metric-box">
                <div className="saas-metric-value">15+</div>
                <div className="saas-metric-title">Hours Saved / Week</div>
              </div>
              <div className="saas-metric-box">
                <div className="saas-metric-value">99.9%</div>
                <div className="saas-metric-title">CCP Intercept Rate</div>
              </div>
            </div>

            {/* Featured Plant Impact Card */}
            <div className="saas-impact-card">
              <p className="saas-impact-quote">
                "MaintenX OS synchronized our 4 packaging skids with sub-second SCADA telemetry, eliminating $140K in monthly micro-stop losses and enforcing automated quality holds across shifts."
              </p>
              <div className="saas-impact-author">
                <div className="saas-impact-avatar">MV</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#261603" }}>Marcus Vance</div>
                  <div style={{ fontSize: "12px", color: "#6B5B4E" }}>Director of Plant Operations, Austin Bottling Complex</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- */}
      {/* 5. Pricing Section (4 Columns)                            */}
      {/* --------------------------------------------------------- */}
      <section id="pricing" className="saas-pricing-section">
        <div className="saas-section-header">
          <div className="saas-pill-badge">
            <Zap size={12} color="#B27E33" />
            <span>FLEXIBLE PRICING</span>
          </div>
          <h2 className="saas-section-title">
            Choose Your <span className="saas-title-accent">Perfect Plan</span>
          </h2>
          <p className="saas-section-subtitle">
            Tailored deployment options for manufacturing plants of all sizes.
          </p>
        </div>

        <div className="saas-pricing-grid">
          {/* Plan 1: Plant Pilot */}
          <div className="saas-price-card">
            <div>
              <div className="saas-plan-header">
                <h3 className="saas-plan-title">Plant Pilot</h3>
                <div className="saas-plan-subtitle">Free 7-Day Evaluation</div>
                <div className="saas-plan-price-wrap">
                  <span className="saas-plan-price">₹0</span>
                  <span className="saas-plan-period">/ 7 days</span>
                </div>
              </div>

              <ul className="saas-plan-features" style={{ marginTop: "20px" }}>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> 1 Packaging or Bottling Line</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Operator HMI Touchscreen Console</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Micro-Stop & Downtime Logging</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Standard Shift OEE Metrics</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Community Knowledge Base</li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenPlanModal({ id: "pilot", name: "Plant Pilot", price: "₹0", period: "/ 7 days", isFree: true })}
              className="saas-plan-btn"
            >
              Start Free Pilot
            </button>
          </div>

          {/* Plan 2: Starter Line */}
          <div className="saas-price-card">
            <div>
              <div className="saas-plan-header">
                <h3 className="saas-plan-title">Starter Line</h3>
                <div className="saas-plan-subtitle">Single Dedicated Line</div>
                <div className="saas-plan-price-wrap">
                  <span className="saas-plan-price">₹5,999</span>
                  <span className="saas-plan-period">/ month</span>
                </div>
              </div>

              <ul className="saas-plan-features" style={{ marginTop: "20px" }}>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Everything in Plant Pilot</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> OPC-UA & MQTT SCADA Ingest</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Inline CCP Quality Gate Validation</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> PM Checklist & Work Order Dispatch</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> 10 Concurrent Operator Logins</li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenPlanModal({ id: "starter", name: "Starter Line", price: "₹5,999", period: "/ month", isFree: false })}
              className="saas-plan-btn"
            >
              Choose Starter
            </button>
          </div>

          {/* Plan 3: Standard Facility (HIGHLIGHTED / MOST POPULAR) */}
          <div className="saas-price-card popular-plan">
            <div className="saas-popular-tag">MOST POPULAR</div>
            <div>
              <div className="saas-plan-header">
                <h3 className="saas-plan-title">Standard Facility</h3>
                <div className="saas-plan-subtitle">Full Multi-Line Bottling Plant</div>
                <div className="saas-plan-price-wrap">
                  <span className="saas-plan-price">₹14,999</span>
                  <span className="saas-plan-period">/ month</span>
                </div>
              </div>

              <ul className="saas-plan-features" style={{ marginTop: "20px" }}>
                <li className="saas-plan-feature-item"><Check size={14} color="#B27E33" /> Everything in Starter Line</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#B27E33" /> Unlimited Production & Packaging Lines</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#B27E33" /> Dynamic APS Capacity Scheduler</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#B27E33" /> Governed AI Shift Recovery & Bottlenecks</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#B27E33" /> Spare Parts & Lot Traceability</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#B27E33" /> Dedicated 24/7 Support Engineer</li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenPlanModal({ id: "standard", name: "Standard Facility", price: "₹14,999", period: "/ month", isFree: false })}
              className="saas-plan-btn"
            >
              Launch Facility Plan
            </button>
          </div>

          {/* Plan 4: Enterprise Multi-Plant */}
          <div className="saas-price-card">
            <div>
              <div className="saas-plan-header">
                <h3 className="saas-plan-title">Enterprise Pro</h3>
                <div className="saas-plan-subtitle">Multi-Facility Corporate Cloud</div>
                <div className="saas-plan-price-wrap">
                  <span className="saas-plan-price">₹29,999</span>
                  <span className="saas-plan-period">/ month</span>
                </div>
              </div>

              <ul className="saas-plan-features" style={{ marginTop: "20px" }}>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Multi-Plant Executive Portfolio</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> 21 CFR Part 11 Electronic Signatures</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> Custom ERP & MES API Connectors</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> On-Premises or Sovereign Private Cloud</li>
                <li className="saas-plan-feature-item"><Check size={14} color="#059669" /> 99.99% Guaranteed Availability SLA</li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenPlanModal({ id: "enterprise", name: "Enterprise Pro", price: "₹29,999", period: "/ month", isFree: false })}
              className="saas-plan-btn"
            >
              Contact Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- */}
      {/* 6. Bottom CTA Banner                                      */}
      {/* --------------------------------------------------------- */}
      <section className="saas-cta-banner-section">
        <div className="saas-cta-banner-card">
          <div className="saas-pill-badge" style={{ background: "rgba(200, 149, 71, 0.2)", color: "#E2B670", border: "1px solid rgba(200, 149, 71, 0.4)" }}>
            <Sparkles size={12} color="#E2B670" />
            <span>READY FOR DEPLOYMENT</span>
          </div>

          <h2 className="saas-cta-title">
            Transform Your Manufacturing Today
          </h2>

          <p className="saas-cta-subtitle">
            Join leading bottling, packaging, and discrete manufacturers operating at peak OEE with MaintenX OS.
          </p>

          <button onClick={handleLaunchApp} className="saas-cta-btn">
            Launch MaintenX OS Now <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* --------------------------------------------------------- */}
      {/* 7. Multi-Column SaaS Footer                               */}
      {/* --------------------------------------------------------- */}
      <footer id="contact" className="saas-footer">
        <div className="saas-footer-container">
          <div className="saas-footer-grid">
            {/* Column 1: Brand Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#261603"
                  }}
                >
                  <Flame size={16} />
                </div>
                <span style={{ fontSize: "16px", fontWeight: 900, color: "#261603" }}>
                  MaintenX <span style={{ color: "#B27E33" }}>OS</span>
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary, #6B5B4E)", lineHeight: 1.6, marginBottom: "18px" }}>
                Enterprise Manufacturing Execution System & SCADA Industrial Cloud for high-speed autonomous factories.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", fontWeight: 750, color: "#B27E33", background: "rgba(200, 149, 71, 0.1)", border: "1px solid rgba(200, 149, 71, 0.25)", padding: "2px 8px", borderRadius: "4px" }}>
                  21 CFR PART 11
                </span>
                <span style={{ fontSize: "10px", fontWeight: 750, color: "#B27E33", background: "rgba(200, 149, 71, 0.1)", border: "1px solid rgba(200, 149, 71, 0.25)", padding: "2px 8px", borderRadius: "4px" }}>
                  ISA-95
                </span>
                <span style={{ fontSize: "10px", fontWeight: 750, color: "#B27E33", background: "rgba(200, 149, 71, 0.1)", border: "1px solid rgba(200, 149, 71, 0.25)", padding: "2px 8px", borderRadius: "4px" }}>
                  SOC 2
                </span>
              </div>
            </div>

            {/* Column 2: Platform Modules */}
            <div>
              <div className="saas-footer-col-title">Platform Suite</div>
              <ul className="saas-footer-links">
                <li className="saas-footer-static-item">Shopfloor Operator HMI</li>
                <li className="saas-footer-static-item">Maintenance CMMS</li>
                <li className="saas-footer-static-item">Inline CCP Quality Gate</li>
                <li className="saas-footer-static-item">APS Dynamic Scheduler</li>
                <li className="saas-footer-static-item">Executive Control Tower</li>
              </ul>
            </div>

            {/* Column 3: Quick Navigation */}
            <div>
              <div className="saas-footer-col-title">Quick Links</div>
              <ul className="saas-footer-links">
                <li><span onClick={() => handleNavClick("/", "home")} className="saas-footer-link">Home Overview</span></li>
                <li><span onClick={() => handleNavClick("/features", "features")} className="saas-footer-link">Core Features</span></li>
                <li><span onClick={() => handleNavClick("/why-us", "why-us")} className="saas-footer-link">Why MaintenX OS</span></li>
                <li><span onClick={() => handleNavClick("/pricing", "pricing")} className="saas-footer-link">Subscription Pricing</span></li>
                <li onClick={() => setIsDemoModalOpen(true)} className="saas-footer-link">Schedule a Demo</li>
              </ul>
            </div>

            {/* Column 4: Contact & Facilities */}
            <div>
              <div className="saas-footer-col-title">Plant Contact</div>
              <div className="saas-footer-contact-item">
                <MapPin size={15} color="#B27E33" style={{ marginTop: "3px", flexShrink: 0 }} />
                <span>Austin Smart Manufacturing Complex 07, Industrial Pkwy, TX</span>
              </div>
              <div className="saas-footer-contact-item">
                <Phone size={15} color="#B27E33" style={{ flexShrink: 0 }} />
                <span>+1 (512) 890-FLOW</span>
              </div>
              <div className="saas-footer-contact-item">
                <Mail size={15} color="#B27E33" style={{ flexShrink: 0 }} />
                <span>operations@maintenx.ops</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Screen Edge-to-Edge Divider Line */}
        <div className="saas-footer-full-line" />

        <div className="saas-footer-container">
          {/* Footer Copyright Bottom Bar */}
          <div className="saas-footer-bottom">
            <div>© 2026 MaintenX OS. All rights reserved.</div>
            <div style={{ display: "flex", gap: "20px" }}>
              <span onClick={() => openLegalModal("privacy")} className="saas-legal-link">Privacy Policy</span>
              <span onClick={() => openLegalModal("terms")} className="saas-legal-link">Terms of Service</span>
              <span onClick={() => openLegalModal("compliance")} className="saas-legal-link">Compliance Disclosures</span>
            </div>
          </div>
        </div>
      </footer>

      {/* --------------------------------------------------------- */}
      {/* 8. Interactive Request a Demo Modal                       */}
      {/* --------------------------------------------------------- */}
      {isDemoModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(38, 22, 3, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setIsDemoModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid var(--accent-amber, #C89547)",
              borderRadius: "18px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 24px 60px rgba(70, 45, 15, 0.25)",
              color: "var(--text-primary, #2B1D11)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  MaintenX OS • Enterprise Walkthrough
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 850, color: "#2B1D11", margin: "4px 0 0 0" }}>
                  Schedule a Factory Demo
                </h3>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9C8C7E",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#6B5B4E", lineHeight: 1.5, marginBottom: "20px" }}>
              See live SCADA telemetry, automated CCP quality holds, and predictive schedule recovery tailored to your production lines.
            </p>

            <form onSubmit={handleDemoSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={demoForm.name}
                  onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main, #F6F3EE)",
                    border: "1px solid var(--border-subtle, #E8DDCF)",
                    color: "#2B1D11",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={demoForm.email}
                  onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main, #F6F3EE)",
                    border: "1px solid var(--border-subtle, #E8DDCF)",
                    color: "#2B1D11",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Plant / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Austin Bottling Facility 04"
                  value={demoForm.plant}
                  onChange={(e) => setDemoForm({ ...demoForm, plant: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main, #F6F3EE)",
                    border: "1px solid var(--border-subtle, #E8DDCF)",
                    color: "#2B1D11",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#FFFFFF",
                    color: "#6B5B4E",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="landing-btn-login"
                  style={{
                    flex: 2,
                    padding: "10px",
                    fontSize: "13px",
                    borderRadius: "8px",
                    justifyContent: "center"
                  }}
                >
                  Request Live Demo →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* 9. Plan Registration & Payment Checkout Modal             */}
      {/* --------------------------------------------------------- */}
      {isPlanModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(38, 22, 3, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid var(--accent-amber, #C89547)",
              borderRadius: "18px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 24px 60px rgba(70, 45, 15, 0.25)",
              color: "var(--text-primary, #2B1D11)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  MaintenX OS • Subscription Setup
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 850, color: "#2B1D11", margin: "4px 0 0 0" }}>
                  Get Started with {selectedPlan.name}
                </h3>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9C8C7E",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#6B5B4E", lineHeight: 1.5, marginBottom: "20px" }}>
              Complete the details below to set up your account and activate your manufacturing cloud access.
            </p>

            <form onSubmit={handlePlanSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Field 1: Name */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main, #F6F3EE)",
                    border: "1px solid var(--border-subtle, #E8DDCF)",
                    color: "#2B1D11",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              {/* Field 2: Mail */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={planForm.email}
                  onChange={(e) => setPlanForm({ ...planForm, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main, #F6F3EE)",
                    border: "1px solid var(--border-subtle, #E8DDCF)",
                    color: "#2B1D11",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              {/* Field 3: Company Name */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Company / Plant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Austin Bottling Facility 04"
                  value={planForm.company}
                  onChange={(e) => setPlanForm({ ...planForm, company: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main, #F6F3EE)",
                    border: "1px solid var(--border-subtle, #E8DDCF)",
                    color: "#2B1D11",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              {/* Field 4: Selected Plan */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Selected Plan
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedPlan.name} • ${selectedPlan.price} ${selectedPlan.period}`}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-main, #F6F3EE)",
                    border: "1px solid var(--border-subtle, #E8DDCF)",
                    color: "#2B1D11",
                    fontSize: "13px",
                    fontWeight: 750,
                    boxSizing: "border-box",
                    outline: "none",
                    cursor: "default"
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#FFFFFF",
                    color: "#6B5B4E",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                {/* Free Plan Button vs Paid Plan Button */}
                {selectedPlan.isFree ? (
                  <button
                    type="submit"
                    className="landing-btn-login"
                    style={{
                      flex: 2,
                      padding: "11px",
                      fontSize: "13px",
                      borderRadius: "8px",
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    Start Free Trial →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="landing-btn-login"
                    style={{
                      flex: 2,
                      padding: "11px",
                      fontSize: "13px",
                      borderRadius: "8px",
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    Proceed to Payment →
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* 10. Legal & Compliance Trust Modal                        */}
      {/* --------------------------------------------------------- */}
      {isLegalModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(38, 22, 3, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setIsLegalModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid var(--accent-amber, #C89547)",
              borderRadius: "18px",
              padding: "0",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 60px rgba(70, 45, 15, 0.25)",
              color: "var(--text-primary, #2B1D11)",
              position: "relative",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "22px 28px 16px 28px",
                borderBottom: "1px solid var(--border-subtle, #E8DDCF)",
                backgroundColor: "var(--bg-main, #F6F3EE)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Legal & Regulatory Governance
                </span>
                <h3 style={{ fontSize: "19px", fontWeight: 850, color: "#2B1D11", margin: "2px 0 0 0" }}>
                  MaintenX OS Trust Center
                </h3>
              </div>
              <button
                onClick={() => setIsLegalModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9C8C7E",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #E8DDCF",
                backgroundColor: "#FFFFFF",
                padding: "0 20px"
              }}
            >
              <button
                type="button"
                onClick={() => setLegalModalTab("privacy")}
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: legalModalTab === "privacy" ? 800 : 600,
                  color: legalModalTab === "privacy" ? "#B27E33" : "#6B5B4E",
                  border: "none",
                  borderBottom: legalModalTab === "privacy" ? "2.5px solid #C89547" : "2.5px solid transparent",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  transition: "all 0.18s ease"
                }}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setLegalModalTab("terms")}
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: legalModalTab === "terms" ? 800 : 600,
                  color: legalModalTab === "terms" ? "#B27E33" : "#6B5B4E",
                  border: "none",
                  borderBottom: legalModalTab === "terms" ? "2.5px solid #C89547" : "2.5px solid transparent",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  transition: "all 0.18s ease"
                }}
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setLegalModalTab("compliance")}
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: legalModalTab === "compliance" ? 800 : 600,
                  color: legalModalTab === "compliance" ? "#B27E33" : "#6B5B4E",
                  border: "none",
                  borderBottom: legalModalTab === "compliance" ? "2.5px solid #C89547" : "2.5px solid transparent",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  transition: "all 0.18s ease"
                }}
              >
                Compliance Disclosures
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div
              style={{
                padding: "24px 28px",
                overflowY: "auto",
                maxHeight: "56vh",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#4A3B2C"
              }}
            >
              {legalModalTab === "privacy" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                      Industrial Privacy & Telemetry Policy
                    </h4>
                    <span style={{ fontSize: "11px", color: "#8C7B6E", fontWeight: 600 }}>Effective: January 2026</span>
                  </div>
                  <p style={{ marginBottom: "14px" }}>
                    MaintenX OS is engineered for mission-critical manufacturing facilities. We recognize that industrial sensory signals, PLC ladder data, and plant yields constitute highly proprietary commercial assets.
                  </p>
                  
                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ fontWeight: 750, color: "#2B1D11", marginBottom: "4px" }}>1. Zero Data Monetization</div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      We do not sell, rent, or commercialize your machine telemetry, recipe setpoints, OEE scores, or packaging volumes to third parties or data brokers under any circumstances.
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ fontWeight: 750, color: "#2B1D11", marginBottom: "4px" }}>2. Edge Isolation & End-to-End Encryption</div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      Shopfloor edge gateways transmit telemetry via mutual TLS 1.3 cryptographic channels over outbound-only reverse MQTT/WSS ports. Ingested telemetry is stored using AES-256 at-rest encryption in dedicated tenant partitions.
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ fontWeight: 750, color: "#2B1D11", marginBottom: "4px" }}>3. Operator Privacy & Shift Logs</div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      Operator RFID badges and electronic signature timestamps are recorded exclusively for ISO 9001 and FDA 21 CFR Part 11 audit trails, respecting workplace labor laws and employee privacy standards.
                    </p>
                  </div>
                </div>
              )}

              {legalModalTab === "terms" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                      Enterprise Master Subscription Agreement
                    </h4>
                    <span style={{ fontSize: "11px", color: "#8C7B6E", fontWeight: 600 }}>Effective: January 2026</span>
                  </div>
                  <p style={{ marginBottom: "14px" }}>
                    These Terms of Service govern your organization’s access to the MaintenX OS manufacturing operating system, shopfloor HMIs, and SCADA telemetry ingest engines.
                  </p>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ fontWeight: 750, color: "#2B1D11", marginBottom: "4px" }}>1. 99.99% Telemetry Uptime SLA</div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      MaintenX OS guarantees 99.99% availability for production-line monitoring. Local edge gateways buffer up to 72 hours of telemetry during unexpected network outages, guaranteeing zero data loss.
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ fontWeight: 750, color: "#2B1D11", marginBottom: "4px" }}>2. IP Ownership & Sovereign Data Rights</div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      Customer retains exclusive intellectual property rights to all recipes, production logs, quality inspection gates, and operational metrics. You may export or purge your factory data at any time in open Parquet / JSON formats.
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ fontWeight: 750, color: "#2B1D11", marginBottom: "4px" }}>3. Safety & Physical Override Authority</div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      While MaintenX OS provides automated CCP quality gates and predictive recommendations, physical emergency e-stops and plant safety interlocks remain under the supervisory governance of on-site plant engineers.
                    </p>
                  </div>
                </div>
              )}

              {legalModalTab === "compliance" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                      Regulatory Compliance & Industrial Certifications
                    </h4>
                    <span style={{ fontSize: "11px", color: "#8C7B6E", fontWeight: 600 }}>Audited: 2026</span>
                  </div>
                  <p style={{ marginBottom: "14px" }}>
                    MaintenX OS is architected to satisfy stringent pharmaceutical, food & beverage, and heavy manufacturing regulatory frameworks.
                  </p>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(200, 149, 71, 0.15)", color: "#B27E33", padding: "2px 6px", borderRadius: "4px" }}>FDA VALIDATED</span>
                      <span style={{ fontWeight: 750, color: "#2B1D11" }}>21 CFR Part 11 Electronic Records</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      Includes tamper-evident audit logs, non-repudiation cryptographic signatures, dual-authorization sign-offs, and automated shift handover documentation.
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(200, 149, 71, 0.15)", color: "#B27E33", padding: "2px 6px", borderRadius: "4px" }}>ISA-95 LEVEL 3</span>
                      <span style={{ fontWeight: 750, color: "#2B1D11" }}>Manufacturing Operations Management</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      Certified data structures for shop-floor work centers, production orders, material lot tracking, and bidirectional ERP integration (SAP S/4HANA, Oracle Cloud).
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#FBF9F5", border: "1px solid #EFEAE2", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(200, 149, 71, 0.15)", color: "#B27E33", padding: "2px 6px", borderRadius: "4px" }}>SOC 2 TYPE II</span>
                      <span style={{ fontWeight: 750, color: "#2B1D11" }}>Cloud & Edge Security Assurance</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#6B5B4E" }}>
                      Annual third-party audit verifying continuous controls across system availability, data confidentiality, edge intrusion prevention, and vulnerability mitigation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 28px",
                borderTop: "1px solid var(--border-subtle, #E8DDCF)",
                backgroundColor: "var(--bg-main, #F6F3EE)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: "11px", color: "#8C7B6E" }}>
                MaintenX OS Compliance & Legal Operations
              </span>
              <button
                type="button"
                onClick={() => setIsLegalModalOpen(false)}
                className="landing-btn-login"
                style={{
                  padding: "7px 20px",
                  fontSize: "12.5px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

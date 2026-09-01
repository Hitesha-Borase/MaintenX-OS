import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Bell,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Cpu,
  Flame,
  User,
  Wrench,
  Activity,
  Layers,
  ShieldCheck,
  FileText,
  Database,
  Lock,
  Sliders,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  X,
  LogOut,
  Settings as SettingsIcon,
  RefreshCw,
  Menu
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { useCMMS } from "../../context/CMMSContext";
import { useAdmin } from "../../context/AdminContext";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";

export function Header() {
  const navigate = useNavigate();

  const {
    selectedPlant,
    setSelectedPlant,
    PLANTS,
    selectedShift,
    setSelectedShift,
    SHIFTS,
    selectedDate,
    setIsSearchOpen,
    setIsQuickActionOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    addToast
  } = useApp();

  const { currentRole, setRoleById, ROLES, logout } = useRole();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSubmenu, setShowRoleSubmenu] = useState(false);

  // Live Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const cmmsContext = useCMMS ? useCMMS() : { assets: [], workOrders: [], solutions: [] };
  const { assets = [], workOrders = [], solutions = [] } = cmmsContext || {};

  const adminContext = useAdmin ? useAdmin() : { skuItems: [], users: [] };
  const { skuItems = [], users = [] } = adminContext || {};

  // Comprehensive static index of all application modules & master data pages
  const ALL_SYSTEM_PAGES = useMemo(() => [
    { title: "Dashboard", category: "Navigation", path: "/dashboard", icon: Layers, desc: "Executive Governance & Operational Overview" },
    { title: "Users Directory", category: "User Management", path: "/users", icon: User, desc: "User provisioning and account control" },
    { title: "User Invitations", category: "User Management", path: "/users/invitations", icon: User, desc: "Pending team invites and onboarding" },
    { title: "User Activity Logs", category: "User Management", path: "/users/activity", icon: Activity, desc: "Live user mutations & IP audit" },
    { title: "Roles & Permissions", category: "Security", path: "/roles", icon: ShieldCheck, desc: "RBAC roles and access rights" },
    { title: "Permissions Matrix", category: "Security", path: "/roles/permissions", icon: ShieldCheck, desc: "Module read/write/delete matrix" },
    { title: "Companies", category: "Organization", path: "/organization/companies", icon: Building2, desc: "Legal enterprise entities & tax IDs" },
    { title: "Plants & Facilities", category: "Organization", path: "/organization/plants", icon: Building2, desc: "Plant sites (Austin, Dallas)" },
    { title: "Production Lines", category: "Organization", path: "/organization/lines", icon: Building2, desc: "Packaging & bottling lines" },
    { title: "Work Centers", category: "Organization", path: "/organization/work-centers", icon: Building2, desc: "Machine cells and work centers" },
    { title: "Item / SKU Master", category: "Master Data", path: "/master-data/items", icon: Database, desc: "Finished goods, packaging, ingredients" },
    { title: "Product Families", category: "Master Data", path: "/master-data/product-families", icon: Database, desc: "Beverage families and brands" },
    { title: "Units of Measure (UOM)", category: "Master Data", path: "/master-data/uom", icon: Database, desc: "UOM conversion rates (EA, CS, PLT, L, KG)" },
    { title: "Packaging Master", category: "Master Data", path: "/master-data/packaging", icon: Database, desc: "Bottles, cans, preforms, closures" },
    { title: "BOM & Recipes", category: "Master Data", path: "/master-data/bom", icon: Database, desc: "Liquid blending formulas & Bill of Materials" },
    { title: "Manufacturing Routings", category: "Master Data", path: "/master-data/routings", icon: Database, desc: "Step-by-step production routings" },
    { title: "Operations Catalogue", category: "Master Data", path: "/master-data/operations", icon: Database, desc: "Standard operating cycle steps" },
    { title: "Line Targets & OEE", category: "Master Data", path: "/master-data/line-targets", icon: Database, desc: "Benchmark speed & OEE targets" },
    { title: "Changeover Matrix (SMED)", category: "Master Data", path: "/master-data/changeover-matrix", icon: Database, desc: "SKU transition matrix & SMED standards" },
    { title: "Sanitation & Allergen CIP", category: "Master Data", path: "/master-data/sanitation-allergens", icon: Database, desc: "CIP wash cycles and chemical specs" },
    { title: "Labour Standards", category: "Master Data", path: "/master-data/labour-standards", icon: Database, desc: "Standard crew sizes and labor hours" },
    { title: "Skills & Qualifications", category: "Master Data", path: "/master-data/skills", icon: Database, desc: "Operator certification tiers" },
    { title: "Quality Specifications", category: "Master Data", path: "/master-data/quality-specs", icon: Database, desc: "Brix, pH, torque LCL/UCL limits" },
    { title: "HACCP CCP Limits", category: "Master Data", path: "/master-data/ccp-limits", icon: Database, desc: "Critical control point thresholds" },
    { title: "Machine Capabilities", category: "Master Data", path: "/master-data/machine-capability", icon: Database, desc: "Rated speeds, mechanical envelopes" },
    { title: "Storage Resources & Silos", category: "Master Data", path: "/master-data/storage-resources", icon: Database, desc: "Bulk liquid holding tanks & racking" },
    { title: "ERP Connector (SAP)", category: "Integrations", path: "/integrations/erp", icon: Cpu, desc: "SAP S/4HANA live sync adapter" },
    { title: "Industrial IoT & Telemetry", category: "Integrations", path: "/integrations/iot", icon: Cpu, desc: "OPC-UA and MQTT edge gateways" },
    { title: "Barcode & GS1 Engine", category: "Integrations", path: "/integrations/barcode", icon: Cpu, desc: "GS1-128 & 2D DataMatrix symbologies" },
    { title: "REST APIs & API Keys", category: "Integrations", path: "/integrations/apis", icon: Cpu, desc: "Machine authentication tokens & webhooks" },
    { title: "Missing Data Radar", category: "Data Health", path: "/data-health/missing-data", icon: Activity, desc: "Unpopulated fields & missing attributes" },
    { title: "Deduplication Engine", category: "Data Health", path: "/data-health/duplicates", icon: Activity, desc: "Fuzzy duplicate detection & merging" },
    { title: "Invalid References", category: "Data Health", path: "/data-health/invalid-references", icon: Activity, desc: "Orphaned foreign keys scanner" },
    { title: "Broken Relationships", category: "Data Health", path: "/data-health/broken-relationships", icon: Activity, desc: "Unlinked entity graph healer" },
    { title: "Stale Records Archive", category: "Data Health", path: "/data-health/stale-records", icon: Activity, desc: "Dormant SKU & vendor archiving" },
    { title: "Automated Data Remediation", category: "Data Health", path: "/data-health/remediation", icon: Activity, desc: "1-Click Self-Healing Master Engine" },
    { title: "Enterprise Security & MFA", category: "Security", path: "/security", icon: Lock, desc: "SAML 2.0 SSO, 2FA & IP Whitelist" },
    { title: "System Configuration", category: "Configuration", path: "/configuration", icon: Sliders, desc: "Timezone, shift schedules & constants" },
    { title: "Compliance Audit Logs", category: "Audit", path: "/audit-logs", icon: FileText, desc: "21 CFR Part 11 immutable audit trail" },
    { title: "Data Migration Engine", category: "Migration", path: "/migration", icon: UploadCloud, desc: "Bulk CSV/Excel master data importer" },
    { title: "System Governance Reports", category: "Reports", path: "/system-reports", icon: FileSpreadsheet, desc: "SLA uptime, database size & API stats" },
    { title: "Asset Register", category: "Maintenance", path: "/assets/register", icon: Wrench, desc: "Master machinery register & tag list" },
    { title: "Asset Hierarchy", category: "Maintenance", path: "/assets/hierarchy", icon: Wrench, desc: "Parent-child equipment tree" },
    { title: "Asset 360", category: "Maintenance", path: "/assets/360", icon: Wrench, desc: "360° Machine telemetry, MTBF, health" },
    { title: "Work Orders", category: "Maintenance", path: "/work-orders", icon: Wrench, desc: "Corrective and preventive work orders" },
    { title: "Breakdown Log", category: "Maintenance", path: "/breakdowns/log", icon: AlertTriangle, desc: "Unplanned stoppage log & root cause" },
    { title: "Preventive Maintenance Plans", category: "Maintenance", path: "/pm/plans", icon: Wrench, desc: "Recurring PM checklists & intervals" },
    { title: "Spare Parts Inventory", category: "Maintenance", path: "/spare-parts/inventory", icon: Wrench, desc: "Critical replacement parts stock" },
    { title: "Calibration Schedule", category: "Maintenance", path: "/calibration/schedule", icon: Wrench, desc: "Instrument calibration standards" },
    { title: "Command Center", category: "Plant Manager", path: "/command-center", icon: Layers, desc: "Live plant OEE & dispatch radar" }
  ], []);

  // Filter Search Results Across All Domains
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    // 1. Match system pages & modules
    const matchedPages = ALL_SYSTEM_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q)
    ).slice(0, 5);

    // 2. Match CMMS Assets
    const matchedAssets = (assets || [])
      .filter((a) => a.id?.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((a) => ({
        title: `${a.id} • ${a.name}`,
        category: "Asset",
        path: `/assets/360?id=${a.id}`,
        icon: Wrench,
        desc: `${a.location || a.line || "Plant 1"} • Health: ${a.health || 95}%`
      }));

    // 3. Match Work Orders
    const matchedWOs = (workOrders || [])
      .filter((w) => w.id?.toLowerCase().includes(q) || w.title?.toLowerCase().includes(q) || w.assetName?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((w) => ({
        title: `${w.id} • ${w.title}`,
        category: "Work Order",
        path: `/work-orders?view=${w.id}`,
        icon: Activity,
        desc: `${w.assetName || "Machine"} • ${w.status} (${w.priority})`
      }));

    // 4. Match SKU Master Items
    const matchedSKUs = (skuItems || [])
      .filter((s) => s.id?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((s) => ({
        title: `${s.id} • ${s.name}`,
        category: "SKU Master",
        path: `/master-data/items`,
        icon: Database,
        desc: `${s.category} • Cost: ${s.stdCost} / ${s.uom}`
      }));

    return [...matchedPages, ...matchedAssets, ...matchedWOs, ...matchedSKUs];
  }, [searchQuery, ALL_SYSTEM_PAGES, assets, workOrders, skuItems]);

  // Handle clicking on a search result
  const handleSelectResult = (path) => {
    navigate(path);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setShowRoleSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleSelectResult(searchResults[0].path);
    }
    if (e.key === "Escape") {
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="app-header" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(14px)", backgroundColor: "var(--bg-header)", borderBottom: "1px solid var(--border-subtle)", gap: "16px" }}>
      {/* Far Left: Branding Logo & Sidebar Collapse Toggle */}
      <div className="header-left-section" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-toggle"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "var(--bg-card-subtle)",
            border: "1px solid var(--border-subtle)",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            marginRight: "4px"
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div
          className="header-brand-logo"
          style={{
            width: "36px",
            height: "36px",
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
          <Flame size={20} />
        </div>
        <div className="header-brand-text" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: 900, letterSpacing: "-0.2px", color: "var(--text-primary)", lineHeight: 1, marginBottom: "4px", whiteSpace: "nowrap" }}>
            MaintenX <span style={{ color: "#B27E33" }}>OS</span>
          </span>
          <span className="header-subtitle" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
            Manufacturing Cloud
          </span>
        </div>

        {/* Sidebar Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="desktop-sidebar-toggle"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--bg-card-subtle)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            marginLeft: "6px",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)"
          }}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Center Space: Live Interactive Global Search Bar */}
      <div
        ref={searchContainerRef}
        className="header-search-container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flex: 1,
          justifyContent: "center",
          minWidth: 0,
          position: "relative"
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "420px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "38px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "0 6px 0 14px",
              boxShadow: "0 1px 4px rgba(70, 45, 15, 0.04)"
            }}
          >
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                backgroundColor: "transparent"
              }}
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={14} />
              </button>
            )}

            <button
              onClick={() => {
                if (searchResults.length > 0) {
                  handleSelectResult(searchResults[0].path);
                } else if (searchQuery.trim()) {
                  addToast(`No results found for "${searchQuery}"`, "warning");
                }
              }}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                color: "#261603",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                marginLeft: "6px",
                flexShrink: 0
              }}
              title="Execute Global Search"
            >
              <Search size={14} />
            </button>
          </div>

          {/* LIVE GLOBAL SEARCH RESULTS DROPDOWN */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "44px",
                left: 0,
                right: 0,
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-highlight)",
                borderRadius: "14px",
                boxShadow: "0 12px 32px rgba(70, 45, 15, 0.15)",
                maxHeight: "380px",
                overflowY: "auto",
                zIndex: 100,
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                animation: "fadeIn 0.15s ease-out"
              }}
            >
              <div
                style={{
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>Matching Results ({searchResults.length})</span>
                <span style={{ fontSize: "10px", color: "#B27E33", fontWeight: 700 }}>Press Enter ↵ to open top match</span>
              </div>

              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => {
                  const IconComp = item.icon || Layers;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectResult(item.path)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        transition: "all 0.12s ease",
                        backgroundColor: idx === 0 ? "rgba(200, 149, 71, 0.08)" : "transparent"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.14)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx === 0 ? "rgba(200, 149, 71, 0.08)" : "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#B27E33",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <IconComp size={14} />
                        </div>
                        <div style={{ minWidth: 0, overflow: "hidden" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "5px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#8C5B23"
                          }}
                        >
                          {item.category}
                        </span>
                        <ArrowRight size={13} color="var(--text-muted)" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No matches found for "<strong>{searchQuery}</strong>". Try searching for <em>FM-001, BOM, Users, CIP, Lines, or Reports</em>.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Far Right: Notification & Profile Button */}
      <div className="header-right-section" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        {/* Mobile Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="mobile-search-trigger"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6B5B4E",
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)"
          }}
          title="Search System"
        >
          <Search size={16} />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => addToast("1 New PM Task Alert for Line 1", "info")}
          className="header-notification-btn"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            color: "#6B5B4E",
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)"
          }}
          title="Notifications"
        >
          <Bell size={17} />
          <span
            style={{
              position: "absolute",
              top: "-3px",
              right: "-3px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#C89547",
              color: "#FFFFFF",
              fontSize: "9px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            1
          </span>
        </button>

        {/* Fast Action */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsQuickActionOpen(true)}
          className="header-fast-action"
        >
          <span className="btn-text">Fast Action</span>
        </Button>

        {/* SLEEK PROFILE AVATAR BUTTON & DROPDOWN */}
        <div ref={profileDropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowRoleSubmenu(false);
            }}
            className="header-profile-btn"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              padding: 0,
              borderRadius: "50%",
              backgroundColor: showProfileMenu ? "rgba(200, 149, 71, 0.18)" : "var(--bg-card-subtle)",
              border: showProfileMenu ? "1.5px solid #C89547" : "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)"
            }}
            title="User Profile & Settings"
          >
            <div
              className="header-profile-avatar"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
                color: "#261603",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "12px",
                boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)"
              }}
            >
              {currentRole?.label?.charAt(0) || "U"}
            </div>
          </button>

          {/* PROFILE & LOGOUT DROPDOWN MENU */}
          {showProfileMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "250px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-highlight)",
                borderRadius: "14px",
                boxShadow: "0 14px 36px rgba(70, 45, 15, 0.15)",
                zIndex: 100,
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                animation: "fadeIn 0.15s ease-out"
              }}
            >
              {/* Profile Card Header */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "4px"
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
                    color: "#261603",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "14px",
                    flexShrink: 0
                  }}
                >
                  {currentRole?.label?.charAt(0) || "U"}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    Alexander Vance
                  </div>
                  <div style={{ fontSize: "11px", color: "#8C5B23", fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {currentRole?.label}
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/profile");
                }}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "background-color 0.12s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <User size={15} color="#B27E33" />
                <span>My Profile</span>
              </div>

              {/* Switch Role Option */}
              <div
                onClick={() => setShowRoleSubmenu(!showRoleSubmenu)}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background-color 0.12s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <RefreshCw size={15} color="#0284C7" />
                  <span>Switch Role</span>
                </div>
                <ChevronRight size={13} color="var(--text-muted)" style={{ transform: showRoleSubmenu ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }} />
              </div>

              {/* Nested Role Submenu */}
              {showRoleSubmenu && (
                <div
                  style={{
                    maxHeight: "160px",
                    overflowY: "auto",
                    backgroundColor: "var(--bg-card-subtle)",
                    borderRadius: "8px",
                    padding: "4px",
                    margin: "2px 0 4px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  {ROLES.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setRoleById(r.id);
                        setShowProfileMenu(false);
                        setShowRoleSubmenu(false);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: currentRole.id === r.id ? 800 : 500,
                        color: currentRole.id === r.id ? "#261603" : "var(--text-primary)",
                        background: currentRole.id === r.id ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <span>{r.label}</span>
                      {currentRole.id === r.id && <span style={{ fontSize: "9px", color: "#261603", fontWeight: 800 }}>● Active</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Account / Settings */}
              <div
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/configuration");
                }}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "background-color 0.12s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <SettingsIcon size={15} color="#6B5B4E" />
                <span>Account Settings</span>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "4px 0" }} />

              {/* Sign Out / Logout */}
              <div
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  addToast("Logged out successfully.", "info");
                }}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#DC2626",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "background-color 0.12s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <LogOut size={15} color="#DC2626" />
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

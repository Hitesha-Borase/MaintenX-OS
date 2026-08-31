import React, { useState } from "react";
import {
  Search,
  Plus,
  Bell,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  ChevronDown,
  Menu,
  Sparkles,
  QrCode,
  Shield,
  Cpu
} from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";

export function Header() {
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
    openQrModal,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useApp();

  const { currentRole, setRoleById, ROLES } = useRole();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="app-header" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(12px)", backgroundColor: "var(--bg-header)", borderBottom: "1px solid var(--border-subtle)", gap: "16px" }}>
      {/* Far Left: Branding Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #0284C7, #06B6D4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            boxShadow: "0 0 14px rgba(6, 182, 212, 0.4)"
          }}
        >
          <Cpu size={20} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em", color: "#FFFFFF", lineHeight: 1, marginBottom: "4px", whiteSpace: "nowrap" }}>
            MaintenX <span style={{ color: "#38BDF8" }}>OS</span>
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1, whiteSpace: "nowrap" }}>
            Manufacturing OS
          </span>
        </div>
      </div>

      {/* Center Space: intermediate elements distributed evenly */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1, justifyContent: "center", minWidth: 0 }}>
        {/* Navigation / Mobile Toggle & Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost"
            style={{ padding: "6px", display: "flex", alignItems: "center" }}
          >
            <Menu size={20} />
          </button>
          <Breadcrumbs />
        </div>

        {/* Facility and Shift removed to save space */}

        {/* Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="btn btn-secondary"
          style={{
            height: "34px",
            padding: "0 12px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-muted)"
          }}
          title="Search anything (Cmd+K / Ctrl+K)"
        >
          <Search size={14} />
          <span style={{ display: "none" }} className="search-text-placeholder">Search...</span>
          <kbd
            style={{
              padding: "1px 5px",
              borderRadius: "4px",
              backgroundColor: "#1E293B",
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "#94A3B8"
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Far Right: Fast Action & Role Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {/* Quick QR Scanner / Label trigger */}
        <Button
          variant="secondary"
          size="sm"
          icon={QrCode}
          onClick={() => openQrModal("Line 1 Asset QR Scanner", "FM-001", { name: "High-Speed Rotary Filler 12-Head", location: "Bay 4A - Cleanroom Zone B" })}
          title="Scan or View Asset QR Code"
        />

        {/* ROLE SWITCHER DROPDOWN */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="btn btn-secondary"
            style={{
              height: "34px",
              padding: "0 12px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #38BDF8",
              backgroundColor: "rgba(56, 189, 248, 0.1)"
            }}
          >
            <UserCheck size={14} color="#38BDF8" />
            <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{currentRole.label}</span>
            <ChevronDown size={14} color="#38BDF8" />
          </button>

          {showRoleDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "40px",
                width: "260px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-highlight)",
                borderRadius: "10px",
                boxShadow: "var(--shadow-lg)",
                zIndex: 60,
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <div style={{ padding: "6px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Switch Frontend Role
              </div>
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setRoleById(r.id);
                    setShowRoleDropdown(false);
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: currentRole.id === r.id ? 700 : 500,
                    color: currentRole.id === r.id ? "#38BDF8" : "var(--text-primary)",
                    backgroundColor: currentRole.id === r.id ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>{r.label}</span>
                  {currentRole.id === r.id && <span style={{ fontSize: "10px", color: "#38BDF8" }}>● Active</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fast Action Drawer Trigger */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsQuickActionOpen(true)}
        >
          Fast Action
        </Button>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .header-plant-select { display: flex !important; }
          .search-text-placeholder { display: inline !important; }
        }
      `}</style>
    </header>
  );
}

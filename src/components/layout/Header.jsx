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
  Cpu,
  Flame,
  User
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
    setMobileMenuOpen,
    addToast
  } = useApp();

  const { currentRole, setRoleById, ROLES } = useRole();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="app-header" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(14px)", backgroundColor: "var(--bg-header)", borderBottom: "1px solid var(--border-subtle)", gap: "16px" }}>
      {/* Far Left: Branding Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <div
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
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: 900, letterSpacing: "-0.2px", color: "var(--text-primary)", lineHeight: 1, marginBottom: "4px", whiteSpace: "nowrap" }}>
            MaintenX <span style={{ color: "#B27E33" }}>OS</span>
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
            Manufacturing Cloud
          </span>
        </div>
      </div>

      {/* Center Space: intermediate elements distributed evenly */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, justifyContent: "center", minWidth: 0 }}>
        {/* Navigation / Mobile Toggle & Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost"
            style={{ padding: "6px", display: "flex", alignItems: "center", color: "var(--text-secondary)" }}
          >
            <Menu size={20} />
          </button>
          <Breadcrumbs />
        </div>

        {/* Facility and Shift removed to save space */}

        {/* Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{
            height: "36px",
            padding: "0 10px 0 14px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            color: "var(--text-muted)",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px",
            cursor: "pointer",
            minWidth: "180px",
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)"
          }}
          title="Search anything (Cmd+K / Ctrl+K)"
        >
          <span className="search-text-placeholder" style={{ fontWeight: 500 }}>Search...</span>
          <div
            style={{
              padding: "4px 6px",
              borderRadius: "6px",
              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Search size={13} />
          </div>
        </button>
      </div>

      {/* Far Right: Fast Action & Role Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
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
            style={{
              height: "36px",
              padding: "0 12px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-card-subtle)",
              borderRadius: "18px",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)"
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
                color: "#261603",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "11px"
              }}
            >
              {currentRole?.label?.charAt(0) || "U"}
            </div>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{currentRole.label} - Alexander V.</span>
            <ChevronDown size={14} color="#B27E33" />
          </button>

          {showRoleDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "42px",
                width: "260px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-highlight)",
                borderRadius: "12px",
                boxShadow: "var(--shadow-lg)",
                zIndex: 60,
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <div style={{ padding: "6px 8px", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
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
                    borderRadius: "8px",
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
                  {currentRole.id === r.id && <span style={{ fontSize: "10px", color: "#261603", fontWeight: 800 }}>● Active</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => addToast("1 New PM Task Alert", "info")}
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

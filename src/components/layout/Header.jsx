import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  QrCode,
  Flame,
  User,
  Settings,
  LogOut,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { Button } from "../common/Button";

export function Header() {
  const {
    setIsSearchOpen,
    setIsQuickActionOpen,
    openQrModal,
    mobileMenuOpen,
    setMobileMenuOpen,
    addToast
  } = useApp();

  const navigate = useNavigate();
  const { currentRole, setRoleById, ROLES } = useRole();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSubmenu, setShowRoleSubmenu] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setShowRoleSubmenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    addToast("Logged out successfully.", "info");
    navigate("/login");
  };

  return (
    <header
      className="app-header"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(14px)",
        backgroundColor: "var(--bg-header)",
        borderBottom: "1px solid var(--border-subtle)"
      }}
    >
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
        <div className="header-logo-text" style={{ flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: 900, letterSpacing: "-0.2px", color: "var(--text-primary)", lineHeight: 1, marginBottom: "4px", whiteSpace: "nowrap" }}>
            MaintenX <span style={{ color: "#B27E33" }}>OS</span>
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
            Manufacturing Cloud
          </span>
        </div>
      </div>

      {/* Center: Nav toggle, Breadcrumbs, Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, justifyContent: "center", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost"
            style={{ padding: "6px", display: "flex", alignItems: "center", color: "var(--text-secondary)" }}
          >
            <Menu size={20} />
          </button>
          <div className="header-breadcrumbs">
            <Breadcrumbs />
          </div>
        </div>

        {/* Search Trigger */}
        <button
          className="header-search-btn"
          onClick={() => setIsSearchOpen(true)}
          style={{
            height: "36px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            color: "var(--text-muted)",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)"
          }}
          title="Search anything (Cmd+K / Ctrl+K)"
        >
          <span className="search-text-placeholder" style={{ fontWeight: 500 }}>Search...</span>
          <div
            className="search-icon-wrapper"
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

      {/* Far Right: QR, Role Switcher, Bell, Fast Action, Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>

        {/* QR Scanner */}
        <div className="header-qr-btn">
          <Button
            variant="secondary"
            size="sm"
            icon={QrCode}
            onClick={() => openQrModal("Line 1 Asset QR Scanner", "FM-001", { name: "High-Speed Rotary Filler 12-Head", location: "Bay 4A - Cleanroom Zone B" })}
            title="Scan or View Asset QR Code"
          />
        </div>

        {/* Role Switcher Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="header-role-btn"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              height: "38px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "0 12px 0 14px",
              boxShadow: "0 1px 4px rgba(70, 45, 15, 0.04)",
              cursor: "pointer"
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
                fontSize: "11px",
                flexShrink: 0
              }}
            >
              {currentRole?.label?.charAt(0) || "U"}
            </div>
            <span className="header-role-text" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {currentRole.label} - Alexander V.
            </span>
            <div className="header-role-chevron" style={{ display: "flex" }}>
              <ChevronDown size={14} color="#B27E33" />
            </div>
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
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)",
            flexShrink: 0
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

        {/* Profile Avatar + Dropdown */}
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

          {/* Profile Dropdown Menu */}
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

              {/* My Profile */}
              <div
                onClick={() => { setShowProfileMenu(false); navigate("/profile"); }}
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "background-color 0.12s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <User size={15} color="#B27E33" />
                <span>My Profile</span>
              </div>

              {/* Switch Role */}
              <div
                onClick={() => setShowRoleSubmenu(!showRoleSubmenu)}
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background-color 0.12s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <RefreshCw size={15} color="#0284C7" />
                  <span>Switch Role</span>
                </div>
                <ChevronRight size={13} color="var(--text-muted)" style={{ transform: showRoleSubmenu ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }} />
              </div>

              {/* Role Submenu */}
              {showRoleSubmenu && (
                <div style={{ maxHeight: "160px", overflowY: "auto", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", padding: "4px", margin: "2px 0 4px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {ROLES.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => { setRoleById(r.id); setShowProfileMenu(false); setShowRoleSubmenu(false); }}
                      style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: currentRole.id === r.id ? 800 : 500, color: currentRole.id === r.id ? "#261603" : "var(--text-primary)", background: currentRole.id === r.id ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <span>{r.label}</span>
                      {currentRole.id === r.id && <span style={{ fontSize: "9px", color: "#261603", fontWeight: 800 }}>● Active</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Account Settings */}
              <div
                onClick={() => { setShowProfileMenu(false); navigate("/configuration"); }}
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "background-color 0.12s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Settings size={15} color="#6B5B4E" />
                <span>Account Settings</span>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "4px 0" }} />

              {/* Sign Out */}
              <div
                onClick={handleLogout}
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "background-color 0.12s ease" }}
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

      <style>{`
        @media (max-width: 767px) {
          .header-logo-text { display: none !important; }
          .header-breadcrumbs { display: none !important; }
          .search-text-placeholder { display: none !important; }
          .header-search-btn { width: 36px !important; min-width: 36px !important; padding: 0 !important; justify-content: center !important; border: none !important; background: transparent !important; box-shadow: none !important; }
          .search-icon-wrapper { padding: 8px !important; border-radius: 10px !important; }
          .header-qr-btn { display: none !important; }
          .header-role-text { display: none !important; }
          .header-role-chevron { display: none !important; }
          .header-role-btn { padding: 0 !important; width: 36px !important; justify-content: center !important; background: transparent !important; border: none !important; box-shadow: none !important; }
          .header-fast-action { display: none !important; }
          .app-header { padding: 12px 16px !important; gap: 8px !important; }
        }
        @media (min-width: 768px) {
          .header-logo-text { display: flex !important; }
          .header-breadcrumbs { display: block !important; }
          .search-text-placeholder { display: inline !important; }
          .header-search-btn { min-width: 180px !important; padding: 0 10px 0 14px !important; justify-content: space-between !important; }
          .header-qr-btn { display: block !important; }
          .header-role-text { display: inline !important; }
          .header-role-chevron { display: block !important; }
          .header-role-btn { padding: 0 12px !important; }
          .header-fast-action { display: block !important; }
          .app-header { padding: 12px 24px !important; gap: 16px !important; }
        }
      `}</style>
    </header>
  );
}

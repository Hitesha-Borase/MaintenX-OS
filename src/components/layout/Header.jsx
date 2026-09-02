import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  Flame,
  User,
  Settings,
  LogOut,
  RefreshCw,
  CheckCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { Button } from "../common/Button";

export function Header() {
  const {
    setIsSearchOpen,
    setIsQuickActionOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    addToast
  } = useApp();

  const navigate = useNavigate();
  const { currentRole, setRoleById, ROLES, logout } = useRole();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSubmenu, setShowRoleSubmenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Line 1 PM Task Alert", desc: "High-Speed Rotary Filler PM due in 30 mins", time: "2m ago", type: "warning", unread: true },
    { id: 2, title: "Batch Formulation Completed", desc: "BAT-2026-0892 bottle filling at 77% attainment", time: "15m ago", type: "success", unread: false },
    { id: 3, title: "CCP Thermal Check", desc: "Limit 83.5°C thermal threshold check verified", time: "1h ago", type: "info", unread: false }
  ]);

  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setShowRoleSubmenu(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(e.target)) {
        setShowNotificationsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowProfileMenu(false);
    setShowRoleSubmenu(false);
    if (logout) logout();
    addToast("Logged out successfully.", "info");
    navigate("/login");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    addToast("All notifications marked as read.", "success");
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
        backgroundColor: "var(--bg-header, #FFFDF9)",
        borderBottom: "1px solid var(--border-subtle, #EFEAE2)",
        padding: "10px 20px",
        gap: "12px"
      }}
    >
      {/* Far Left: Branding Logo & Sidebar Collapse Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {/* Gold Flame Icon */}
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

        {/* Branding Title */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 900, letterSpacing: "-0.2px", color: "var(--text-primary, #261603)", lineHeight: 1, marginBottom: "2px", whiteSpace: "nowrap" }}>
            MaintenX <span style={{ color: "#B27E33" }}>OS</span>
          </span>
          <span className="header-logo-subtext" style={{ fontSize: "9px", color: "var(--text-muted, #8C7B6E)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
            Manufacturing Cloud
          </span>
        </div>

        {/* Sidebar Toggle Button (3 Lines Menu Icon) */}
        <button
          onClick={() => {
            if (window.innerWidth <= 768) {
              setMobileMenuOpen(!mobileMenuOpen);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle, #EFEAE2)",
            color: "var(--text-secondary, #6B5B4E)",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)",
            marginLeft: "2px",
            flexShrink: 0,
            transition: "all 0.15s ease"
          }}
          title="Toggle Sidebar Menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Center: Search Input Bar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: "600px", minWidth: 0 }}>
        <div
          onClick={() => setIsSearchOpen(true)}
          className="header-search-box"
          style={{
            width: "100%",
            height: "36px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle, #EFEAE2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "3px 4px 3px 12px",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(70, 45, 15, 0.04)",
            transition: "all 0.15s ease",
            minWidth: 0
          }}
          title="Search anything (Cmd+K / Ctrl+K)"
        >
          <span className="header-search-text" style={{ fontSize: "12px", color: "var(--text-muted, #A09082)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Search...
          </span>
          <div
            className="header-search-icon-btn"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Search size={13} />
          </div>
        </div>
      </div>

      {/* Far Right: Notification Bell, Fast Action Button, Profile Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>

        {/* Notification Bell Dropdown */}
        <div ref={notificationsDropdownRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => {
              setShowNotificationsMenu(!showNotificationsMenu);
              setShowProfileMenu(false);
            }}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              backgroundColor: showNotificationsMenu ? "var(--bg-card-subtle, #FAF6F0)" : "#FFFFFF",
              border: showNotificationsMenu ? "1.5px solid #C89547" : "1px solid var(--border-subtle, #EFEAE2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              color: "#6B5B4E",
              boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)",
              flexShrink: 0,
              transition: "all 0.15s ease"
            }}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  width: "15px",
                  height: "15px",
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
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {showNotificationsMenu && (
            <div
              className="notifications-dropdown-popover"
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "310px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-highlight, #E2B670)",
                borderRadius: "14px",
                boxShadow: "0 14px 36px rgba(70, 45, 15, 0.15)",
                zIndex: 100,
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                animation: "fadeIn 0.15s ease-out"
              }}
            >
              {/* Notifications Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle, #EFEAE2)", paddingBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary, #261603)" }}>
                  Notifications ({notifications.length})
                </span>
                <button
                  onClick={markAllRead}
                  style={{ background: "none", border: "none", color: "#B27E33", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              </div>

              {/* Notification List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      backgroundColor: n.unread ? "rgba(200, 149, 71, 0.08)" : "var(--bg-card-subtle, #FAF6F0)",
                      border: "1px solid var(--border-subtle, #EFEAE2)",
                      display: "flex",
                      gap: "8px",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ marginTop: "2px", flexShrink: 0 }}>
                      {n.type === "warning" && <AlertTriangle size={14} color="#D97706" />}
                      {n.type === "success" && <CheckCircle size={14} color="#059669" />}
                      {n.type === "info" && <Clock size={14} color="#0284C7" />}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: "12px", fontWeight: n.unread ? 800 : 600, color: "var(--text-primary, #261603)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted, #8C7B6E)", fontWeight: 500, flexShrink: 0 }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary, #6B5B4E)", margin: "2px 0 0 0", lineHeight: 1.3 }}>
                        {n.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Notifications Page */}
              <button
                onClick={() => {
                  setShowNotificationsMenu(false);
                  navigate(`/${currentRole.id}/notifications`);
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle, #FAF6F0)",
                  border: "1px solid var(--border-subtle, #EFEAE2)",
                  color: "#B27E33",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                View Notifications Center →
              </button>
            </div>
          )}
        </div>

        {/* + Fast Action Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsQuickActionOpen(true)}
          className="header-fast-action-btn"
          style={{
            background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
            color: "#261603",
            border: "none",
            borderRadius: "10px",
            padding: "6px 12px",
            fontWeight: 800,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)",
            flexShrink: 0
          }}
        >
          <span className="header-fast-action-text">Fast Action</span>
        </Button>

        {/* Profile Avatar & Dropdown */}
        <div ref={profileDropdownRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowRoleSubmenu(false);
              setShowNotificationsMenu(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              padding: 0,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              border: showProfileMenu ? "2px solid #261603" : "1px solid #B27E33",
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: "0 2px 8px rgba(178, 126, 51, 0.3)",
              fontWeight: 900,
              fontSize: "13px"
            }}
            title="User Profile & Role Settings"
          >
            {currentRole?.label?.charAt(0) || "M"}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              className="profile-dropdown-popover"
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "240px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-highlight, #E2B670)",
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
              {/* Profile Header */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle, #FAF6F0)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "4px"
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
                    color: "#261603",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "13px",
                    flexShrink: 0
                  }}
                >
                  {currentRole?.label?.charAt(0) || "M"}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary, #261603)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
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
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary, #261603)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle, #FAF6F0)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <User size={15} color="#B27E33" />
                <span>My Profile</span>
              </div>

              {/* Switch Role Submenu */}
              <div
                onClick={() => setShowRoleSubmenu(!showRoleSubmenu)}
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary, #261603)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle, #FAF6F0)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <RefreshCw size={15} color="#0284C7" />
                  <span>Switch Role</span>
                </div>
                <ChevronRight size={13} color="var(--text-muted, #8C7B6E)" style={{ transform: showRoleSubmenu ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }} />
              </div>

              {showRoleSubmenu && (
                <div style={{ maxHeight: "160px", overflowY: "auto", backgroundColor: "var(--bg-card-subtle, #FAF6F0)", borderRadius: "8px", padding: "4px", margin: "2px 0 4px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {ROLES.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => { setRoleById(r.id); setShowProfileMenu(false); setShowRoleSubmenu(false); addToast(`Switched role to ${r.label}`, "info"); }}
                      style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: currentRole.id === r.id ? 800 : 500, color: currentRole.id === r.id ? "#261603" : "var(--text-primary, #261603)", background: currentRole.id === r.id ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
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
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary, #261603)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle, #FAF6F0)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Settings size={15} color="#6B5B4E" />
                <span>Account Settings</span>
              </div>

              <div style={{ height: "1px", backgroundColor: "var(--border-subtle, #EFEAE2)", margin: "4px 0" }} />

              {/* Sign Out */}
              <div
                onClick={handleLogout}
                style={{ padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
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
        @media (max-width: 640px) {
          .header-logo-subtext {
            display: none !important;
          }
          .header-search-text {
            display: none !important;
          }
          .header-search-box {
            width: 34px !important;
            min-width: 34px !important;
            padding: 0 !important;
            justify-content: center !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            flex: none !important;
          }
          .header-search-icon-btn {
            width: 34px !important;
            height: 34px !important;
            border-radius: 10px !important;
          }
          .header-fast-action-text {
            display: none !important;
          }
          .header-fast-action-btn {
            padding: 0 !important;
            width: 34px !important;
            height: 34px !important;
            justify-content: center !important;
            border-radius: 10px !important;
          }
          .app-header {
            padding: 8px 12px !important;
            gap: 8px !important;
          }
          .notifications-dropdown-popover,
          .profile-dropdown-popover {
            position: fixed !important;
            top: 54px !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            max-width: none !important;
            box-shadow: 0 10px 30px rgba(43, 29, 17, 0.25) !important;
            z-index: 1000 !important;
          }
        }
      `}</style>
    </header>
  );
}

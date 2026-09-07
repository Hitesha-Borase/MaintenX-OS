import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Bell,
  Menu,
  Flame,
  User,
  Settings,
  LogOut,
  RefreshCw,
  CheckCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { useMasterData } from "../../context/MasterDataContext";

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
  const { company } = useMasterData();

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
  const roleDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(e.target)) {
        setShowNotificationsMenu(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleSubmenu(false);
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
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast("All notifications marked as read.", "success");
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

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
        gap: "16px"
      }}
    >
      {/* Far Left: Branding Logo & Hamburger Menu Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {/* Gold Flame Icon */}
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
          <Flame size={18} />
        </div>

        {/* Branding Title */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 900, letterSpacing: "-0.2px", color: "var(--text-primary, #261603)", lineHeight: 1, marginBottom: "2px", whiteSpace: "nowrap" }}>
            MaintenX <span style={{ color: "#B27E33" }}>OS</span>
          </span>
          <span className="header-logo-subtext" style={{ fontSize: "8px", color: "var(--text-muted, #8C7B6E)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
            MANUFACTURING CLOUD
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
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle, #EFEAE2)",
            color: "var(--text-secondary, #6B5B4E)",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(70, 45, 15, 0.04)",
            marginLeft: "4px",
            flexShrink: 0,
            transition: "all 0.15s ease"
          }}
          title="Toggle Sidebar Menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Center: Search Input Bar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: "560px", minWidth: 0 }}>
        <div
          onClick={() => setIsSearchOpen(true)}
          className="header-search-box"
          style={{
            width: "100%",
            height: "38px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle, #EFEAE2)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "3px 4px 3px 14px",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(70, 45, 15, 0.04)",
            transition: "all 0.15s ease",
            minWidth: 0
          }}
          title="Search anything (Cmd+K / Ctrl+K)"
        >
          <span className="header-search-text" style={{ fontSize: "13px", color: "var(--text-muted, #A09082)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          </span>
          <div
            className="header-search-icon-btn"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "10px",
              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Search size={14} />
          </div>
        </div>
      </div>

      {/* Far Right: Notification Bell, + Fast Action, User Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        {/* Notification Bell Dropdown */}
        <div ref={notificationsDropdownRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => {
              setShowNotificationsMenu(!showNotificationsMenu);
              setShowProfileMenu(false);
            }}
            style={{
              width: "36px",
              height: "36px",
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
                  top: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#C89547",
                  color: "#FFFFFF",
                  fontSize: "9px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #FFFFFF"
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
                top: "46px",
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

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, unread: false } : item));
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      backgroundColor: n.unread ? "rgba(200, 149, 71, 0.08)" : "transparent",
                      border: "1px solid",
                      borderColor: n.unread ? "rgba(200, 149, 71, 0.3)" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: n.unread ? 800 : 600, color: "var(--text-primary, #261603)" }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted, #8C7B6E)" }}>{n.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary, #6B5B4E)", lineHeight: 1.3 }}>
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle, #EFEAE2)", paddingTop: "8px", textAlign: "center" }}>
                <button
                  onClick={() => {
                    setShowNotificationsMenu(false);
                    navigate(currentRole?.id === "maintenance" ? "/maintenance/notifications" : "/notifications");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#C89547",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  View full notifications center →
                </button>
              </div>
            </div>
          )}
        </div>

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
              width: "36px",
              height: "36px",
              padding: 0,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              border: showProfileMenu ? "2px solid #261603" : "1px solid #B27E33",
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: "0 2px 8px rgba(178, 126, 51, 0.3)",
              fontWeight: 900,
              fontSize: "14px"
            }}
            title={`User Profile (${currentRole?.user?.name || "User"} - ${currentRole?.label || "Role"})`}
          >
            {currentRole?.user?.avatar || currentRole?.label?.charAt(0) || "U"}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              className="profile-dropdown-popover"
              style={{
                position: "absolute",
                right: 0,
                top: "46px",
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
                  {currentRole?.user?.avatar || currentRole?.label?.charAt(0) || "U"}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary, #261603)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentRole?.user?.name || "Authorized User"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#B27E33", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentRole?.label}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate(currentRole?.id === "maintenance" ? "/maintenance/profile" : "/profile");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-primary, #261603)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.15s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle, #FAF6F0)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <User size={14} color="#C89547" /> My Profile
              </button>

              {/* Switch Role Perspective */}
              <div style={{ borderTop: "1px solid var(--border-subtle, #EFEAE2)", marginTop: "4px", paddingTop: "6px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted, #8C7B6E)", textTransform: "uppercase", padding: "4px 8px", letterSpacing: "0.05em" }}>
                  Switch Role Perspective
                </div>
                <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {ROLES?.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRoleById(r.id);
                        setShowProfileMenu(false);
                        addToast(`Switched perspective to ${r.label} (${r.user?.name || "User"})!`, "success");
                        navigate(r.defaultRoute || "/dashboard");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: currentRole?.id === r.id ? "rgba(200, 149, 71, 0.15)" : "transparent",
                        color: currentRole?.id === r.id ? "#8C5B23" : "var(--text-primary, #261603)",
                        fontSize: "11px",
                        fontWeight: currentRole?.id === r.id ? 800 : 600,
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                      onMouseEnter={(e) => {
                        if (currentRole?.id !== r.id) e.currentTarget.style.backgroundColor = "var(--bg-card-subtle, #FAF6F0)";
                      }}
                      onMouseLeave={(e) => {
                        if (currentRole?.id !== r.id) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.label}
                      </span>
                      {currentRole?.id === r.id && <CheckCircle size={12} color="#C89547" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--red-500, #EF4444)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <LogOut size={14} /> Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

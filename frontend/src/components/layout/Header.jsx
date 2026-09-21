import React, { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "../../services/apiClient";
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
  ShieldAlert,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { useMasterData } from "../../context/MasterDataContext";


// ── Notification helpers ─────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function severityToType(severity) {
  if (!severity) return "info";
  const s = severity.toUpperCase();
  if (s === "CRITICAL") return "warning";
  if (s === "WARNING") return "warning";
  if (s === "INFO") return "info";
  return "info";
}

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
  const { currentRole, setRoleById, ROLES, logout, isModuleEnabled } = useRole();
  const { company } = useMasterData();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSubmenu, setShowRoleSubmenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Fetch notifications from backend and normalise shape
  const fetchNotifications = useCallback(async () => {
    try {
      const raw = await apiClient.get("/notifications");
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setNotifications(list.map((n) => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        time: n.createdAt ? timeAgo(n.createdAt) : "",
        type: severityToType(n.severity),
        unread: !n.isRead,
        linkUrl: n.linkUrl,
        category: n.category,
      })));
    } catch {
      // Silently ignore — keep previous state
    }
  }, []);

  // Initial fetch + 30-second polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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

  const markAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast("All notifications marked as read.", "success");
    try {
      await apiClient.patch("/notifications/read-all", {});
    } catch {
      // Revert on failure
      fetchNotifications();
    }
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
        {/* Client Logo - The Great Canadian Meat Company */}
        <div
          style={{
            height: "36px",
            padding: "2px 6px",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(200, 149, 71, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(70, 45, 15, 0.06)",
            flexShrink: 0
          }}
        >
          <img
            src="/great_canadian_meat_logo.png"
            alt="The Great Canadian Meat Company"
            style={{ height: "28px", maxWidth: "50px", objectFit: "contain" }}
          />
        </div>

        {/* Branding Title */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 900, letterSpacing: "-0.2px", color: "var(--text-primary, #261603)", lineHeight: 1, marginBottom: "2px", whiteSpace: "nowrap" }}>
              The Great Canadian <span style={{ color: "#B27E33" }}>Meat Co.</span>
            </span>
          </div>
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
                {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted, #8C7B6E)", fontSize: "12px" }}>
                      No notifications
                    </div>
                  ) : notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      // Optimistic mark-as-read
                      setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, unread: false } : item));
                      try {
                        await apiClient.patch(`/notifications/${n.id}/read`, {});
                      } catch { /* ignore */ }
                      if (n.linkUrl) {
                        setShowNotificationsMenu(false);
                        navigate(n.linkUrl);
                      }
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
                    {currentRole?.label}{currentRole?.user?.companyName && currentRole?.user?.companyName !== "MaintenX OS" ? ` · ${currentRole.user.companyName}` : ""}
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
                  {ROLES?.map((r) => {
                    const isEnabled = typeof isModuleEnabled === "function" ? isModuleEnabled(r.module) !== false : true;
                    const isSelected = currentRole?.id === r.id;

                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          if (!isEnabled) {
                            addToast(
                              `Role '${r.label}' (${(r.module || "").toUpperCase()} module) is not included in your active subscription plan. Upgrade your plan to unlock access.`,
                              "warning"
                            );
                            return;
                          }
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
                          backgroundColor: isSelected ? "rgba(200, 149, 71, 0.15)" : "transparent",
                          color: !isEnabled
                            ? "var(--text-muted, #A09082)"
                            : isSelected
                            ? "#8C5B23"
                            : "var(--text-primary, #261603)",
                          fontSize: "11px",
                          fontWeight: isSelected ? 800 : 600,
                          cursor: isEnabled ? "pointer" : "not-allowed",
                          textAlign: "left",
                          opacity: !isEnabled ? 0.65 : 1
                        }}
                        title={!isEnabled ? `Locked - Not in your current subscription plan` : r.label}
                        onMouseEnter={(e) => {
                          if (!isSelected && isEnabled) e.currentTarget.style.backgroundColor = "var(--bg-card-subtle, #FAF6F0)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && isEnabled) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                          {!isEnabled && <Lock size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.label}
                          </span>
                        </div>
                        {isSelected ? (
                          <CheckCircle size={12} color="#C89547" style={{ flexShrink: 0 }} />
                        ) : !isEnabled ? (
                          <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.02em" }}>
                            LOCKED
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
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

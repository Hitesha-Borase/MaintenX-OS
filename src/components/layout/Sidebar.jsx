import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Gauge,
  LineChart,
  BrainCircuit,
  AlertTriangle,
  Wrench,
  Factory,
  CalendarRange,
  ShieldCheck,
  Package,
  Boxes,
  DollarSign,
  SearchCode,
  Users,
  ShoppingBag,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Cpu,
  ShieldAlert,
  Clock,
  Layers,
  Settings,
  Briefcase,
  Bell,
  User
} from "lucide-react";
import { useRole } from "../../context/RoleContext";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useExceptions } from "../../context/ExceptionContext";

const iconMap = {
  LayoutDashboard,
  Gauge,
  LineChart,
  BrainCircuit,
  AlertTriangle,
  Wrench,
  Factory,
  CalendarRange,
  ShieldCheck,
  Package,
  Boxes,
  DollarSign,
  SearchCode,
  Users,
  ShoppingBag,
  FileText,
  FileSpreadsheet,
  Smartphone,
  Cpu,
  ShieldAlert,
  Clock,
  Layers,
  Settings,
  Briefcase,
  Bell,
  User
};

export function Sidebar() {
  const { currentRole, logout, NAVIGATION_CONFIG } = useRole();
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen, addToast } = useApp();
  const { workOrders, assets } = useCMMS();
  const { exceptions } = useExceptions();

  // Collapsible sub-navigation groups
  const [openGroups, setOpenGroups] = useState({
    Production: true,
    Planning: true,
    Inventory: true,
    Quality: true,
    CMMS: true,
    Dashboards: true,
    Settings: true,
    Analytics: true
  });

  const toggleGroup = (groupKey) => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const openP1Count = exceptions.filter((e) => e.severity === "P1" && e.status !== "Resolved").length;
  const activeWOCount = workOrders.filter((w) => w.status !== "Closed" && w.status !== "Completed").length;

  const navItemStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "9px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: isActive ? 600 : 500,
    color: isActive ? "#38BDF8" : "var(--text-secondary)",
    backgroundColor: isActive ? "rgba(56, 189, 248, 0.12)" : "transparent",
    textDecoration: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
    position: "relative"
  });

  const subNavItemStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 12px 7px 34px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#38BDF8" : "var(--text-secondary)",
    backgroundColor: isActive ? "rgba(56, 189, 248, 0.1)" : "transparent",
    textDecoration: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
  });

  const roleMenu = NAVIGATION_CONFIG[currentRole.id] || [];

  const renderBadge = (label) => {
    if (label === "Work Orders" && activeWOCount > 0) {
      return (
        <span style={{ fontSize: "10px", backgroundColor: "rgba(56, 189, 248, 0.2)", color: "#38BDF8", padding: "1px 5px", borderRadius: "4px" }}>
          {activeWOCount}
        </span>
      );
    }
    if ((label === "Escalations" || label === "Exception Tower") && openP1Count > 0) {
      return (
        <span style={{ fontSize: "10px", backgroundColor: "#EF4444", color: "#FFFFFF", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
          {openP1Count} P1
        </span>
      );
    }
    if (label === "Assets Registry") {
      return (
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
          {assets.length}
        </span>
      );
    }
    return null;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 45 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Brand Logo & App Header */}
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
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
                boxShadow: "0 0 14px rgba(6, 182, 212, 0.4)",
                flexShrink: 0
              }}
            >
              <Cpu size={20} />
            </div>

            {!sidebarCollapsed && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em", color: "#FFFFFF" }}>
                  FLOW<span style={{ color: "#38BDF8" }}>STATE</span>
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Manufacturing OS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Dynamic Navigation Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          
          {roleMenu.map((menuItem, idx) => {
            // Check if it's a Collapsible Group
            if (menuItem.group) {
              const isGroupOpen = openGroups[menuItem.group] !== false;
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div
                    onClick={() => toggleGroup(menuItem.group)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      marginTop: "6px"
                    }}
                  >
                    {!sidebarCollapsed && <span>{menuItem.group}</span>}
                    {!sidebarCollapsed && (isGroupOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                  </div>

                  {(isGroupOpen || sidebarCollapsed) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {menuItem.items.map((subItem, sIdx) => {
                        const Icon = iconMap[subItem.icon] || Wrench;
                        return (
                          <NavLink
                            key={sIdx}
                            to={subItem.path}
                            style={sidebarCollapsed ? navItemStyle : subNavItemStyle}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {sidebarCollapsed && <Icon size={17} />}
                              <span>{subItem.label}</span>
                            </div>
                            {renderBadge(subItem.label)}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Otherwise, render as a Top-Level Menu Link
            const Icon = iconMap[menuItem.icon] || Wrench;
            return (
              <NavLink
                key={idx}
                to={menuItem.path}
                style={navItemStyle}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={17} />
                {!sidebarCollapsed && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span>{menuItem.label}</span>
                    {renderBadge(menuItem.label)}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Role Badge & Sign Out in Footer */}
        {!sidebarCollapsed && (
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "11px", fontWeight: 700 }}>
                {currentRole.label.charAt(0)}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {currentRole.label}
                </div>
                <div style={{ fontSize: "10px", color: "#34D399", fontWeight: 600 }}>Active Role Mode</div>
              </div>
            </div>
            <button
              onClick={() => {
                addToast("Session Terminated. Redirecting to login...", "warning");
                setTimeout(() => {
                  logout();
                }, 1000);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#F87171",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

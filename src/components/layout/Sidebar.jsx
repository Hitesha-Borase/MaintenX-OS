import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Database,
  Cpu,
  HeartPulse,
  Lock,
  Sliders,
  FileText,
  UploadCloud,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Flame,
  ShieldAlert,
  KeyRound,
  UserCheck,
  Server,
  Layers,
  Activity
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useApp } from "../../context/AppContext";

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const location = useLocation();
  const { users, invitations, dataHealthStats } = useAdmin ? useAdmin() : { users: [], invitations: [], dataHealthStats: {} };

  // Collapsible sub-navigation groups
  const [openGroups, setOpenGroups] = useState({
    users: true,
    roles: true,
    org: true,
    masterData: false,
    integrations: true,
    dataHealth: true
  });

  const toggleGroup = (groupKey) => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const isGroupActive = (paths) => paths.some((p) => location.pathname.startsWith(p));

  const navItemStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
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
    padding: "5px 12px 5px 30px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#38BDF8" : "var(--text-secondary)",
    backgroundColor: isActive ? "rgba(56, 189, 248, 0.1)" : "transparent",
    textDecoration: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
  });

  const groupHeaderStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: active ? 600 : 500,
    color: active ? "#FFFFFF" : "var(--text-secondary)",
    backgroundColor: active ? "rgba(255, 255, 255, 0.04)" : "transparent",
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 45
          }}
        />
      )}

      <aside
        className={`app-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
        style={{
          width: sidebarCollapsed ? "68px" : "260px",
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 50
        }}
      >
        {/* TOP BRAND HEADER */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "space-between",
              padding: "16px 14px",
              borderBottom: "1px solid var(--border-subtle)",
              minHeight: "64px"
            }}
          >
            {!sidebarCollapsed ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#0284C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 12px rgba(2, 132, 199, 0.5)",
                    flexShrink: 0
                  }}
                >
                  <Flame size={18} color="#FFFFFF" />
                </div>
                <div>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.3px", display: "block", lineHeight: 1.2 }}>
                    MaintenX-OS
                  </span>
                  <span style={{ fontSize: "10px", color: "#38BDF8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    System Admin Edition
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#0284C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Flame size={18} color="#FFFFFF" />
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="btn btn-ghost"
              style={{
                padding: "4px",
                borderRadius: "6px",
                display: sidebarCollapsed ? "none" : "flex",
                alignItems: "center",
                color: "var(--text-muted)"
              }}
              title="Toggle Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* EXACT 12 SYSTEM ADMINISTRATOR MENUS */}
          <nav
            style={{
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              overflowY: "auto",
              maxHeight: "calc(100vh - 140px)"
            }}
          >
            {/* 1. DASHBOARD */}
            <NavLink to="/dashboard" style={navItemStyle} title="Dashboard">
              <LayoutDashboard size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>1. Dashboard</span>}
            </NavLink>

            {/* 2. USER MANAGEMENT */}
            <div>
              <div
                onClick={() => toggleGroup("users")}
                style={groupHeaderStyle(isGroupActive(["/users"]))}
                title="User Management"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Users size={18} color="#60A5FA" style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>2. User Management</span>}
                </div>
                {!sidebarCollapsed && (
                  openGroups.users ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                )}
              </div>

              {!sidebarCollapsed && openGroups.users && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                  <NavLink to="/users" end style={subNavItemStyle}>
                    <span>Users</span>
                  </NavLink>
                  <NavLink to="/users/invitations" style={subNavItemStyle}>
                    <span>User Invitations</span>
                  </NavLink>
                  <NavLink to="/users/status" style={subNavItemStyle}>
                    <span>User Status</span>
                  </NavLink>
                  <NavLink to="/users/activity" style={subNavItemStyle}>
                    <span>User Activity</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 3. ROLES & PERMISSIONS */}
            <div>
              <div
                onClick={() => toggleGroup("roles")}
                style={groupHeaderStyle(isGroupActive(["/roles"]))}
                title="Roles & Permissions"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={18} color="#34D399" style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>3. Roles & Permissions</span>}
                </div>
                {!sidebarCollapsed && (
                  openGroups.roles ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                )}
              </div>

              {!sidebarCollapsed && openGroups.roles && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                  <NavLink to="/roles" end style={subNavItemStyle}>
                    <span>Roles</span>
                  </NavLink>
                  <NavLink to="/roles/permissions" style={subNavItemStyle}>
                    <span>Permissions</span>
                  </NavLink>
                  <NavLink to="/roles/mapping" style={subNavItemStyle}>
                    <span>Role Mapping</span>
                  </NavLink>
                  <NavLink to="/roles/approval-permissions" style={subNavItemStyle}>
                    <span>Approval Permissions</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 4. ORGANIZATION */}
            <div>
              <div
                onClick={() => toggleGroup("org")}
                style={groupHeaderStyle(isGroupActive(["/organization"]))}
                title="Organization"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Building2 size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>4. Organization</span>}
                </div>
                {!sidebarCollapsed && (
                  openGroups.org ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                )}
              </div>

              {!sidebarCollapsed && openGroups.org && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                  <NavLink to="/organization/companies" style={subNavItemStyle}>
                    <span>Companies</span>
                  </NavLink>
                  <NavLink to="/organization/plants" style={subNavItemStyle}>
                    <span>Plants</span>
                  </NavLink>
                  <NavLink to="/organization/departments" style={subNavItemStyle}>
                    <span>Departments</span>
                  </NavLink>
                  <NavLink to="/organization/lines" style={subNavItemStyle}>
                    <span>Lines</span>
                  </NavLink>
                  <NavLink to="/organization/work-centers" style={subNavItemStyle}>
                    <span>Work Centers</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 5. MASTER DATA */}
            <div>
              <div
                onClick={() => toggleGroup("masterData")}
                style={groupHeaderStyle(isGroupActive(["/master-data"]))}
                title="Master Data"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Database size={18} color="#A855F7" style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>5. Master Data</span>}
                </div>
                {!sidebarCollapsed && (
                  openGroups.masterData ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                )}
              </div>

              {!sidebarCollapsed && openGroups.masterData && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                  <NavLink to="/master-data/items" style={subNavItemStyle}>
                    <span>Item / SKU Master</span>
                  </NavLink>
                  <NavLink to="/master-data/product-families" style={subNavItemStyle}>
                    <span>Product Families</span>
                  </NavLink>
                  <NavLink to="/master-data/uom" style={subNavItemStyle}>
                    <span>UOM</span>
                  </NavLink>
                  <NavLink to="/master-data/packaging" style={subNavItemStyle}>
                    <span>Packaging</span>
                  </NavLink>
                  <NavLink to="/master-data/bom" style={subNavItemStyle}>
                    <span>BOM / Recipes</span>
                  </NavLink>
                  <NavLink to="/master-data/routings" style={subNavItemStyle}>
                    <span>Routings</span>
                  </NavLink>
                  <NavLink to="/master-data/operations" style={subNavItemStyle}>
                    <span>Operations</span>
                  </NavLink>
                  <NavLink to="/master-data/work-centers" style={subNavItemStyle}>
                    <span>Work Centers</span>
                  </NavLink>
                  <NavLink to="/master-data/line-targets" style={subNavItemStyle}>
                    <span>Line Targets</span>
                  </NavLink>
                  <NavLink to="/master-data/changeover-matrix" style={subNavItemStyle}>
                    <span>Changeover Matrix</span>
                  </NavLink>
                  <NavLink to="/master-data/sanitation-allergens" style={subNavItemStyle}>
                    <span>Sanitation / Allergens</span>
                  </NavLink>
                  <NavLink to="/master-data/labour-standards" style={subNavItemStyle}>
                    <span>Labour Standards</span>
                  </NavLink>
                  <NavLink to="/master-data/skills" style={subNavItemStyle}>
                    <span>Skills / Qualifications</span>
                  </NavLink>
                  <NavLink to="/master-data/quality-specs" style={subNavItemStyle}>
                    <span>Quality Specifications</span>
                  </NavLink>
                  <NavLink to="/master-data/ccp-limits" style={subNavItemStyle}>
                    <span>CCP Limits</span>
                  </NavLink>
                  <NavLink to="/master-data/machine-capability" style={subNavItemStyle}>
                    <span>Machine Capability</span>
                  </NavLink>
                  <NavLink to="/master-data/storage-resources" style={subNavItemStyle}>
                    <span>Storage Resources</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 6. INTEGRATIONS */}
            <div>
              <div
                onClick={() => toggleGroup("integrations")}
                style={groupHeaderStyle(isGroupActive(["/integrations"]))}
                title="Integrations"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Cpu size={18} color="#06B6D4" style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>6. Integrations</span>}
                </div>
                {!sidebarCollapsed && (
                  openGroups.integrations ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                )}
              </div>

              {!sidebarCollapsed && openGroups.integrations && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                  <NavLink to="/integrations/erp" style={subNavItemStyle}>
                    <span>ERP</span>
                  </NavLink>
                  <NavLink to="/integrations/iot" style={subNavItemStyle}>
                    <span>IoT / Machines</span>
                  </NavLink>
                  <NavLink to="/integrations/barcode" style={subNavItemStyle}>
                    <span>Barcode / QR</span>
                  </NavLink>
                  <NavLink to="/integrations/apis" style={subNavItemStyle}>
                    <span>APIs</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 7. DATA HEALTH */}
            <div>
              <div
                onClick={() => toggleGroup("dataHealth")}
                style={groupHeaderStyle(isGroupActive(["/data-health"]))}
                title="Data Health"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <HeartPulse size={18} color="#EC4899" style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>7. Data Health</span>}
                </div>
                {!sidebarCollapsed && (
                  openGroups.dataHealth ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                )}
              </div>

              {!sidebarCollapsed && openGroups.dataHealth && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                  <NavLink to="/data-health/missing-data" style={subNavItemStyle}>
                    <span>Missing Data</span>
                  </NavLink>
                  <NavLink to="/data-health/duplicates" style={subNavItemStyle}>
                    <span>Duplicates</span>
                  </NavLink>
                  <NavLink to="/data-health/invalid-references" style={subNavItemStyle}>
                    <span>Invalid References</span>
                  </NavLink>
                  <NavLink to="/data-health/broken-relationships" style={subNavItemStyle}>
                    <span>Broken Relationships</span>
                  </NavLink>
                  <NavLink to="/data-health/stale-records" style={subNavItemStyle}>
                    <span>Stale Records</span>
                  </NavLink>
                  <NavLink to="/data-health/remediation" style={subNavItemStyle}>
                    <span>Remediation</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 8. SECURITY */}
            <NavLink to="/security" style={navItemStyle} title="Security">
              <Lock size={18} color="#EF4444" style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>8. Security</span>}
            </NavLink>

            {/* 9. CONFIGURATION */}
            <NavLink to="/configuration" style={navItemStyle} title="Configuration">
              <Sliders size={18} color="#FB923C" style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>9. Configuration</span>}
            </NavLink>

            {/* 10. AUDIT LOGS */}
            <NavLink to="/audit-logs" style={navItemStyle} title="Audit Logs">
              <FileText size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>10. Audit Logs</span>}
            </NavLink>

            {/* 11. MIGRATION */}
            <NavLink to="/migration" style={navItemStyle} title="Migration">
              <UploadCloud size={18} color="#10B981" style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>11. Migration</span>}
            </NavLink>

            {/* 12. SYSTEM REPORTS */}
            <NavLink to="/system-reports" style={navItemStyle} title="System Reports">
              <FileSpreadsheet size={18} color="#60A5FA" style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>12. System Reports</span>}
            </NavLink>
          </nav>
        </div>

        {/* BOTTOM USER PROFILE CARD */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--border-subtle)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "var(--bg-card-subtle)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#0284C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "12px",
                color: "#FFFFFF",
                flexShrink: 0
              }}
            >
              SA
            </div>
            {!sidebarCollapsed && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "#FFFFFF", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  Alexander Vance
                </div>
                <div style={{ fontSize: "10px", color: "#38BDF8", whiteSpace: "nowrap" }}>
                  System Administrator • Root
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

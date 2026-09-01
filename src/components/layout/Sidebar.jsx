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
  Activity,
  Gauge,
  LineChart,
  BrainCircuit,
  AlertTriangle,
  Wrench,
  Factory,
  CalendarRange,
  Package,
  Boxes,
  DollarSign,
  SearchCode,
  ShoppingBag,
  Smartphone,
  Clock,
  Settings,
  Briefcase,
  Bell,
  User,
  Zap,
  AlertOctagon,
  FileCheck,
  Send,
  CheckSquare,
  ArrowDown,
  Trash2,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  X,
  Truck,
  LogOut
} from "lucide-react";
import { useRole } from "../../context/RoleContext";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useExceptions } from "../../context/ExceptionContext";
import { useAdmin } from "../../context/AdminContext";

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
  User,
  Zap,
  AlertOctagon,
  FileCheck,
  Send,
  CheckSquare,
  ArrowDown,
  Trash2,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  X,
  Truck,
  Building2,
  Database,
  HeartPulse,
  Lock,
  Sliders,
  UploadCloud,
  Flame,
  KeyRound,
  UserCheck,
  Server,
  Activity
};

export function Sidebar() {
  const { currentRole, logout, NAVIGATION_CONFIG } = useRole();
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen, addToast } = useApp();
  const location = useLocation();

  React.useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname]);

  const cmmsContext = useCMMS ? useCMMS() : { workOrders: [], assets: [] };
  const { workOrders = [], assets = [] } = cmmsContext || {};

  const exceptionContext = useExceptions ? useExceptions() : { exceptions: [] };
  const { exceptions = [] } = exceptionContext || {};

  const adminContext = useAdmin ? useAdmin() : { users: [], invitations: [], dataHealthStats: {} };
  const { users = [], invitations = [], dataHealthStats = {} } = adminContext || {};

  const activeWOCount = workOrders.filter((w) => w.status === "In Progress" || w.status === "Open").length;
  const openP1Count = exceptions.filter((e) => e.severity === "P1" || e.priority === "P1").length;

  // Collapsible sub-navigation groups
  const [openGroups, setOpenGroups] = useState({
    users: true,
    roles: true,
    org: true,
    masterData: false,
    integrations: true,
    dataHealth: true,
    Production: true,
    Planning: true,
    Inventory: true,
    Quality: true,
    CMMS: true,
    Dashboards: true,
    Settings: true,
    Analytics: true,
    Demand: true,
    Forecast: true,
    MRP: true,
    APS: true,
    Receiving: true,
    Locations: true,
    Operations: true,
    Picking: true,
    Shipping: true,
    Sanitation: true,
    "Quality Checks": true,
    "Quality Events": true,
    "Batch Quality": true,
    "QA Release": true,
    Disposition: true,
    "RCA 2.0": true,
    CAPA: true,
    "Loss Analysis": true,
    "CI Projects": true,
    "Enterprise Performance": true,
    "Financial Intelligence": true,
    "Business Performance": true,
    "Risk & Opportunity": true,
    AI: true
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
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: isActive ? 800 : 500,
    color: isActive ? "#1A0F02" : "var(--text-secondary)",
    background: isActive ? "linear-gradient(180deg, #C99649 0%, #B17E32 100%)" : "transparent",
    boxShadow: isActive ? "0 4px 14px rgba(177, 126, 50, 0.35)" : "none",
    border: isActive ? "1px solid #DFAC5E" : "1px solid transparent",
    textDecoration: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
    position: "relative"
  });

  const subNavItemStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px 8px 24px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: isActive ? 800 : 500,
    color: isActive ? "#1A0F02" : "var(--text-secondary)",
    background: isActive ? "linear-gradient(180deg, #C99649 0%, #B17E32 100%)" : "transparent",
    boxShadow: isActive ? "0 3px 10px rgba(177, 126, 50, 0.3)" : "none",
    border: isActive ? "1px solid #DFAC5E" : "1px solid transparent",
    textDecoration: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
  });

  const groupHeaderStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: active ? 700 : 600,
    color: active ? "#2B1D11" : "var(--text-secondary)",
    backgroundColor: active ? "rgba(200, 149, 71, 0.08)" : "transparent",
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
  });

  const renderBadge = (label) => {
    if (label === "Work Orders" && activeWOCount > 0) {
      return (
        <span style={{ fontSize: "10px", backgroundColor: "rgba(200, 149, 71, 0.18)", color: "#B27E33", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
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
    if (label === "Assets Registry" || label === "Asset Register") {
      return (
        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>
          {assets.length || 24}
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
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: "61px",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(43, 29, 17, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 998
          }}
        />
      )}

      <aside
        className={`app-sidebar ${mobileMenuOpen ? "mobile-open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}
        style={{
          width: sidebarCollapsed ? "68px" : "260px",
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-subtle)"
        }}
      >
        {/* TOP BRAND HEADER */}
        <div>
          {/* Header block (logo/collapse button) removed to save space */}

          {/* DYNAMIC NAVIGATION MENU ACCORDING TO ROLE */}
          <nav
            style={{
              padding: "12px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              overflowY: "auto",
              maxHeight: "calc(100vh - 140px)"
            }}
          >
            {/* 1. IF SYSTEM ADMINISTRATOR ROLE: STRICT 12 MENUS */}
            {currentRole?.id === "admin" ? (
              <>
                {/* 1. Dashboard */}
                <NavLink to="/dashboard" end style={navItemStyle} title="Dashboard">
                  <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>1. Dashboard</span>}
                </NavLink>

                {/* 2. User Management */}
                <div>
                  <div
                    onClick={() => toggleGroup("users")}
                    style={groupHeaderStyle(isGroupActive(["/users"]))}
                    title="User Management"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Users size={18} color="#B27E33" style={{ flexShrink: 0 }} />
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
                      <NavLink to="/users/invitations" end style={subNavItemStyle}>
                        <span>User Invitations</span>
                      </NavLink>
                      <NavLink to="/users/status" end style={subNavItemStyle}>
                        <span>User Status</span>
                      </NavLink>
                      <NavLink to="/users/activity" end style={subNavItemStyle}>
                        <span>User Activity</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 3. Roles & Permissions */}
                <div>
                  <div
                    onClick={() => toggleGroup("roles")}
                    style={groupHeaderStyle(isGroupActive(["/roles"]))}
                    title="Roles & Permissions"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <ShieldCheck size={18} color="#10B981" style={{ flexShrink: 0 }} />
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
                      <NavLink to="/roles/permissions" end style={subNavItemStyle}>
                        <span>Permissions</span>
                      </NavLink>
                      <NavLink to="/roles/mapping" end style={subNavItemStyle}>
                        <span>Role Mapping</span>
                      </NavLink>
                      <NavLink to="/roles/approval-permissions" end style={subNavItemStyle}>
                        <span>Approval Permissions</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 4. Organization */}
                <div>
                  <div
                    onClick={() => toggleGroup("org")}
                    style={groupHeaderStyle(isGroupActive(["/organization"]))}
                    title="Organization"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Building2 size={18} color="#C89547" style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && <span>4. Organization</span>}
                    </div>
                    {!sidebarCollapsed && (
                      openGroups.org ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                    )}
                  </div>

                  {!sidebarCollapsed && openGroups.org && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                      <NavLink to="/organization/companies" end style={subNavItemStyle}>
                        <span>Companies</span>
                      </NavLink>
                      <NavLink to="/organization/plants" end style={subNavItemStyle}>
                        <span>Plants</span>
                      </NavLink>
                      <NavLink to="/organization/departments" end style={subNavItemStyle}>
                        <span>Departments</span>
                      </NavLink>
                      <NavLink to="/organization/lines" end style={subNavItemStyle}>
                        <span>Lines</span>
                      </NavLink>
                      <NavLink to="/organization/work-centers" end style={subNavItemStyle}>
                        <span>Work Centers</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 5. Master Data */}
                <div>
                  <div
                    onClick={() => toggleGroup("masterData")}
                    style={groupHeaderStyle(isGroupActive(["/master-data"]))}
                    title="Master Data"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Database size={18} color="#8B5CF6" style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && <span>5. Master Data</span>}
                    </div>
                    {!sidebarCollapsed && (
                      openGroups.masterData ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                    )}
                  </div>

                  {!sidebarCollapsed && openGroups.masterData && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                      <NavLink to="/master-data/items" end style={subNavItemStyle}>
                        <span>Item / SKU Master</span>
                      </NavLink>
                      <NavLink to="/master-data/product-families" end style={subNavItemStyle}>
                        <span>Product Families</span>
                      </NavLink>
                      <NavLink to="/master-data/uom" end style={subNavItemStyle}>
                        <span>UOM</span>
                      </NavLink>
                      <NavLink to="/master-data/packaging" end style={subNavItemStyle}>
                        <span>Packaging</span>
                      </NavLink>
                      <NavLink to="/master-data/bom" end style={subNavItemStyle}>
                        <span>BOM / Recipes</span>
                      </NavLink>
                      <NavLink to="/master-data/routings" end style={subNavItemStyle}>
                        <span>Routings</span>
                      </NavLink>
                      <NavLink to="/master-data/operations" end style={subNavItemStyle}>
                        <span>Operations</span>
                      </NavLink>
                      <NavLink to="/master-data/work-centers" end style={subNavItemStyle}>
                        <span>Work Centers</span>
                      </NavLink>
                      <NavLink to="/master-data/line-targets" end style={subNavItemStyle}>
                        <span>Line Targets</span>
                      </NavLink>
                      <NavLink to="/master-data/changeover-matrix" end style={subNavItemStyle}>
                        <span>Changeover Matrix</span>
                      </NavLink>
                      <NavLink to="/master-data/sanitation-allergens" end style={subNavItemStyle}>
                        <span>Sanitation / Allergens</span>
                      </NavLink>
                      <NavLink to="/master-data/labour-standards" end style={subNavItemStyle}>
                        <span>Labour Standards</span>
                      </NavLink>
                      <NavLink to="/master-data/skills" end style={subNavItemStyle}>
                        <span>Skills / Qualifications</span>
                      </NavLink>
                      <NavLink to="/master-data/quality-specs" end style={subNavItemStyle}>
                        <span>Quality Specifications</span>
                      </NavLink>
                      <NavLink to="/master-data/ccp-limits" end style={subNavItemStyle}>
                        <span>CCP Limits</span>
                      </NavLink>
                      <NavLink to="/master-data/machine-capability" end style={subNavItemStyle}>
                        <span>Machine Capability</span>
                      </NavLink>
                      <NavLink to="/master-data/storage-resources" end style={subNavItemStyle}>
                        <span>Storage Resources</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 6. Integrations */}
                <div>
                  <div
                    onClick={() => toggleGroup("integrations")}
                    style={groupHeaderStyle(isGroupActive(["/integrations"]))}
                    title="Integrations"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Cpu size={18} color="#0284C7" style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && <span>6. Integrations</span>}
                    </div>
                    {!sidebarCollapsed && (
                      openGroups.integrations ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                    )}
                  </div>

                  {!sidebarCollapsed && openGroups.integrations && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                      <NavLink to="/integrations/erp" end style={subNavItemStyle}>
                        <span>ERP</span>
                      </NavLink>
                      <NavLink to="/integrations/iot" end style={subNavItemStyle}>
                        <span>IoT / Machines</span>
                      </NavLink>
                      <NavLink to="/integrations/barcode" end style={subNavItemStyle}>
                        <span>Barcode / QR</span>
                      </NavLink>
                      <NavLink to="/integrations/apis" end style={subNavItemStyle}>
                        <span>APIs</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 7. Data Health */}
                <div>
                  <div
                    onClick={() => toggleGroup("dataHealth")}
                    style={groupHeaderStyle(isGroupActive(["/data-health"]))}
                    title="Data Health"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <HeartPulse size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && <span>7. Data Health</span>}
                    </div>
                    {!sidebarCollapsed && (
                      openGroups.dataHealth ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                    )}
                  </div>

                  {!sidebarCollapsed && openGroups.dataHealth && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                      <NavLink to="/data-health/missing-data" end style={subNavItemStyle}>
                        <span>Missing Data</span>
                      </NavLink>
                      <NavLink to="/data-health/duplicates" end style={subNavItemStyle}>
                        <span>Duplicates</span>
                      </NavLink>
                      <NavLink to="/data-health/invalid-references" end style={subNavItemStyle}>
                        <span>Invalid References</span>
                      </NavLink>
                      <NavLink to="/data-health/broken-relationships" end style={subNavItemStyle}>
                        <span>Broken Relationships</span>
                      </NavLink>
                      <NavLink to="/data-health/stale-records" end style={subNavItemStyle}>
                        <span>Stale Records</span>
                      </NavLink>
                      <NavLink to="/data-health/remediation" end style={subNavItemStyle}>
                        <span>Remediation</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* 8. Security */}
                <NavLink to="/security" end style={navItemStyle} title="Security">
                  <Lock size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>8. Security</span>}
                </NavLink>

                {/* 9. Configuration */}
                <NavLink to="/configuration" end style={navItemStyle} title="Configuration">
                  <Sliders size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>9. Configuration</span>}
                </NavLink>

                {/* 10. Audit Logs */}
                <NavLink to="/audit-logs" end style={navItemStyle} title="Audit Logs">
                  <FileText size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>10. Audit Logs</span>}
                </NavLink>

                {/* 11. Migration */}
                <NavLink to="/migration" end style={navItemStyle} title="Migration">
                  <UploadCloud size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>11. Migration</span>}
                </NavLink>

                {/* 12. System Reports */}
                <NavLink to="/system-reports" end style={navItemStyle} title="System Reports">
                  <FileSpreadsheet size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>12. System Reports</span>}
                </NavLink>
              </>
            ) : (
              /* 2. OTHER ROLES: RENDER CONFIG DYNAMICALLY */
              (NAVIGATION_CONFIG[currentRole?.id] || []).map((item, idx) => {
                if (item.group) {
                  const isGroupOpen = openGroups[item.group] ?? true;
                  const groupPaths = item.items.map((i) => i.path);
                  const active = isGroupActive(groupPaths);

                  return (
                    <div key={item.group || idx}>
                      <div
                        onClick={() => toggleGroup(item.group)}
                        style={groupHeaderStyle(active)}
                        title={item.group}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Layers size={18} color={active ? "#B27E33" : "var(--text-secondary)"} style={{ flexShrink: 0 }} />
                          {!sidebarCollapsed && <span>{item.group}</span>}
                        </div>
                        {!sidebarCollapsed && (
                          isGroupOpen ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />
                        )}
                      </div>

                      {!sidebarCollapsed && isGroupOpen && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                          {item.items.map((subItem) => {
                            const IconComp = iconMap[subItem.icon] || FileText;
                            return (
                              <NavLink key={subItem.path} to={subItem.path} end style={subNavItemStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <IconComp size={14} />
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

                const IconComp = iconMap[item.icon] || LayoutDashboard;
                return (
                  <NavLink key={item.path} to={item.path} end style={navItemStyle} title={item.label}>
                    <IconComp size={18} style={{ flexShrink: 0 }} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {!sidebarCollapsed && renderBadge(item.label)}
                  </NavLink>
                );
              })
            )}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE CARD & ROLE IDENTIFIER */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          {!sidebarCollapsed ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
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
                  fontWeight: 800,
                  fontSize: "13px",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)"
                }}
              >
                {currentRole?.label?.charAt(0) || "U"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#2B1D11", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  Alexander Vance
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {currentRole?.label}
                </div>
              </div>
            </div>
          ) : (
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
                fontWeight: 800,
                fontSize: "13px",
                boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)"
              }}
              title={`${currentRole?.label} (Alexander Vance)`}
            >
              {currentRole?.label?.charAt(0) || "U"}
            </div>
          )}

          {!sidebarCollapsed && (
            <button
              onClick={() => {
                logout();
                addToast("Logged out of simulation session.", "info");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px"
              }}
              title="Logout Session"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

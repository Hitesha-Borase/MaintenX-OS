import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  Cpu
} from "lucide-react";
import { useRole } from "../../context/RoleContext";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useExceptions } from "../../context/ExceptionContext";

export function Sidebar() {
  const { currentRole, canAccessModule, logout } = useRole();
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen, addToast } = useApp();
  const { workOrders, assets } = useCMMS();
  const { exceptions } = useExceptions();
  const location = useLocation();

  // Collapsible sub-navigation groups
  const [openGroups, setOpenGroups] = useState({
    dashboards: true,
    maintenance: true,
    production: false,
    planning: false,
    quality: false,
    inventory: false
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

        {/* Navigation Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
          
          {/* Shop Floor Mobile Launcher */}
          {canAccessModule("shopfloor") && (
            <>
              <NavLink to="/shopfloor" end style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <Smartphone size={17} color="#34D399" />
                {!sidebarCollapsed && <span>Mobile Shop-Floor Hub</span>}
              </NavLink>
              
              {currentRole.id === "operator" && (
                <div style={navItemStyle({ isActive: false })} onClick={() => { setMobileMenuOpen(false); addToast("Task execution pending backend integration.", "info"); }}>
                  <FileText size={17} color="#F59E0B" />
                  {!sidebarCollapsed && <span>My Tasks</span>}
                </div>
              )}
            </>
          )}

          {/* Dashboards Section */}
          {canAccessModule("dashboards") && (
            <div>
              <div
                onClick={() => toggleGroup("dashboards")}
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
                  cursor: "pointer"
                }}
              >
                {!sidebarCollapsed && <span>Control & Dashboards</span>}
                {!sidebarCollapsed && (openGroups.dashboards ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </div>

              {(!sidebarCollapsed ? openGroups.dashboards : true) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <NavLink to="/command-center" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard size={17} />
                    {!sidebarCollapsed && <span>Command Center</span>}
                  </NavLink>

                  <NavLink to="/oee-performance" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                    <Gauge size={17} />
                    {!sidebarCollapsed && <span>OEE & Performance</span>}
                  </NavLink>

                  <NavLink to="/kpi-analytics" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                    <LineChart size={17} />
                    {!sidebarCollapsed && <span>KPI & Real-Time</span>}
                  </NavLink>

                  <NavLink to="/ai-analytics" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                    <BrainCircuit size={17} color="#A855F7" />
                    {!sidebarCollapsed && <span>AI Decision Support</span>}
                  </NavLink>

                  <NavLink to="/exception-control-tower" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                    <AlertTriangle size={17} color={openP1Count > 0 ? "#EF4444" : "#F59E0B"} />
                    {!sidebarCollapsed && (
                      <div style={{ display: "flex", alignItems: "center", justifyBox: "space-between", width: "100%" }}>
                        <span>Exception Tower</span>
                        {openP1Count > 0 && (
                          <span style={{ fontSize: "10px", backgroundColor: "#EF4444", color: "#FFFFFF", padding: "1px 6px", borderRadius: "10px", fontWeight: 700, marginLeft: "auto" }}>
                            {openP1Count} P1
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* CMMS / Maintenance Section */}
          {canAccessModule("cmms") && (
            <div style={{ marginTop: "8px" }}>
              <div
                onClick={() => toggleGroup("maintenance")}
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
                  cursor: "pointer"
                }}
              >
                {!sidebarCollapsed && <span>Maintenance / CMMS</span>}
                {!sidebarCollapsed && (openGroups.maintenance ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </div>

              {(!sidebarCollapsed ? openGroups.maintenance : true) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {currentRole.id !== "operator" && (
                    <NavLink to="/maintenance" end style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                      <Wrench size={17} color="#38BDF8" />
                      {!sidebarCollapsed && <span>CMMS Dashboard</span>}
                    </NavLink>
                  )}

                  {!sidebarCollapsed && (
                    <>
                      {currentRole.id !== "operator" && (
                        <>
                          <NavLink to="/maintenance/assets" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Assets Registry</span>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{assets.length}</span>
                          </NavLink>

                          <NavLink to="/maintenance/work-orders" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Work Orders</span>
                            <span style={{ fontSize: "10px", backgroundColor: "rgba(56, 189, 248, 0.2)", color: "#38BDF8", padding: "1px 5px", borderRadius: "4px" }}>
                              {activeWOCount}
                            </span>
                          </NavLink>

                          <NavLink to="/maintenance/pm-schedules" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>PM Scheduling</span>
                          </NavLink>
                        </>
                      )}

                      <NavLink to="/maintenance/pm-checklists" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                        <span>PM Checklists</span>
                      </NavLink>

                      {currentRole.id !== "operator" && (
                        <>
                          <NavLink to="/maintenance/breakdowns" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Breakdowns</span>
                          </NavLink>

                          <NavLink to="/maintenance/troubleshooting" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Troubleshooting</span>
                          </NavLink>

                          <NavLink to="/maintenance/verified-solutions" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Verified Solutions</span>
                          </NavLink>

                          <NavLink to="/maintenance/repeat-failures" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Repeat Failures</span>
                          </NavLink>

                          <NavLink to="/maintenance/reliability" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Reliability (MTBF)</span>
                          </NavLink>

                          <NavLink to="/maintenance/spare-parts" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Spare Parts</span>
                          </NavLink>

                          <NavLink to="/maintenance/calibration" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Calibration</span>
                          </NavLink>

                          <NavLink to="/maintenance/failure-codes" style={subNavItemStyle} onClick={() => setMobileMenuOpen(false)}>
                            <span>Failure Codes</span>
                          </NavLink>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Production / MES */}
          {canAccessModule("production") && (
            <div style={{ marginTop: "8px" }}>
              <NavLink to="/production" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <Factory size={17} color="#F59E0B" />
                {!sidebarCollapsed && <span>Production / MES</span>}
              </NavLink>
            </div>
          )}

          {/* Planning / APS / MRP */}
          {canAccessModule("planning") && (
            <div>
              <NavLink to="/planning" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <CalendarRange size={17} color="#6366F1" />
                {!sidebarCollapsed && <span>Planning & MRP</span>}
              </NavLink>
            </div>
          )}

          {/* Quality / QMS */}
          {canAccessModule("quality") && (
            <div>
              <NavLink to="/quality" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <ShieldCheck size={17} color="#10B981" />
                {!sidebarCollapsed && <span>Quality (QMS)</span>}
              </NavLink>
            </div>
          )}

          {/* WMS / Inventory */}
          {canAccessModule("inventory") && (
            <div>
              <NavLink to="/inventory" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <Package size={17} />
                {!sidebarCollapsed && <span>WMS / Inventory</span>}
              </NavLink>
            </div>
          )}

          {/* Traceability (Batch 360) */}
          {canAccessModule("traceability") && (
            <div>
              <NavLink to="/traceability" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <Boxes size={17} />
                {!sidebarCollapsed && <span>Traceability 360°</span>}
              </NavLink>
            </div>
          )}

          {/* Costing */}
          {canAccessModule("costing") && (
            <div>
              <NavLink to="/costing" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <DollarSign size={17} />
                {!sidebarCollapsed && <span>Costing & Variance</span>}
              </NavLink>
            </div>
          )}

          {/* RCA / CAPA */}
          {canAccessModule("rca") && (
            <div>
              <NavLink to="/rca-capa" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <SearchCode size={17} />
                {!sidebarCollapsed && <span>RCA / CAPA</span>}
              </NavLink>
            </div>
          )}

          {/* Labour & Skills */}
          {canAccessModule("labour") && (
            <div>
              <NavLink to="/labour" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <Users size={17} />
                {!sidebarCollapsed && <span>Labour & Skills</span>}
              </NavLink>
            </div>
          )}

          {/* Purchasing */}
          {canAccessModule("purchasing") && (
            <div>
              <NavLink to="/purchasing" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <ShoppingBag size={17} />
                {!sidebarCollapsed && <span>Purchasing Hub</span>}
              </NavLink>
            </div>
          )}

          {/* Documents */}
          {canAccessModule("documents") && (
            <div>
              <NavLink to="/documents" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <FileText size={17} />
                {!sidebarCollapsed && <span>SOPs & Documents</span>}
              </NavLink>
            </div>
          )}

          {/* Reports */}
          {canAccessModule("reports") && (
            <div>
              <NavLink to="/reports" style={navItemStyle} onClick={() => setMobileMenuOpen(false)}>
                <FileSpreadsheet size={17} />
                {!sidebarCollapsed && <span>Reports Center</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Role Badge in Footer */}
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

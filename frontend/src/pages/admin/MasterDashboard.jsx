import React, { useState } from "react";
import { useMasterAdmin } from "../../context/MasterAdminContext";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Building2, Users, CreditCard, Activity, AlertCircle, Plus, ShieldCheck, ArrowUpRight, ArrowDownRight, Headset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddCompanyModal } from "./companies/AddCompanyModal";

export function MasterDashboard() {
  const { companies, users, activityLogs, dashboardData, loading, fetchDashboard } = useMasterAdmin();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  React.useEffect(() => {
    fetchDashboard?.();
  }, [fetchDashboard]);

  const totalCompanies = dashboardData?.kpis?.totalCompanies ?? companies.length;
  const activeCompanies = dashboardData?.kpis?.activeCompanies ?? companies.filter(c => c.status === "Active").length;
  const suspendedCompanies = dashboardData?.kpis?.suspendedCompanies ?? companies.filter(c => c.status === "Suspended").length;
  
  const totalUsers = dashboardData?.kpis?.totalUsers ?? users.length;
  const totalAdmins = dashboardData?.kpis?.totalAdmins ?? users.filter(u => u.role === "Company Admin").length;
  
  const activeSubscriptions = dashboardData?.kpis?.activeSubscriptions ?? companies.filter(c => c.subscription !== "Trial").length;
  const expiringSubscriptions = dashboardData?.kpis?.expiringSubscriptions ?? 0;
  const pendingTickets = dashboardData?.kpis?.pendingTickets ?? 0;
  const systemAlerts = dashboardData?.kpis?.systemAlerts ?? 0;

  const planBreakdown = dashboardData?.planBreakdown || {};
  const enterpriseCount = planBreakdown["MaintenX OS Complete"] || planBreakdown["ENTERPRISE"] || 0;
  const bundlesCount = planBreakdown["Bundles"] || planBreakdown["STANDARD"] || 0;
  const individualCount = planBreakdown["Individual Modules"] || planBreakdown["STARTER"] || 0;

  const BarChart = ({ label, value, max, color }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div style={{ height: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: color, borderRadius: "4px" }}></div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>Control Center</h1>
        {loading && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Syncing with PostgreSQL...</span>
        )}
      </div>

      {/* TOP METRICS ROW 1 - 2x2 on mobile, 4 on desktop */}
      <div className="kpi-grid-responsive grid-4">
        <StatCard
          title="Total Companies"
          value={totalCompanies}
          trend={{ value: <><ArrowUpRight size={11} style={{marginBottom:'-2px', marginRight:'2px'}}/>+2 this month</>, isPositive: true }}
          icon={Building2}
          colorVariant="cyan"
          onClick={() => navigate("/master/companies")}
          className="cursor-pointer hover-card"
        />
        
        <StatCard
          title="Active / Suspended"
          value={
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", paddingRight: "10px" }}>
              <span style={{ color: "#10B981" }}>{activeCompanies}</span>
              <span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: 500 }}>/</span>
              <span style={{ fontSize: "18px", color: "#EF4444" }}>{suspendedCompanies}</span>
            </div>
          }
          description="Active vs Suspended"
          icon={Activity}
          colorVariant="emerald"
          onClick={() => navigate("/master/companies")}
          className="cursor-pointer hover-card"
        />

        <StatCard
          title="Global Users"
          value={totalUsers}
          trend={{ value: <><ArrowUpRight size={11} style={{marginBottom:'-2px', marginRight:'2px'}}/>+12% growth</>, isPositive: true }}
          icon={Users}
          colorVariant="indigo"
          onClick={() => navigate("/master/platform-users")}
          className="cursor-pointer hover-card"
        />

        <StatCard
          title="Active Subs"
          value={activeSubscriptions}
          trend={{ value: <><AlertCircle size={11} style={{marginBottom:'-2px', marginRight:'2px'}}/>{expiringSubscriptions} Expiring Soon</>, isPositive: false }}
          icon={CreditCard}
          colorVariant="amber"
          onClick={() => navigate("/master/subscriptions")}
          className="cursor-pointer hover-card"
        />
      </div>

      {/* CHARTS & GRAPHS ROW - 2 columns on desktop, 1 column full-width on mobile */}
      <div className="grid-2-responsive" style={{ gap: "20px" }}>
        <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Usage Overview</h3>
          
          <BarChart label="Enterprise Plan Companies" value={enterpriseCount} max={totalCompanies || 1} color="#8B5CF6" />
          <BarChart label="Bundles Plan Companies" value={bundlesCount} max={totalCompanies || 1} color="#2563EB" />
          <BarChart label="Individual Modules Companies" value={individualCount} max={totalCompanies || 1} color="#10B981" />
          
          <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "8px", paddingTop: "14px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Company Administrators">Company Admins</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>{totalAdmins}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Pending Support Tickets">Pending Tickets</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#EF4444", marginTop: "2px" }}>{pendingTickets}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="System Alerts">System Alerts</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#F59E0B", marginTop: "2px" }}>{systemAlerts}</div>
            </div>
          </div>
        </Card>

        <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Recent Platform Activity</h3>
            <span style={{ fontSize: "12px", color: "#2563EB", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/master/audit-logs")}>View Logs</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px" }}>
            {activityLogs.slice(0, 4).map((log, i) => (
              <div key={log.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: i !== 3 ? "12px" : "0", borderBottom: i !== 3 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ padding: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "50%", color: "#64748B", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                  <Activity size={14} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{log.action}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: "1.4" }}>{log.details}</div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "4px", fontWeight: 600 }}>{log.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS ROW - 2x2 on mobile, 4 on desktop */}
      <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800 }}>SaaS Quick Management</h3>
        <div className="grid-2" style={{ gap: "10px" }}>
          <button onClick={() => setIsAddModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#2563EB"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
            <div style={{ padding: "8px", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563EB", borderRadius: "8px", flexShrink: 0 }}><Plus size={18} /></div>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>Add Company</span>
          </button>
          
          <button onClick={() => navigate("/master/company-admins")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#10B981"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
            <div style={{ padding: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", borderRadius: "8px", flexShrink: 0 }}><ShieldCheck size={18} /></div>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>Manage Admins</span>
          </button>
          


          <button onClick={() => navigate("/master/support-tickets")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#EF4444"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
            <div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px", flexShrink: 0 }}><Headset size={18} /></div>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>Support Tickets</span>
          </button>
        </div>
      </Card>

      <AddCompanyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}


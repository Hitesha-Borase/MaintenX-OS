import React, { useState } from "react";
import { useMasterAdmin } from "../../context/MasterAdminContext";
import { Card } from "../../components/common/Card";
import { Building2, Users, CreditCard, Activity, AlertCircle, Plus, ShieldCheck, Layers, ArrowUpRight, ArrowDownRight, Headset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddCompanyModal } from "./companies/AddCompanyModal";

export function MasterDashboard() {
  const { companies, users, activityLogs } = useMasterAdmin();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === "Active").length;
  const suspendedCompanies = companies.filter(c => c.status === "Suspended").length;
  
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === "Company Admin").length;
  
  const activeSubscriptions = companies.filter(c => c.subscription !== "Trial").length;
  const expiringSubscriptions = 2; // Mock data for expiring subscriptions
  const pendingTickets = 14; // Mock data for support tickets
  const systemAlerts = 3; // Mock data for system alerts

  const BarChart = ({ label, value, max, color }) => {
    const percentage = Math.min((value / max) * 100, 100);
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
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>SaaS Control Center</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Global overview of all tenant companies and platform subscriptions</p>
      </div>

      {/* TOP METRICS ROW 1 - 2x2 on mobile, 4 on desktop */}
      <div className="kpi-grid-responsive grid-4">
        <Card style={{ padding: "14px 16px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }} onClick={() => navigate("/master/companies")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Total Companies</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.2 }}>{totalCompanies}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#10B981", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>
                <ArrowUpRight size={13} /> <span>+2 this month</span>
              </div>
            </div>
            <div style={{ padding: "8px", backgroundColor: "rgba(37, 99, 235, 0.1)", borderRadius: "8px", color: "#2563EB", flexShrink: 0 }}>
              <Building2 size={18} />
            </div>
          </div>
        </Card>
        
        <Card style={{ padding: "14px 16px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }} onClick={() => navigate("/master/companies")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Active / Suspended</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px", lineHeight: 1.2 }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#10B981" }}>{activeCompanies}</span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-muted)" }}>/</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#EF4444" }}>{suspendedCompanies}</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 600 }}>Active vs Suspended</div>
            </div>
            <div style={{ padding: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", color: "#10B981", flexShrink: 0 }}>
              <Activity size={18} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: "14px 16px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }} onClick={() => navigate("/master/platform-users")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Global Users</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.2 }}>{totalUsers}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#10B981", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>
                <ArrowUpRight size={13} /> <span>+12% growth</span>
              </div>
            </div>
            <div style={{ padding: "8px", backgroundColor: "rgba(139, 92, 246, 0.1)", borderRadius: "8px", color: "#8B5CF6", flexShrink: 0 }}>
              <Users size={18} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: "14px 16px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }} onClick={() => navigate("/master/subscriptions")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Active Subs</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px", lineHeight: 1.2 }}>{activeSubscriptions}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#F59E0B", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>
                <AlertCircle size={13} /> <span>{expiringSubscriptions} Expiring Soon</span>
              </div>
            </div>
            <div style={{ padding: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", color: "#F59E0B", flexShrink: 0 }}>
              <CreditCard size={18} />
            </div>
          </div>
        </Card>
      </div>

      {/* CHARTS & GRAPHS ROW - 2 columns on desktop, 1 column full-width on mobile */}
      <div className="grid-2-responsive" style={{ gap: "20px" }}>
        <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Usage Overview</h3>
          
          <BarChart label="Enterprise Plan Companies" value={1} max={totalCompanies} color="#8B5CF6" />
          <BarChart label="Professional Plan Companies" value={1} max={totalCompanies} color="#2563EB" />
          <BarChart label="Basic Plan Companies" value={1} max={totalCompanies} color="#10B981" />
          
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
          
          <button onClick={() => navigate("/master/modules")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#8B5CF6"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
            <div style={{ padding: "8px", backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6", borderRadius: "8px", flexShrink: 0 }}><Layers size={18} /></div>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>Global Modules</span>
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


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

      {/* TOP METRICS ROW 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "20px", cursor: "pointer", transition: "transform 0.2s" }} onClick={() => navigate("/master/companies")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Companies</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>{totalCompanies}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10B981", fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>
                <ArrowUpRight size={14} /> <span>+2 this month</span>
              </div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "rgba(37, 99, 235, 0.1)", borderRadius: "12px" }}>
              <Building2 size={24} color="#2563EB" />
            </div>
          </div>
        </Card>
        
        <Card style={{ padding: "20px", cursor: "pointer" }} onClick={() => navigate("/master/companies")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Active / Suspended</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
                <span style={{ fontSize: "32px", fontWeight: 800, color: "#10B981" }}>{activeCompanies}</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-muted)" }}>/</span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#EF4444" }}>{suspendedCompanies}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px", fontWeight: 600 }}>Active vs Suspended</div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "12px" }}>
              <Activity size={24} color="#10B981" />
            </div>
          </div>
        </Card>

        <Card style={{ padding: "20px", cursor: "pointer" }} onClick={() => navigate("/master/platform-users")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Global Users</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>{totalUsers}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10B981", fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>
                <ArrowUpRight size={14} /> <span>+12% growth</span>
              </div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "rgba(139, 92, 246, 0.1)", borderRadius: "12px" }}>
              <Users size={24} color="#8B5CF6" />
            </div>
          </div>
        </Card>

        <Card style={{ padding: "20px", cursor: "pointer" }} onClick={() => navigate("/master/subscriptions")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Subs</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>{activeSubscriptions}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#F59E0B", fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>
                <AlertCircle size={14} /> <span>{expiringSubscriptions} Expiring Soon</span>
              </div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "12px" }}>
              <CreditCard size={24} color="#F59E0B" />
            </div>
          </div>
        </Card>
      </div>

      {/* CHARTS & GRAPHS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Usage Overview</h3>
          
          <BarChart label="Enterprise Plan Companies" value={1} max={totalCompanies} color="#8B5CF6" />
          <BarChart label="Professional Plan Companies" value={1} max={totalCompanies} color="#2563EB" />
          <BarChart label="Basic Plan Companies" value={1} max={totalCompanies} color="#10B981" />
          
          <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "8px", paddingTop: "16px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Company Administrators</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>{totalAdmins}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Pending Support Tickets</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#EF4444" }}>{pendingTickets}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>System Alerts</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#F59E0B" }}>{systemAlerts}</div>
            </div>
          </div>
        </Card>

        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Recent Platform Activity</h3>
            <span style={{ fontSize: "13px", color: "#2563EB", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/master/audit-logs")}>View Logs</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
            {activityLogs.slice(0, 4).map((log, i) => (
              <div key={log.id} style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingBottom: i !== 3 ? "16px" : "0", borderBottom: i !== 3 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ padding: "10px", backgroundColor: "var(--bg-body)", borderRadius: "50%", color: "#64748B", border: "1px solid var(--border-color)" }}>
                  <Activity size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{log.action}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>{log.details}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 600 }}>{log.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS ROW */}
      <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800 }}>SaaS Quick Management</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <button onClick={() => setIsAddModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", backgroundColor: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#2563EB"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-color)"}>
            <div style={{ padding: "10px", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563EB", borderRadius: "8px" }}><Plus size={20} /></div>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Add Company</span>
          </button>
          
          <button onClick={() => navigate("/master/company-admins")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", backgroundColor: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#10B981"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-color)"}>
            <div style={{ padding: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", borderRadius: "8px" }}><ShieldCheck size={20} /></div>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Manage Admins</span>
          </button>
          
          <button onClick={() => navigate("/master/modules")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", backgroundColor: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#8B5CF6"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-color)"}>
            <div style={{ padding: "10px", backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6", borderRadius: "8px" }}><Layers size={20} /></div>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Global Modules</span>
          </button>

          <button onClick={() => navigate("/master/support-tickets")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", backgroundColor: "var(--bg-body)", border: "1px solid var(--border-color)", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#EF4444"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border-color)"}>
            <div style={{ padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px" }}><Headset size={20} /></div>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Support Tickets</span>
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


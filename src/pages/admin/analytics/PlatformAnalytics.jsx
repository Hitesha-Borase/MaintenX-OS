import React from "react";
import { Card } from "../../../components/common/Card";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";

export function PlatformAnalytics() {
  const { companies, users } = useMasterAdmin();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Analytics</h1>
      </div>

      {/* Metric Cards - 2x2 on mobile, 4 on desktop */}
      <div className="kpi-grid-responsive grid-4">
        <Card style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(37, 99, 235, 0.1)", borderRadius: "10px", color: "#2563EB", flexShrink: 0 }}>
            <Activity size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Total Companies</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginTop: "2px" }}>{companies.length}</div>
          </div>
        </Card>
        
        <Card style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "10px", color: "#10B981", flexShrink: 0 }}>
            <Users size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Total Users</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginTop: "2px" }}>{users.length}</div>
          </div>
        </Card>
        
        <Card style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "10px", color: "#F59E0B", flexShrink: 0 }}>
            <TrendingUp size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Avg Session</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginTop: "2px" }}>24m</div>
          </div>
        </Card>

        <Card style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(139, 92, 246, 0.1)", borderRadius: "10px", color: "#8B5CF6", flexShrink: 0 }}>
            <BarChart3 size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>API Requests</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginTop: "2px" }}>1.2M</div>
          </div>
        </Card>
      </div>

      <div className="grid-2-responsive" style={{ gap: "20px" }}>
        
        {/* Subscription Distribution */}
        <Card style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>Subscription Distribution</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Object.entries(
              companies.reduce((acc, curr) => {
                acc[curr.subscription] = (acc[curr.subscription] || 0) + 1;
                return acc;
              }, {})
            ).map(([plan, count]) => {
              const percentage = Math.round((count / companies.length) * 100) || 0;
              const color = plan === "Enterprise" ? "#2563EB" : plan === "Professional" ? "#10B981" : plan === "Trial" ? "#F59E0B" : "#6B7280";
              return (
                <div key={plan}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    <span>{plan}</span>
                    <span>{count} Companies ({percentage}%)</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-body)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Module Adoption */}
        <Card style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>Module Adoption Rate</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Object.entries(
              companies.reduce((acc, curr) => {
                Object.keys(curr.modules || {}).forEach(mod => {
                  if (curr.modules[mod]) acc[mod] = (acc[mod] || 0) + 1;
                });
                return acc;
              }, { production: 0, quality: 0, maintenance: 0, warehouse: 0, ci: 0 })
            ).map(([mod, count]) => {
              const percentage = Math.round((count / companies.length) * 100) || 0;
              const formatName = (str) => str.charAt(0).toUpperCase() + str.slice(1);
              return (
                <div key={mod}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    <span>{mod === "ci" ? "Continuous Improvement" : formatName(mod)}</span>
                    <span>{percentage}% Adoption</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-body)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: "var(--accent-cyan)", borderRadius: "4px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { masterAdminService } from "../../../services/masterAdminService";
import { useMasterAdmin } from "../../../context/MasterAdminContext";

export function PlatformAnalytics() {
  const { companies, users } = useMasterAdmin();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await masterAdminService.getAnalytics();
        if (isMounted) setAnalytics(data);
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalCompanies = analytics?.totalCompanies ?? companies.length;
  const totalUsers = analytics?.totalUsers ?? users.length;
  const activeUsers = analytics?.activeUsers ?? users.filter((u) => u.status === "Active").length;
  const apiRequests = analytics?.apiRequests ?? "N/A (Audit Logs)";
  const avgSession = analytics?.avgSession ?? "N/A (Active Session Telemetry)";

  const moduleNames = {
    plan: "Plan (APS Scheduler)",
    produce: "Produce (HMI & eBR)",
    verify: "Verify (CCP Quality)",
    maintain: "Maintain (CMMS)",
    move: "Move (Warehouse)",
    people: "Manage People",
    improve: "Improve (CI / RCA)",
    intelligence: "Intelligence (AI)",
  };

  const moduleAdoption = analytics?.moduleAdoption || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Analytics</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Real-time multi-tenant telemetry and adoption metrics calculated from PostgreSQL
          </p>
        </div>
        {loading && <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Calculating Metrics...</span>}
      </div>

      {/* Metric Cards - 4 in a row on desktop, 2x2 on mobile */}
      <div className="kpi-grid-responsive grid-4">
        <StatCard
          title="TOTAL COMPANIES"
          value={totalCompanies}
          icon={Activity}
          colorVariant="blue"
        />
        <StatCard
          title="TOTAL USERS"
          value={totalUsers}
          icon={Users}
          colorVariant="emerald"
        />
        <StatCard
          title="ACTIVE USERS"
          value={activeUsers}
          icon={TrendingUp}
          colorVariant="amber"
        />
        <StatCard
          title="DATABASE TELEMETRY"
          value={apiRequests}
          icon={BarChart3}
          colorVariant="indigo"
        />
      </div>

      <div className="grid-2-responsive" style={{ gap: "20px" }}>
        {/* Subscription Distribution */}
        <Card style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
            Subscription Distribution (PostgreSQL)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Object.entries(
              companies.reduce((acc, curr) => {
                acc[curr.subscription] = (acc[curr.subscription] || 0) + 1;
                return acc;
              }, {})
            ).map(([plan, count]) => {
              const percentage = Math.round((count / (companies.length || 1)) * 100) || 0;
              const color =
                plan === "MaintenX OS Complete" || plan === "ENTERPRISE"
                  ? "#8B5CF6"
                  : plan === "Bundles" || plan === "STANDARD"
                  ? "#2563EB"
                  : plan === "Individual Modules" || plan === "STARTER"
                  ? "#10B981"
                  : "#F59E0B";
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
            {companies.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No active companies registered.
              </div>
            )}
          </div>
        </Card>

        {/* Module Adoption Rate */}
        <Card style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
            Core Module Entitlement Rate
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Object.keys(moduleNames).map((modKey) => {
              const count = moduleAdoption[modKey] || 0;
              const percentage = totalCompanies > 0 ? Math.round((count / totalCompanies) * 100) : 0;
              return (
                <div key={modKey}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    <span>{moduleNames[modKey]}</span>
                    <span>{percentage}% Enabled ({count}/{totalCompanies})</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-body)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: "#10B981", borderRadius: "4px", transition: "width 0.5s ease" }} />
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

import React, { useState } from "react";
import {
  Server,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Activity
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function ERPIntegrationPage() {
  const { addToast } = useApp();

  const [syncStatus, setSyncStatus] = useState("Synchronized (Last: 2 mins ago)");

  const handleSyncNow = () => {
    setSyncStatus("Synchronizing with SAP S/4HANA...");
    setTimeout(() => {
      setSyncStatus("Synchronized (Just now)");
      addToast("SAP S/4HANA ERP Connector: 142 Purchase Orders & Inventory Lots synchronized!", "success");
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Enterprise Resource Planning (ERP) Connector
            </h1>
            <Badge variant="emerald" dot>
              SAP S/4HANA CONNECTED
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={RotateCcw} onClick={handleSyncNow}>
            Trigger Immediate ERP Sync
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="ERP Connector Health"
          value="100%"
          unit="Active"
          trend={{ value: syncStatus, isPositive: true, text: "" }}
          icon={Server}
          colorVariant="emerald"
        />
        <StatCard
          title="Sync Frequency"
          value="15 Mins"
          unit="Interval"
          trend={{ value: "Next automated poll in 13m", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Sync Error Queue"
          value="0 Errors"
          unit="Clean"
          trend={{ value: "Zero payload drops", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Configuration Card */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
          SAP S/4HANA Connection Parameters
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", fontSize: "13px" }}>
          <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>RFC Gateway Endpoint</div>
            <strong style={{ color: "#FFFFFF" }}>sap-prod-gw.corp.flowstate.io:3300</strong>
          </div>

          <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Client ID & System</div>
            <strong style={{ color: "#FFFFFF" }}>PRD_100 • S4H_CORP</strong>
          </div>

          <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Authentication Mode</div>
            <strong style={{ color: "#38BDF8" }}>OAuth2 mTLS Certificate</strong>
          </div>
        </div>
      </Card>

      {/* Recent Sync Events */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-card-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <Activity size={18} color="#C89547" />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Recent Synchronization Events
          </h3>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Timestamp</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Event Type</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Scope</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Records Processed</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: "2 mins ago", type: "Delta Sync", scope: "Purchase Orders, Inventory", count: "142", status: "Success" },
                { time: "17 mins ago", type: "Delta Sync", scope: "Production Orders", count: "38", status: "Success" },
                { time: "32 mins ago", type: "Delta Sync", scope: "Master Data (SKUs)", count: "14", status: "Success" },
                { time: "47 mins ago", type: "Delta Sync", scope: "Purchase Orders, Inventory", count: "129", status: "Success" },
                { time: "1 hour ago", type: "Full Master Sync", scope: "All ERP Entities", count: "4,592", status: "Success" }
              ].map((event, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{event.time}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{event.type}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)" }}>{event.scope}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>{event.count}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={event.status === "Success" ? "emerald" : "red"}>{event.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

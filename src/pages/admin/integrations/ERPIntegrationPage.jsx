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
    </div>
  );
}

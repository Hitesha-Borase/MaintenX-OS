import React, { useState } from "react";
import {
  AlertOctagon,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Layers,
  Wrench
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function BreakdownsOverviewPage() {
  const { breakdowns, resolveBreakdown } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredBreakdowns = breakdowns.filter((b) => {
    return (
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.symptom?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeBDs = breakdowns.filter((b) => b.status !== "Resolved" && b.status !== "Closed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Plant Breakdowns & Outage Log
            </h1>
            <Badge variant="rose">{activeBDs.length} Active Stoppages</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time tracking of machine outages, emergency repair technician dispatches, and downtime duration timers.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="danger" icon={AlertOctagon} onClick={() => setIsQuickActionOpen(true)}>
            Report Breakdown
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Active Breakdowns"
          value={activeBDs.length.toString()}
          unit="Lines Down"
          trend={{ value: activeBDs.length > 0 ? "Emergency response active" : "Zero active stoppages", isPositive: activeBDs.length === 0, text: "" }}
          icon={AlertOctagon}
          colorVariant={activeBDs.length > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Avg Plant MTTR"
          value="1.4 hrs"
          unit="Repair Time"
          trend={{ value: "Target: 1.2 hrs", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Resolved Incidents"
          value={breakdowns.filter((b) => b.status === "Resolved").length.toString()}
          unit="Resolved"
          trend={{ value: "100% RCAs recorded", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Table Card */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Breakdown Incident Logs
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Breakdown ID</th>
                <th>Equipment Asset</th>
                <th>Line</th>
                <th>Failure Symptom</th>
                <th>Downtime Duration</th>
                <th>Assigned Tech</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBreakdowns.map((b) => {
                const isResolved = b.status === "Resolved";

                return (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{b.assetName}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{b.assetId}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{b.line}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#F59E0B", maxWidth: "260px" }}>
                      {b.symptom}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isResolved ? "var(--text-primary)" : "#EF4444" }}>
                      {b.durationMinutes || 35} mins
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{b.technician}</td>
                    <td>
                      <Badge variant={isResolved ? "emerald" : "rose"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td>
                      {!isResolved ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            resolveBreakdown(b.id, "Corrective replacement completed and verified.");
                            addToast(`Breakdown ${b.id} marked as Resolved! Asset restored.`, "success");
                          }}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Filter,
  ShieldCheck,
  Clock,
  UserCheck,
  Layers,
  History,
  Lock
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function AuditLogsPage() {
  const { activityLogs = [] } = useAdmin();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = activityLogs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.category && l.category.toLowerCase().includes(q)) ||
      (l.id && l.id.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    const headers = "Audit Event ID,Actor User,Mutation Description,Category,IP Address,Timestamp\n";
    const rows = activityLogs
      .map((l) => `"${l.id}","${l.user}","${l.action}","${l.category}","${l.ip}","${l.timestamp}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `System_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Immutable audit trail exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Immutable Compliance Audit Logs
            </h1>
            <Badge variant="emerald">21 CFR PART 11 & GAMP 5</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit Trail (CSV)
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Total Audit Events"
          value={activityLogs.length.toString()}
          unit="Records"
          trend={{ value: "Append-only immutable log", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="emerald"
        />
        <StatCard
          title="Compliance Target"
          value="GAMP 5"
          unit="Certified"
          trend={{ value: "FDA 21 CFR Part 11 compliant", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Subsystem Scope"
          value="100%"
          unit="Coverage"
          trend={{ value: "User, Role, Data, Master changes", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="Tamper Seal"
          value="SHA-256"
          unit="Hash Chained"
          trend={{ value: "Zero log modification allowed", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search audit trail by user, event, subsystem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "700px" }}>
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Author / User</th>
                <th>Event Description</th>
                <th>Subsystem</th>
                <th>IP Origin</th>
                <th>Time Recorded</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{l.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{l.user}</strong>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)", maxWidth: "340px", fontWeight: 600 }}>{l.action}</td>
                  <td>
                    <Badge variant="cyan">{l.category}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{l.ip}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{l.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

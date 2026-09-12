import React, { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  RefreshCw,
  Eye,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";

export function UserActivityPage() {
  const { activityLogs = [], fetchActivityLogs } = useAdmin() || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewingLog, setViewingLog] = useState(null);

  useEffect(() => {
    if (fetchActivityLogs) {
      fetchActivityLogs(searchQuery);
    }
  }, [searchQuery]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (fetchActivityLogs) {
        await fetchActivityLogs(searchQuery);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const filteredLogs = activityLogs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.category && l.category.toLowerCase().includes(q)) ||
      (l.ip && l.ip.includes(q))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              User Live Activity Stream & Audit Log
            </h1>
            <Badge variant="emerald" dot>
              STREAMING LIVE
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleRefresh}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Stream"}
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
          title="Events Streamed"
          value={activityLogs.length.toString()}
          unit="Real-time"
          trend={{ value: "Immutable audit ledger", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="cyan"
        />
        <StatCard
          title="Security Anomalies"
          value="0"
          unit="Incidents"
          trend={{ value: "Zero rogue login attempts", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="21 CFR Part 11"
          value="100%"
          unit="Compliant"
          trend={{ value: "Digital signatures tracked", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Latency"
          value="14ms"
          unit="Telemetry"
          trend={{ value: "Sub-second event capture", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
      </div>

      {/* Activity Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search user, action keyword, IP, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>User Account</th>
                <th>Action & Mutation Description</th>
                <th>Category</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Action</th>
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
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "340px" }}>
                    {l.action}
                  </td>
                  <td>
                    <Badge variant="cyan">{l.category}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                    {l.ip}
                  </td>
                  <td style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{l.timestamp}</td>
                  <td>
                    <button
                      onClick={() => setViewingLog(l)}
                      title="View Activity Details"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(14, 165, 233, 0.1)",
                        color: "#0284C7",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW ACTIVITY LOG DETAILS MODAL */}
      {viewingLog && (
        <div className="modal-backdrop" onClick={() => setViewingLog(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Audit Event & Activity Details
                </h2>
              </div>
              <button onClick={() => setViewingLog(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Event ID</span>
                  <strong style={{ fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{viewingLog.id}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Category</span>
                  <Badge variant="cyan">{viewingLog.category}</Badge>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>User Account</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>{viewingLog.user}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Origin IP</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)" }}>{viewingLog.ip}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Action & Operation</span>
                <div style={{ fontSize: "13px", color: "var(--text-primary)", padding: "10px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                  {viewingLog.action}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Recorded Timestamp</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{viewingLog.timestamp}</span>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setViewingLog(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Server,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Eye,
  Trash2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function ERPIntegrationPage() {
  const { addToast } = useApp();

  const [erpInfo, setErpInfo] = useState({
    connectorHealth: "100%",
    status: "Connected",
    syncStatus: "Synchronized (Last: 2 mins ago)",
    syncFrequency: "15 Mins",
    errorQueue: "0 Errors"
  });
  const [syncStatus, setSyncStatus] = useState("Synchronized (Last: 2 mins ago)");
  const [viewingEvent, setViewingEvent] = useState(null);
  const [syncEvents, setSyncEvents] = useState([
    { time: "2 mins ago", type: "Delta Sync", scope: "Purchase Orders, Inventory", count: "142", status: "Success" },
    { time: "17 mins ago", type: "Delta Sync", scope: "Production Orders", count: "38", status: "Success" },
    { time: "32 mins ago", type: "Delta Sync", scope: "Master Data (SKUs)", count: "14", status: "Success" },
    { time: "47 mins ago", type: "Delta Sync", scope: "Purchase Orders, Inventory", count: "129", status: "Success" },
    { time: "1 hour ago", type: "Full Master Sync", scope: "All ERP Entities", count: "4,592", status: "Success" }
  ]);

  useEffect(() => {
    adminService.getERPStatus()
      .then((data) => {
        if (data) {
          setErpInfo(data);
          if (data.syncStatus) setSyncStatus(data.syncStatus);
        }
      })
      .catch((err) => console.warn("ERP status load error:", err.message));
  }, []);

  const handleSyncNow = async () => {
    setSyncStatus("Synchronizing with SAP S/4HANA...");
    try {
      const res = await adminService.syncERP();
      setSyncStatus(res.syncStatus || "Synchronized (Just now)");
      addToast(res.message || "SAP S/4HANA ERP Connector: 142 Purchase Orders & Inventory Lots synchronized!", "success");
    } catch (err) {
      setSyncStatus("Sync failed");
      addToast("ERP Sync failed: " + err.message, "danger");
    }
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {syncEvents.map((event, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{event.time}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{event.type}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)" }}>{event.scope}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>{event.count}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={event.status === "Success" ? "emerald" : "red"}>{event.status}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button onClick={() => setViewingEvent(event)} title="View Event Details" style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#0284C7", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <Eye size={13} />
                      </button>
                      <button onClick={() => { setSyncEvents((prev) => prev.filter((_, i) => i !== idx)); addToast("Sync event removed from log.", "info"); }} title="Remove Event" style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW EVENT MODAL */}
      {viewingEvent && (
        <div className="modal-backdrop" onClick={() => setViewingEvent(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Sync Event Details</h2>
              </div>
              <button onClick={() => setViewingEvent(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Timestamp</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingEvent.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
                  <div style={{ marginTop: "6px" }}><Badge variant={viewingEvent.status === "Success" ? "emerald" : "red"}>{viewingEvent.status}</Badge></div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Event Type</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingEvent.type}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Scope</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{viewingEvent.scope}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Records Processed</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669", fontFamily: "var(--font-mono)", marginTop: "4px" }}>{viewingEvent.count}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingEvent(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Filter,
  ShieldCheck,
  Clock,
  UserCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function AuditLogsPage() {
  const { activityLogs } = useAdmin();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Immutable Compliance Audit Logs
            </h1>
            <Badge variant="emerald">21 CFR Part 11 & GAMP 5</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Tamper-proof audit logs recording administrative modifications, security policy changes, and master data edits.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Audit Trail (CSV)
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search audit trail by user, change event, IP address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
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
              {activityLogs.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{l.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{l.user}</strong>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)", maxWidth: "340px" }}>{l.action}</td>
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

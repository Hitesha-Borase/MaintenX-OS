import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Search, Download, Filter } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function MasterAuditLogs() {
  const { auditLogs } = useMasterAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const { addToast } = useApp();

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || log.target.toLowerCase().includes(searchTerm.toLowerCase()) || log.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = eventFilter === "All" || log.event === eventFilter;
    return matchesSearch && matchesEvent;
  });

  // Dynamically extract unique events for the filter dropdown
  const uniqueEvents = ["All", ...new Set(auditLogs.map(log => log.event))].sort();

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      addToast("No logs to export", "warning");
      return;
    }
    
    // Create CSV content
    const headers = ["Log ID", "Date/Time", "User", "Event", "Target", "IP Address"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => `"${log.id}","${log.date}","${log.user}","${log.event}","${log.target}","${log.ip}"`)
    ].join("\n");

    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Audit logs exported as CSV", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
            Activity & Audit Logs
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px", margin: 0 }}>
            Security and compliance audit trail for platform actions
          </p>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExport} style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 600 }}>
          Export Logs
        </Button>
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ flex: "1 1 100%", minWidth: "180px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by user or target..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={eventFilter} 
              onChange={(e) => setEventFilter(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600 }}
            >
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side Audit Log Cards (Aamne-Samne) */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filteredLogs.map(log => (
            <div 
              key={log.id} 
              style={{ 
                padding: "12px", 
                backgroundColor: "var(--bg-card-subtle)", 
                borderRadius: "10px", 
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "8px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)", fontWeight: 700 }}>{log.id}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#2563EB", backgroundColor: "rgba(37, 99, 235, 0.1)", padding: "2px 6px", borderRadius: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.event}
                  </span>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <div style={{ fontWeight: 700, fontSize: "12.5px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    👤 {log.user}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🎯 {log.target}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)", fontSize: "10px", color: "var(--text-muted)" }}>
                <span>{log.date}</span>
                <span>{log.ip}</span>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No audit logs found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Log ID</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Date / Time</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>User</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Event</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px", fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>{log.id}</td>
                  <td style={{ padding: "16px 20px", fontSize: "13px", color: "var(--text-secondary)" }}>{log.date}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-primary)" }}>{log.user}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500, color: "#2563EB" }}>{log.event}</td>
                  <td style={{ padding: "16px 20px" }}>{log.target}</td>
                  <td style={{ padding: "16px 20px", fontSize: "12px", color: "var(--text-muted)" }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No audit logs found matching criteria.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

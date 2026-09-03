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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Activity & Audit Logs</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" icon={Download} onClick={handleExport}>Export Logs</Button>
        </div>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by user or target..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select 
              value={eventFilter} 
              onChange={(e) => setEventFilter(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)" }}
            >
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
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

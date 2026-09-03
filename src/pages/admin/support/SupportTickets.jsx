import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Search, Filter, MessageSquare, CheckCircle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { TicketModal } from "./TicketModal";

export function SupportTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { addToast } = useApp();
  const { supportTickets, updateTicketStatus } = useMasterAdmin();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTickets = supportTickets.filter(t => {
    const matchesSearch = t.company.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleResolve = (id) => {
    updateTicketStatus(id, "Resolved");
    addToast(`Ticket ${id} marked as resolved`, "success");
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: "Resolved" });
    }
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "#EF4444";
      case "Medium": return "#F59E0B";
      case "Low": return "#10B981";
      default: return "var(--text-secondary)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
          Support Tickets
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px", margin: 0 }}>
          Manage platform-level support requests from tenant companies
        </p>
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ flex: "1 1 100%", minWidth: "180px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search tickets by company or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600 }}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side Ticket Cards (Aamne-Samne) */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id} 
              style={{ 
                padding: "12px", 
                backgroundColor: "var(--bg-card-subtle)", 
                borderRadius: "10px", 
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "10px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 800, fontSize: "12px", color: "var(--text-primary)" }}>{ticket.id}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: 700, color: getPriorityColor(ticket.priority) }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: getPriorityColor(ticket.priority) }} />
                    {ticket.priority}
                  </div>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <div style={{ fontWeight: 700, fontSize: "12.5px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.subject}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.company}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                <Badge variant={ticket.status === "Resolved" ? "emerald" : ticket.status === "Open" ? "warning" : "primary"} style={{ fontSize: "10px", padding: "2px 6px" }}>
                  {ticket.status}
                </Badge>
                <div style={{ display: "flex", gap: "4px" }}>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenTicket(ticket)} title="View & Reply" style={{ padding: "4px" }}><MessageSquare size={13} /></Button>
                  {ticket.status !== "Resolved" && (
                    <Button variant="ghost" size="sm" onClick={() => handleResolve(ticket.id)} title="Mark as Resolved" style={{ padding: "4px" }}><CheckCircle size={13} color="#10B981" /></Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No support tickets found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Ticket ID</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company & Subject</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Priority</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-primary)" }}>{ticket.id}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ticket.subject}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{ticket.company} • {ticket.date}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: getPriorityColor(ticket.priority) }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: getPriorityColor(ticket.priority) }} />
                      {ticket.priority}
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={ticket.status === "Resolved" ? "emerald" : ticket.status === "Open" ? "warning" : "primary"}>
                      {ticket.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenTicket(ticket)} title="View & Reply to Ticket"><MessageSquare size={16} /></Button>
                      {ticket.status !== "Resolved" && (
                        <Button variant="ghost" size="sm" onClick={() => handleResolve(ticket.id)} title="Mark as Resolved"><CheckCircle size={16} color="#10B981" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No support tickets found matching criteria.
            </div>
          )}
        </div>
      </Card>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={selectedTicket}
        onResolve={handleResolve}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Headset, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, X, Send, FileText } from "lucide-react";
import { masterAdminService } from "../../../services/masterAdminService";
import { useApp } from "../../../context/AppContext";
import { useRole } from "../../../context/RoleContext";

export function AdminSupportPage() {
  const { addToast } = useApp();
  const { currentRole } = useRole();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "Medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyName = currentRole?.user?.companyName || currentRole?.user?.company || "My Company";

  const fetchTenantTickets = async () => {
    setLoading(true);
    try {
      const data = await masterAdminService.getSupportTickets();
      const all = Array.isArray(data) ? data : data?.data || [];
      // Filter tickets for this tenant / company
      const tenantTickets = all.filter(
        (t) =>
          t.companyName?.toLowerCase() === companyName.toLowerCase() ||
          t.company?.toLowerCase() === companyName.toLowerCase()
      );
      setTickets(tenantTickets.length > 0 ? tenantTickets : all.slice(0, 3));
    } catch (e) {
      console.warn("Failed to fetch tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantTickets();
  }, [companyName]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      addToast("Please provide both subject and description", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await masterAdminService.createSupportTicket({
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        companyName: companyName
      });
      addToast("Support ticket submitted successfully! Super Admin will respond shortly.", "success");
      setForm({ subject: "", description: "", priority: "Medium" });
      setIsCreateOpen(false);
      fetchTenantTickets();
    } catch (err) {
      addToast(err.message || "Failed to create support ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "Open").toLowerCase();
    if (s.includes("close") || s.includes("resolve")) {
      return <Badge variant="success">Closed</Badge>;
    }
    if (s.includes("reply") || s.includes("progress")) {
      return <Badge variant="primary">Replied</Badge>;
    }
    return <Badge variant="warning">Open</Badge>;
  };

  const getPriorityColor = (priority) => {
    const p = (priority || "Medium").toLowerCase();
    if (p === "high") return "#EF4444";
    if (p === "low") return "#10B981";
    return "#F59E0B";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Support &amp; Helpdesk
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            Submit questions, report system issues, and track replies directly from Super Admin.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 16px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
            color: "#261603",
            border: "none",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(200, 149, 71, 0.25)"
          }}
        >
          <Plus size={16} /> Create New Ticket
        </button>
      </div>

      {/* Tickets List Card */}
      <Card style={{ padding: "0", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
            My Submitted Tickets ({tickets.length})
          </div>
          {loading && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Loading tickets...</span>}
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Headset size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>No Support Tickets</div>
            <p style={{ fontSize: "13px", maxWidth: "420px", margin: "6px auto 16px" }}>
              Need help with your plant setup, sensors, work orders or billing? Create a ticket and our platform team will reply.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#C89547",
                color: "#FFFFFF",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Submit First Ticket
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Ticket ID</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Subject</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Priority</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Super Admin Reply</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer" }}
                    onClick={() => setSelectedTicket(t)}
                  >
                    <td style={{ padding: "14px 18px", fontWeight: 800, color: "#8C5B23" }}>
                      {t.id}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{t.subject}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                        {t.description}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: getPriorityColor(t.priority) }}>
                        ● {t.priority || "Medium"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      {getStatusBadge(t.status)}
                    </td>
                    <td style={{ padding: "14px 18px", color: t.resolution ? "var(--text-primary)" : "var(--text-muted)", fontSize: "12px" }}>
                      {t.resolution ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#047857", fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> {t.resolution.substring(0, 40)}...
                        </div>
                      ) : (
                        <span style={{ fontStyle: "italic" }}>Waiting for reply</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(t);
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          border: "1px solid var(--border-subtle)",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          cursor: "pointer"
                        }}
                      >
                        View Thread
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CREATE TICKET MODAL */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Create Support Ticket
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "5px", color: "var(--text-secondary)" }}>
                  Subject / Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Line 2 OEE sensor disconnected or Billing question"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card-subtle)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "5px", color: "var(--text-secondary)" }}>
                  Priority Level
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card-subtle)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  <option value="Low">Low - General Question</option>
                  <option value="Medium">Medium - Standard Request</option>
                  <option value="High">High - Production / Line Blocker</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "5px", color: "var(--text-secondary)" }}>
                  Problem Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe the issue in detail, including line number, SKU or screen where the error happened..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-card-subtle)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    backgroundColor: "#C89547",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Send size={13} /> {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAILS & REPLY MODAL */}
      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#8C5B23" }}>{selectedTicket.id}</div>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {getStatusBadge(selectedTicket.status)}
              <span style={{ fontSize: "12px", fontWeight: 700, color: getPriorityColor(selectedTicket.priority) }}>
                Priority: {selectedTicket.priority || "Medium"}
              </span>
            </div>

            {/* Original Problem */}
            <div style={{ backgroundColor: "var(--bg-card-subtle)", borderRadius: "10px", padding: "12px 14px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                Problem Description:
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                {selectedTicket.description}
              </div>
            </div>

            {/* Super Admin Reply */}
            <div
              style={{
                backgroundColor: selectedTicket.resolution ? "#ECFDF5" : "#FFFBEB",
                border: `1px solid ${selectedTicket.resolution ? "#A7F3D0" : "#FDE68A"}`,
                borderRadius: "10px",
                padding: "12px 14px"
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: selectedTicket.resolution ? "#065F46" : "#92400E",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "4px"
                }}
              >
                {selectedTicket.resolution ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                Super Admin Response:
              </div>
              <div style={{ fontSize: "13px", color: selectedTicket.resolution ? "#064E3B" : "#78350F", lineHeight: 1.5 }}>
                {selectedTicket.resolution || "Our platform engineers are reviewing your ticket. You will receive an updated resolution here shortly."}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  backgroundColor: "#C89547",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

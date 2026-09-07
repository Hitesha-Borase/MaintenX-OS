import React, { useState } from "react";
import {
  UserPlus,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Mail,
  ShieldCheck,
  Building2,
  Layers,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function UserInvitationsPage() {
  const { invitations = [], addInvitation } = useAdmin();
  const { addToast } = useApp();

  const [invites, setInvites] = useState(invitations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingInvite, setDeletingInvite] = useState(null);

  const [newInvite, setNewInvite] = useState({
    email: "",
    role: "Quality Analyst",
    department: "Quality"
  });

  const handleResend = (email) => {
    addToast(`Magic sign-up link re-dispatched to ${email}.`, "info");
  };

  const handleConfirmRevoke = () => {
    if (!deletingInvite) return;
    setInvites((prev) => prev.filter((i) => i.id !== deletingInvite.id));
    addToast(`Invitation for ${deletingInvite.email} revoked.`, "warning");
    setDeletingInvite(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newInvite.email.trim()) {
      addToast("Please provide recipient email.", "warning");
      return;
    }

    const created = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      email: newInvite.email,
      role: newInvite.role,
      department: newInvite.department,
      sentDate: new Date().toISOString().substring(0, 10),
      status: "Pending"
    };

    setInvites([created, ...invites]);
    if (addInvitation) addInvitation(newInvite);
    addToast(`Invitation sent to ${newInvite.email}!`, "success");
    setIsModalOpen(false);
    setNewInvite({ email: "", role: "Quality Analyst", department: "Quality" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Pending User Onboarding Invitations
            </h1>
            <Badge variant="cyan">{invites.length} PENDING INVITES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Send User Invite
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
          title="Pending Invitations"
          value={invites.length.toString()}
          unit="Awaiting Signup"
          icon={Mail}
          colorVariant="amber"
        />
        <StatCard
          title="Avg Acceptance Time"
          value="4.2 hrs"
          unit="Onboarding SLA"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Invite Deliverability"
          value="100%"
          unit="Delivered"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="SSO / Magic Link"
          value="Enabled"
          unit="Auth0 Gateway"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Invitations Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "650px" }}>
            <thead>
              <tr>
                <th>Invite ID</th>
                <th>Recipient Email</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Date Dispatched</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => (
                <tr key={i.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{i.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{i.email}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{i.role}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{i.department}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{i.sentDate}</td>
                  <td>
                    <Badge variant="amber">{i.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleResend(i.email)}
                        title="Resend Invite Link"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Send size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingInvite(i)}
                        title="Revoke / Delete Invitation"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(220, 38, 38, 0.1)",
                          color: "#DC2626",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
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

      {/* SEND INVITATION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Send User Invitation
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Recipient Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. employee@flowstate.io"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Pre-Assigned Role</label>
                <select
                  className="form-select"
                  value={newInvite.role}
                  onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Operator / Line Tech">Operator / Line Tech</option>
                  <option value="Maintenance Lead">Maintenance Lead</option>
                  <option value="Quality Analyst">Quality Analyst</option>
                  <option value="Plant Manager">Plant Manager</option>
                </select>
              </div>

              <div>
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={newInvite.department}
                  onChange={(e) => setNewInvite({ ...newInvite, department: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Operations">Operations</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality">Quality Assurance</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Dispatch Invite Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM REVOKE INVITATION MODAL */}
      {deletingInvite && (
        <div className="modal-backdrop" onClick={() => setDeletingInvite(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Confirm Revoke Invitation
                </h2>
              </div>
              <button onClick={() => setDeletingInvite(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me <strong>{deletingInvite.email}</strong> ka invitation revoke aur delete karna chahte hain?
              </p>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                User ka dispatched magic login link expire aur invalidate ho jayega.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingInvite(null)}>
                  Cancel
                </Button>
                <button
                  onClick={handleConfirmRevoke}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Yes, Revoke Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

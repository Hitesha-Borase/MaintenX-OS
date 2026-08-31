import React, { useState } from "react";
import {
  Mail,
  Plus,
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function UserInvitationsPage() {
  const { invitations, addInvitation } = useAdmin();
  const { addToast } = useApp();

  const [invites, setInvites] = useState(invitations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: "",
    role: "Quality Analyst",
    department: "Quality"
  });

  const handleResend = (email) => {
    addToast(`Invitation resent to ${email}!`, "success");
  };

  const handleRevoke = (id) => {
    setInvites(invites.filter((i) => i.id !== id));
    addToast(`Invitation ${id} revoked.`, "info");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newInvite.email) {
      addToast("Please provide corporate email", "warning");
      return;
    }
    const created = addInvitation ? addInvitation(newInvite) : { ...newInvite, id: `INV-${Date.now()}`, sentDate: "Today", status: "Pending" };
    setInvites([...invites, created]);
    addToast(`Invitation link sent to ${newInvite.email}!`, "success");
    setIsModalOpen(false);
    setNewInvite({ email: "", role: "Quality Analyst", department: "Quality" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Pending User Onboarding Invitations
            </h1>
            <Badge variant="cyan">{invites.length} Pending Invites</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Invite new operators, technicians, and plant managers via magic sign-up links with pre-assigned RBAC roles.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Send New Invitation
          </Button>
        </div>
      </div>

      {/* Invitations Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invitation Ref</th>
                <th>Recipient Email</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Date Sent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => (
                <tr key={i.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{i.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{i.email}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{i.role}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{i.department}</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{i.sentDate}</td>
                  <td>
                    <Badge variant="amber">{i.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Send}
                        onClick={() => handleResend(i.email)}
                      >
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleRevoke(i.id)}
                      >
                        Revoke
                      </Button>
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
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Send User Invitation
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Recipient Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. employee@flowstate.io"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Pre-Assigned Role</label>
                <select
                  className="form-select"
                  value={newInvite.role}
                  onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
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
                >
                  <option value="Operations">Operations</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality">Quality Assurance</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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
    </div>
  );
}

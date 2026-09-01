import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Edit,
  Save,
  KeyRound,
  Bell,
  Globe,
  Clock,
  CheckCircle2,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function Profile() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [profile, setProfile] = useState({
    name: "Alexander Vance",
    role: "Lead CI & Manufacturing Engineer",
    department: "Continuous Improvement & Engineering",
    email: "alexander.vance@maintenx.internal",
    phone: "+1 (555) 492-8830",
    employeeId: "EMP-8842",
    plant: "Plant 1 — Main Processing Facility",
    shift: "Day Shift (08:00 - 17:00)",
    timezone: "UTC-05:00 (Eastern Time)",
    emailAlerts: true,
    pushAlerts: true,
    weeklyDigest: true
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProfile({ ...formData });
    addToast("Profile details updated successfully!", "success");
    setIsEditModalOpen(false);
  };

  const handleToggle = (key) => {
    setProfile((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      addToast("Notification preference updated.", "info");
      return updated;
    });
  };

  const handlePasswordReset = () => {
    addToast("Password reset link dispatched to your registered email.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1000px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              User Profile & Account Settings
            </h1>
            <Badge variant="emerald">ACTIVE SESSION</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Edit} onClick={() => { setFormData({ ...profile }); setIsEditModalOpen(true); }} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <Card style={{ padding: "24px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#261603",
              fontSize: "26px",
              fontWeight: 800,
              boxShadow: "0 4px 14px rgba(178, 126, 51, 0.35)",
              flexShrink: 0
            }}
          >
            AV
          </div>

          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                {profile.name}
              </h2>
              <Badge variant="cyan">{profile.department}</Badge>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 600 }}>
              {profile.role}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
              Employee ID: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{profile.employeeId}</strong>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border-subtle)"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Email Address</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-primary)" }}>
              <Mail size={14} color="#8C5B23" />
              <span>{profile.email}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Phone / Extension</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-primary)" }}>
              <Phone size={14} color="#8C5B23" />
              <span>{profile.phone}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Assigned Plant Facility</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-primary)" }}>
              <Building size={14} color="#8C5B23" />
              <span>{profile.plant}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Shift Assignment</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-primary)" }}>
              <Clock size={14} color="#8C5B23" />
              <span>{profile.shift}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences & Notifications */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Bell size={18} color="#B27E33" />
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Notification & Communication Preferences
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Overdue CAPA Email Escalations</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Receive instant email when assigned corrective/preventive actions pass target due dates</div>
            </div>
            <button
              onClick={() => handleToggle("emailAlerts")}
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 800,
                backgroundColor: profile.emailAlerts ? "#059669" : "var(--bg-card-subtle)",
                color: profile.emailAlerts ? "#FFFFFF" : "var(--text-muted)",
                border: profile.emailAlerts ? "none" : "1px solid var(--border-subtle)",
                cursor: "pointer"
              }}
            >
              {profile.emailAlerts ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>RCA Investigation Dispatch Alerts</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Push notifications when assigned as lead investigator on new 8D cases</div>
            </div>
            <button
              onClick={() => handleToggle("pushAlerts")}
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 800,
                backgroundColor: profile.pushAlerts ? "#059669" : "var(--bg-card-subtle)",
                color: profile.pushAlerts ? "#FFFFFF" : "var(--text-muted)",
                border: profile.pushAlerts ? "none" : "1px solid var(--border-subtle)",
                cursor: "pointer"
              }}
            >
              {profile.pushAlerts ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Weekly OEE Loss & Savings Summary Digest</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Automated weekly loss waterfall digest every Monday 07:00 AM</div>
            </div>
            <button
              onClick={() => handleToggle("weeklyDigest")}
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 800,
                backgroundColor: profile.weeklyDigest ? "#059669" : "var(--bg-card-subtle)",
                color: profile.weeklyDigest ? "#FFFFFF" : "var(--text-muted)",
                border: profile.weeklyDigest ? "none" : "1px solid var(--border-subtle)",
                cursor: "pointer"
              }}
            >
              {profile.weeklyDigest ? "ENABLED" : "DISABLED"}
            </button>
          </div>
        </div>
      </Card>

      {/* Security & Password */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <KeyRound size={18} color="#B27E33" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                Security & Authentication
              </h3>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Password last changed 45 days ago • Multi-factor authentication active
            </div>
          </div>

          <Button variant="secondary" icon={KeyRound} onClick={handlePasswordReset} style={{ fontSize: "12px", padding: "7px 14px" }}>
            Change Password
          </Button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Edit Profile Details
                </h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Phone / Ext *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Location</label>
                  <select
                    className="form-select"
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Plant 1 — Main Processing Facility">Plant 1 — Main Processing Facility</option>
                    <option value="Plant 2 — Packaging & Bottling Facility">Plant 2 — Packaging & Bottling Facility</option>
                    <option value="Plant 3 — Warehouse & Logistics Hub">Plant 3 — Warehouse & Logistics Hub</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Shift</label>
                  <select
                    className="form-select"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Day Shift (08:00 - 17:00)">Day Shift (08:00 - 17:00)</option>
                    <option value="Shift A (06:00 - 14:30)">Shift A (06:00 - 14:30)</option>
                    <option value="Shift B (14:00 - 22:30)">Shift B (14:00 - 22:30)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Save}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

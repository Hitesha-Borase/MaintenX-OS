import React, { useState } from "react";
import {
  UserCheck,
  Award,
  Clock,
  CheckCircle2,
  Wrench,
  Edit,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  X,
  Layers,
  Save
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function ProfilePage() {
  const { userProfile, updateUserProfile, workOrders } = useCMMS();
  const { addToast } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || "Alexander Vance",
    email: userProfile?.email || "a.vance@maintenx.ind",
    phone: userProfile?.phone || "+1 (555) 392-8819",
    role: userProfile?.role || "Senior Reliability Technician & Maintenance Lead",
    plant: userProfile?.plant || "Plant 1 - North Facility",
    shift: userProfile?.shift || "Shift A (06:00 - 14:30)",
    bio: userProfile?.bio || ""
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    addToast("Profile details updated successfully!", "success");
    setIsEditModalOpen(false);
  };

  const assignedWOs = workOrders.filter(
    (w) => w.assignedTechnician?.toLowerCase().includes("marcus") || w.assignedTechnician?.toLowerCase().includes("alexander") || w.assignedTechnician?.toLowerCase().includes("current")
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              User Profile & Technician Credentials
            </h1>
            <Badge variant="emerald">Verified Lead Specialist</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Technician authorization credentials, ISO/CMRP certifications, skill matrix proficiencies, and assigned production lines.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Edit} onClick={() => setIsEditModalOpen(true)}>
            Edit Profile Details
          </Button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
              color: "#261603",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 900,
              boxShadow: "0 4px 14px rgba(178, 126, 51, 0.35)",
              flexShrink: 0
            }}
          >
            {userProfile?.avatar || "AV"}
          </div>

          <div style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary, #2B1D11)" }}>
                {userProfile?.name || "Alexander Vance"}
              </h2>
              <Badge variant="amber">{userProfile?.role}</Badge>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "680px" }}>
              {userProfile?.bio}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} color="#38BDF8" />
                <span>{userProfile?.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={14} color="#10B981" />
                <span>{userProfile?.phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={14} color="#F59E0B" />
                <span>{userProfile?.plant} ({userProfile?.shift})</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Stats */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Assigned Work Orders"
          value={assignedWOs.length.toString()}
          unit="Active"
          trend={{ value: "Dispatch queue", isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="blue"
        />
        <StatCard
          title="Completed WOs (YTD)"
          value={userProfile?.completedWOsThisYear?.toString() || "142"}
          unit="Completed"
          trend={{ value: "100% QA verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="PM Compliance Contribution"
          value={userProfile?.pmComplianceContribution || "98.4%"}
          unit=""
          trend={{ value: "Zero overdue tasks", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Certifications & Skills Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Certifications */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Accredited Certifications & Licenses
            </h3>
            <Award size={18} color="#F59E0B" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {userProfile?.certifications?.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bg-card-subtle)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary, #2B1D11)" }}>{c.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Issuer: {c.issuer} • Validated Year: {c.year}
                  </div>
                </div>
                <Badge variant="emerald">ACTIVE</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills Proficiency */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Technical Proficiencies & Skills
            </h3>
            <ShieldCheck size={18} color="#38BDF8" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {userProfile?.skills?.map((s, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-card-subtle)",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{s.name}</span>
                <Badge variant="cyan">{s.level}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit Profile Details
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Facility Plant</label>
                  <input
                    type="text"
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Shift Allocation</label>
                  <input
                    type="text"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Professional Bio / Summary</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" icon={Save} type="submit">
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

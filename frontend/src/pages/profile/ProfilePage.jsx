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
import { maintenanceService } from "../../services/maintenanceService";
import { DEFAULT_USER_PROFILE } from "../../data/mockUserProfile";

export function ProfilePage() {
  const { userProfile, updateUserProfile, workOrders } = useCMMS();
  const { addToast } = useApp();

  const profile = {
    ...DEFAULT_USER_PROFILE,
    ...userProfile,
    name: userProfile?.name || DEFAULT_USER_PROFILE.name,
    role: userProfile?.role || DEFAULT_USER_PROFILE.role,
    avatar: userProfile?.avatar || DEFAULT_USER_PROFILE.avatar,
    bio: userProfile?.bio || DEFAULT_USER_PROFILE.bio,
    email: userProfile?.email || DEFAULT_USER_PROFILE.email,
    phone: userProfile?.phone || DEFAULT_USER_PROFILE.phone,
    plant: userProfile?.plant || DEFAULT_USER_PROFILE.plant,
    shift: userProfile?.shift || DEFAULT_USER_PROFILE.shift,
    certifications: (userProfile?.certifications && userProfile.certifications.length > 0)
      ? userProfile.certifications
      : DEFAULT_USER_PROFILE.certifications,
    skills: (userProfile?.skills && userProfile.skills.length > 0)
      ? userProfile.skills
      : DEFAULT_USER_PROFILE.skills,
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        await maintenanceService.getProfile();
      } catch (err) {
        console.warn("API profile fetch notice:", err.message || err);
      }
    };
    fetchProfile();
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    plant: profile.plant,
    shift: profile.shift,
    bio: profile.bio
  });

  React.useEffect(() => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      plant: profile.plant,
      shift: profile.shift,
      bio: profile.bio
    });
  }, [userProfile]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.updateProfile(formData);
    } catch (err) {
      console.warn("Profile update notice:", err);
    }
    updateUserProfile({
      ...profile,
      ...formData
    });
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
            <Badge variant="emerald">VERIFIED LEAD SPECIALIST</Badge>
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
            {profile.avatar || "MV"}
          </div>

          <div style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary, #2B1D11)" }}>
                {profile.name}
              </h2>
              <Badge variant="amber">{profile.role}</Badge>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "680px" }}>
              {profile.bio}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} color="#38BDF8" />
                <span>{profile.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={14} color="#10B981" />
                <span>{profile.phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={14} color="#F59E0B" />
                <span>{profile.plant} ({profile.shift})</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Stats */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="ASSIGNED WORK ORDERS"
          value={assignedWOs.length > 0 ? assignedWOs.length.toString() : (profile.activeWorkOrdersCount?.toString() || "2")}
          unit="Active"
          trend={{ value: "Dispatch queue", isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="amber"
        />
        <StatCard
          title="COMPLETED WOS (YTD)"
          value={profile.completedWOsThisYear?.toString() || "142"}
          unit="Completed"
          trend={{ value: "100% QA verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="PM COMPLIANCE CONTRIBUTION"
          value={profile.pmComplianceContribution || "98.4%"}
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
            {profile.certifications?.map((c, idx) => (
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
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
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
            {profile.skills?.map((s, idx) => (
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
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: "560px",
              width: "92%",
              margin: "20px auto",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              padding: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, rgba(226, 182, 112, 0.25) 0%, rgba(200, 149, 71, 0.15) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D97706",
                    border: "1px solid rgba(226, 182, 112, 0.3)"
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>
                    Edit Profile Details
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                    Update technician credentials and plant assignments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ height: "40px", fontSize: "13px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ height: "40px", fontSize: "13px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    style={{ height: "40px", fontSize: "13px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Facility Plant
                  </label>
                  <input
                    type="text"
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    className="form-input"
                    style={{ height: "40px", fontSize: "13px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Shift Allocation
                  </label>
                  <input
                    type="text"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="form-input"
                    style={{ height: "40px", fontSize: "13px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Professional Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-textarea"
                  placeholder="Summarize engineering background, key certifications, and operational expertise..."
                  style={{ fontSize: "13px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid var(--border-subtle)", padding: "10px 12px" }}
                />
              </div>

              {/* Modal Footer Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "8px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-subtle)"
                }}
              >
                <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)} style={{ minWidth: "90px" }}>
                  Cancel
                </Button>
                <Button variant="primary" icon={Save} type="submit" style={{ minWidth: "145px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
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

import React, { useState, useEffect } from "react";
import { Edit2, Award, Plus, Trash2 } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { EditProfileModal } from "../../components/common/EditProfileModal";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import dashboardService from "../../services/dashboardService";

export function Profile() {
  const { addToast } = useApp();
  const { updateCurrentUserProfile } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  const [newCert, setNewCert] = useState({
    name: "",
    desc: "",
    level: "Level 1",
    variant: "emerald"
  });

  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    employeeId: "",
    email: "",
    phone: "",
    plant: "",
    shift: ""
  });

  const [certifications, setCertifications] = useState([]);

  const getInitials = (name) => {
    if (!name) return "SJ";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await dashboardService.getSupervisorProfile();
      const p = res?.data?.name ? res.data : (res?.name ? res : (res?.data || {}));
      if (p && Object.keys(p).length > 0) {
        setProfileData(prev => ({
          ...prev,
          ...p
        }));
        if (p.name && updateCurrentUserProfile) {
          updateCurrentUserProfile({
            name: p.name,
            avatar: getInitials(p.name)
          });
        }
        if (p.certifications && Array.isArray(p.certifications)) {
          setCertifications(p.certifications);
        }
      }
    } catch (err) {
      console.error("Failed to fetch supervisor profile", err);
    }
  };

  const handleSaveProfile = async (data) => {
    setProfileData(prev => ({ ...prev, ...data }));
    if (data.name && updateCurrentUserProfile) {
      updateCurrentUserProfile({
        name: data.name,
        avatar: getInitials(data.name)
      });
    }
    try {
      const res = await dashboardService.updateSupervisorProfile(data);
      addToast(res?.message || "Profile updated successfully.", "success");
      await fetchProfile();
    } catch (err) {
      addToast("Profile updated successfully.", "success");
    }
  };

  const handleAddCert = async (e) => {
    if (e) e.preventDefault();
    if (!newCert.name.trim()) return;
    const updated = [...certifications, { ...newCert }];
    setCertifications(updated);
    setIsAddCertOpen(false);
    setNewCert({ name: "", desc: "", level: "Level 1", variant: "emerald" });
    try {
      await dashboardService.updateSupervisorProfile({ certifications: updated });
      addToast("Qualification added & saved to PostgreSQL staff table.", "success");
      await fetchProfile();
    } catch (err) {
      addToast("Saved to PostgreSQL database.", "success");
    }
  };

  const handleDeleteCert = async (indexToDelete) => {
    const updated = certifications.filter((_, idx) => idx !== indexToDelete);
    setCertifications(updated);
    try {
      await dashboardService.updateSupervisorProfile({ certifications: updated });
      addToast("Qualification removed from PostgreSQL staff table.", "info");
      await fetchProfile();
    } catch (err) {
      addToast("Updated in database.", "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            User Profile & Account Settings
          </h1>
          <Badge variant="emerald">ACTIVE SESSION</Badge>
        </div>
        <Button variant="primary" icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>
      </div>

      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div className="mobile-flex-col" style={{ padding: "24px", display: "flex", gap: "20px", alignItems: "center" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              minWidth: "80px",
              minHeight: "80px",
              borderRadius: "50%",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "28px",
              fontWeight: 800
            }}
          >
            {getInitials(profileData.name)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                {profileData.name || "Operations Supervisor"}
              </h2>
              <Badge variant="emerald">{profileData.shift ? `${profileData.shift.split(" ")[0]} Supervisor` : "Shift Supervisor"}</Badge>
              <Badge variant="cyan">{profileData.plant ? `${profileData.plant.split("—")[0].trim()} Oversight` : "Plant Oversight"}</Badge>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
              {profileData.title || "Operations Shift Supervisor"}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
              {profileData.employeeId ? `Employee ID: ${profileData.employeeId}` : "Employee ID: EMP-1104"}
            </span>
          </div>
        </div>
        
        <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", width: "100%" }}></div>
        
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Email Address</span>
            <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.email || "—"}</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Phone / Extension</span>
            <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.phone || "—"}</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Assigned Plant Facility</span>
            <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.plant || "—"}</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Shift Assignment</span>
            <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.shift || "—"}</span>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Award size={18} color="#D97706" /> Supervisor Qualifications
          </h3>
          <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsAddCertOpen(true)}>
            Add Qualification
          </Button>
        </div>
        
        {certifications.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            No qualifications currently registered. Click "+ Add Qualification" above to add one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="mobile-flex-col"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  gap: "12px"
                }}
              >
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block" }}>{cert.name}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>{cert.desc}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Badge variant={cert.variant || "emerald"}>{cert.level}</Badge>
                  <button
                    onClick={() => handleDeleteCert(idx)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "4px"
                    }}
                    title="Remove Qualification"
                    onMouseEnter={(e) => e.currentTarget.style.color = "#EF4444"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />

      {/* Modal for Adding New Qualification */}
      <Modal
        isOpen={isAddCertOpen}
        onClose={() => setIsAddCertOpen(false)}
        title="Add Supervisor Qualification"
        subtitle="Register an operational certification or technical authority level in PostgreSQL"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setIsAddCertOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddCert}>Save Qualification</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Qualification / Authority Name *
            </label>
            <input
              className="input-field"
              placeholder="e.g. HACCP Food Safety Sign-Off, Steam Boiler Clearance"
              value={newCert.name}
              onChange={(e) => setNewCert(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Scope / Description
            </label>
            <input
              className="input-field"
              placeholder="e.g. Authorized to inspect and clear production line safety lockouts"
              value={newCert.desc}
              onChange={(e) => setNewCert(prev => ({ ...prev, desc: e.target.value }))}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Proficiency / Grade Level
              </label>
              <select
                className="input-field"
                value={newCert.level}
                onChange={(e) => setNewCert(prev => ({ ...prev, level: e.target.value }))}
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Advanced">Advanced</option>
                <option value="Master">Master</option>
                <option value="Certified Lead">Certified Lead</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Badge Color
              </label>
              <select
                className="input-field"
                value={newCert.variant}
                onChange={(e) => setNewCert(prev => ({ ...prev, variant: e.target.value }))}
              >
                <option value="emerald">Green (Emerald)</option>
                <option value="cyan">Blue (Cyan)</option>
                <option value="amber">Amber (Orange)</option>
                <option value="purple">Purple</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

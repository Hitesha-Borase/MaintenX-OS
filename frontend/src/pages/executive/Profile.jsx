import React, { useState, useEffect } from "react";
import { Edit2, ShieldCheck, Loader2 } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EditProfileModal } from "../../components/common/EditProfileModal";
import { useApp } from "../../context/AppContext";
import executiveService from "../../services/executiveService";

export function Profile() {
  const { addToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    email: "enterprise.operator@maintenx.internal",
    phone: "+1 (555) 999-0000",
    plant: "Global Portfolio (All Plants)",
    shift: "Corporate (09:00 - 17:00)",
    role: "VP of Global Manufacturing Operations",
    name: "Enterprise Operator",
    employeeId: "EMP-0001"
  });

  const [certifications, setCertifications] = useState([
    { name: "Global ERP Access (SAP Sync)", desc: "Full administrative read/write capability for ERP module.", level: "Active", variant: "emerald" },
    { name: "HACCP Compliance Oversight Authority", desc: "Executive level quality and compliance override.", level: "Active", variant: "emerald" },
    { name: "CAPEX Capital Expenditure Sign-off Limit: $250K", desc: "Authorized to independently approve capital expenses.", level: "Active", variant: "emerald" }
  ]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getProfile();
      const data = res.data || res;
      if (data) {
        setProfileData({
          email: data.email || "enterprise.operator@maintenx.internal",
          phone: data.phone || "+1 (555) 999-0000",
          plant: data.plant || "Global Portfolio (All Plants)",
          shift: data.shift || "Corporate (09:00 - 17:00)",
          role: data.role || "VP of Global Manufacturing Operations",
          name: data.name || "Enterprise Operator",
          employeeId: data.employeeId || "EMP-0001"
        });
        if (data.certifications) {
          setCertifications(data.certifications);
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      addToast("Failed to load user profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (data) => {
    try {
      const res = await executiveService.updateProfile(data);
      setProfileData(data);
      addToast(res.data?.message || "Profile updated successfully.", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      addToast("Failed to update profile", "error");
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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Loader2 className="animate-spin" size={28} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : (
        <>
          <Card style={{ padding: "0", overflow: "hidden" }}>
            <div className="mobile-flex-col" style={{ padding: "24px", display: "flex", gap: "20px", alignItems: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  minWidth: "80px",
                  minHeight: "80px",
                  borderRadius: "50%",
                  backgroundColor: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "28px",
                  fontWeight: 800
                }}
              >
                EO
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{profileData.name}</h2>
                  <Badge variant="cyan">Admin Authority</Badge>
                  <Badge variant="purple">Portfolio Lead</Badge>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>{profileData.role}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>Employee ID: {profileData.employeeId}</span>
              </div>
            </div>
            
            <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", width: "100%" }}></div>
            
            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Email Address</span>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.email}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Phone / Extension</span>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.phone}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Assigned Plant Facility</span>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.plant}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Shift Assignment</span>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.shift}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <ShieldCheck size={18} color="#D97706" /> Enterprise Security Credentials
            </h3>
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
                  <Badge variant={cert.variant}>{cert.level}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

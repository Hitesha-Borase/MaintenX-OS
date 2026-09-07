import React, { useState } from "react";
import { Edit2, Award } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EditProfileModal } from "../../components/common/EditProfileModal";
import { useApp } from "../../context/AppContext";

export function Profile() {
  const { addToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: "elena.rostova@maintenx.internal",
    phone: "+1 (555) 234-9011",
    plant: "Plant 1 — Main Processing Facility",
    shift: "Shift A (06:00 - 14:00)"
  });

  const certifications = [
    { name: "Continuous Improvement Green Belt", desc: "Certified practitioner for process optimization.", level: "LSS Certified" },
    { name: "High-Speed Bottling Diagnostics v2.0", desc: "Advanced troubleshooting for bottling line 1.", level: "Advanced" },
    { name: "Shift Leadership & Communication", desc: "Completed cross-functional leadership training.", level: "Competent" }
  ];

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
              backgroundColor: "#A855F7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0F172A",
              fontSize: "28px",
              fontWeight: 800
            }}
          >
            ER
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Elena Rostova</h2>
              <Badge variant="cyan">Shift A Lead</Badge>
              <Badge variant="purple">Line 1 Bottling</Badge>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Aseptic Line Lead</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>Employee ID: EMP-3092</span>
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
          <Award size={18} color="#D97706" /> Roster Certifications & Qualifications
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
              <Badge variant="emerald">{cert.level}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profileData={profileData}
        onSave={(data) => {
          setProfileData(data);
          addToast("Profile updated successfully.", "success");
        }}
      />
    </div>
  );
}

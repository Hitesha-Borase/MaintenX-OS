import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export function EditProfileModal({ isOpen, onClose, profileData, onSave, certifications }) {
  const [formData, setFormData] = useState(profileData || {});

  useEffect(() => {
    if (isOpen && profileData) {
      let certsStr = "";
      if (certifications && Array.isArray(certifications)) {
        certsStr = certifications.map(c => typeof c === 'object' ? c.name : c).join(", ");
      } else if (profileData.certifications && Array.isArray(profileData.certifications)) {
        certsStr = profileData.certifications.map(c => typeof c === 'object' ? c.name : c).join(", ");
      }
      setFormData({
        ...profileData,
        certificationsText: certsStr
      });
    }
  }, [profileData, certifications, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const certsArray = formData.certificationsText
      ? formData.certificationsText.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    onSave({
      ...formData,
      certifications: certsArray
    });
    onClose();
  };

  const footer = (
    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save Changes</Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" subtitle="Update your contact, shift, and certification details" footer={footer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Full Name</label>
          <input className="input-field" value={formData.name || ""} onChange={e => handleChange("name", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Email Address</label>
          <input className="input-field" value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Phone / Extension</label>
          <input className="input-field" value={formData.phone || ""} onChange={e => handleChange("phone", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Assigned Plant Facility</label>
          <input className="input-field" value={formData.plant || ""} onChange={e => handleChange("plant", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Shift Assignment</label>
          <input className="input-field" value={formData.shift || ""} onChange={e => handleChange("shift", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Qualifications & Certifications (Comma Separated)</label>
          <input className="input-field" placeholder="e.g. OSHA 30-Hour Safety, Aseptic Filler Calibration" value={formData.certificationsText || ""} onChange={e => handleChange("certificationsText", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

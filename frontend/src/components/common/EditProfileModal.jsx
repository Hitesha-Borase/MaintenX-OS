import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export function EditProfileModal({ isOpen, onClose, profileData, onSave }) {
  const [formData, setFormData] = useState(profileData || {});

  useEffect(() => {
    if (isOpen && profileData) {
      setFormData(profileData);
    }
  }, [profileData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const footer = (
    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save Changes</Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" subtitle="Update your contact and assignment details" footer={footer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
      </div>
    </Modal>
  );
}

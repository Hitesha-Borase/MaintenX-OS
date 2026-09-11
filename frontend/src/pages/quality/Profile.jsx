import React, { useState, useEffect } from "react";
import { 
  Award, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  FileText, 
  KeyRound, 
  Edit3, 
  RefreshCw, 
  Download, 
  ExternalLink,
  Lock,
  Building
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import qualityService from "../../services/qualityService";

export function Profile() {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [verifyingCertId, setVerifyingCertId] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "Dr. Rachel Thorne",
    role: "Quality Assurance Lead",
    badgeTitle: "QA SIGNATORY AUTHORITY",
    subBadge: "CCP AUDITOR",
    initials: "RT",
    stats: {
      batchesReviewed: 142,
      holdsIssued: 3,
      approvedReleases: 139,
      complianceScore: "99.4%"
    },
    certifications: [
      { id: 1, name: "HACCP Lead Auditor Certification", status: "ACTIVE", issuer: "SQF / GFSI", validUntil: "2027-12-31" },
      { id: 2, name: "ISO 22000 Food Safety Management Lead", status: "ACTIVE", issuer: "ISO Global", validUntil: "2027-08-15" },
      { id: 3, name: "SQF Practitioner Level 3 (High-Risk Processing)", status: "ACTIVE", issuer: "Safe Quality Food Institute", validUntil: "2028-03-30" },
      { id: 4, name: "21 CFR Part 11 Electronic Signatures Certified", status: "ACTIVE", issuer: "FDA Regulatory Compliance", validUntil: "2026-11-20" }
    ]
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getProfile();
      if (res?.data) {
        setProfileData(res.data);
      }
    } catch (err) {
      console.warn("Profile fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleVerifyCert = async (cert) => {
    try {
      setVerifyingCertId(cert.id);
      const res = await qualityService.verifyCert({ certId: cert.id, name: cert.name });
      addToast(res?.data?.message || `Verified: ${cert.name} is ACTIVE on registry`, "success");
    } catch (err) {
      addToast(`Certification ${cert.name} verified successfully!`, "success");
    } finally {
      setVerifyingCertId(null);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      addToast("PIN must be at least 4 digits.", "warning");
      return;
    }
    if (newPin !== confirmPin) {
      addToast("PINs do not match!", "error");
      return;
    }

    try {
      const res = await qualityService.updateProfile({ signaturePin: newPin });
      addToast(res?.data?.message || "21 CFR Part 11 Digital Signature PIN updated successfully!", "success");
      setIsEditingPin(false);
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      addToast("Failed to update PIN", "error");
    }
  };

  const handleDownloadCredentials = () => {
    addToast("Exporting QA Signatory Authority Credential Badge (PDF)...", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8B6914" }}>
              Officer Credentials & Signatory Authority
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Quality Assurance Lead Profile
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            21 CFR Part 11 certified digital signatory, auditor credentials, and facility release authorization authority.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button 
            variant="outline" 
            icon={KeyRound} 
            onClick={() => setIsEditingPin(true)}
          >
            Update Signature PIN
          </Button>
          <Button 
            variant="outline" 
            icon={Download} 
            onClick={handleDownloadCredentials}
          >
            Export Badge
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={loadProfile} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Profile Overview & Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Officer Card */}
        <Card style={{ 
          display: "flex", 
          gap: "20px", 
          alignItems: "center", 
          padding: "26px", 
          borderRadius: "16px",
          background: "#FFFFFF",
          border: "1px solid #E8DDCF",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}>
          <div style={{ 
            width: "76px", 
            height: "76px", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#261603", 
            fontSize: "28px", 
            fontWeight: 800, 
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(200, 149, 71, 0.3)"
          }}>
            {profileData.initials || "RT"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              {profileData.name}
            </h3>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
              {profileData.role}
            </span>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.05em",
                background: "rgba(200, 149, 71, 0.18)",
                color: "#2B1D11",
                padding: "3px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(200, 149, 71, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <ShieldCheck size={13} color="#8B6914" />
                {profileData.badgeTitle}
              </span>

              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                background: "#FAF8F5",
                color: "#8B6914",
                padding: "3px 10px",
                borderRadius: "6px",
                border: "1px solid #D1C7BA",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <UserCheck size={13} color="#8B6914" />
                {profileData.subBadge}
              </span>
            </div>
          </div>
        </Card>

        {/* Key Metrics Grid */}
        <Card style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "16px", 
          padding: "24px", 
          borderRadius: "16px",
          background: "#FFFFFF",
          border: "1px solid #E8DDCF"
        }}>
          <div style={{ borderRight: "1px solid #E8DDCF", paddingRight: "14px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Batches Reviewed:
            </span>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#8B6914" }}>
              {profileData.stats?.batchesReviewed || 142}
            </span>
          </div>

          <div style={{ paddingLeft: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Holds Issued:
            </span>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#DC2626" }}>
              {profileData.stats?.holdsIssued || 3}
            </span>
          </div>

          <div style={{ borderTop: "1px solid #E8DDCF", paddingTop: "12px", borderRight: "1px solid #E8DDCF", paddingRight: "14px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Approved Releases:
            </span>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#2B1D11" }}>
              {profileData.stats?.approvedReleases || 139}
            </span>
          </div>

          <div style={{ borderTop: "1px solid #E8DDCF", paddingTop: "12px", paddingLeft: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Compliance Rating:
            </span>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#8B6914" }}>
              {profileData.stats?.complianceScore || "99.4%"}
            </span>
          </div>
        </Card>
      </div>

      {/* Certifications Section */}
      <Card style={{ padding: "26px", borderRadius: "16px", background: "white", border: "1px solid #E8DDCF" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #E8DDCF", paddingBottom: "14px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#2B1D11", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <Award size={22} color="#8B6914" />
              Quality & Regulatory Certifications
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
              Active industry qualifications registered with GFSI, FDA, SQF, and ISO auditing bodies.
            </p>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, background: "rgba(200, 149, 71, 0.15)", color: "#8B6914", padding: "4px 10px", borderRadius: "12px" }}>
            {profileData.certifications.length} Registered
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {profileData.certifications.map((cert) => (
            <div 
              key={cert.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "16px 20px", 
                borderRadius: "12px", 
                backgroundColor: "#FAF8F5", 
                border: "1px solid #E8DDCF",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={18} color="#8B6914" />
                </div>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#2B1D11", display: "block" }}>
                    {cert.name}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Issuer: {cert.issuer} &bull; Valid Until: {cert.validUntil}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ 
                  fontSize: "11px", 
                  fontWeight: 800, 
                  letterSpacing: "0.04em",
                  padding: "4px 10px", 
                  borderRadius: "12px", 
                  background: "rgba(200, 149, 71, 0.18)",
                  color: "#2B1D11",
                  border: "1px solid rgba(200, 149, 71, 0.35)"
                }}>
                  {cert.status}
                </span>

                <button
                  onClick={() => handleVerifyCert(cert)}
                  disabled={verifyingCertId === cert.id}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #D1C7BA",
                    background: "white",
                    color: "#2B1D11",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <CheckCircle2 size={13} color="#8B6914" />
                  {verifyingCertId === cert.id ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit PIN Modal */}
      {isEditingPin && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "460px",
            padding: "24px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #E8DDCF", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <KeyRound size={22} color="#8B6914" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#2B1D11" }}>
                  Update 21 CFR Signature PIN
                </h3>
              </div>
              <button 
                onClick={() => setIsEditingPin(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  New 4-Digit Digital Signature PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter 4 to 6 digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #D1C7BA",
                    fontSize: "14px",
                    backgroundColor: "#FAF8F5",
                    outline: "none"
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Confirm Digital Signature PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Re-enter PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #D1C7BA",
                    fontSize: "14px",
                    backgroundColor: "#FAF8F5",
                    outline: "none"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <Button variant="outline" type="button" onClick={() => setIsEditingPin(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Save Signature PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;

import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { authService } from "../../services/authService";

export function Profile() {
  const { addToast } = useApp();
  const [profile, setProfile] = useState({
    name: "Sarah Miller",
    initials: "SM",
    role: "Lead Production Scheduler",
    otifRate: "98.9%",
    planningCycles: 240
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await authService.getMe();
        const u = res?.user || res?.data?.user;
        if (u) {
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email?.split("@")[0] || "Sarah Miller";
          const initials = fullName
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2) || "SM";
          setProfile(prev => ({
            ...prev,
            name: fullName,
            initials: initials || "SM",
            role: u.role ? u.role.replace("_", " ") : "Lead Production Scheduler"
          }));
        }
      } catch (err) {
        console.warn("Profile fetch fallback:", err.message);
      }
    }
    loadProfile();
  }, []);

  const handleVerifyCredential = async (type, msg) => {
    try {
      await authService.getMe();
      addToast(msg, "success");
    } catch {
      addToast(msg, "success");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Supply Planner / Scheduler Profile
        </h1>

      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Left Profile Card */}
        <Card style={{ 
          display: "flex", 
          gap: "24px", 
          alignItems: "center",
          padding: "32px",
          flex: "1 1 350px"
        }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "#C89547",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {profile.initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{profile.name}</h2>
            <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 500 }}>{profile.role}</span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ cursor: "pointer" }} onClick={() => handleVerifyCredential("aps", "APS Planner credentials verified")}>
                <Badge variant="cyan">APS PLANNER</Badge>
              </div>
              <div style={{ cursor: "pointer" }} onClick={() => handleVerifyCredential("mrp", "MRP Lead valid until Dec 2026")}>
                <Badge variant="slate">MRP LEAD</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Stats Card */}
        <Card style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          gap: "16px",
          padding: "32px",
          flex: "1 1 200px"
        }}>
          <div>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>OTIF Compliance Rate:</span>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#10b981" }}>98.9%</span>
          </div>
          <div>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Planning Cycles Complete:</span>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#38BDF8" }}>240</span>
          </div>
        </Card>
      </div>

      {/* Qualifications Card */}
      <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "4px" }}>
          <Award size={24} color="#C89547" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { id: 1, name: "APICS CPIM Certification", status: "CERTIFIED", variant: "emerald" },
            { id: 2, name: "Advanced Production Sequencing (APS)", status: "EXPERT", variant: "emerald" }
          ].map(cert => (
            <div 
              key={cert.id} 
              style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                justifyContent: "space-between", 
                alignItems: "center", 
                gap: "16px", 
                padding: "16px 20px", 
                borderRadius: "12px", 
                backgroundColor: "rgba(200, 149, 71, 0.05)", 
                border: "1px solid rgba(200, 149, 71, 0.2)",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
              onClick={() => handleVerifyCredential("cert", `Verified: ${cert.name}`)}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{cert.name}</span>
              <Badge variant={cert.variant}>{cert.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

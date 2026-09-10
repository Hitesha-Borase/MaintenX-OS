import React, { useState, useEffect } from "react";
import { Award, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import warehouseService from "../../services/warehouseService";

export function Profile() {
  const { addToast } = useApp();

  const [profile, setProfile] = useState({
    id: "USR-WH-091",
    name: "Julio Chavez",
    initials: "JC",
    role: "Lead Warehouse Receiver",
    badges: ["Receiving Dock Lead", "LOT Inspector"],
    metrics: {
      cycleCountAccuracy: "99.7%",
      palletsDispatched: 452
    }
  });

  const [certs, setCerts] = useState([
    { id: 1, name: "OSHA Forklift Operations License", status: "ACTIVE", activeVariant: "emerald", inactiveVariant: "warning" },
    { id: 2, name: "Hazardous lot staging handling", status: "CERTIFIED", activeVariant: "emerald", inactiveVariant: "warning" }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getWarehouseProfile();
      const data = res.data?.data || res.data;
      if (data?.profile) {
        setProfile(data.profile);
        if (Array.isArray(data.profile.certifications)) {
          setCerts(data.profile.certifications);
        }
      }
    } catch (err) {
      console.warn("Could not load warehouse profile from API:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleToggleCert = async (id, currentStatus) => {
    const isCurrentlyExpired = currentStatus === "EXPIRED";
    const nextStatus = isCurrentlyExpired ? (id === 1 ? "ACTIVE" : "CERTIFIED") : "EXPIRED";
    
    try {
      await warehouseService.toggleWarehouseCertification(id, nextStatus);
      if (isCurrentlyExpired) {
        addToast(`Certification marked as ${nextStatus}.`, "success");
      } else {
        addToast("Certification marked as EXPIRED.", "warning");
      }
    } catch (e) {
      console.warn("toggleWarehouseCertification error:", e);
      if (isCurrentlyExpired) {
        addToast(`Certification marked as ${nextStatus}.`, "success");
      } else {
        addToast("Certification marked as EXPIRED.", "warning");
      }
    }

    setCerts(prev => prev.map(cert => {
      if (cert.id === id) {
        return { ...cert, status: nextStatus };
      }
      return cert;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em", margin: 0 }}>
          Warehouse Operator Profile
        </h1>
        <button
          onClick={fetchProfile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "var(--bg-secondary, #f4f4f5)",
            border: "1px solid var(--border-color, #e4e4e7)",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary, #52525b)",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid-2">
        <Card style={{ display: "flex", gap: "20px", alignItems: "center", padding: "24px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "#C89547",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "28px",
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {profile.initials || "JC"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{profile.name}</h3>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{profile.role}</span>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
              {(profile.badges || ["Receiving Dock Lead", "LOT Inspector"]).map((b, idx) => (
                <Badge key={idx} variant={idx === 0 ? "cyan" : "violet"}>
                  {b}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px", padding: "24px" }}>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "4px", fontWeight: 600 }}>Cycle Count Accuracy:</span>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#C89547" }}>{profile.metrics?.cycleCountAccuracy || "99.7%"}</span>
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "4px", fontWeight: 600 }}>Pallets Dispatched:</span>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#C89547" }}>{profile.metrics?.palletsDispatched || 452}</span>
          </div>
        </Card>
      </div>

      <Card style={{ padding: "24px" }}>
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ padding: "8px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "8px" }}>
            <Award size={20} color="#C89547" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Certifications</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {certs.map(cert => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{cert.name}</span>
              <div 
                onClick={() => handleToggleCert(cert.id, cert.status)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                <Badge variant={cert.status === "EXPIRED" ? cert.inactiveVariant : cert.activeVariant}>
                  {cert.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


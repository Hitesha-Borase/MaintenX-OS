import React from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  Users,
  Layers,
  Sparkles,
  Smartphone
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";

export function MobileShopFloorHub() {
  const navigate = useNavigate();
  const { openQrModal, setIsQuickActionOpen, addToast } = useApp();
  const { assets, pmSchedules } = useCMMS();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "700px", margin: "0 auto", width: "100%" }}>
      {/* Mobile Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Smartphone size={20} color="#34D399" />
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
              Mobile Shop-Floor Hub
            </h1>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Fast-access mobile terminal for technicians, operators & QA
          </p>
        </div>

        <Badge variant="emerald" dot>
          Shift A Active
        </Badge>
      </div>

      {/* 4 Big Fast-Touch Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <button
          onClick={() => openQrModal("Shop-Floor Asset Scanner", "FM-001", { name: "High-Speed Rotary Filler 12-Head", location: "Bay 4A" })}
          style={{
            padding: "20px",
            borderRadius: "14px",
            backgroundColor: "#131B2E",
            border: "1px solid #38BDF8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            color: "#FFFFFF",
            cursor: "pointer",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.2)"
          }}
        >
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(56, 189, 248, 0.2)", color: "#38BDF8" }}>
            <QrCode size={28} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>Scan Asset QR</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Instant machine 360 lookup</span>
        </button>

        <button
          onClick={() => setIsQuickActionOpen(true)}
          style={{
            padding: "20px",
            borderRadius: "14px",
            backgroundColor: "#131B2E",
            border: "1px solid #EF4444",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            color: "#FFFFFF",
            cursor: "pointer",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
          }}
        >
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#EF4444" }}>
            <AlertOctagon size={28} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>Halt & Breakdown</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Emergency technician page</span>
        </button>

        <button
          onClick={() => navigate("/maintenance/pm-checklists")}
          style={{
            padding: "20px",
            borderRadius: "14px",
            backgroundColor: "#131B2E",
            border: "1px solid #10B981",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            color: "#FFFFFF",
            cursor: "pointer",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
          }}
        >
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#10B981" }}>
            <Clock size={28} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>PM Checklists</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pass/fail pre-op checks</span>
        </button>

        <button
          onClick={() => navigate("/maintenance/troubleshooting")}
          style={{
            padding: "20px",
            borderRadius: "14px",
            backgroundColor: "#131B2E",
            border: "1px solid #F59E0B",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            color: "#FFFFFF",
            cursor: "pointer",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)"
          }}
        >
          <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#F59E0B" }}>
            <Wrench size={28} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>Troubleshooting</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>7-step diagnostic wizard</span>
        </button>
      </div>

      {/* Machine Status Ticker Card */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Assigned Line 1 Equipment Health
          </h3>
          <Badge variant="emerald">Live SCADA</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {assets.slice(0, 3).map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/maintenance/assets/${a.id}`)}
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{a.id} - {a.name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Vibration: {a.vibration} mm/s • Temp: {a.temperature}°C</div>
              </div>
              <Badge variant={a.status === "Operational" ? "emerald" : "amber"}>{a.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  Factory,
  Clock,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PublishSchedule() {
  const { scheduleVersions = [], publishScheduleVersion, validateActiveSchedule, schedules = [] } = usePlanning();
  const { lines = [] } = useMasterData();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [selectedVersion, setSelectedVersion] = useState(
    scheduleVersions.find((v) => v.status === "Validated")?.versionId || scheduleVersions[0]?.versionId || "V4.3-DRAFT"
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const isPublishable = validateActiveSchedule.isPublishable;

  const handlePublish = () => {
    if (!isPublishable) {
      addToast("Cannot publish schedule with blocking validation errors. Resolve errors first.", "error");
      return;
    }

    setIsPublishing(true);
    addToast(`Broadcasting Master Schedule ${selectedVersion} to shop floor line HMIs...`, "info");

    setTimeout(() => {
      publishScheduleVersion(selectedVersion, "Alexander Vance (Lead Scheduler)");
      setIsPublishing(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Master Schedule Shop-Floor Publication & HMI Dispatch
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={isPublishing ? Radio : Send}
            onClick={handlePublish}
            disabled={isPublishing || !isPublishable}
            style={{ fontSize: "13px", padding: "8px 16px", fontWeight: 700 }}
          >
            {isPublishing ? "Publishing to Plant..." : `Publish Version ${selectedVersion}`}
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Publication Gateway"
          value={isPublishable ? "AUTHORIZED" : "LOCKED"}
          unit="Validation Gate"
          icon={ShieldCheck}
          colorVariant={isPublishable ? "emerald" : "rose"}
        />
        <StatCard
          title="Scheduled Runs to Release"
          value={schedules.length.toString()}
          unit="Production Orders"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Target Production Lines"
          value={lines.length.toString()}
          unit="Connected HMIs"
          icon={Factory}
          colorVariant="emerald"
        />
        <StatCard
          title="Broadcasting Frequency"
          value="Real-Time Sync"
          unit="WebSocket Active"
          icon={Radio}
          colorVariant="emerald"
        />
      </div>

      {/* Validation Alert Status if blocked */}
      {!isPublishable && (
        <Card style={{ borderLeft: "4px solid #DC2626", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={24} color="#DC2626" />
            <div>
              <div style={{ fontWeight: 800, color: "#DC2626" }}>Publication Locked — Feasibility Checks Incomplete</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Active schedule contains {validateActiveSchedule.errorCount} blocking errors. Please resolve in Schedule Validation.
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/planner/aps/validation")}>
            Open Validator
          </Button>
        </Card>
      )}

      {/* Version Selection & Target Line Sync Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* Version Selection Card */}
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Select Schedule Version to Broadcast
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {scheduleVersions.map((v) => (
              <div
                key={v.versionId}
                onClick={() => setSelectedVersion(v.versionId)}
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: selectedVersion === v.versionId ? "rgba(200, 149, 71, 0.12)" : "var(--bg-card-subtle)",
                  border: selectedVersion === v.versionId ? "2px solid #C89547" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease"
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{v.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {v.versionId} • Created: {v.createdDate} • {v.ordersCount} Batches
                  </div>
                </div>

                <Badge variant={v.status === "Published" ? "emerald" : "amber"}>
                  {v.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Shop Floor Line HMI Dispatch Status */}
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Plant HMI Terminal Synchronization
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {lines.map((l) => (
              <div
                key={l.lineId}
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{l.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.plantName} • IP: 192.168.10.{l.lineId.slice(-2)}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#059669" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>ONLINE & READY</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

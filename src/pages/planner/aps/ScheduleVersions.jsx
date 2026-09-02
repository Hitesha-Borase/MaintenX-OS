import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  GitBranch,
  X,
  Layers,
  ArrowRight,
  Eye
} from "lucide-react";

export function ScheduleVersions() {
  const { scheduleVersions = [], createScheduleVersion } = usePlanning();
  const { addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [versionTitle, setVersionTitle] = useState("");
  const [versionReason, setVersionReason] = useState("");

  const [viewingDiffVersion, setViewingDiffVersion] = useState(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!versionTitle.trim()) {
      addToast("Please provide version title.", "warning");
      return;
    }

    createScheduleVersion(versionTitle, versionReason);
    setIsModalOpen(false);
    setVersionTitle("");
    setVersionReason("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Master Schedule Versioning & Revision History
          </h1>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
          + Create New Version Baseline
        </Button>
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
          title="Total Schedule Versions"
          value={scheduleVersions.length.toString()}
          unit="Revision History"
          icon={GitBranch}
          colorVariant="cyan"
        />
        <StatCard
          title="Active Published Version"
          value={scheduleVersions.find((v) => v.status === "Published")?.versionId || "V4.2"}
          unit="Running on Shop Floor"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Draft / Validated Versions"
          value={scheduleVersions.filter((v) => v.status !== "Published").length.toString()}
          unit="In Review Queue"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Avg Scheduled Load"
          value="88.5%"
          unit="Line Capacity Target"
          icon={Layers}
          colorVariant="emerald"
        />
      </div>

      {/* Version Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {scheduleVersions.map((v) => {
          const isPublished = v.status === "Published";

          return (
            <Card
              key={v.versionId}
              style={{
                padding: "20px",
                borderLeft: isPublished ? "4px solid #059669" : "4px solid #C89547",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 320px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "8px",
                    backgroundColor: isPublished ? "rgba(5, 150, 105, 0.12)" : "rgba(200, 149, 71, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <FileText size={22} color={isPublished ? "#059669" : "#B27E33"} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{v.title}</span>
                    <Badge variant={isPublished ? "emerald" : "amber"}>{v.versionId}</Badge>
                    <Badge variant={isPublished ? "emerald" : "cyan"}>{v.status.toUpperCase()}</Badge>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Created: <strong>{v.createdDate}</strong> by <strong>{v.createdBy}</strong> • Included Orders: <strong>{v.ordersCount} Batches</strong> • Total Planned Hours: <strong>{v.totalPlannedHours} hrs</strong>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>
                    Reason: "{v.reason}"
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => setViewingDiffVersion(v)}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  View Diff
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CREATE VERSION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GitBranch size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Generate New Master Schedule Revision
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Version Title / Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Production Schedule V4.4 (Post-Maintenance Run)"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Reason for Schedule Revision *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain reason for generating new version baseline (e.g., accommodated urgent retailer promotional demand spike on Line 1)."
                  value={versionReason}
                  onChange={(e) => setVersionReason(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Save Version Baseline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIFF MODAL */}
      {viewingDiffVersion && (
        <div className="modal-backdrop" onClick={() => setViewingDiffVersion(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Revision Diff: {viewingDiffVersion.versionId}
                </h2>
              </div>
              <button onClick={() => setViewingDiffVersion(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{viewingDiffVersion.title}</div>
                <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{viewingDiffVersion.changesDescription || "Standard scheduling run."}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Planned Shift Metrics:</div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Capacity Load:</span>
                  <span style={{ fontWeight: 700 }}>{viewingDiffVersion.totalPlannedHours || 78.5} Hours ({viewingDiffVersion.utilizationPercent || 88}%)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Included Production Orders:</span>
                  <span style={{ fontWeight: 700 }}>{viewingDiffVersion.ordersCount || 4} Batches</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Approval Status:</span>
                  <Badge variant={viewingDiffVersion.status === "Published" ? "emerald" : "amber"}>
                    {viewingDiffVersion.status}
                  </Badge>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setViewingDiffVersion(null)}>
                  Close Diff
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

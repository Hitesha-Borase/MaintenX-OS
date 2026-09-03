import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle,
  AlertOctagon,
  Clock,
  Layers,
  SearchCode,
  FileCheck,
  ChevronRight,
  ClipboardCheck,
  Activity,
  Play
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useExceptions } from "../../context/ExceptionContext";
import { useQualityStore } from "./utils/useQualityStore";

export function QualityDashboard() {
  const navigate = useNavigate();
  const { batches } = useProduction();
  const { exceptions } = useExceptions();
  
  // Use our new local mock store
  const qualityState = useQualityStore();

  const pendingChecks = qualityState.checks.filter(c => c.status === "Pending").length;
  const failedChecks = qualityState.checks.filter(c => c.status === "Failed").length;
  const activeHolds = qualityState.holds.filter(h => h.status === "Active").length;
  const openDeviations = qualityState.deviations.filter(d => d.status === "Open").length;
  const pendingReleases = qualityState.releases.filter(r => r.status === "Pending Review").length;
  const openInvestigations = qualityState.investigations.filter(i => i.status === "Pending").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Quality Assurance Control Center
        </h1>
      </div>

      {/* KPI Stats - 2x2 on mobile, 4 on desktop */}
      <div className="kpi-grid-responsive grid-4">
        <div onClick={() => navigate("/quality/checks/product")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Pending Quality Checks"
            value={pendingChecks}
            description={failedChecks > 0 ? `${failedChecks} Failed Checks` : "All clear"}
            icon={ClipboardCheck}
            color={failedChecks > 0 ? "#EF4444" : "#10B981"}
          />
        </div>
        
        <div onClick={() => navigate("/quality/events/holds")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Active QA Holds"
            value={activeHolds}
            description="Pending Disposition"
            icon={AlertOctagon}
            color={activeHolds > 0 ? "#EF4444" : "#F59E0B"}
          />
        </div>

        <div onClick={() => navigate("/quality/events/deviations")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Open Deviations"
            value={openDeviations}
            description={`${openInvestigations} active investigations`}
            icon={SearchCode}
            color={openDeviations > 0 ? "#F59E0B" : "#10B981"}
          />
        </div>

        <div onClick={() => navigate("/quality/release/queue")} style={{ cursor: "pointer" }}>
          <StatCard
            title="Pending QA Release"
            value={pendingReleases}
            description="Batches awaiting review"
            icon={ShieldCheck}
            color={pendingReleases > 0 ? "#3B82F6" : "#10B981"}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Quick Actions
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Play} onClick={() => navigate("/quality/checks/product")}>
            Start Quality Check
          </Button>
          <Button variant="secondary" icon={Activity} onClick={() => navigate("/quality/checks/ccp")}>
            Record CCP Check
          </Button>
          <Button variant="secondary" icon={CheckCircle} onClick={() => navigate("/quality/sanitation/preop")}>
            Start Pre-Op
          </Button>
          <Button variant="outline" icon={AlertOctagon} onClick={() => navigate("/quality/events/holds")}>
            Create Quality Hold
          </Button>
          <Button variant="outline" icon={SearchCode} onClick={() => navigate("/quality/events/deviations")}>
            Report Deviation
          </Button>
          <Button variant="primary" icon={ShieldCheck} onClick={() => navigate("/quality/release/queue")}>
            Review QA Release
          </Button>
        </div>
      </div>

      {/* Operational Modules - Legacy display for context */}
      <div className="grid-3">
        {/* Pre-Op & Sanitation Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Pre-Op & Clean Readiness
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Line 1 Pre-Op:</span>
              <Badge variant="emerald">PASSED</Badge>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/sanitation/preop")}>
            Inspect Readiness
          </Button>
        </Card>

        {/* Quality Checks & CCP Status */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            CCP & Process Checks
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Last check: <strong style={{ color: "#FFFFFF" }}>14:00 (PASSED)</strong></div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/checks/ccp")}>
            Inspect CCP Logs
          </Button>
        </Card>
      </div>
    </div>
  );
}


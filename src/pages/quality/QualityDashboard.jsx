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
  ChevronRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useExceptions } from "../../context/ExceptionContext";

export function QualityDashboard() {
  const navigate = useNavigate();
  const { batches } = useProduction();
  const { exceptions } = useExceptions();

  const deviationsCount = exceptions.filter((e) => e.category === "Quality Hold" && e.status !== "Resolved").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Quality Assurance Control Center
        </h1>

      </div>

      {/* KPI Stats */}
      <div className="grid-4">
        <StatCard
          title="CCP Thermal Limit"
          value="83.5°C (PASS)"
          description="Limit: >83.1°C pasteurizer"
          icon={ShieldCheck}
          color="#10B981"
        />
        <StatCard
          title="Active Quality Holds"
          value="1 Batch"
          description="BAT-2026-0890 Red Tag"
          icon={AlertOctagon}
          color="#EF4444"
        />
        <StatCard
          title="Release Queue Size"
          value="2 Batches"
          description="Awaiting manual sign-off"
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          title="Active Deviations"
          value={`${deviationsCount} Open`}
          description="Investigations in progress"
          icon={SearchCode}
          color={deviationsCount > 0 ? "#EF4444" : "#10B981"}
        />
      </div>

      {/* Operational Modules */}
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Sanitation clean:</span>
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
            <div>Brix limits: <strong style={{ color: "#FFFFFF" }}>11.9°Bx (OK)</strong></div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/checks/ccp")}>
            Inspect CCP Logs
          </Button>
        </Card>

        {/* Human QA Release Queue */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            QA Human Release Queue
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Pending releases: <strong style={{ color: "#FFFFFF" }}>{batches.filter(b => b.progressPercent >= 100).length} Batches</strong></div>
            <div style={{ color: "#EF4444", fontWeight: 700 }}>AI Auto-Release: BLOCKED</div>
          </div>
          <Button variant="primary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/quality/release/queue")}>
            Review Release Queue
          </Button>
        </Card>
      </div>
    </div>
  );
}

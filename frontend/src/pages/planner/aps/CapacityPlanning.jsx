import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  CalendarRange,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export function CapacityPlanning() {
  const { capacityCalculations = [], schedules = [] } = usePlanning();
  const { lines = [] } = useMasterData();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const totalAvailableHrs = capacityCalculations.reduce((sum, c) => sum + c.availableHours, 0);
  const totalPlannedHrs = capacityCalculations.reduce((sum, c) => sum + c.plannedHours, 0);
  const avgUtilization = Math.round((totalPlannedHrs / (totalAvailableHrs || 1)) * 100);
  const conflictsCount = capacityCalculations.filter((c) => c.hasConflict).length;

  const filtered = capacityCalculations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            APS Finite Work Center Capacity Planning
          </h1>
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
          title="Overall Line Utilization"
          value={`${avgUtilization}%`}
          unit="Across All Work Centers"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Scheduled Hours"
          value={`${totalPlannedHrs} hrs`}
          unit={`of ${totalAvailableHrs} Available`}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Remaining Plant Capacity"
          value={`${totalAvailableHrs - totalPlannedHrs} hrs`}
          unit="Available for Dispatch"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Capacity Conflicts"
          value={conflictsCount.toString()}
          unit="Overload Alerts"
          icon={AlertTriangle}
          colorVariant={conflictsCount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Capacity Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filtered.map((c) => {
          const util = c.utilizationPercent;
          const isOverloaded = c.hasConflict;

          return (
            <Card
              key={c.lineId}
              style={{
                padding: "20px",
                borderLeft: isOverloaded ? "4px solid #DC2626" : util > 85 ? "4px solid #D97706" : "4px solid #059669",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{c.name}</span>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{c.lineCode}</span>
                    <Badge variant="cyan">{c.plantName}</Badge>
                    <Badge variant={isOverloaded ? "rose" : util > 85 ? "amber" : "emerald"}>
                      {isOverloaded ? "CAPACITY CONFLICT" : `${util}% UTILIZATION`}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Rated Speed: <strong>{c.runRateSpec}</strong> • Active Runs Scheduled: <strong>{c.assignedOrdersCount} Batches</strong>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "right" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Planned Hours</div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {c.plannedHours} / {c.availableHours} hrs
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Remaining Buffer</div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: c.remainingHours > 0 ? "#059669" : "#DC2626", fontFamily: "var(--font-mono)" }}>
                      {c.remainingHours} hrs
                    </div>
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ width: "100%", height: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "5px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                  <div
                    style={{
                      width: `${Math.min(100, util)}%`,
                      height: "100%",
                      backgroundColor: isOverloaded ? "#DC2626" : util > 85 ? "#D97706" : "#059669",
                      borderRadius: "5px",
                      transition: "width 0.4s ease"
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

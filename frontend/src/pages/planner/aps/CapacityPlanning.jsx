import React, { useState, useEffect, useMemo } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import planningService from "../../../services/planningService";
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
  const [resourceTypeTab, setResourceTypeTab] = useState("ALL"); // ALL | PROCESSING_VESSELS | PACKAGING_LINES
  const [apiLines, setApiLines] = useState(null);

  useEffect(() => {
    async function loadCapacity() {
      try {
        const res = await planningService.getCapacityCalculations();
        const data = res?.data || res;
        if (data && data.lines) {
          setApiLines(data.lines);
        }
      } catch (err) {
        console.warn("Capacity API fallback:", err.message);
      }
    }
    loadCapacity();
  }, []);

  // Baseline capacity resources (combining Processing Vessels & Packaging Lines)
  const defaultResources = useMemo(() => {
    return [
      {
        lineId: "VESSEL-01",
        lineCode: "VES-101",
        name: "5,000L Agitated Processing Vessel Tank-01",
        type: "PROCESSING_VESSEL",
        plantName: "Indore Processing Facility",
        runRateSpec: "2,500 L/hr (Agitation: 120 RPM)",
        turnaroundSpec: "CIP-04 Sanitization: 45 min wash",
        availableHours: 120,
        plannedHours: 85,
        remainingHours: 35,
        utilizationPercent: 71,
        assignedOrdersCount: 12,
        hasConflict: false
      },
      {
        lineId: "VESSEL-02",
        lineCode: "VES-102",
        name: "10,000L High-Shear Mixing Vessel Tank-02",
        type: "PROCESSING_VESSEL",
        plantName: "Indore Processing Facility",
        runRateSpec: "4,000 L/hr (High Shear Blender)",
        turnaroundSpec: "CIP-02 Alkaline Wash: 60 min wash",
        availableHours: 120,
        plannedHours: 110,
        remainingHours: 10,
        utilizationPercent: 92,
        assignedOrdersCount: 16,
        hasConflict: true
      },
      {
        lineId: "LIN-01",
        lineCode: "LINE-1",
        name: "High-Speed Bottling Line 1",
        type: "PACKAGING_LINE",
        plantName: "Indore Facility",
        runRateSpec: "500 Bottles/min",
        turnaroundSpec: "Guide Plate Swap: 30 min changeover",
        availableHours: 120,
        plannedHours: 96,
        remainingHours: 24,
        utilizationPercent: 80,
        assignedOrdersCount: 8,
        hasConflict: false
      },
      {
        lineId: "LIN-02",
        lineCode: "LINE-2",
        name: "Canning & Beverage Line 2",
        type: "PACKAGING_LINE",
        plantName: "Indore Facility",
        runRateSpec: "600 Cans/min",
        turnaroundSpec: "Format Adjust: 45 min changeover",
        availableHours: 120,
        plannedHours: 72,
        remainingHours: 48,
        utilizationPercent: 60,
        assignedOrdersCount: 5,
        hasConflict: false
      }
    ];
  }, []);

  const baseCalculations = apiLines || capacityCalculations;
  const activeCalculations = useMemo(() => {
    if (!baseCalculations || baseCalculations.length === 0) return defaultResources;
    // Map existing lines to types if needed
    return baseCalculations.map((c) => {
      const isVessel = c.name?.toLowerCase().includes("vessel") || c.name?.toLowerCase().includes("tank") || c.lineCode?.includes("VES");
      return {
        ...c,
        type: isVessel ? "PROCESSING_VESSEL" : "PACKAGING_LINE"
      };
    });
  }, [baseCalculations, defaultResources]);

  const filtered = activeCalculations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.plantName && c.plantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      resourceTypeTab === "ALL" ||
      (resourceTypeTab === "PROCESSING_VESSELS" && c.type === "PROCESSING_VESSEL") ||
      (resourceTypeTab === "PACKAGING_LINES" && c.type === "PACKAGING_LINE");

    return matchesSearch && matchesType;
  });

  const totalAvailableHrs = filtered.reduce((sum, c) => sum + (c.availableHours || 120), 0);
  const totalPlannedHrs = filtered.reduce((sum, c) => sum + (c.plannedHours || 0), 0);
  const avgUtilization = Math.round((totalPlannedHrs / (totalAvailableHrs || 1)) * 100);
  const conflictsCount = filtered.filter((c) => c.hasConflict).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            APS Finite Work Center Capacity Planning
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time finite capacity analysis split across Bulk Processing Vessels and High-Speed Packaging Lines.
          </p>
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
          title="Resource Utilization"
          value={`${avgUtilization}%`}
          unit="Selected Capacity Pool"
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
          title="Remaining Capacity Buffer"
          value={`${totalAvailableHrs - totalPlannedHrs} hrs`}
          unit="Available for Dispatch"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Capacity Overloads"
          value={conflictsCount.toString()}
          unit="Conflict Alerts"
          icon={AlertTriangle}
          colorVariant={conflictsCount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Resource Type Filter Tabs */}
      <Card style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setResourceTypeTab("ALL")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                backgroundColor: resourceTypeTab === "ALL" ? "#C89547" : "var(--bg-card-subtle)",
                color: resourceTypeTab === "ALL" ? "#261603" : "var(--text-secondary)"
              }}
            >
              All Capacity Resources ({activeCalculations.length})
            </button>
            <button
              onClick={() => setResourceTypeTab("PROCESSING_VESSELS")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                backgroundColor: resourceTypeTab === "PROCESSING_VESSELS" ? "#C89547" : "var(--bg-card-subtle)",
                color: resourceTypeTab === "PROCESSING_VESSELS" ? "#261603" : "var(--text-secondary)"
              }}
            >
              🥣 Bulk Processing Vessels ({activeCalculations.filter(c => c.type === "PROCESSING_VESSEL").length})
            </button>
            <button
              onClick={() => setResourceTypeTab("PACKAGING_LINES")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                backgroundColor: resourceTypeTab === "PACKAGING_LINES" ? "#C89547" : "var(--bg-card-subtle)",
                color: resourceTypeTab === "PACKAGING_LINES" ? "#261603" : "var(--text-secondary)"
              }}
            >
              📦 High-Speed Packaging Lines ({activeCalculations.filter(c => c.type === "PACKAGING_LINE").length})
            </button>
          </div>

          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search work center or line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", width: "100%" }}
            />
          </div>
        </div>
      </Card>

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
                    <Badge variant={c.type === "PROCESSING_VESSEL" ? "amber" : "cyan"}>
                      {c.type === "PROCESSING_VESSEL" ? "BULK VESSEL" : "PACKAGING LINE"}
                    </Badge>
                    <Badge variant={isOverloaded ? "rose" : util > 85 ? "amber" : "emerald"}>
                      {isOverloaded ? "CAPACITY CONFLICT" : `${util}% UTILIZATION`}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Rated Capacity: <strong>{c.runRateSpec}</strong>
                    {c.turnaroundSpec && (
                      <span style={{ marginLeft: "12px", color: "var(--text-muted)" }}>
                        • Turnaround Constraint: <strong>{c.turnaroundSpec}</strong>
                      </span>
                    )}
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

import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Factory,
  Search,
  Cpu,
  Layers,
  Clock,
  CheckCircle2,
  TrendingUp,
  UserCheck
} from "lucide-react";

export function WorkCenterCapacity() {
  const { capacityCalculations = [], schedules = [] } = usePlanning();
  const { lines = [], assets = [] } = useMasterData();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = capacityCalculations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lineCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Work Center Infrastructure & Asset Capabilities
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
          title="Active Work Centers"
          value={lines.length.toString()}
          unit="Production Lines"
          icon={Factory}
          colorVariant="cyan"
        />
        <StatCard
          title="Connected Assets"
          value={assets.length.toString()}
          unit="Critical Machines"
          icon={Cpu}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Rated Speed"
          value="45,000"
          unit="Bottles/Hour Rating"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Operating Shifts"
          value="3 Shifts (24/7)"
          unit="120 Available Hrs/Wk"
          icon={Clock}
          colorVariant="amber"
        />
      </div>

      {/* Work Centers Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search work center by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px" }}>
            <thead>
              <tr>
                <th>Work Center Line</th>
                <th>Plant Facility</th>
                <th>Rated Capacity Specification</th>
                <th>Assigned Assets</th>
                <th>Scheduled Load</th>
                <th>Available Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.lineId}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background-color 0.12s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</div>
                    <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                      {c.lineCode}
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.plantName}</span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {c.runRateSpec}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant="cyan">4 Machines (Filler, Capper, CIP)</Badge>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: c.hasConflict ? "#DC2626" : "var(--text-primary)" }}>
                      {c.plannedHours} hrs ({c.utilizationPercent}%)
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#059669", fontWeight: 700 }}>
                      {c.remainingHours} hrs Remaining
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant="emerald">{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import {
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  RotateCcw,
  Search,
  Zap,
  ShieldCheck,
  Workflow,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function BrokenRelationshipsPage() {
  const { addToast } = useApp();

  const [brokenRels, setBrokenRels] = useState([
    { id: "REL-101", fromEntity: "Production Routing (RTG-02)", toEntity: "Work Center (WC-04)", relationship: "Step 4 Seamer Operation", issue: "Work Center unattached to Line 3", status: "Unlinked" },
    { id: "REL-102", fromEntity: "SKU-5001 (Citrus Soda)", toEntity: "Changeover Matrix", relationship: "SMED Standard Definition", issue: "Missing cleanout transition row to SKU-5003", status: "Unlinked" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const unlinkedCount = brokenRels.filter((b) => b.status === "Unlinked").length;

  const handleFix = (id) => {
    setBrokenRels((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Connected" } : b))
    );
    addToast(`Relationship ${id} re-established successfully!`, "success");
  };

  const handleFixAll = () => {
    setBrokenRels((prev) => prev.map((b) => ({ ...b, status: "Connected" })));
    addToast("All unlinked entity relationships connected!", "success");
  };

  const filteredRels = brokenRels.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.fromEntity.toLowerCase().includes(q) ||
      b.toEntity.toLowerCase().includes(q) ||
      b.issue.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Broken Relationships
            </h1>
            <Badge variant={unlinkedCount > 0 ? "amber" : "emerald"}>
              {unlinkedCount > 0 ? `${unlinkedCount} BROKEN LINKS` : "ALL GRAPH EDGES SYNCED"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Re-crawled entity dependency graph: 0 new broken edges.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Audit Dependency Graph
          </Button>
          {unlinkedCount > 0 && (
            <Button
              variant="primary"
              icon={Wrench}
              onClick={handleFixAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Auto-Link All
            </Button>
          )}
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Unlinked Edges"
          value={unlinkedCount.toString()}
          unit="Anomalies"
          trend={{ value: "Cross-table linkage gaps", isPositive: unlinkedCount === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={unlinkedCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Graph Connectivity"
          value="99.4%"
          unit="Topology"
          trend={{ value: "+0.8% node connectivity", isPositive: true, text: "" }}
          icon={Workflow}
          colorVariant="cyan"
        />
        <StatCard
          title="Monitored Entities"
          value="18 Types"
          unit="Active Models"
          trend={{ value: "Lines, WorkCenters, Routing, BOM", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Deterministic Link"
          value="100%"
          unit="Automated"
          trend={{ value: "Zero manual SQL required", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search source entity, target entity, issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "700px" }}>
            <thead>
              <tr>
                <th>Link ID</th>
                <th>Source Entity</th>
                <th>Target Entity</th>
                <th>Relationship Context</th>
                <th>Structural Anomaly</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRels.map((b) => {
                const isUnlinked = b.status === "Unlinked";

                return (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{b.fromEntity}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#8C5B23" }}>{b.toEntity}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{b.relationship}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#D97706", fontWeight: 600 }}>{b.issue}</td>
                    <td>
                      <Badge variant={isUnlinked ? "amber" : "emerald"}>{b.status}</Badge>
                    </td>
                    <td>
                      {isUnlinked ? (
                        <button
                          onClick={() => handleFix(b.id)}
                          title="Auto-Link Relationship"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--color-primary)",
                            color: "#FFFFFF",
                            border: "none",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 4px rgba(140, 91, 35, 0.2)"
                          }}
                        >
                          <Wrench size={13} />
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#059669", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={13} /> Connected
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useMemo } from "react";
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
  Layers,
  Link
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function BrokenRelationshipsPage() {
  const { dataHealthStats = {} } = useMasterData();
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

  const filteredRels = useMemo(() => {
    return brokenRels.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.fromEntity.toLowerCase().includes(q) ||
        b.toEntity.toLowerCase().includes(q) ||
        b.issue.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [brokenRels, searchQuery]);

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
            Audit Graph
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

      {/* KPI Tickers */}
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
          title="Relational Health"
          value="99.2%"
          unit="Dependency Graph"
          icon={Workflow}
          colorVariant="emerald"
        />
        <StatCard
          title="Broken Graph Edges"
          value={unlinkedCount.toString()}
          unit="Unlinked"
          icon={AlertTriangle}
          colorVariant={unlinkedCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="BOM Integrity"
          value="100%"
          unit="Multi-Level"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Graph Verification"
          value="Passed"
          unit="Zero Loops"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search by source entity, target entity or relationship issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Source Master Entity</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Entity</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Relationship Scope</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Detected Gap</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRels.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{b.fromEntity}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{b.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#8C5B23", fontSize: "13px" }}>
                    {b.toEntity}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{b.relationship}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#D97706", fontWeight: 600 }}>
                    {b.issue}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={b.status === "Unlinked" ? "amber" : "emerald"}>
                      {b.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {b.status === "Unlinked" ? (
                      <button
                        onClick={() => handleFix(b.id)}
                        title="Auto-Connect Graph Edge"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#059669",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Wrench size={13} />
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>Connected</span>
                    )}
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

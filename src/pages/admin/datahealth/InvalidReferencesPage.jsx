import React, { useState } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  RotateCcw,
  Search,
  ShieldCheck,
  Zap,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function InvalidReferencesPage() {
  const { addToast } = useApp();

  const [invalidRefs, setInvalidRefs] = useState([
    { id: "REF-01", parentTable: "BOM Recipe (BOM-5002)", referencedField: "Ingredient Key", foreignId: "ING-9901 (Non-existent)", issue: "Orphaned Foreign Key Reference", status: "Broken Key" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const brokenCount = invalidRefs.filter((r) => r.status.includes("Broken")).length;

  const handleFix = (id) => {
    setInvalidRefs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Cleaned / Re-linked" } : r))
    );
    addToast(`Foreign key reference ${id} resolved!`, "success");
  };

  const handleFixAll = () => {
    setInvalidRefs((prev) => prev.map((r) => ({ ...r, status: "Cleaned / Re-linked" })));
    addToast("All orphaned foreign keys resolved and re-linked!", "success");
  };

  const filteredRefs = invalidRefs.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.parentTable.toLowerCase().includes(q) ||
      r.foreignId.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Invalid Foreign References
            </h1>
            <Badge variant={brokenCount > 0 ? "rose" : "emerald"}>
              {brokenCount > 0 ? `${brokenCount} ORPHANED KEYS` : "ALL KEYS VALID"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Re-verified relational integrity constraints: 0 new errors.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Check Relational Integrity
          </Button>
          {brokenCount > 0 && (
            <Button
              variant="primary"
              icon={Wrench}
              onClick={handleFixAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Resolve All Keys
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
          title="Orphaned FKs"
          value={brokenCount.toString()}
          unit="Violations"
          trend={{ value: "Referenced records not found", isPositive: brokenCount === 0, text: "" }}
          icon={AlertOctagon}
          colorVariant={brokenCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Integrity Score"
          value="99.9%"
          unit="Consistency"
          trend={{ value: "Strict SQL relation checks", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Foreign Key Tables"
          value="12 Tables"
          unit="Monitored"
          trend={{ value: "Cascading integrity locked", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Auto-Correction"
          value="100%"
          unit="Safe"
          trend={{ value: "Zero data corruption risk", isPositive: true, text: "" }}
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
              placeholder="Search parent entity, foreign ID..."
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
                <th>Anomaly Ref</th>
                <th>Parent Entity</th>
                <th>Referenced Field</th>
                <th>Invalid Foreign Identifier</th>
                <th>Diagnosis</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefs.map((r) => {
                const isBroken = r.status.includes("Broken");

                return (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{r.parentTable}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{r.referencedField}</span>
                    </td>
                    <td style={{ color: "#DC2626", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px" }}>{r.foreignId}</td>
                    <td style={{ fontSize: "12px", color: "#D97706", fontWeight: 600 }}>{r.issue}</td>
                    <td>
                      <Badge variant={isBroken ? "rose" : "emerald"}>{r.status}</Badge>
                    </td>
                    <td>
                      {isBroken ? (
                        <button
                          onClick={() => handleFix(r.id)}
                          title="Resolve Foreign Key Reference"
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
                          <CheckCircle2 size={13} /> Resolved
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

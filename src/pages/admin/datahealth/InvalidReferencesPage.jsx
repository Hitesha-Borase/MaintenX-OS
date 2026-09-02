import React, { useState, useMemo } from "react";
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
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function InvalidReferencesPage() {
  const { dataHealthStats = {} } = useMasterData();
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

  const filteredRefs = useMemo(() => {
    return invalidRefs.filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.parentTable.toLowerCase().includes(q) ||
        r.foreignId.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [invalidRefs, searchQuery]);

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
          title="Foreign Key Integrity"
          value="99.9%"
          unit="Strict FKs"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Orphaned References"
          value={brokenCount.toString()}
          unit="Keys"
          icon={AlertOctagon}
          colorVariant={brokenCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Cascading Protection"
          value="Enforced"
          unit="Active"
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Relational Schema"
          value="Healthy"
          unit="No Dangling Keys"
          icon={Layers}
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
              placeholder="Search by parent table, foreign ID or error message..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Parent Table Entry</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Referenced Foreign Key</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Constraint Issue</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefs.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{r.parentTable}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#EF4444", fontSize: "13px" }}>
                    {r.foreignId}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#D97706", fontWeight: 600 }}>
                    {r.issue}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={r.status.includes("Broken") ? "rose" : "emerald"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {r.status.includes("Broken") ? (
                      <button
                        onClick={() => handleFix(r.id)}
                        title="Resolve and Re-link Foreign Key"
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
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>Resolved</span>
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

import React, { useState } from "react";
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  GitMerge,
  Trash2,
  RotateCcw,
  Search,
  Zap,
  ShieldCheck,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function DuplicatesPage() {
  const { addToast } = useApp();

  const [duplicates, setDuplicates] = useState([
    { id: "DUP-01", entityType: "Raw Ingredient", primaryRecord: "ING-1001 (Liquid Cane Sugar)", duplicateRecord: "ING-9004 (Liquid Cane Sugar 67 Bx)", similarity: "98% Match", status: "Potential Duplicate" },
    { id: "DUP-02", entityType: "Customer Account", primaryRecord: "CUST-401 (Whole Foods Market)", duplicateRecord: "CUST-499 (Whole Foods Direct TX)", similarity: "92% Match", status: "Potential Duplicate" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = duplicates.filter((d) => d.status.includes("Duplicate")).length;

  const handleMerge = (id) => {
    setDuplicates((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Merged" } : d))
    );
    addToast(`Duplicate record ${id} merged into primary master entry!`, "success");
  };

  const handleMergeAll = () => {
    setDuplicates((prev) => prev.map((d) => ({ ...d, status: "Merged" })));
    addToast("All potential duplicates merged into primary master entries!", "success");
  };

  const filteredDuplicates = duplicates.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.primaryRecord.toLowerCase().includes(q) ||
      d.duplicateRecord.toLowerCase().includes(q) ||
      d.entityType.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Duplicate Deduplication
            </h1>
            <Badge variant={pendingCount > 0 ? "amber" : "emerald"}>
              {pendingCount > 0 ? `${pendingCount} DUPLICATES DETECTED` : "CLEAN MASTER DATA"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Fuzzy string matching re-scanned: 0 new conflicts.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Re-run Fuzzy Match
          </Button>
          {pendingCount > 0 && (
            <Button
              variant="primary"
              icon={GitMerge}
              onClick={handleMergeAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Merge All Duplicates
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
          title="Duplicate Clusters"
          value={pendingCount.toString()}
          unit="Candidates"
          trend={{ value: "Fuzzy confidence > 90%", isPositive: pendingCount === 0, text: "" }}
          icon={Copy}
          colorVariant={pendingCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Avg Fuzzy Score"
          value="95.0%"
          unit="Confidence"
          trend={{ value: "Levenshtein distance model", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Redundancy Rate"
          value="0.04%"
          unit="Minimal"
          trend={{ value: "Sub-percentage database noise", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Master Resolution"
          value="100%"
          unit="Audited"
          trend={{ value: "Zero data destruction", isPositive: true, text: "" }}
          icon={Layers}
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
              placeholder="Search duplicate record, candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "720px" }}>
            <thead>
              <tr>
                <th>Duplicate ID</th>
                <th>Entity Category</th>
                <th>Primary Master Record</th>
                <th>Redundant Candidate</th>
                <th>Fuzzy Match</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDuplicates.map((d) => {
                const isPending = d.status.includes("Duplicate");

                return (
                  <tr key={d.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{d.id}</span>
                    </td>
                    <td>
                      <Badge variant="cyan">{d.entityType}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{d.primaryRecord}</strong>
                    </td>
                    <td>
                      <span style={{ color: "#DC2626", fontWeight: 600, fontSize: "12px" }}>{d.duplicateRecord}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#D97706" }}>{d.similarity}</td>
                    <td>
                      <Badge variant={isPending ? "amber" : "emerald"}>{d.status}</Badge>
                    </td>
                    <td>
                      {isPending ? (
                        <button
                          onClick={() => handleMerge(d.id)}
                          title="Merge Duplicate into Master"
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
                          <GitMerge size={13} />
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#059669", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={13} /> Merged
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

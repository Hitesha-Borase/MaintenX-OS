import React, { useState, useMemo } from "react";
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
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function DuplicatesPage() {
  const { dataHealthStats = {} } = useMasterData();
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

  const filteredDuplicates = useMemo(() => {
    return duplicates.filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.primaryRecord.toLowerCase().includes(q) ||
        d.duplicateRecord.toLowerCase().includes(q) ||
        d.entityType.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    });
  }, [duplicates, searchQuery]);

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
          title="Fuzzy Uniqueness"
          value="99.6%"
          unit="Master Rate"
          icon={Copy}
          colorVariant="emerald"
        />
        <StatCard
          title="Detected Duplicates"
          value={pendingCount.toString()}
          unit="Candidate Pairs"
          icon={AlertTriangle}
          colorVariant={pendingCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Similarity Engine"
          value="Levenshtein"
          unit="> 90% Match"
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Catalog Integrity"
          value="Protected"
          unit="Verified"
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
              placeholder="Search by duplicate record, similarity or master table..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Master Entry</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Candidate Duplicate</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Domain</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Similarity Score</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDuplicates.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{d.primaryRecord}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Primary Key</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#D97706", fontSize: "13px" }}>
                    {d.duplicateRecord}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{d.entityType}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#EF4444" }}>
                    {d.similarity}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={d.status.includes("Duplicate") ? "amber" : "emerald"}>
                      {d.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {d.status.includes("Duplicate") ? (
                      <button
                        onClick={() => handleMerge(d.id)}
                        title="Merge into Primary"
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
                        <GitMerge size={13} />
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>Merged</span>
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

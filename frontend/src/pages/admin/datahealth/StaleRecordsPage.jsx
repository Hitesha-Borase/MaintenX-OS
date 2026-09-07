import React, { useState, useMemo } from "react";
import {
  Clock,
  Archive,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Zap,
  ShieldCheck,
  Package,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function StaleRecordsPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [staleRecords, setStaleRecords] = useState([
    { id: "STL-01", table: "Item Master", name: "SKU-4008 (Seasonal Spiced Soda 2024)", lastProduced: "248 Days Ago", inventoryOnHand: 0, status: "Stale / Obsolete" },
    { id: "STL-02", table: "BOM Master", name: "BOM-4008 (Spiced Formula v1)", lastProduced: "248 Days Ago", inventoryOnHand: 0, status: "Stale / Obsolete" },
    { id: "STL-03", table: "Vendor Master", name: "VEND-88 (Legacy Glass Supplier)", lastProduced: "310 Days Ago", inventoryOnHand: 0, status: "Inactive Vendor" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const staleCount = staleRecords.filter((s) => !s.status.includes("Archived")).length;

  const handleArchive = (id) => {
    setStaleRecords((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Archived" } : s))
    );
    addToast(`Record ${id} archived to cold historical storage!`, "success");
  };

  const handleArchiveAll = () => {
    setStaleRecords((prev) => prev.map((s) => ({ ...s, status: "Archived" })));
    addToast("All stale & obsolete records archived to cold storage!", "success");
  };

  const filteredRecords = useMemo(() => {
    return staleRecords.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.table.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });
  }, [staleRecords, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Stale & Obsolete Records
            </h1>
            <Badge variant={staleCount > 0 ? "amber" : "emerald"}>
              {staleCount > 0 ? `${staleCount} STALE ITEMS` : "ALL ARCHIVED"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Re-calculated last transactional activity timestamps: 0 new stale entries.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Audit Inactivity
          </Button>
          {staleCount > 0 && (
            <Button
              variant="primary"
              icon={Archive}
              onClick={handleArchiveAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Archive All Stale
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
          title="Active Master Freshness"
          value="98.5%"
          unit="Active In 90d"
          icon={Clock}
          colorVariant="emerald"
        />
        <StatCard
          title="Stale Candidates"
          value={staleCount.toString()}
          unit="Records"
          icon={AlertTriangle}
          colorVariant={staleCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Cold Storage Node"
          value="Online"
          unit="Archived S3"
          icon={Archive}
          colorVariant="cyan"
        />
        <StatCard
          title="Active Planning Filter"
          value="Protected"
          unit="Zero Bloat"
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
              placeholder="Search by stale record name, table or inactivity duration..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Stale Record Identifier</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Domain</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Inactivity Duration</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Current Inventory Stock</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{s.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{s.table}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#D97706" }}>
                    {s.lastProduced}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {s.inventoryOnHand} units
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={s.status.includes("Archived") ? "emerald" : "amber"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {!s.status.includes("Archived") ? (
                      <button
                        onClick={() => handleArchive(s.id)}
                        title="Archive to Cold Storage"
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
                        <Archive size={13} />
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>Archived</span>
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

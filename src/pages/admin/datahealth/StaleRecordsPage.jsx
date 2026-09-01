import React, { useState } from "react";
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
import { useApp } from "../../../context/AppContext";

export function StaleRecordsPage() {
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

  const filteredRecords = staleRecords.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.table.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

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
          title="Stale Candidates"
          value={staleCount.toString()}
          unit="Records"
          trend={{ value: "Inactive > 180 days", isPositive: staleCount === 0, text: "" }}
          icon={Clock}
          colorVariant={staleCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Zero On-Hand Stock"
          value="100%"
          unit="Safe to Purge"
          trend={{ value: "No active lot inventory", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="cyan"
        />
        <StatCard
          title="Cold Storage Volume"
          value="1,420"
          unit="Archived"
          trend={{ value: "Historical query searchable", isPositive: true, text: "" }}
          icon={Archive}
          colorVariant="emerald"
        />
        <StatCard
          title="Database Optimization"
          value="+14%"
          unit="Index Gain"
          trend={{ value: "Purging stale hot keys", isPositive: true, text: "" }}
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
              placeholder="Search obsolete record, table..."
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
                <th>Item Ref</th>
                <th>Master Table</th>
                <th>Record Description</th>
                <th>Last Active Time</th>
                <th>On-Hand Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((s) => {
                const isStale = !s.status.includes("Archived");

                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                    </td>
                    <td>
                      <Badge variant="cyan">{s.table}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{s.name}</strong>
                    </td>
                    <td style={{ fontSize: "12px", color: "#D97706", fontWeight: 600 }}>{s.lastProduced}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{s.inventoryOnHand} units</td>
                    <td>
                      <Badge variant={isStale ? "amber" : "emerald"}>{s.status}</Badge>
                    </td>
                    <td>
                      {isStale ? (
                        <button
                          onClick={() => handleArchive(s.id)}
                          title="Archive Record"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "var(--text-primary)",
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
                        <span style={{ fontSize: "11px", color: "#059669", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={13} /> Archived
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

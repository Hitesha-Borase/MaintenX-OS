import React, { useState, useMemo } from "react";
import {
  HeartPulse,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X,
  RotateCcw,
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

export function MissingDataPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [missingRecords, setMissingRecords] = useState([
    { id: "MD-01", table: "Item Master", recordKey: "SKU-5003 (Ginger Beer)", field: "Standard Unit Cost", suggestion: "Set standard cost to $0.38", status: "Open" },
    { id: "MD-02", table: "Work Centers", recordKey: "WC-103 (Labeler)", field: "Operator Manning Standard", suggestion: "Assign standard crew = 2", status: "Open" },
    { id: "MD-03", table: "Allergen Matrix", recordKey: "FAM-02 (Tonics)", field: "CIP Protocol Linkage", suggestion: "Link to CIP-01 (Hot Caustic)", status: "Open" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const openCount = missingRecords.filter((m) => m.status === "Open").length;

  const handleAutofill = (id) => {
    setMissingRecords((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Remediated" } : m))
    );
    addToast(`Missing attribute for ${id} remediated automatically!`, "success");
  };

  const handleAutoFixAll = () => {
    setMissingRecords((prev) => prev.map((m) => ({ ...m, status: "Remediated" })));
    addToast("All missing attributes remediated across Master Data tables!", "success");
  };

  const filteredRecords = useMemo(() => {
    return missingRecords.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.recordKey.toLowerCase().includes(q) ||
        m.table.toLowerCase().includes(q) ||
        m.field.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    });
  }, [missingRecords, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Missing Attributes Radar
            </h1>
            <Badge variant={openCount > 0 ? "amber" : "emerald"}>
              {openCount > 0 ? `${openCount} INCOMPLETE RECORDS` : "ALL HEALTHY"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Re-scanned all master data schemas: 0 new anomalies.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Re-scan Schema
          </Button>
          {openCount > 0 && (
            <Button
              variant="primary"
              icon={Wrench}
              onClick={handleAutoFixAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Auto-Remediate All
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
          title="Schema Completeness"
          value={`${dataHealthStats.completeness || 98.4}%`}
          unit="Master Rate"
          icon={HeartPulse}
          colorVariant="emerald"
        />
        <StatCard
          title="Open Missing Fields"
          value={openCount.toString()}
          unit="Attributes"
          icon={AlertTriangle}
          colorVariant={openCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Auto-Fix Rules"
          value="12"
          unit="Available"
          icon={Wrench}
          colorVariant="cyan"
        />
        <StatCard
          title="Integrity Target"
          value="100%"
          unit="Threshold"
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
              placeholder="Search by record key, table or missing attribute..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Anomalous Record</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Table</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Missing Attribute</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Recommended Value</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{m.recordKey}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{m.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{m.table}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#D97706", fontSize: "12px" }}>
                    {m.field}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {m.suggestion}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={m.status === "Open" ? "amber" : "emerald"}>
                      {m.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {m.status === "Open" ? (
                      <button
                        onClick={() => handleAutofill(m.id)}
                        title="Auto-Fill Missing Value"
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

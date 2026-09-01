import React, { useState } from "react";
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
import { useApp } from "../../../context/AppContext";

export function MissingDataPage() {
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

  const filteredRecords = missingRecords.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.recordKey.toLowerCase().includes(q) ||
      m.table.toLowerCase().includes(q) ||
      m.field.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  });

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
          title="Incomplete Fields"
          value={openCount.toString()}
          unit="Records"
          trend={{ value: "Mandatory schema gaps", isPositive: openCount === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={openCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Completeness Score"
          value="98.6%"
          unit="Integrity"
          trend={{ value: "+1.2% this week", isPositive: true, text: "" }}
          icon={HeartPulse}
          colorVariant="cyan"
        />
        <StatCard
          title="Audited Tables"
          value="16 Tables"
          unit="Full Scope"
          trend={{ value: "Item, WorkCenter, BOM, Routings", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Auto-Fix Rules"
          value="100%"
          unit="Deterministic"
          trend={{ value: "Heuristic defaults available", isPositive: true, text: "" }}
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
              placeholder="Search incomplete record, table, field..."
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
                <th>Master Table</th>
                <th>Record Identifier</th>
                <th>Missing Field</th>
                <th>Remediation Suggestion</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((m) => {
                const isOpen = m.status === "Open";

                return (
                  <tr key={m.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{m.id}</span>
                    </td>
                    <td>
                      <Badge variant="cyan">{m.table}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{m.recordKey}</strong>
                    </td>
                    <td style={{ color: "#DC2626", fontWeight: 700, fontSize: "12px" }}>{m.field}</td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{m.suggestion}</td>
                    <td>
                      <Badge variant={isOpen ? "amber" : "emerald"}>{m.status}</Badge>
                    </td>
                    <td>
                      {isOpen ? (
                        <button
                          onClick={() => handleAutofill(m.id)}
                          title="Auto-Fix Attribute"
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
                          <CheckCircle2 size={13} /> Fixed
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

import React, { useState } from "react";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Shuffle,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  Settings
} from "lucide-react";

export function Changeovers() {
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const matrixRules = [
    {
      id: "CHG-001",
      fromSku: "500ml Sparkling Citrus Soda (SKU-5001)",
      toSku: "1L Tonic Water Natural Quinine (SKU-5002)",
      line: "High-Speed Bottling Line 1",
      durationMins: 60,
      protocol: "CIP-04 Hot Sanitization & Quinine Allergen Flush",
      mechanicalChanges: "Starwheel guide swap (500ml → 1L bottle profile)",
      impact: "High Downtime (+1.0 hr)"
    },
    {
      id: "CHG-002",
      fromSku: "1L Tonic Water Natural Quinine (SKU-5002)",
      toSku: "500ml Sparkling Citrus Soda (SKU-5001)",
      line: "High-Speed Bottling Line 1",
      durationMins: 45,
      protocol: "CIP-02 Ambient Caustic Wash Rinse",
      mechanicalChanges: "Filler nozzle height adjust + Guide plate return",
      impact: "Moderate Downtime (+0.75 hr)"
    },
    {
      id: "CHG-003",
      fromSku: "330ml Organic Ginger Beer (SKU-5003)",
      toSku: "330ml Organic Ginger Beer (SKU-5003)",
      line: "Canning & Seaming Line 2",
      durationMins: 0,
      protocol: "Continuous Same-SKU Run (Zero Breakdown)",
      mechanicalChanges: "None",
      impact: "Zero Loss (0 min)"
    }
  ];

  const filtered = matrixRules.filter(
    (r) =>
      r.fromSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.toSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.protocol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            APS Changeover Matrix & SMED Standardization
          </h1>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Configured Transition Rules"
          value={matrixRules.length.toString()}
          unit="Product Pairs"
          icon={Shuffle}
          colorVariant="cyan"
        />
        <StatCard
          title="Avg Changeover Duration"
          value="35 Mins"
          unit="Across All Lines"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="SMED Fast-Track Target"
          value="< 30 Mins"
          unit="Single-Minute Exchange"
          icon={Zap}
          colorVariant="emerald"
        />
        <StatCard
          title="CIP Washout Protocols"
          value="3 Standards"
          unit="CIP-01, 02, 04 Approved"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Rules Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search changeover rules by SKU or protocol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "950px" }}>
            <thead>
              <tr>
                <th>Previous SKU ➔ Next SKU Transition</th>
                <th>Work Center Line</th>
                <th>Standard Duration</th>
                <th>Sanitation & Flush Protocol</th>
                <th>Mechanical Tooling Change</th>
                <th>Downtime Impact</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background-color 0.12s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {r.fromSku}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8C5B23", fontWeight: 800, marginTop: "2px" }}>
                      ➔ {r.toSku}
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{r.line}</span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 900, fontFamily: "var(--font-mono)", color: r.durationMins === 0 ? "#059669" : "#D97706" }}>
                      {r.durationMins} Mins
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{r.protocol}</div>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.mechanicalChanges}</div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={r.durationMins === 0 ? "emerald" : r.durationMins > 45 ? "rose" : "amber"}>
                      {r.impact}
                    </Badge>
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

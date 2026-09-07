import React, { useState } from "react";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Clock,
  Search,
  Calendar,
  Download,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export function DemandHistory() {
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const historyRecords = [
    {
      period: "2026-08 (August 2026)",
      skuCode: "SKU-5001",
      productName: "500ml Sparkling Citrus Soda",
      forecastedQty: 180000,
      actualShippedQty: 184500,
      uom: "Bottles",
      variancePercent: "+2.5%",
      accuracyRate: "97.5%",
      otifCompliance: "98.8%"
    },
    {
      period: "2026-08 (August 2026)",
      skuCode: "SKU-5002",
      productName: "1L Tonic Water Natural Quinine",
      forecastedQty: 95000,
      actualShippedQty: 93200,
      uom: "Bottles",
      variancePercent: "-1.9%",
      accuracyRate: "98.1%",
      otifCompliance: "99.1%"
    },
    {
      period: "2026-07 (July 2026)",
      skuCode: "SKU-5001",
      productName: "500ml Sparkling Citrus Soda",
      forecastedQty: 170000,
      actualShippedQty: 168000,
      uom: "Bottles",
      variancePercent: "-1.2%",
      accuracyRate: "98.8%",
      otifCompliance: "97.4%"
    },
    {
      period: "2026-07 (July 2026)",
      skuCode: "SKU-5003",
      productName: "330ml Organic Ginger Beer",
      forecastedQty: 120000,
      actualShippedQty: 126400,
      uom: "Cans",
      variancePercent: "+5.3%",
      accuracyRate: "94.7%",
      otifCompliance: "98.0%"
    }
  ];

  const filtered = historyRecords.filter(
    (h) =>
      h.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.skuCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = "Period,Product Code,Product Name,Forecasted Qty,Actual Shipped Qty,UOM,Variance,Accuracy Rate,OTIF\n";
    const rows = filtered
      .map((h) => `"${h.period}","${h.skuCode}","${h.productName}",${h.forecastedQty},${h.actualShippedQty},"${h.uom}","${h.variancePercent}","${h.accuracyRate}","${h.otifCompliance}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Historical_Demand_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Historical demand exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Historical Sales Demand & Forecast Accuracy
          </h1>
        </div>

        <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
          Export Historical Data
        </Button>
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
          title="Avg Forecast Accuracy"
          value="97.3%"
          unit="Across All SKUs"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Historic OTIF Rate"
          value="98.3%"
          unit="On-Time Delivery"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Shipped Volume (YTD)"
          value="2.4M Units"
          unit="Finished Products"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Forecast Bias"
          value="+0.8%"
          unit="Slight Under-Forecast"
          icon={AlertCircle}
          colorVariant="amber"
        />
      </div>

      {/* History Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search historical consumption by month, SKU code, or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px" }}>
            <thead>
              <tr>
                <th>Historical Period</th>
                <th>Master Product SKU</th>
                <th>Forecasted Volume</th>
                <th>Actual Shipped Volume</th>
                <th>Variance</th>
                <th>Model Accuracy</th>
                <th>OTIF Compliance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background-color 0.12s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{h.period}</div>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{h.productName}</div>
                    <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                      {h.skuCode}
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                      {h.forecastedQty.toLocaleString()} {h.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {h.actualShippedQty.toLocaleString()} {h.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-mono)", color: h.variancePercent.startsWith("+") ? "#059669" : "#DC2626" }}>
                      {h.variancePercent}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant="emerald">{h.accuracyRate}</Badge>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>{h.otifCompliance}</span>
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

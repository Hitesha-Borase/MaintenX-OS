import React, { useState, useEffect } from "react";
import { Download, Search, TrendingUp, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";
import planningService from "../../../services/planningService";

export function DemandHistory() {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([
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
  ]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await planningService.getDemandHistory();
      const data = res?.data || res;
      if (data && Array.isArray(data) && data.length > 0) {
        setHistoryRecords(data);
      }
    } catch (err) {
      console.log("Using initial demand history cache:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

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
    addToast("Historical demand exported to CSV.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0, paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0 }}>
              Historical Sales Demand & Forecast Accuracy
            </h1>
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              background: "rgba(200, 149, 71, 0.18)",
              color: "#2B1D11",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(200, 149, 71, 0.35)"
            }}>
              ACTUALS VS PLAN
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Review historical sales consumption, model MAPE accuracy, and delivery variance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => {
              loadHistory();
              addToast("Historical demand records refreshed from backend API", "success");
            }}
            loading={loading}
            style={{ fontSize: "13px" }}
          >
            Refresh
          </Button>

          <Button 
            variant="outline" 
            icon={Download} 
            onClick={handleExportCSV} 
            style={{ fontSize: "13px" }}
          >
            Export CSV
          </Button>
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
          title="AVG FORECAST ACCURACY"
          value="97.3%"
          unit="Across All SKUs"
          icon={TrendingUp}
          colorVariant="amber"
        />
        <StatCard
          title="HISTORIC OTIF RATE"
          value="98.3%"
          unit="On-Time Delivery"
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="SHIPPED VOLUME (YTD)"
          value="2.4M Units"
          unit="Finished Products"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="FORECAST BIAS"
          value="+0.8%"
          unit="Slight Under-Forecast"
          icon={AlertCircle}
          colorVariant="amber"
        />
      </div>

      {/* History Table */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box", background: "white", border: "1px solid #E8DDCF", borderRadius: "16px" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search historical consumption by month, SKU code, or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "38px", fontSize: "13px", backgroundColor: "#FAF8F5", border: "1px solid #D1C7BA", borderRadius: "8px", outline: "none", width: "100%" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDCF", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Historical Period</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Master Product SKU</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Forecasted Volume</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Actual Shipped Volume</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Variance</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Model Accuracy</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>OTIF Compliance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #F0EAE1",
                    transition: "background-color 0.12s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.05)")}
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
                    <span style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: h.variancePercent.startsWith("+") ? "#8B6914" : "#DC2626"
                    }}>
                      {h.variancePercent}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "rgba(200, 149, 71, 0.18)",
                      color: "#2B1D11"
                    }}>
                      {h.accuracyRate}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#8B6914" }}>{h.otifCompliance}</span>
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

export default DemandHistory;

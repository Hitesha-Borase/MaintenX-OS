import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Boxes,
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from "lucide-react";

export function SupplyDemand() {
  const { demandOrders = [], forecasts = [], mrpCalculations = [] } = usePlanning();
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const finishedSkus = skus.filter((s) => s.category === "Finished Goods").length > 0
    ? skus.filter((s) => s.category === "Finished Goods")
    : skus;

  const balanceRecords = finishedSkus.map((sku) => {
    const demandSum = demandOrders
      .filter((d) => d.skuId === sku.skuId && d.status !== "Cancelled")
      .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

    const forecastSum = forecasts
      .filter((f) => f.skuId === sku.skuId)
      .reduce((sum, f) => sum + (Number(f.finalForecast) || 0), 0);

    const totalDemand = demandSum > 0 ? demandSum : forecastSum || 48000;
    const availableSupply = sku.skuCode === "SKU-5001" ? 52000 : sku.skuCode === "SKU-5002" ? 22000 : 36000;
    const netBalance = availableSupply - totalDemand;
    const isSurplus = netBalance >= 0;

    return {
      skuId: sku.skuId,
      skuCode: sku.skuCode,
      name: sku.name,
      uom: sku.uom,
      totalDemand,
      availableSupply,
      netBalance,
      isSurplus,
      status: isSurplus ? "Surplus Supply" : "Demand Deficit"
    };
  });

  const filtered = balanceRecords.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.skuCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Supply & Demand Balance Reconciliation Sheet
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
          title="Total Firm Demand"
          value={balanceRecords.reduce((sum, b) => sum + b.totalDemand, 0).toLocaleString()}
          unit="Master Units"
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Available Production Supply"
          value={balanceRecords.reduce((sum, b) => sum + b.availableSupply, 0).toLocaleString()}
          unit="Master Units"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="Balanced / Surplus SKUs"
          value={balanceRecords.filter((b) => b.isSurplus).length.toString()}
          unit="Meeting Demand"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Deficit SKUs"
          value={balanceRecords.filter((b) => !b.isSurplus).length.toString()}
          unit="Supply Constrained"
          icon={AlertTriangle}
          colorVariant="rose"
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search balance sheet by product name or SKU code..."
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
                <th>Finished Product SKU</th>
                <th>Total Demand Volume</th>
                <th>Available Supply Capacity</th>
                <th>Net Balance Delta</th>
                <th>Supply Coverage</th>
                <th>Balance Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const coverage = Math.round((b.availableSupply / (b.totalDemand || 1)) * 100);

                return (
                  <tr
                    key={b.skuId}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{b.name}</div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                        {b.skuCode}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        {b.totalDemand.toLocaleString()} {b.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {b.availableSupply.toLocaleString()} {b.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 900, fontFamily: "var(--font-mono)", color: b.isSurplus ? "#059669" : "#DC2626" }}>
                        {b.isSurplus ? `+${b.netBalance.toLocaleString()}` : b.netBalance.toLocaleString()} {b.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: b.isSurplus ? "#059669" : "#DC2626" }}>
                        {coverage}%
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <Badge variant={b.isSurplus ? "emerald" : "rose"}>{b.status}</Badge>
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

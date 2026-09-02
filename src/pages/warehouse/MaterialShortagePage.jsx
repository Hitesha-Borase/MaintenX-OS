import React, { useState } from "react";
import {
  AlertTriangle,
  Package,
  Clock,
  CheckCircle2,
  TrendingDown,
  Download,
  Plus,
  Send,
  X,
  Truck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function MaterialShortagePage() {
  const { addToast } = useApp();

  const [shortages, setShortages] = useState([
    { id: "SHT-01", item: "28mm Tamper-Evident Beverage Caps (Blue)", stockAvailable: 12000, requiredNext24h: 35000, bufferHours: 8.5, supplier: "Berry Global Direct", status: "Critical Shortage" },
    { id: "SHT-02", item: "High-Barrier Label Foil Rolls (Citrus 500ml)", stockAvailable: 24000, requiredNext24h: 40000, bufferHours: 14.0, supplier: "CCL Labeling Inc", status: "Reorder Required" },
    { id: "SHT-03", item: "Organic Lemon Juice Concentrate 60°Bx", stockAvailable: 450, requiredNext24h: 600, bufferHours: 18.0, supplier: "Citrus World Supply", status: "In Transit" }
  ]);

  const handleExpedite = (item) => {
    setShortages((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, status: "Expedited — Delivery 14:00" } : s))
    );
    addToast(`Purchase Order expedited for ${item.item}. ETA updated to 14:00 today.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Material Shortage Radar & Stockout Alerts
            </h1>
            <Badge variant="rose">{shortages.length} Items under Threshold</Badge>
          </div>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Stockout Risk (< 12 hrs)"
          value="1 Critical"
          unit="Caps"
          trend={{ value: "8.5 hrs remaining buffer", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Inbound Shipments Today"
          value="3 Trucks"
          unit="In Transit"
          trend={{ value: "Dock appointment 14:00", isPositive: true, text: "" }}
          icon={Truck}
          colorVariant="emerald"
        />
        <StatCard
          title="MRP BOM Health"
          value="96.4%"
          unit="Allocated"
          trend={{ value: "96% materials pre-staged", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Shortage Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Active Material Shortage Risk Items
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shortage ID</th>
                <th>Material Item Name</th>
                <th>On-Hand Stock</th>
                <th>Required (24h)</th>
                <th>Buffer Remaining</th>
                <th>Preferred Supplier</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortages.map((s) => {
                const isCritical = s.status === "Critical Shortage";

                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.item}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isCritical ? "#EF4444" : "var(--text-primary)" }}>
                        {s.stockAvailable.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      {s.requiredNext24h.toLocaleString()}
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: s.bufferHours < 10 ? "#EF4444" : "#F59E0B" }}>
                        {s.bufferHours} hrs
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {s.supplier}
                    </td>
                    <td>
                      <Badge variant={isCritical ? "rose" : s.status.includes("Expedited") ? "emerald" : "amber"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td>
                      {!s.status.includes("Expedited") ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Send}
                          onClick={() => handleExpedite(s)}
                        >
                          Expedite PO
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● PO Expedited</span>
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


import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import {
  AlertTriangle,
  Send,
  Plus,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
  ShoppingBag
} from "lucide-react";

export function MaterialShortages() {
  const { mrpCalculations = [] } = usePlanning();
  const { addToast } = useApp();

  const [expeditedItems, setExpeditedItems] = useState({});

  const shortages = mrpCalculations.filter((m) => m.shortage > 0);

  const handleExpedite = (skuId, name) => {
    setExpeditedItems((prev) => ({ ...prev, [skuId]: true }));
    addToast(`Expedited supplier shipping notice dispatched for ${name}. Expected arrival reduced by 48 hours!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Material Shortage Exceptions & Supplier Expediting
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
          title="Active Shortage Alerts"
          value={shortages.length.toString()}
          unit="SKU Deficits"
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Expedited Shipments"
          value={Object.keys(expeditedItems).length.toString()}
          unit="Inbound In-Transit"
          icon={Truck}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Net Shortage Units"
          value={shortages.reduce((sum, s) => sum + s.shortage, 0).toLocaleString()}
          unit="Deficit Units"
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="Vulnerable Lines"
          value="Line 1 & Line 2"
          unit="Bottling & Blending"
          icon={Calendar}
          colorVariant="rose"
        />
      </div>

      {/* Shortages List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {shortages.length > 0 ? (
          shortages.map((s) => {
            const isExpedited = expeditedItems[s.skuId];

            return (
              <Card
                key={s.skuId}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: "4px solid #DC2626",
                  padding: "20px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 320px" }}>
                  <div style={{ padding: "12px", backgroundColor: "rgba(220, 38, 38, 0.12)", borderRadius: "10px", flexShrink: 0 }}>
                    <AlertTriangle size={24} color="#DC2626" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{s.name}</span>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{s.skuCode}</span>
                      <Badge variant={s.riskLevel === "CRITICAL" ? "rose" : "amber"}>{s.riskLevel} RISK</Badge>
                      {isExpedited && <Badge variant="emerald">EXPEDITE CONFIRMED</Badge>}
                    </div>

                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Projected Deficit: <strong style={{ color: "#DC2626" }}>−{s.shortage.toLocaleString()} {s.uom}</strong> • Gross Demand: <strong>{s.grossRequirement.toLocaleString()} {s.uom}</strong> • On-Hand: <strong>{s.availableInventory.toLocaleString()} {s.uom}</strong>
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Supplier Contract: <strong>Indore Packaging & Beverage Ingredients Ltd</strong> • Standard Lead Time: 5 Days
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Button
                    variant={isExpedited ? "secondary" : "primary"}
                    size="sm"
                    icon={isExpedited ? CheckCircle2 : Send}
                    onClick={() => handleExpedite(s.skuId, s.name)}
                    disabled={isExpedited}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    {isExpedited ? "Inbound Expedited" : "Expedite Inbound Supply"}
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)" }}>
            <CheckCircle2 size={32} color="#059669" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>No Material Shortages Detected</div>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>All scheduled manufacturing runs are fully covered by warehouse stock and inbound supply.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

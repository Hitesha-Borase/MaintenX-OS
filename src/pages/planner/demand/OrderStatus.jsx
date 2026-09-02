import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ArrowRight,
  TrendingUp,
  Search,
  Layers,
  Calendar
} from "lucide-react";

export function OrderStatus() {
  const { demandOrders = [], updateDemandOrder } = usePlanning();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const stages = ["Open", "Allocated", "Scheduled", "Fulfilled"];

  const handleAdvanceStatus = (order) => {
    const currentIndex = stages.indexOf(order.status);
    const nextStatus = stages[currentIndex + 1] || "Fulfilled";
    updateDemandOrder(order.id, { status: nextStatus });
    addToast(`Order ${order.orderNumber} advanced to "${nextStatus}" status!`, "success");
  };

  const filtered = demandOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.customer?.toLowerCase().includes(q) ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.productName?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Demand Order Fulfillment & Lifecycle Tracking
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
          title="Open Queue"
          value={demandOrders.filter((o) => o.status === "Open").length.toString()}
          unit="Unscheduled"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Allocated to Lines"
          value={demandOrders.filter((o) => o.status === "Allocated").length.toString()}
          unit="In APS Planning"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Fulfilled & Dispatched"
          value={demandOrders.filter((o) => o.status === "Fulfilled").length.toString()}
          unit="Completed Orders"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="OTIF Fulfillment Rate"
          value="98.4%"
          unit="On-Time Delivery"
          icon={Truck}
          colorVariant="emerald"
        />
      </div>

      {/* Search Bar */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search fulfillment status by customer, order number, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.length > 0 ? (
            filtered.map((o) => {
              const stageIdx = stages.indexOf(o.status);
              const progressPercent = stageIdx === -1 ? 100 : Math.round(((stageIdx + 1) / stages.length) * 100);

              return (
                <div
                  key={o.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                          {o.orderNumber}
                        </span>
                        <Badge variant="cyan">{o.customer}</Badge>
                        <Badge variant={o.priority === "Urgent" ? "rose" : o.priority === "High" ? "amber" : "slate"}>
                          {o.priority} Priority
                        </Badge>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        <strong>{o.productName}</strong> ({o.productCode}) • Quantity: <strong>{Number(o.quantity).toLocaleString()} {o.uom}</strong> • Ship Date: <strong>{o.requestedShipDate}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Badge
                        variant={
                          o.status === "Fulfilled"
                            ? "emerald"
                            : o.status === "Allocated"
                            ? "cyan"
                            : o.status === "Open"
                            ? "amber"
                            : "slate"
                        }
                      >
                        {o.status.toUpperCase()}
                      </Badge>
                      {o.status !== "Fulfilled" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => handleAdvanceStatus(o)}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          Advance Stage
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Multi-step pipeline tracker */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
                      {stages.map((st, i) => (
                        <span
                          key={st}
                          style={{
                            color: i <= stageIdx ? "#B27E33" : "var(--text-muted)",
                            fontWeight: i === stageIdx ? 800 : 600
                          }}
                        >
                          {i + 1}. {st}
                        </span>
                      ))}
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "#FFFFFF", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: "100%",
                          backgroundColor: progressPercent === 100 ? "#059669" : "#C89547",
                          borderRadius: "4px",
                          transition: "width 0.4s ease"
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
              No demand orders match your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

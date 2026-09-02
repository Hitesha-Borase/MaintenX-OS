import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import {
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Layers,
  ArrowRight,
  Boxes
} from "lucide-react";

export function MaterialReservation() {
  const { materialReservations = [], reserveMaterialsForOrder, stageMaterialsForOrder, releaseReservation } = usePlanning();
  const { productionOrders = [] } = useProduction();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  // KPIs
  const totalReservations = materialReservations.length;
  const fullyReserved = materialReservations.filter((r) => r.status === "Fully Reserved" || r.status === "Staged").length;
  const partialShortages = materialReservations.filter((r) => r.status === "Partially Reserved" || r.shortage > 0).length;
  const stagedCount = materialReservations.filter((r) => r.status === "Staged").length;

  const filtered = materialReservations.filter(
    (r) =>
      r.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Material Reservations & Production Staging
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {productionOrders.slice(0, 2).map((po) => (
            <Button
              key={po.id}
              variant="secondary"
              icon={Package}
              onClick={() => reserveMaterialsForOrder(po.id)}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Reserve for {po.orderNumber}
            </Button>
          ))}
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
          title="Active Allocations"
          value={totalReservations.toString()}
          unit="Reserved BOM Lots"
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Fully Covered Orders"
          value={fullyReserved.toString()}
          unit="Ready for Blending"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Staged at Line"
          value={stagedCount.toString()}
          unit="Transferred to WIP"
          icon={Send}
          colorVariant="emerald"
        />
        <StatCard
          title="Shortage Reservations"
          value={partialShortages.toString()}
          unit="Partial Lot Holds"
          icon={AlertTriangle}
          colorVariant={partialShortages > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search material reservations by part, SKU, or order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
            <thead>
              <tr>
                <th>Target Production Order</th>
                <th>BOM Component Material</th>
                <th>Required Volume</th>
                <th>Reserved Stock</th>
                <th>Shortage</th>
                <th>Staging Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isFullyReserved = r.status === "Fully Reserved" || r.status === "Staged";

                return (
                  <tr
                    key={r.reservationId}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {r.orderNumber}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {r.reservationId}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{r.materialName}</div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                        {r.skuCode}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        {Number(r.requiredQty).toLocaleString()} {r.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#059669" }}>
                        {Number(r.reservedQty).toLocaleString()} {r.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      {r.shortage > 0 ? (
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "#DC2626", fontFamily: "var(--font-mono)" }}>
                          ▲ {r.shortage.toLocaleString()} {r.uom}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>✓ Covered</span>
                      )}
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <Badge
                        variant={
                          r.status === "Staged"
                            ? "emerald"
                            : r.status === "Fully Reserved"
                            ? "cyan"
                            : "amber"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        {r.status !== "Staged" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Send}
                            onClick={() => stageMaterialsForOrder(r.productionOrderId)}
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                          >
                            Stage to Line
                          </Button>
                        )}
                        <button
                          onClick={() => releaseReservation(r.reservationId)}
                          title="Release Reservation"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#DC2626",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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

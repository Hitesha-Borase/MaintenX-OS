import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function FinishedGoodsPage() {
  const { addToast } = useApp();

  const [finishedInventory, setFinishedInventory] = useState([
    { id: "FG-901", product: "500ml Sparkling Citrus Soda (24-pk)", pallets: 42, totalCases: 2520, bayLocation: "Bay 12 — Staging North", carrier: "DHL Freight", departureTime: "16:00", status: "Staged" },
    { id: "FG-902", product: "1L Tonic Water Natural (12-pk)", pallets: 28, totalCases: 1680, bayLocation: "Bay 14 — Cold Dock", carrier: "FedEx Freight", departureTime: "18:30", status: "Staged" },
    { id: "FG-903", product: "330ml Organic Ginger Beer Can (24-pk)", pallets: 35, totalCases: 2100, bayLocation: "Bay 15 — Outbound", carrier: "Swift Transportation", departureTime: "19:00", status: "Loaded" }
  ]);

  const handleDispatch = (id) => {
    setFinishedInventory((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "Dispatched" } : f))
    );
    addToast(`Shipment ${id} dispatched! Bill of Lading (BoL) generated.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Finished Goods Pallet Inventory & Outbound Staging
            </h1>
            <Badge variant="emerald">105 Pallets Ready for Dispatch</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Pallet staging bays, QA-released inventory tracking, carrier appointment schedules, and electronic Bill of Lading (BoL).
          </p>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Staged Finished Pallets"
          value="105 Pallets"
          unit="6,300 Cases"
          trend={{ value: "100% QA Released", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="Outbound Carriers Today"
          value="3 Trucks"
          unit="Scheduled"
          trend={{ value: "Next departure: 16:00", isPositive: true, text: "" }}
          icon={Truck}
          colorVariant="cyan"
        />
        <StatCard
          title="Warehouse Bay Utilization"
          value="72%"
          unit="Nominal"
          trend={{ value: "Ample staging buffer", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Finished Goods Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Staged Outbound Shipments & Bay Allocation
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment Ref</th>
                <th>Finished Product</th>
                <th>Pallets / Cases</th>
                <th>Staging Bay</th>
                <th>Carrier</th>
                <th>Departure</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {finishedInventory.map((f) => {
                const isDispatched = f.status === "Dispatched";

                return (
                  <tr key={f.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{f.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.product}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {f.pallets} Pallets ({f.totalCases.toLocaleString()} cs)
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#F59E0B" }}>
                      {f.bayLocation}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                      {f.carrier}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {f.departureTime}
                    </td>
                    <td>
                      <Badge variant={isDispatched ? "emerald" : "cyan"}>
                        {f.status}
                      </Badge>
                    </td>
                    <td>
                      {!isDispatched ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Truck}
                          onClick={() => handleDispatch(f.id)}
                        >
                          Dispatch
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Outbound</span>
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

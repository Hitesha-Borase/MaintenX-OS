import React, { useState, useMemo } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Truck,
  Plus,
  Search,
  Calendar,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle
} from "lucide-react";

export function ShipmentsDemand() {
  const { demandOrders = [], updateDemandOrder } = usePlanning();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Derive real shipments directly from active Customer Demand Orders in DB
  const shipments = useMemo(() => {
    return demandOrders.map((o, idx) => {
      const qty = Number(o.quantity) || 1000;
      const pallets = Math.max(1, Math.ceil(qty / 1000));
      
      const carrier = o.priority === "Urgent" 
        ? "Swift Dedicated Logistics (Priority FTL)" 
        : o.priority === "High"
        ? "C.H. Robinson Cold Fleet"
        : "Schneider National Express";

      const mode = (o.uom === "Bottles" || o.uom === "Liters") ? "Reefer FTL (53ft)" : "Standard Dry Van (53ft)";
      const dockDoor = `Door 0${(idx % 4) + 1}${idx % 2 === 0 ? " (Cold Chain)" : ""}`;

      // Synchronize shipment status with order lifecycle
      let shippingStatus = "Booked";
      if (o.status === "Fulfilled" || o.status === "Dispatched") {
        shippingStatus = "Dispatched";
      } else if (o.status === "Scheduled" || o.status === "Staged") {
        shippingStatus = "Staged";
      } else if (o.status === "Open") {
        shippingStatus = "Pending Dispatch";
      }

      return {
        id: `SH-${o.orderNumber?.replace(/[^a-zA-Z0-9]/g, "") || (9000 + idx)}`,
        orderId: o.id,
        orderRef: o.orderNumber,
        customer: o.customer,
        destination: o.notes ? `${o.customer} (${o.notes})` : `${o.customer} - Regional Distribution Hub`,
        carrier,
        mode,
        pallets,
        units: `${qty.toLocaleString()} ${o.uom || "Units"}`,
        productName: o.productName,
        productCode: o.productCode,
        scheduledDate: o.requestedShipDate || new Date().toISOString().substring(0, 10),
        dockDoor,
        status: shippingStatus,
        orderStatus: o.status
      };
    });
  }, [demandOrders]);

  const handleToggleShipmentStatus = async (shipment) => {
    const nextOrderStatus = 
      shipment.status === "Dispatched" 
        ? "Allocated" 
        : shipment.status === "Staged" 
        ? "Fulfilled" 
        : "Scheduled";

    setUpdatingId(shipment.orderId);
    try {
      await updateDemandOrder(shipment.orderId, { status: nextOrderStatus });
      addToast(`Shipment for Order ${shipment.orderRef} updated in Database!`, "success");
    } catch (err) {
      console.error("Failed to update shipment status:", err);
      addToast(`Failed to update shipment in DB: ${err.message}`, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = shipments.filter(
    (s) =>
      s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.orderRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.productName && s.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPallets = shipments.reduce((sum, s) => sum + s.pallets, 0);
  const stagedCount = shipments.filter((s) => s.status === "Staged").length;
  const activeDoorsCount = Math.min(4, shipments.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Outbound Shipping & Freight Allocation
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time outbound freight dispatching connected to Customer Demand Orders.
          </p>
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
          title="Active Freight Bookings"
          value={shipments.length.toString()}
          unit="Trailers Required"
          icon={Truck}
          colorVariant="cyan"
        />
        <StatCard
          title="Staged at Dock"
          value={stagedCount.toString()}
          unit="Ready for Loading"
          icon={Package}
          colorVariant="amber"
        />
        <StatCard
          title="Total Pallet Payload"
          value={totalPallets.toString()}
          unit="Standard GMA Pallets"
          icon={MapPin}
          colorVariant="emerald"
        />
        <StatCard
          title="Dock Utilization"
          value={shipments.length === 0 ? "0%" : `${Math.round((activeDoorsCount / 4) * 100)}%`}
          unit={`${activeDoorsCount} of 4 Doors Active`}
          icon={Clock}
          colorVariant="emerald"
        />
      </div>

      {/* Shipment Cards Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search shipments by customer, destination, carrier, or order ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  opacity: updatingId === s.orderId ? 0.6 : 1,
                  transition: "opacity 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: "1 1 300px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Truck size={22} color="#B27E33" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{s.destination}</span>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{s.id}</span>
                      <Badge variant="slate">Ref: {s.orderRef}</Badge>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Carrier: <strong>{s.carrier}</strong> ({s.mode}) • Payload: <strong>{s.pallets} Pallets ({s.units})</strong> • Assigned: <strong>{s.dockDoor}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Departure</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={12} color="var(--text-muted)" /> {s.scheduledDate}
                    </div>
                  </div>

                  <div
                    onClick={() => handleToggleShipmentStatus(s)}
                    style={{ cursor: updatingId === s.orderId ? "wait" : "pointer" }}
                    title="Click to advance shipment status in Database"
                  >
                    <Badge variant={s.status === "Dispatched" ? "emerald" : s.status === "Staged" ? "cyan" : "amber"}>
                      {updatingId === s.orderId ? "UPDATING..." : s.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={28} color="var(--text-muted)" />
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                No Outbound Shipments Found
              </div>
              <div style={{ fontSize: "12px", maxWidth: "400px" }}>
                Create customer orders in the <strong>Customer Orders</strong> menu to automatically generate real outbound freight shipments.
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

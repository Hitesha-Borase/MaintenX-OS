import React, { useState } from "react";
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
  Download
} from "lucide-react";

export function ShipmentsDemand() {
  const { demandOrders = [] } = usePlanning();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const [shipments, setShipments] = useState([
    {
      id: "SH-9002",
      orderRef: "PO-WF-88901",
      destination: "Whole Foods Market - Chicago Distribution Hub",
      carrier: "Swift Dedicated Logistics",
      mode: "Reefer FTL (53ft)",
      pallets: 26,
      units: "48,000 Bottles",
      scheduledDate: "2026-09-08",
      dockDoor: "Door 04 (Cold Chain)",
      status: "Booked"
    },
    {
      id: "SH-9003",
      orderRef: "PO-TJ-55412",
      destination: "Trader Joe's - Dallas Cross-Dock",
      carrier: "C.H. Robinson Cold Fleet",
      mode: "Reefer FTL",
      pallets: 20,
      units: "36,000 Cans",
      scheduledDate: "2026-09-12",
      dockDoor: "Door 02",
      status: "Pending Dispatch"
    },
    {
      id: "SH-9004",
      orderRef: "PO-KR-99321",
      destination: "Kroger Distribution - Atlanta",
      carrier: "Schneider Express",
      mode: "FTL Carrier",
      pallets: 14,
      units: "24,000 Bottles",
      scheduledDate: "2026-09-15",
      dockDoor: "Door 06",
      status: "Staged"
    }
  ]);

  const handleToggleShipmentStatus = (id) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextSt = s.status === "Booked" ? "Staged" : s.status === "Staged" ? "Dispatched" : "Booked";
          addToast(`Shipment ${id} status updated to ${nextSt}!`, "success");
          return { ...s, status: nextSt };
        }
        return s;
      })
    );
  };

  const filtered = shipments.filter(
    (s) =>
      s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.orderRef.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Outbound Shipping & Freight Allocation
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
          title="Active Freight Bookings"
          value={shipments.length.toString()}
          unit="Trailers Booked"
          icon={Truck}
          colorVariant="cyan"
        />
        <StatCard
          title="Staged at Dock"
          value={shipments.filter((s) => s.status === "Staged").length.toString()}
          unit="Ready for Loading"
          icon={Package}
          colorVariant="amber"
        />
        <StatCard
          title="Total Pallet Payload"
          value={shipments.reduce((sum, s) => sum + s.pallets, 0).toString()}
          unit="Standard GMA Pallets"
          icon={MapPin}
          colorVariant="emerald"
        />
        <StatCard
          title="Dock Utilization"
          value="75%"
          unit="3 of 4 Doors Active"
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
            placeholder="Search shipments by destination, carrier, or PO ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((s) => (
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
                gap: "14px"
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
                  onClick={() => handleToggleShipmentStatus(s.id)}
                  style={{ cursor: "pointer" }}
                  title="Click to advance shipment status"
                >
                  <Badge variant={s.status === "Dispatched" ? "emerald" : s.status === "Staged" ? "cyan" : "amber"}>
                    {s.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

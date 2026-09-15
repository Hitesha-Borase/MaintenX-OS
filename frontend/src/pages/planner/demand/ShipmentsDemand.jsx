import React, { useState, useEffect, useMemo } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import planningService from "../../../services/planningService";
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
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight
} from "lucide-react";

export function ShipmentsDemand() {
  const { demandOrders = [], updateDemandOrder } = usePlanning();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualShipments, setManualShipments] = useState([]);

  const [newShipment, setNewShipment] = useState({
    destination: "",
    orderRef: "PO-CUST-98214",
    carrier: "Swift Dedicated Logistics",
    mode: "Reefer FTL (53ft)",
    pallets: 24,
    units: "24,000 Bottles",
    scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10),
    dockDoor: "Door 01 (Outbound Bay)",
    status: "Booked"
  });

  // Derive real shipments directly from active Customer Demand Orders in DB
  const orderShipments = useMemo(() => {
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
        orderRef: o.orderNumber || `ORD-${o.id}`,
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

  const [dbShipments, setDbShipments] = useState([]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await planningService.getShipments();
      const data = Array.isArray(res) ? res : (res?.data || []);
      if (data.length > 0) {
        setDbShipments(data);
      }
    } catch (err) {
      console.warn("Outbound shipments backend fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const shipments = useMemo(() => {
    if (dbShipments.length > 0) {
      return dbShipments;
    }
    return orderShipments;
  }, [dbShipments, orderShipments]);

  const handleToggleShipmentStatus = async (shipment) => {
    const nextSt = 
      shipment.status === "Booked" ? "Pending Dispatch" :
      shipment.status === "Pending Dispatch" ? "Staged" :
      shipment.status === "Staged" ? "Dispatched" : "Booked";

    const targetId = shipment.id || shipment.shipmentNumber;
    setUpdatingId(targetId);

    try {
      await planningService.updateShipmentStatus(targetId, nextSt);
      if (shipment.orderId && updateDemandOrder) {
        const nextOrderSt = nextSt === "Dispatched" ? "Fulfilled" : nextSt === "Staged" ? "Scheduled" : "Open";
        await updateDemandOrder(shipment.orderId, { status: nextOrderSt }).catch(() => {});
      }
      await fetchShipments();
      addToast(`Shipment ${shipment.orderRef || shipment.shipmentNumber || targetId} updated to ${nextSt} in Database!`, "success");
    } catch (err) {
      console.error("Failed to update shipment status:", err);
      addToast(`Failed to update shipment in DB: ${err.message}`, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    if (!newShipment.destination.trim()) {
      addToast("Please provide shipment destination.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        destination: newShipment.destination,
        customerName: newShipment.destination,
        customer: newShipment.destination,
        orderRef: newShipment.orderRef,
        carrier: newShipment.carrier,
        mode: newShipment.mode,
        pallets: Number(newShipment.pallets),
        units: newShipment.units,
        scheduledDate: newShipment.scheduledDate,
        dockDoor: newShipment.dockDoor,
        status: newShipment.status
      };
      await planningService.createShipment(payload);
      await fetchShipments();
      addToast(`Outbound freight trailer booked for ${payload.destination} and saved in DB!`, "success");
      setIsModalOpen(false);
      setNewShipment({
        destination: "",
        orderRef: `PO-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
        carrier: "Swift Dedicated Logistics",
        mode: "Reefer FTL (53ft)",
        pallets: 24,
        units: "24,000 Bottles",
        scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10),
        dockDoor: "Door 01 (Outbound Bay)",
        status: "Booked"
      });
    } catch (err) {
      console.error("Create shipment failed:", err);
      addToast("Failed to book shipment in backend.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "Shipment ID,Order Ref,Destination,Carrier,Mode,Pallets,Units,Scheduled Date,Dock Door,Status\n";
    const rows = filtered
      .map((s) => `"${s.id}","${s.orderRef}","${s.destination}","${s.carrier}","${s.mode}",${s.pallets},"${s.units}","${s.scheduledDate}","${s.dockDoor}","${s.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Outbound_Shipments_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Outbound shipments exported to CSV.", "success");
  };

  const filtered = shipments.filter((s) => {
    const matchesStatus = statusFilter === "ALL" || s.status?.toLowerCase() === statusFilter?.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.destination?.toLowerCase().includes(q) ||
      s.carrier?.toLowerCase().includes(q) ||
      s.orderRef?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q) ||
      (s.productName && s.productName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const totalPallets = shipments.reduce((sum, s) => sum + (Number(s.pallets) || 0), 0);
  const stagedCount = shipments.filter((s) => s.status === "Staged").length;
  const activeDoorsCount = Math.min(4, shipments.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0, paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0 }}>
              Outbound Shipping & Freight Allocation
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
              LOGISTICS DOCK COMMAND
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Coordinate outbound carrier freight bookings, pallet payloads, and cold chain dock allocation connected to Customer Orders.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button 
            variant="outline" 
            icon={RefreshCw} 
            onClick={() => {
              fetchShipments();
              addToast("Outbound shipments refreshed from live backend API", "success");
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

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              color: "#261603",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Plus size={16} />
            + Book Freight Trailer
          </button>
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
          colorVariant="amber"
        />
        <StatCard
          title="Dock Utilization"
          value={shipments.length === 0 ? "0%" : `${Math.round((activeDoorsCount / 4) * 100)}%`}
          unit={`${activeDoorsCount} of 4 Doors Active`}
          icon={Clock}
          colorVariant="amber"
        />
      </div>

      {/* Shipment Cards Container */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box", background: "white", border: "1px solid #E8DDCF", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search shipments by destination, carrier, or PO ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "38px", fontSize: "13px", backgroundColor: "#FAF8F5", border: "1px solid #D1C7BA", borderRadius: "8px", outline: "none", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "Booked", "Staged", "Dispatched"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: statusFilter === st ? "#E2B670" : "#FAF8F5",
                  color: statusFilter === st ? "#261603" : "var(--text-secondary)",
                  border: statusFilter === st ? "1px solid #C89547" : "1px solid #E8DDCF",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#FAF8F5",
                  border: "1px solid #E8DDCF",
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
                  <div style={{ width: "42px", height: "42px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Truck size={22} color="#8B6914" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{s.destination}</span>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{s.shipmentNumber || s.id}</span>
                      <Badge variant="slate">Ref: {s.orderRef}</Badge>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Carrier: <strong>{s.carrier}</strong> ({s.mode}) • Payload: <strong>{s.pallets} Pallets ({s.units})</strong> • Assigned: <strong>{s.dockDoor}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Departure</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                      <Calendar size={12} color="var(--text-muted)" /> {s.scheduledDate}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleShipmentStatus(s)}
                    disabled={updatingId === s.orderId}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #C89547",
                      backgroundColor: s.status === "Dispatched" ? "rgba(200, 149, 71, 0.25)" : "rgba(200, 149, 71, 0.12)",
                      color: "#2B1D11",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: updatingId === s.orderId ? "wait" : "pointer"
                    }}
                    title="Click to advance status in Database"
                  >
                    <span>{updatingId === s.orderId ? "UPDATING..." : s.status?.toUpperCase()}</span>
                    <ArrowRight size={12} />
                  </button>
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
                Create customer orders in the <strong>Customer Orders</strong> menu to automatically generate real outbound freight shipments, or click <strong>+ Book Freight Trailer</strong>.
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* BOOK FREIGHT MODAL */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "520px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8DDCF", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#8B6914" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Book Outbound Freight Trailer
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Destination Hub / Distribution Center *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Foods Market - Chicago Distribution Hub"
                  value={newShipment.destination}
                  onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Order Ref / PO #</label>
                  <input
                    type="text"
                    value={newShipment.orderRef}
                    onChange={(e) => setNewShipment({ ...newShipment, orderRef: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Carrier Service</label>
                  <input
                    type="text"
                    value={newShipment.carrier}
                    onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Pallet Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newShipment.pallets}
                    onChange={(e) => setNewShipment({ ...newShipment, pallets: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Scheduled Date</label>
                  <input
                    type="date"
                    value={newShipment.scheduledDate}
                    onChange={(e) => setNewShipment({ ...newShipment, scheduledDate: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  {isSubmitting ? "Booking..." : "Confirm Freight Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShipmentsDemand;

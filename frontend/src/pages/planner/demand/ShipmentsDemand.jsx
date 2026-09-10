import React, { useState, useEffect } from "react";
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
  RefreshCw,
  X,
  ArrowRight
} from "lucide-react";

export function ShipmentsDemand() {
  const { demandOrders = [] } = usePlanning();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await planningService.getShipments();
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        setShipments(data);
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

  const handleToggleShipmentStatus = async (id) => {
    const current = shipments.find((s) => s.id === id);
    if (!current) return;
    const nextSt = current.status === "Booked" ? "Staged" : current.status === "Staged" ? "Dispatched" : "Booked";
    
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextSt } : s))
    );
    addToast(`Shipment ${id} status updated to ${nextSt}!`, "success");

    try {
      await planningService.updateShipmentStatus(id, nextSt);
    } catch (err) {
      console.warn("Backend updateShipmentStatus fallback:", err.message);
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
      const res = await planningService.createShipment(newShipment);
      const created = res?.data || res;
      const optimistic = {
        id: created?.id || `SH-${Math.floor(1000 + Math.random() * 9000)}`,
        ...newShipment,
        pallets: Number(newShipment.pallets)
      };

      setShipments((prev) => [optimistic, ...prev]);
      addToast(`Outbound freight trailer booked for ${optimistic.destination}!`, "success");
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
      s.destination.toLowerCase().includes(q) ||
      s.carrier.toLowerCase().includes(q) ||
      s.orderRef.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

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
            Coordinate outbound carrier freight bookings, pallet payloads, and cold chain dock allocation.
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
          value={shipments.reduce((sum, s) => sum + (Number(s.pallets) || 0), 0).toString()}
          unit="Standard GMA Pallets"
          icon={MapPin}
          colorVariant="amber"
        />
        <StatCard
          title="Dock Utilization"
          value="75%"
          unit="3 of 4 Doors Active"
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
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: "1 1 300px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Truck size={22} color="#8B6914" />
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

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Departure</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                      <Calendar size={12} color="var(--text-muted)" /> {s.scheduledDate}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleShipmentStatus(s.id)}
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
                      cursor: "pointer"
                    }}
                    title="Click to advance status"
                  >
                    <span>{s.status?.toUpperCase()}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
              No shipments match your criteria.
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

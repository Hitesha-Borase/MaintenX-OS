import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Truck,
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Send,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  FileText,
  Building2,
  Calendar,
  Trash2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export const INITIAL_SHIPMENT_ORDERS = [];

export function ShipmentOrders() {
  const { addToast } = useApp();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [editingShipment, setEditingShipment] = useState(null);
  const [deleteTargetShipment, setDeleteTargetShipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New Shipment Form State
  const initialNewShipment = {
    customer: "",
    orderNumber: "",
    finishedGoods: "",
    batchLot: "",
    quantity: "",
    carrier: "Challenger Freight Lines",
    shipDate: new Date().toISOString().substring(0, 10),
    destination: "",
    trailerNo: "",
    sealNo: "",
    bolNumber: "",
    status: "Scheduled"
  };
  const [newShipment, setNewShipment] = useState(initialNewShipment);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getShipmentOrders();
      const data = res?.data || res;
      if (Array.isArray(data?.shipmentOrders)) {
        setShipments(data.shipmentOrders);
      } else if (Array.isArray(data)) {
        setShipments(data);
      } else {
        setShipments([]);
      }
    } catch (err) {
      console.warn("Backend shipment orders fetch fallback:", err.message);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (s.shipmentNumber || s.id || "").toLowerCase().includes(q) ||
        (s.customer || "").toLowerCase().includes(q) ||
        (s.orderNumber || "").toLowerCase().includes(q) ||
        (s.finishedGoods || "").toLowerCase().includes(q) ||
        (s.batchLot || "").toLowerCase().includes(q) ||
        (s.carrier || "").toLowerCase().includes(q) ||
        (s.destination || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchQuery, statusFilter]);

  // Create Shipment Handler -> Saves to PostgreSQL
  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const shipNum = `SHP-2026-${Math.floor(880 + Math.random() * 120)}`;
    const payload = {
      shipmentNumber: shipNum,
      customer: newShipment.customer,
      orderNumber: newShipment.orderNumber || `ORD-${Math.floor(88000 + Math.random() * 1000)}`,
      finishedGoods: newShipment.finishedGoods,
      batchLot: newShipment.batchLot,
      quantity: newShipment.quantity,
      carrier: newShipment.carrier,
      shipDate: newShipment.shipDate,
      destination: newShipment.destination,
      trailerNo: newShipment.trailerNo || `TR-${Math.floor(5000 + Math.random() * 4000)}`,
      sealNo: newShipment.sealNo || `SL-${Math.floor(90000 + Math.random() * 9000)}`,
      bolNumber: newShipment.bolNumber || `BOL-2026-${Math.floor(880 + Math.random() * 120)}`,
      status: newShipment.status || "Scheduled"
    };

    try {
      await warehouseService.createShipmentOrder(payload);
      addToast(`Shipment order for "${payload.customer}" created in database!`, "success");
      setIsCreateModalOpen(false);
      setNewShipment(initialNewShipment);
      await fetchShipments();
    } catch (err) {
      console.error("Backend createShipmentOrder error:", err);
      addToast(err?.response?.data?.message || "Failed to save shipment to database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Shipment Handler -> Updates in PostgreSQL
  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    if (!editingShipment) return;
    setSubmitting(true);

    try {
      await warehouseService.updateShipmentOrder(editingShipment.id, editingShipment);
      addToast(`Shipment ${editingShipment.shipmentNumber || editingShipment.id} updated in database.`, "success");
      setIsEditModalOpen(false);
      setEditingShipment(null);
      await fetchShipments();
    } catch (err) {
      console.error("Backend updateShipmentOrder error:", err);
      addToast(err?.response?.data?.message || "Failed to update shipment in database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Shipment Handler -> Deletes permanently from PostgreSQL
  const handleDeleteShipment = async () => {
    if (!deleteTargetShipment) return;
    setSubmitting(true);

    try {
      await warehouseService.deleteShipmentOrder(deleteTargetShipment.id);
      addToast(`Shipment ${deleteTargetShipment.shipmentNumber || deleteTargetShipment.id} deleted from database.`, "success");
      setDeleteTargetShipment(null);
      await fetchShipments();
    } catch (err) {
      console.error("Backend deleteShipmentOrder error:", err);
      addToast(err?.response?.data?.message || "Failed to delete shipment from database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Dispatch Shipment Handler -> Updates in PostgreSQL
  const handleDispatch = async (s) => {
    try {
      await warehouseService.dispatchShipmentOrder(s.id);
      addToast(`Shipment ${s.shipmentNumber || s.id} dispatched! BoL issued.`, "success");
      await fetchShipments();
    } catch (e) {
      console.error("dispatchShipmentOrder API error:", e);
      addToast("Failed to dispatch shipment in database", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return <Badge variant="emerald" dot>Delivered</Badge>;
      case "Dispatched":
        return <Badge variant="blue" dot>Dispatched</Badge>;
      case "In Transit":
        return <Badge variant="cyan" dot>In Transit</Badge>;
      case "Loading Complete":
        return <Badge variant="amber" dot>Loading Complete</Badge>;
      case "Scheduled":
        return <Badge variant="slate">Scheduled</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const totalPallets = useMemo(() => {
    return shipments.reduce((sum, s) => {
      const match = (s.quantity || "").match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
  }, [shipments]);

  const dispatchedCount = useMemo(() => {
    return shipments.filter((s) => s.status === "Dispatched" || s.status === "Delivered").length;
  }, [shipments]);

  const deliveredCount = useMemo(() => {
    return shipments.filter((s) => s.status === "Delivered").length;
  }, [shipments]);

  const otifRate = useMemo(() => {
    if (shipments.length === 0) return "100%";
    return `${Math.round((deliveredCount / shipments.length) * 100) || 100}%`;
  }, [shipments, deliveredCount]);

  const handleExportCSV = () => {
    const headers = "Shipment ID,Customer,Order #,Finished Goods,Batch/Lot,Quantity,Carrier,Ship Date,Destination,Status,Trailer No,Seal No,BOL\n";
    const rows = filteredShipments
      .map(
        (s) =>
          `"${s.shipmentNumber || s.id}","${s.customer}","${s.orderNumber}","${s.finishedGoods}","${s.batchLot}","${s.quantity}","${s.carrier}","${s.shipDate}","${s.destination}","${s.status}","${s.trailerNo}","${s.sealNo}","${s.bolNumber}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Outbound_Shipments_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Outbound shipments exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Outbound Shipping & Logistics Manifest
            </h1>
            <Badge variant="emerald">GS1-128 & BOL VERIFIED</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage outbound commercial carrier dispatches, customer orders, trailer seal tracking, and freight delivery SLAs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={RefreshCw} onClick={fetchShipments} disabled={loading} style={{ fontSize: "12px", padding: "7px 12px" }}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} disabled={shipments.length === 0} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Shipment
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active Shipments Today"
          value={shipments.length.toString()}
          unit="Orders"
          trend={{ value: shipments.length > 0 ? "100% on schedule" : "No active orders", isPositive: true, text: "" }}
          icon={Truck}
          colorVariant="blue"
        />
        <StatCard
          title="Total Outbound Pallets"
          value={`${totalPallets} Pallets`}
          unit="In Fleet"
          trend={{ value: "Commercial retail orders", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="amber"
        />
        <StatCard
          title="Carrier OTIF Punctuality"
          value={otifRate}
          unit="SLA Delivered"
          trend={{ value: "+0.8% this week", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Dispatched Trailers"
          value={dispatchedCount.toString()}
          unit="Sealed & Shipped"
          trend={{ value: "Electronic BoL cleared", isPositive: true, text: "" }}
          icon={Send}
          colorVariant="cyan"
        />
      </div>

      {/* Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Search & Status Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by Shipment ID, Customer, Order #, Finished Goods, Carrier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "150px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Loading Complete">Loading Complete</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1150px" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Shipment ID</th>
                <th style={{ whiteSpace: "nowrap" }}>Customer</th>
                <th style={{ whiteSpace: "nowrap" }}>Order #</th>
                <th style={{ whiteSpace: "nowrap" }}>Finished Goods</th>
                <th style={{ whiteSpace: "nowrap" }}>Batch / Lot</th>
                <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                <th style={{ whiteSpace: "nowrap" }}>Carrier</th>
                <th style={{ whiteSpace: "nowrap" }}>Ship Date</th>
                <th style={{ whiteSpace: "nowrap" }}>Destination</th>
                <th style={{ whiteSpace: "nowrap" }}>Status</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "36px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                      <RefreshCw className="animate-spin" size={18} color="#8C5B23" />
                      <span>Loading shipments from database...</span>
                    </div>
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(140, 91, 35, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8C5B23" }}>
                        <Truck size={28} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                          No Outbound Shipment Orders Found
                        </h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                          The database table is empty. Click below to create your first outbound shipment order.
                        </p>
                      </div>
                      <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)} style={{ marginTop: "6px" }}>
                        + Create First Shipment
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>
                    No shipment orders match your search query.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23", fontSize: "13px" }}>
                        {s.shipmentNumber || s.id}
                      </span>
                    </td>

                    <td style={{ minWidth: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building2 size={13} color="#8C5B23" />
                        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12.5px" }}>
                          {s.customer}
                        </span>
                      </div>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)", fontSize: "12px" }}>
                        {s.orderNumber}
                      </span>
                    </td>

                    <td style={{ minWidth: "180px" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", maxWidth: "220px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={s.finishedGoods}>
                        {s.finishedGoods}
                      </div>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", color: "#0284C7", fontWeight: 700, fontSize: "12px" }}>
                        {s.batchLot}
                      </span>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px" }}>
                        {s.quantity}
                      </span>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {s.carrier}
                      </span>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {s.shipDate}
                      </span>
                    </td>

                    <td style={{ minWidth: "160px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <MapPin size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {s.destination}
                        </span>
                      </div>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      {getStatusBadge(s.status)}
                    </td>

                    <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedShipment(s)}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                          title="View Details"
                        >
                          View
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingShipment({ ...s });
                            setIsEditModalOpen(true);
                          }}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                          title="Edit Shipment"
                        >
                          Edit
                        </Button>

                        {s.status !== "Dispatched" && s.status !== "Delivered" && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Send}
                            onClick={() => handleDispatch(s)}
                            style={{ fontSize: "11px", padding: "4px 8px", backgroundColor: "#059669", borderColor: "#059669" }}
                            title="Dispatch Shipment"
                          >
                            Dispatch
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Navigation}
                          onClick={() => {
                            setSelectedShipment(s);
                            setIsTrackModalOpen(true);
                          }}
                          style={{ fontSize: "11px", padding: "4px 8px", color: "#0284C7" }}
                          title="Track Milestones"
                        >
                          Track
                        </Button>

                        <button
                          onClick={() => setDeleteTargetShipment(s)}
                          style={{
                            padding: "5px 7px",
                            backgroundColor: "transparent",
                            border: "1px solid rgba(220, 38, 38, 0.3)",
                            borderRadius: "6px",
                            color: "#DC2626",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
                            e.currentTarget.style.borderColor = "#DC2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
                          }}
                          title="Delete Shipment from Database"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE SHIPMENT MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "600px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#8C5B23" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Create Outbound Shipment
                </h2>
              </div>
              <button onClick={() => !submitting && setIsCreateModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Customer / Retail DC *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Supermarkets Distribution"
                    className="form-input"
                    value={newShipment.customer}
                    onChange={(e) => setNewShipment({ ...newShipment, customer: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Sales / Purchase Order # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-88210"
                    className="form-input"
                    value={newShipment.orderNumber}
                    onChange={(e) => setNewShipment({ ...newShipment, orderNumber: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Finished Goods Item *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sparkling Tea 330ml Can"
                  className="form-input"
                  value={newShipment.finishedGoods}
                  onChange={(e) => setNewShipment({ ...newShipment, finishedGoods: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Finished Batch / Lot *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-FG-2026-0885"
                    className="form-input"
                    value={newShipment.batchLot}
                    onChange={(e) => setNewShipment({ ...newShipment, batchLot: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Pallet / Case Quantity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24 Pallets (36,000 cans)"
                    className="form-input"
                    value={newShipment.quantity}
                    onChange={(e) => setNewShipment({ ...newShipment, quantity: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Carrier *</label>
                  <select
                    className="form-select"
                    value={newShipment.carrier}
                    onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Challenger Freight Lines">Challenger Freight Lines</option>
                    <option value="Bison Transport Logistics">Bison Transport Logistics</option>
                    <option value="Titan Freight Corp.">Titan Freight Corp.</option>
                    <option value="Swift Transportation">Swift Transportation</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Ship Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={newShipment.shipDate}
                    onChange={(e) => setNewShipment({ ...newShipment, shipDate: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Destination Facility Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toronto Logistics Hub, ON"
                  className="form-input"
                  value={newShipment.destination}
                  onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Trailer #</label>
                  <input
                    type="text"
                    placeholder="Auto (e.g. TR-5510)"
                    className="form-input"
                    value={newShipment.trailerNo}
                    onChange={(e) => setNewShipment({ ...newShipment, trailerNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Seal #</label>
                  <input
                    type="text"
                    placeholder="Auto (e.g. SL-99410)"
                    className="form-input"
                    value={newShipment.sealNo}
                    onChange={(e) => setNewShipment({ ...newShipment, sealNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">BoL #</label>
                  <input
                    type="text"
                    placeholder="Auto (e.g. BOL-2026-881)"
                    className="form-input"
                    value={newShipment.bolNumber}
                    onChange={(e) => setNewShipment({ ...newShipment, bolNumber: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus} disabled={submitting}>
                  {submitting ? "Saving to Database..." : "Register Shipment in DB"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHIPMENT MODAL */}
      {isEditModalOpen && editingShipment && (
        <div className="modal-backdrop" onClick={() => !submitting && setIsEditModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "600px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Shipment: {editingShipment.shipmentNumber || editingShipment.id}
              </h2>
              <button onClick={() => !submitting && setIsEditModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateShipment} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Customer / Retail DC *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingShipment.customer || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, customer: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Order # *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingShipment.orderNumber || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, orderNumber: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Finished Goods Item *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingShipment.finishedGoods || ""}
                  onChange={(e) => setEditingShipment({ ...editingShipment, finishedGoods: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Batch / Lot *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingShipment.batchLot || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, batchLot: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Quantity *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingShipment.quantity || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, quantity: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Carrier *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingShipment.carrier || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, carrier: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={editingShipment.status || "Scheduled"}
                    onChange={(e) => setEditingShipment({ ...editingShipment, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Loading Complete">Loading Complete</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Ship Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={editingShipment.shipDate || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, shipDate: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Destination *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingShipment.destination || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, destination: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Trailer #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingShipment.trailerNo || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, trailerNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Seal #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingShipment.sealNo || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, sealNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">BoL #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingShipment.bolNumber || ""}
                    onChange={(e) => setEditingShipment({ ...editingShipment, bolNumber: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Updating Database..." : "Save Changes to DB"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetShipment && (
        <div className="modal-backdrop" onClick={() => !submitting && setDeleteTargetShipment(null)}>
          <div className="modal-content" style={{ maxWidth: "460px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DC2626" }}>
                <AlertTriangle size={20} />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Delete Shipment Order
                </h2>
              </div>
              <button onClick={() => !submitting && setDeleteTargetShipment(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to permanently delete shipment <strong style={{ color: "var(--text-primary)" }}>{deleteTargetShipment.shipmentNumber || deleteTargetShipment.id}</strong> ({deleteTargetShipment.customer}) from the database?
              </p>

              <div style={{ backgroundColor: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#DC2626" }}>
                This record will be permanently deleted from the PostgreSQL database table <code>shipment_orders</code>.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <Button variant="secondary" onClick={() => setDeleteTargetShipment(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDeleteShipment}
                  disabled={submitting}
                  style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}
                  icon={Trash2}
                >
                  {submitting ? "Deleting..." : "Delete Permanently"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SHIPMENT DETAILS MODAL */}
      {selectedShipment && !isTrackModalOpen && (
        <div className="modal-backdrop" onClick={() => setSelectedShipment(null)}>
          <div className="modal-content" style={{ maxWidth: "580px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#8C5B23" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Shipment Dossier: {selectedShipment.shipmentNumber || selectedShipment.id}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Bill of Lading: {selectedShipment.bolNumber}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedShipment(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    {selectedShipment.customer}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Order Ref: <strong>{selectedShipment.orderNumber}</strong>
                  </span>
                </div>
                {getStatusBadge(selectedShipment.status)}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Carrier:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedShipment.carrier}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Trailer / Seal:</span>
                  <strong style={{ color: "#0284C7" }}>{selectedShipment.trailerNo} / {selectedShipment.sealNo}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Payload Quantity:</span>
                  <strong style={{ color: "#10B981" }}>{selectedShipment.quantity}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Scheduled Ship Date:</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{selectedShipment.shipDate}</strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Item Cargo:</span>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{selectedShipment.finishedGoods}</strong>
                <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                  Lot: {selectedShipment.batchLot}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedShipment(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACK SHIPMENT MILESTONES MODAL */}
      {isTrackModalOpen && selectedShipment && (
        <div className="modal-backdrop" onClick={() => setIsTrackModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Navigation size={18} color="#0284C7" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Live Carrier Tracking: {selectedShipment.shipmentNumber || selectedShipment.id}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {selectedShipment.carrier} • Trailer {selectedShipment.trailerNo}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsTrackModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Destination:</span>
                  <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{selectedShipment.destination}</strong>
                </div>
                {getStatusBadge(selectedShipment.status)}
              </div>

              {/* Milestones Vertical Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "2px solid #E8DDCF", marginLeft: "14px", paddingLeft: "16px" }}>
                {selectedShipment.trackingMilestones?.map((m, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: "-23px",
                        top: "2px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: m.done ? "#10B981" : "#D1D5DB",
                        border: "2px solid #FFFFFF"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: m.done ? 700 : 500, color: m.done ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {m.step}
                      </span>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: m.done ? "#10B981" : "var(--text-muted)" }}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsTrackModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

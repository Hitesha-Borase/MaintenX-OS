import React, { useState, useMemo } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import {
  FileText,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  Filter
} from "lucide-react";

export function CustomerOrders() {
  const { demandOrders = [], addDemandOrder, updateDemandOrder, cancelDemandOrder } = usePlanning();
  const { skus = [], plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const availableSkus = useMemo(() => {
    const fg = skus.filter((s) => s.category === "Finished Goods");
    return fg.length > 0 ? fg : skus;
  }, [skus]);

  const defaultSku = availableSkus[0] || {
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    name: "500ml Sparkling Citrus Soda",
    uom: "Bottles"
  };

  // New Demand Form State
  const [newOrder, setNewOrder] = useState({
    orderNumber: `PO-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
    customer: "",
    skuId: defaultSku.skuId,
    quantity: 24000,
    requestedShipDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
    priority: "High",
    plantId: "PLT-01",
    notes: ""
  });

  // Dynamically resolve SKU details for Add Modal
  const resolvedNewSku = useMemo(() => {
    return skus.find((s) => s.skuId === newOrder.skuId) || defaultSku;
  }, [skus, newOrder.skuId, defaultSku]);

  // Dynamically resolve SKU details for Edit Modal
  const resolvedEditSku = useMemo(() => {
    if (!editingOrder) return null;
    return skus.find((s) => s.skuId === editingOrder.skuId) || defaultSku;
  }, [skus, editingOrder, defaultSku]);

  // KPIs
  const totalOrders = demandOrders.length;
  const openOrders = demandOrders.filter((o) => o.status === "Open").length;
  const totalUnits = demandOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
  const urgentOrders = demandOrders.filter((o) => o.priority === "Urgent" || o.priority === "High").length;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return demandOrders.filter((o) => {
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || o.priority === priorityFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q) ||
        o.productCode?.toLowerCase().includes(q);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [demandOrders, statusFilter, priorityFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newOrder.customer.trim()) {
      addToast("Please provide customer name.", "warning");
      return;
    }
    if (!newOrder.quantity || Number(newOrder.quantity) <= 0) {
      addToast("Quantity must be greater than 0.", "warning");
      return;
    }

    const created = addDemandOrder({
      orderNumber: newOrder.orderNumber,
      customer: newOrder.customer,
      skuId: newOrder.skuId,
      quantity: Number(newOrder.quantity),
      requestedShipDate: newOrder.requestedShipDate,
      priority: newOrder.priority,
      plantId: newOrder.plantId,
      notes: newOrder.notes
    });

    addToast(`Demand Order ${created.orderNumber} created for ${created.customer}!`, "success");
    setIsAddModalOpen(false);
    setNewOrder({
      orderNumber: `PO-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: "",
      skuId: defaultSku.skuId,
      quantity: 24000,
      requestedShipDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      priority: "High",
      plantId: "PLT-01",
      notes: ""
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editingOrder.customer.trim()) {
      addToast("Please provide customer name.", "warning");
      return;
    }
    if (!editingOrder.quantity || Number(editingOrder.quantity) <= 0) {
      addToast("Quantity must be greater than 0.", "warning");
      return;
    }

    updateDemandOrder(editingOrder.id, {
      customer: editingOrder.customer,
      skuId: editingOrder.skuId,
      quantity: Number(editingOrder.quantity),
      requestedShipDate: editingOrder.requestedShipDate,
      priority: editingOrder.priority,
      status: editingOrder.status,
      notes: editingOrder.notes
    });

    addToast(`Demand Order ${editingOrder.orderNumber} updated successfully!`, "success");
    setEditingOrder(null);
  };

  const handleExportCSV = () => {
    const headers = "Order ID,Order Number,Customer,Product Code,Product Name,Quantity,UOM,Requested Ship Date,Priority,Status\n";
    const rows = filteredOrders
      .map((o) => `"${o.id}","${o.orderNumber}","${o.customer}","${o.productCode}","${o.productName}",${o.quantity},"${o.uom}","${o.requestedShipDate}","${o.priority}","${o.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Customer_Demand_Orders_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Demand orders exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Customer Demand & Purchase Orders
            </h1>
            <Badge variant="cyan">{openOrders} OPEN DEMAND ORDERS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Demand Order
          </Button>
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
          title="Total Demand Orders"
          value={totalOrders.toString()}
          unit="Orders Logged"
          icon={FileText}
          colorVariant="cyan"
        />
        <StatCard
          title="Open Demand"
          value={openOrders.toString()}
          unit="Awaiting Allocation"
          icon={ShoppingBag}
          colorVariant="amber"
        />
        <StatCard
          title="Total Demand Volume"
          value={totalUnits.toLocaleString()}
          unit="Master Units"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="High Priority Demands"
          value={urgentOrders.toString()}
          unit="Urgent / High"
          icon={AlertCircle}
          colorVariant="rose"
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by Order #, Customer, Product Code, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "Open", "Allocated", "Fulfilled", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: statusFilter === st ? "#C89547" : "var(--bg-card-subtle)",
                  color: statusFilter === st ? "#261603" : "var(--text-secondary)",
                  border: statusFilter === st ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px" }}>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer Name</th>
                <th>Master Product SKU</th>
                <th>Requested Volume</th>
                <th>Target Ship Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {o.orderNumber}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {o.id}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{o.customer}</div>
                      {o.notes && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{o.notes}</div>}
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{o.productName}</div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                        {o.productCode}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {Number(o.quantity).toLocaleString()} {o.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        <span>{o.requestedShipDate}</span>
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <Badge variant={o.priority === "Urgent" ? "rose" : o.priority === "High" ? "amber" : "cyan"}>
                        {o.priority}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
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
                        {o.status}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          onClick={() => setEditingOrder({ ...o })}
                          title="Edit Demand Order"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        {o.status !== "Cancelled" && (
                          <button
                            onClick={() => cancelDemandOrder(o.id, "Cancelled by Planner")}
                            title="Cancel Order"
                            style={{
                              width: "30px",
                              height: "30px",
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No customer demand orders match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE DEMAND ORDER MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShoppingBag size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Create Customer Demand Order
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Customer Purchase Order # *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.orderNumber}
                    onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Customer / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Costco Wholesale EMEA"
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Master SKU Selection (Single Source of Truth) *</label>
                <select
                  value={newOrder.skuId}
                  onChange={(e) => setNewOrder({ ...newOrder, skuId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.skuId} value={s.skuId}>
                      {s.skuCode} — {s.name} ({s.uom})
                    </option>
                  ))}
                </select>
              </div>

              {resolvedNewSku && (
                <div
                  style={{
                    backgroundColor: "rgba(200, 149, 71, 0.08)",
                    border: "1px dashed #C89547",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                    fontSize: "11px"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Product Code:</span>
                    <div style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                      {resolvedNewSku.skuCode || resolvedNewSku.skuId}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Product Name:</span>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                      {resolvedNewSku.name || resolvedNewSku.productName}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>UOM:</span>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                      {resolvedNewSku.uom || "Units"}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Ordered Quantity ({resolvedNewSku?.uom || "Units"}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Requested Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={newOrder.requestedShipDate}
                    onChange={(e) => setNewOrder({ ...newOrder, requestedShipDate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Priority Tier</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Fulfillment Plant</label>
                  <select
                    value={newOrder.plantId}
                    onChange={(e) => setNewOrder({ ...newOrder, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Order Notes & Logistics Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Endcap promotional display barcode required."
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Save Demand Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEMAND ORDER MODAL */}
      {editingOrder && (
        <div className="modal-backdrop" onClick={() => setEditingOrder(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Demand Order — {editingOrder.orderNumber}
                </h2>
              </div>
              <button onClick={() => setEditingOrder(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editingOrder.customer}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Master SKU Selection *</label>
                <select
                  value={editingOrder.skuId}
                  onChange={(e) => setEditingOrder({ ...editingOrder, skuId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.skuId} value={s.skuId}>
                      {s.skuCode} — {s.name} ({s.uom})
                    </option>
                  ))}
                </select>
              </div>

              {resolvedEditSku && (
                <div
                  style={{
                    backgroundColor: "rgba(200, 149, 71, 0.08)",
                    border: "1px dashed #C89547",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                    fontSize: "11px"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Product Code:</span>
                    <div style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                      {resolvedEditSku.skuCode || resolvedEditSku.skuId}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Product Name:</span>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                      {resolvedEditSku.name || resolvedEditSku.productName}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>UOM:</span>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                      {resolvedEditSku.uom || "Units"}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Ordered Quantity ({resolvedEditSku?.uom || "Units"}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingOrder.quantity}
                    onChange={(e) => setEditingOrder({ ...editingOrder, quantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Requested Ship Date *</label>
                  <input
                    type="date"
                    required
                    value={editingOrder.requestedShipDate}
                    onChange={(e) => setEditingOrder({ ...editingOrder, requestedShipDate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    value={editingOrder.priority}
                    onChange={(e) => setEditingOrder({ ...editingOrder, priority: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Open">Open</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Order Notes</label>
                <input
                  type="text"
                  value={editingOrder.notes || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingOrder(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

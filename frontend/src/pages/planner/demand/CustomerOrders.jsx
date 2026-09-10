import React, { useState, useEffect, useMemo } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import planningService from "../../../services/planningService";
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
  Filter,
  RefreshCw
} from "lucide-react";

export function CustomerOrders() {
  const { 
    demandOrders: contextDemandOrders = [], 
    addDemandOrder, 
    updateDemandOrder, 
    cancelDemandOrder 
  } = usePlanning();
  
  const { skus = [], plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [orders, setOrders] = useState(contextDemandOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    skuId: defaultSku.skuId || defaultSku.id,
    quantity: 24000,
    requestedShipDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
    priority: "High",
    plantId: "PLT-01",
    notes: ""
  });

  // Fetch live demand orders from Backend REST API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await planningService.getCustomerOrders();
      const items = res?.data || res;
      if (Array.isArray(items) && items.length > 0) {
        setOrders(items);
      }
    } catch (err) {
      console.warn("Backend demand orders fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Synchronize when context updates
  useEffect(() => {
    if (contextDemandOrders.length > 0) {
      setOrders(contextDemandOrders);
    }
  }, [contextDemandOrders]);

  // Dynamically resolve SKU details for Add Modal
  const resolvedNewSku = useMemo(() => {
    return skus.find((s) => s.skuId === newOrder.skuId || s.id === newOrder.skuId) || defaultSku;
  }, [skus, newOrder.skuId, defaultSku]);

  // Dynamically resolve SKU details for Edit Modal
  const resolvedEditSku = useMemo(() => {
    if (!editingOrder) return null;
    return skus.find((s) => s.skuId === editingOrder.skuId || s.id === editingOrder.skuId) || defaultSku;
  }, [skus, editingOrder, defaultSku]);

  // KPIs
  const totalOrders = orders.length;
  const openOrders = orders.filter((o) => o.status === "Open" || o.status === "Allocated").length;
  const totalUnits = orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
  const urgentOrders = orders.filter((o) => o.priority === "Urgent" || o.priority === "High").length;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "ALL" || o.status?.toLowerCase() === statusFilter?.toLowerCase();
      const matchesPriority = priorityFilter === "ALL" || o.priority?.toLowerCase() === priorityFilter?.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q) ||
        o.productCode?.toLowerCase().includes(q);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [orders, statusFilter, priorityFilter, searchQuery]);

  // Handle Add Order
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newOrder.customer.trim()) {
      addToast("Please provide customer name.", "warning");
      return;
    }
    if (!newOrder.quantity || Number(newOrder.quantity) <= 0) {
      addToast("Quantity must be greater than 0.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        orderNumber: newOrder.orderNumber,
        customer: newOrder.customer,
        customerName: newOrder.customer,
        skuId: newOrder.skuId,
        quantity: Number(newOrder.quantity),
        requestedShipDate: newOrder.requestedShipDate,
        priority: newOrder.priority,
        plantId: newOrder.plantId,
        notes: newOrder.notes,
        status: "Open"
      };

      // Call Backend API
      const res = await planningService.createDemandOrder(payload);
      const createdItem = res?.data || res;

      const optimisticItem = {
        id: createdItem?.id || `DO-${Date.now()}`,
        ...payload,
        productCode: resolvedNewSku.skuCode || "SKU-5001",
        productName: resolvedNewSku.name || "Beverage Item",
        uom: resolvedNewSku.uom || "Bottles",
        createdDate: new Date().toISOString().substring(0, 10)
      };

      setOrders(prev => [optimisticItem, ...prev]);
      if (addDemandOrder) {
        addDemandOrder(payload);
      }

      addToast(`Demand Order ${payload.orderNumber} created for ${payload.customer}!`, "success");
      setIsAddModalOpen(false);
      
      // Reset form
      setNewOrder({
        orderNumber: `PO-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
        customer: "",
        skuId: defaultSku.skuId || defaultSku.id,
        quantity: 24000,
        requestedShipDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
        priority: "High",
        plantId: "PLT-01",
        notes: ""
      });
    } catch (err) {
      console.error("Create order failed:", err);
      addToast("Failed to create demand order in backend.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Order
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editingOrder.customer?.trim()) {
      addToast("Please provide customer name.", "warning");
      return;
    }
    if (!editingOrder.quantity || Number(editingOrder.quantity) <= 0) {
      addToast("Quantity must be greater than 0.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customer: editingOrder.customer,
        customerName: editingOrder.customer,
        skuId: editingOrder.skuId,
        quantity: Number(editingOrder.quantity),
        requestedShipDate: editingOrder.requestedShipDate,
        priority: editingOrder.priority,
        status: editingOrder.status,
        notes: editingOrder.notes
      };

      // Call Backend API
      await planningService.updateDemandOrder(editingOrder.id, payload);

      setOrders(prev =>
        prev.map(o => (o.id === editingOrder.id ? { ...o, ...payload, productName: resolvedEditSku?.name || o.productName, productCode: resolvedEditSku?.skuCode || o.productCode } : o))
      );

      if (updateDemandOrder) {
        updateDemandOrder(editingOrder.id, payload);
      }

      addToast(`Demand Order ${editingOrder.orderNumber} updated successfully!`, "success");
      setEditingOrder(null);
    } catch (err) {
      console.error("Update order failed:", err);
      addToast("Failed to update demand order in backend.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Cancel Order
  const handleCancelOrder = async (orderId, orderNumber) => {
    try {
      await planningService.deleteDemandOrder(orderId);
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
      );
      if (cancelDemandOrder) {
        cancelDemandOrder(orderId, "Cancelled by Planner");
      }
      addToast(`Demand Order ${orderNumber || orderId} marked as CANCELLED.`, "info");
    } catch (err) {
      console.error("Cancel order failed:", err);
      addToast("Failed to cancel demand order in backend.", "error");
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = "Order ID,Order Number,Customer,Product Code,Product Name,Quantity,UOM,Requested Ship Date,Priority,Status\n";
    const rows = filteredOrders
      .map((o) => `"${o.id}","${o.orderNumber}","${o.customer || o.customerName}","${o.productCode}","${o.productName}",${o.quantity},"${o.uom || 'Units'}","${o.requestedShipDate}","${o.priority}","${o.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Customer_Demand_Orders_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Demand orders exported to CSV.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0, paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0 }}>
              Customer Demand & Purchase Orders
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
              {openOrders} OPEN DEMAND ORDERS
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Capture, allocate, and manage firm customer sales orders and EDI requisitions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button 
            variant="outline" 
            icon={RefreshCw} 
            onClick={() => {
              fetchOrders();
              addToast("Customer orders refreshed from live backend API", "success");
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
            onClick={() => setIsAddModalOpen(true)}
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
            + Create Demand Order
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
          title="TOTAL DEMAND ORDERS"
          value={totalOrders.toString()}
          unit="Orders Logged"
          icon={FileText}
          colorVariant="cyan"
        />
        <StatCard
          title="OPEN DEMAND"
          value={openOrders.toString()}
          unit="Awaiting Allocation"
          icon={ShoppingBag}
          colorVariant="amber"
        />
        <StatCard
          title="TOTAL DEMAND VOLUME"
          value={totalUnits.toLocaleString()}
          unit="Master Units"
          icon={TrendingUp}
          colorVariant="emerald"
        />
        <StatCard
          title="HIGH PRIORITY DEMANDS"
          value={urgentOrders.toString()}
          unit="Urgent / High"
          icon={AlertCircle}
          colorVariant="rose"
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box", background: "white", border: "1px solid #E8DDCF", borderRadius: "16px" }}>
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
              style={{ paddingLeft: "32px", height: "38px", fontSize: "13px", backgroundColor: "#FAF8F5", border: "1px solid #D1C7BA", borderRadius: "8px", outline: "none", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "Open", "Allocated", "Fulfilled", "Cancelled"].map((st) => (
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

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDCF", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Order Ref</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Customer Name</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Master Product SKU</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Requested Volume</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Target Ship Date</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Priority</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 14px", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: "1px solid #F0EAE1",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {o.orderNumber}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: {o.id}</div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{o.customer || o.customerName}</div>
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
                        {Number(o.quantity).toLocaleString()} {o.uom || "Bottles"}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        <span>{o.requestedShipDate}</span>
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: o.priority === "Urgent" ? "rgba(220, 38, 38, 0.12)" : o.priority === "High" ? "rgba(200, 149, 71, 0.18)" : "#FAF8F5",
                        color: o.priority === "Urgent" ? "#DC2626" : o.priority === "High" ? "#8B6914" : "var(--text-secondary)"
                      }}>
                        {o.priority}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: o.status === "Fulfilled" ? "rgba(200, 149, 71, 0.2)" : o.status === "Allocated" ? "rgba(200, 149, 71, 0.12)" : o.status === "Open" ? "rgba(200, 149, 71, 0.15)" : "#FAF8F5",
                        color: o.status === "Fulfilled" ? "#2B1D11" : o.status === "Cancelled" ? "#DC2626" : "#8B6914"
                      }}>
                        {o.status}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          onClick={() => setEditingOrder({ ...o })}
                          title="Edit Demand Order"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "#FAF8F5",
                            color: "var(--text-primary)",
                            border: "1px solid #D1C7BA",
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
                            onClick={() => handleCancelOrder(o.id, o.orderNumber)}
                            title="Cancel Order"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: "#FAF8F5",
                              color: "#DC2626",
                              border: "1px solid #D1C7BA",
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
        }} onClick={() => setIsAddModalOpen(false)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "560px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8DDCF", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShoppingBag size={18} color="#8B6914" />
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
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Customer Purchase Order # *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.orderNumber}
                    onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Customer / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Costco Wholesale EMEA"
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Master SKU Selection *</label>
                <select
                  value={newOrder.skuId}
                  onChange={(e) => setNewOrder({ ...newOrder, skuId: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.skuId || s.id} value={s.skuId || s.id}>
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
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Ordered Quantity ({resolvedNewSku?.uom || "Units"}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Requested Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={newOrder.requestedShipDate}
                    onChange={(e) => setNewOrder({ ...newOrder, requestedShipDate: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Priority Tier</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Fulfillment Plant</label>
                  <select
                    value={newOrder.plantId}
                    onChange={(e) => setNewOrder({ ...newOrder, plantId: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Order Notes & Logistics Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Endcap promotional display barcode required."
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #E8DDCF", paddingTop: "14px" }}>
                <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Demand Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEMAND ORDER MODAL */}
      {editingOrder && (
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
        }} onClick={() => setEditingOrder(null)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "560px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8DDCF", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#8B6914" />
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
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editingOrder.customer || editingOrder.customerName || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value, customerName: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Master SKU Selection *</label>
                <select
                  value={editingOrder.skuId}
                  onChange={(e) => setEditingOrder({ ...editingOrder, skuId: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.skuId || s.id} value={s.skuId || s.id}>
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
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Ordered Quantity ({resolvedEditSku?.uom || "Units"}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingOrder.quantity}
                    onChange={(e) => setEditingOrder({ ...editingOrder, quantity: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Requested Ship Date *</label>
                  <input
                    type="date"
                    required
                    value={editingOrder.requestedShipDate}
                    onChange={(e) => setEditingOrder({ ...editingOrder, requestedShipDate: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Priority</label>
                  <select
                    value={editingOrder.priority}
                    onChange={(e) => setEditingOrder({ ...editingOrder, priority: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  >
                    <option value="Open">Open</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Order Notes</label>
                <input
                  type="text"
                  value={editingOrder.notes || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #E8DDCF", paddingTop: "14px" }}>
                <Button variant="outline" type="button" onClick={() => setEditingOrder(null)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;

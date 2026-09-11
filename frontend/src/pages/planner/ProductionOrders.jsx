import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { productionService } from "../../services/productionService";
import {
  Factory,
  Plus,
  Search,
  X,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Package,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Check,
  Download
} from "lucide-react";

export function ProductionOrders() {
  const { productionOrders: ctxOrders = [], setProductionOrders: setCtxOrders } = useProduction();
  const { skus = [], lines = [] } = useMasterData();
  const { addToast } = useApp();

  const [orders, setOrders] = useState(ctxOrders || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available finished goods or master SKUs
  const availableSkus = useMemo(() => {
    const fg = skus.filter((s) => s.category === "Finished Goods");
    return fg.length > 0 ? fg : skus;
  }, [skus]);

  // Form State using stable master IDs
  const defaultSku = availableSkus[0] || {
    skuId: "SKU-001",
    skuCode: "SKU-5001",
    name: "500ml Sparkling Citrus Soda",
    uom: "Bottles"
  };

  const defaultLine = lines[0] || {
    lineId: "LIN-01",
    name: "High-Speed Bottling Line 1",
    lineCode: "LINE-1"
  };

  const [formData, setFormData] = useState({
    orderNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    skuId: defaultSku.skuId || defaultSku.id,
    lineId: defaultLine.lineId || defaultLine.id,
    targetQuantity: 25000,
    plannedStartDate: new Date().toISOString().substring(0, 10),
    priority: "NORMAL",
    status: "SCHEDULED"
  });

  // Fetch production orders from backend API
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productionService.getOrders();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (list.length > 0) {
        setOrders(list);
        if (setCtxOrders) setCtxOrders(list);
      } else if (ctxOrders.length > 0) {
        setOrders(ctxOrders);
      }
    } catch (err) {
      console.warn("Using contextual production orders fallback:", err.message);
      if (ctxOrders.length > 0) {
        setOrders(ctxOrders);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ctxOrders, setCtxOrders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status via API
  const handleUpdateStatus = async (orderId, newStatus) => {
    // Optimistic local update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (setCtxOrders) {
      setCtxOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }

    try {
      await productionService.updateOrderStatus(orderId, newStatus);
      addToast(`Order status updated to ${newStatus} (Connected to API)`, "success");
    } catch (err) {
      console.warn("Backend status update fallback:", err.message);
      addToast(`Status updated to ${newStatus}`, "info");
    }
  };

  // Dynamically resolve SKU details
  const selectedSku = useMemo(() => {
    return (
      skus.find((s) => s.skuId === formData.skuId || s.id === formData.skuId) ||
      defaultSku
    );
  }, [skus, formData.skuId, defaultSku]);

  // Dynamically resolve Line details
  const selectedLine = useMemo(() => {
    return (
      lines.find((l) => l.lineId === formData.lineId || l.id === formData.lineId) ||
      defaultLine
    );
  }, [lines, formData.lineId, defaultLine]);

  // KPIs
  const totalOrders = orders.length;
  const runningOrders = orders.filter((o) =>
    (typeof o?.status === "string" ? o.status : "").toLowerCase().includes("run")
  ).length;
  const scheduledOrders = orders.filter((o) =>
    (typeof o?.status === "string" ? o.status : "").toLowerCase().includes("sched") ||
    (typeof o?.status === "string" ? o.status : "").toLowerCase().includes("plan")
  ).length;
  const totalVolume = orders.reduce(
    (sum, o) => sum + (Number(o?.targetQuantity) || 0),
    0
  );

  // Filtered list
  const filteredOrders = useMemo(() => {
    return orders.filter((po) => {
      if (!po) return false;
      const statusStr = typeof po.status === "string" ? po.status : "";
      const matchesStatus =
        statusFilter === "ALL" ||
        statusStr.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const lineStr =
        typeof po.line === "object" ? po.line?.name || "" : po.line || "";
      const prodName =
        typeof po.productName === "string"
          ? po.productName
          : po.sku?.name || "";
      const prodCode =
        typeof po.productCode === "string"
          ? po.productCode
          : po.sku?.skuCode || "";
      const ordNum = typeof po.orderNumber === "string" ? po.orderNumber : "";

      const matchesSearch =
        !q ||
        ordNum.toLowerCase().includes(q) ||
        prodName.toLowerCase().includes(q) ||
        prodCode.toLowerCase().includes(q) ||
        lineStr.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setFormData({
      orderNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      skuId: availableSkus[0]?.skuId || availableSkus[0]?.id || defaultSku.skuId,
      lineId: lines[0]?.lineId || lines[0]?.id || defaultLine.lineId,
      targetQuantity: 25000,
      plannedStartDate: new Date().toISOString().substring(0, 10),
      priority: "NORMAL",
      status: "SCHEDULED"
    });
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!formData.orderNumber.trim()) {
      addToast("Please provide a valid Production Order number.", "warning");
      return;
    }

    if (!formData.targetQuantity || Number(formData.targetQuantity) <= 0) {
      addToast("Target Quantity must be greater than 0.", "warning");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      orderNumber: formData.orderNumber.trim(),
      skuId: formData.skuId || selectedSku?.id || selectedSku?.skuId,
      lineId: formData.lineId || selectedLine?.id || selectedLine?.lineId,
      targetQuantity: Number(formData.targetQuantity),
      plannedStart: `${formData.plannedStartDate}T06:00:00Z`,
      plannedEnd: `${formData.plannedStartDate}T18:00:00Z`,
      priority: formData.priority || "NORMAL"
    };

    const newPO = {
      id: `PO-${Date.now()}`,
      orderNumber: payload.orderNumber,
      productCode: selectedSku?.skuCode || selectedSku?.skuId || "SKU-5001",
      productName: selectedSku?.name || "Finished Goods",
      producedQuantity: 0,
      targetQuantity: payload.targetQuantity,
      unit: selectedSku?.uom || "Bottles",
      status: formData.status || "SCHEDULED",
      line: selectedLine?.name || "Line 1",
      plant: selectedLine?.plantName || "Main Bottling Plant",
      startTime: `${formData.plannedStartDate} 06:00`,
      estimatedEndTime: `${formData.plannedStartDate} 18:00`,
      skuId: payload.skuId,
      lineId: payload.lineId
    };

    try {
      const created = await productionService.createOrder(payload);
      const finalPO = created?.order || created || newPO;
      setOrders((prev) => [finalPO, ...prev]);
      if (setCtxOrders) setCtxOrders((prev) => [finalPO, ...(prev || [])]);
      addToast(
        `Production Order ${payload.orderNumber} successfully created and released to MES! (API Connected)`,
        "success"
      );
    } catch (err) {
      console.warn("Backend create order fallback:", err.message);
      setOrders((prev) => [newPO, ...prev]);
      if (setCtxOrders) setCtxOrders((prev) => [newPO, ...(prev || [])]);
      addToast(
        `Production Order ${newPO.orderNumber} saved locally for ${newPO.productName}!`,
        "success"
      );
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  // Export CSV handler
  const handleExportCSV = () => {
    addToast("Exporting Production Orders to CSV...", "info");
    let csv = "Order Number,Product Name,Product Code,Line,Target Quantity,Produced Quantity,Progress %,Planned Start,Status\n";
    filteredOrders.forEach((po) => {
      const target = Number(po.targetQuantity) || 1;
      const produced = Number(po.producedQuantity) || 0;
      const pct = Math.min(100, Math.round((produced / target) * 100));
      const pName = typeof po.productName === "string" ? po.productName : po.sku?.name || "Product";
      const pCode = typeof po.productCode === "string" ? po.productCode : po.sku?.skuCode || "SKU";
      const pLine = typeof po.line === "object" ? po.line?.name || "Line 1" : po.line || "Line 1";
      const start = po.startTime ? String(po.startTime).substring(0, 10) : po.plannedStart ? String(po.plannedStart).substring(0, 10) : "2026-08-31";
      csv += `"${po.orderNumber || po.id}","${pName}","${pCode}","${pLine}",${po.targetQuantity || 0},${produced},${pct}%,"${start}","${po.status || "SCHEDULED"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Production_Orders_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Production Orders CSV downloaded successfully!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Supply Planning Production Orders
            </h1>
            <Badge variant="amber">{totalOrders} TOTAL ORDERS</Badge>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
            Manage manufacturing work orders, view live batch progress, and dispatch to lines with real-time API sync.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchOrders}
            disabled={isLoading}
            style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 700 }}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportCSV}
            style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 700 }}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenCreateModal}
            style={{ fontSize: "13px", padding: "8px 16px", fontWeight: 700 }}
          >
            + Create Production Order
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
          title="Total Orders"
          value={totalOrders.toString()}
          unit="Active Runs"
          icon={Factory}
          colorVariant="amber"
        />
        <StatCard
          title="Running In Production"
          value={runningOrders.toString()}
          unit="Active Lines"
          icon={TrendingUp}
          colorVariant="amber"
        />
        <StatCard
          title="Scheduled Queue"
          value={scheduledOrders.toString()}
          unit="Pending Release"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Total Planned Volume"
          value={totalVolume.toLocaleString()}
          unit="Master Units"
          icon={Package}
          colorVariant="amber"
        />
      </div>

      {/* Search, Status Filter & Table Container */}
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
              placeholder="Search by Order #, SKU Name, Code, or Line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "Scheduled", "Running", "Completed", "Paused"].map((st) => (
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

        {/* Orders Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "950px" }}>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Master SKU & Product</th>
                <th>Assigned Line</th>
                <th>Target Quantity</th>
                <th>Progress</th>
                <th>Planned Start</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((po) => {
                  const target = Number(po.targetQuantity) || 1;
                  const produced = Number(po.producedQuantity) || 0;
                  const percent = Math.min(100, Math.round((produced / target) * 100));
                  const status = (po.status || "SCHEDULED").toUpperCase();

                  return (
                    <tr
                      key={po.id || po.orderNumber}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                          {po.orderNumber || po.id}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          ID: {po.id}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {typeof po.productName === "string" ? po.productName : (po.sku?.name || "Finished Product")}
                        </div>
                        <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                          {typeof po.productCode === "string" ? po.productCode : (po.sku?.skuCode || po.skuId || "SKU-5001")}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {typeof po.line === "object" ? (po.line?.name || "Line 1") : (po.line || "Line 1")}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          {typeof po.plant === "object" ? (po.plant?.name || "Indore Plant") : (po.plant || "Indore Plant")}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                          {Number(po.targetQuantity || 0).toLocaleString()} {typeof po.unit === "object" ? (po.unit?.name || "Bottles") : (po.unit || "Bottles")}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", minWidth: "140px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{produced.toLocaleString()}</span>
                          <span style={{ fontWeight: 800, color: percent >= 100 ? "#8C5B23" : "#C89547" }}>{percent}%</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${percent}%`,
                              height: "100%",
                              backgroundColor: percent >= 100 ? "#8C5B23" : "#C89547",
                              borderRadius: "3px",
                              transition: "width 0.3s ease"
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} color="var(--text-muted)" />
                          <span>{po.startTime ? String(po.startTime).substring(0, 10) : (po.plannedStart ? String(po.plannedStart).substring(0, 10) : "2026-08-31")}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge
                          variant={
                            status.includes("RUN")
                              ? "amber"
                              : status.includes("COMP")
                              ? "neutral"
                              : status.includes("SCHED") || status.includes("PLAN")
                              ? "amber"
                              : "rose"
                          }
                        >
                          {po.status || "SCHEDULED"}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          {status !== "RUNNING" && status !== "COMPLETED" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Play}
                              onClick={() => handleUpdateStatus(po.id, "RUNNING")}
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                            >
                              Run
                            </Button>
                          )}
                          {status === "RUNNING" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Pause}
                              onClick={() => handleUpdateStatus(po.id, "PAUSED")}
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                            >
                              Pause
                            </Button>
                          )}
                          {status !== "COMPLETED" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Check}
                              onClick={() => handleUpdateStatus(po.id, "COMPLETED")}
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                            >
                              Done
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No production orders match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE PRODUCTION ORDER MODAL */}
      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              border: "1px solid var(--border-subtle)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Factory size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Release New Production Order
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOrder} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Order Number */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Production Order Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PO-2026-904"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              {/* Centralized Master SKU Selection */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Master SKU Selection (Single Source of Truth) *
                  </label>
                  <span style={{ fontSize: "10px", color: "#8C5B23", fontWeight: 700 }}>
                    ● Central Master Catalog ({availableSkus.length} SKUs)
                  </span>
                </div>
                <select
                  value={formData.skuId}
                  onChange={(e) => setFormData({ ...formData, skuId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {availableSkus.map((s) => (
                    <option key={s.skuId || s.id} value={s.skuId || s.id}>
                      {s.skuCode} — {s.name} ({s.uom})
                    </option>
                  ))}
                </select>
              </div>

              {/* Resolved SKU Details Preview Card */}
              {selectedSku && (
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
                      {selectedSku.skuCode || selectedSku.skuId}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Product Name:</span>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                      {selectedSku.name || selectedSku.productName}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>UOM:</span>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                      {selectedSku.uom || "Units"}
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Line / Work Center from Master Lines */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Assigned Work Center / Line *
                  </label>
                  <select
                    value={formData.lineId}
                    onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId || l.id} value={l.lineId || l.id}>
                        {l.lineCode ? `${l.lineCode} - ` : ""}{l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Target Planned Output ({selectedSku?.uom || "Units"}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              {/* Date & Priority */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Planned Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="RUNNING">Running</option>
                    <option value="PAUSED">Paused</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus} disabled={isSubmitting}>
                  {isSubmitting ? "Releasing..." : "Release Production Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

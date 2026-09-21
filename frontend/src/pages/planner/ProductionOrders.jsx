import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { productionService } from "../../services/productionService";
import { masterDataService } from "../../services/masterDataService";
import planningService from "../../services/planningService";
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

  const [activeTab, setActiveTab] = useState("PACKAGING"); // PACKAGING | PROCESSING | LINKAGE
  const [orders, setOrders] = useState(ctxOrders || []);
  const [processingBatches, setProcessingBatches] = useState([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedBatchForLink, setSelectedBatchForLink] = useState(null);
  const [targetPackagingOrderId, setTargetPackagingOrderId] = useState("");

  const [batchFormData, setBatchFormData] = useState({
    batchNumber: `BAT-2026-B${Math.floor(100 + Math.random() * 900)}`,
    skuId: "",
    tankNumber: "Tank-01",
    targetVolume: 5000,
    uom: "Liters",
    recipeVersion: "R1 (Standard Blend)"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Live DB Master Data State
  const [dbSkus, setDbSkus] = useState([]);
  const [dbLines, setDbLines] = useState([]);

  // Fetch live master data (SKUs and Production Lines) from backend DB API
  const loadMasterData = useCallback(async () => {
    try {
      const skuRes = await masterDataService.getSkus();
      const skuList = Array.isArray(skuRes) ? skuRes : (Array.isArray(skuRes?.data) ? skuRes.data : []);
      if (skuList.length > 0) setDbSkus(skuList);
    } catch (err) {
      console.warn("[ProductionOrders] Failed to load live SKUs from DB API:", err.message);
    }

    try {
      const lineRes = await masterDataService.getLines();
      const lineList = Array.isArray(lineRes) ? lineRes : (Array.isArray(lineRes?.data) ? lineRes.data : []);
      if (lineList.length > 0) setDbLines(lineList);
    } catch (err) {
      console.warn("[ProductionOrders] Failed to load live Lines from DB API:", err.message);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  // Available Master SKUs from live DB or context
  const availableSkus = useMemo(() => {
    return dbSkus.length > 0 ? dbSkus : skus;
  }, [dbSkus, skus]);

  // Available Lines from live DB or context
  const availableLines = useMemo(() => {
    return dbLines.length > 0 ? dbLines : lines;
  }, [dbLines, lines]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    orderNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    skuId: "",
    lineId: "",
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
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));
      if (Array.isArray(list) && list.length > 0) {
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

  const fetchProcessingBatches = useCallback(async () => {
    try {
      const res = await planningService.getProcessingBatches();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setProcessingBatches(list);
    } catch (err) {
      console.warn("Failed to fetch processing batches from API:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProcessingBatches();
    const interval = setInterval(() => {
      fetchOrders();
      fetchProcessingBatches();
    }, 4000);
    const handleFocus = () => {
      fetchOrders();
      fetchProcessingBatches();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await planningService.createProcessingBatch(batchFormData);
      addToast(res?.message || "Processing Batch created successfully in PostgreSQL DB!", "success");
      setIsBatchModalOpen(false);
      await fetchProcessingBatches();
    } catch (err) {
      addToast("Failed to create processing batch.", "error");
    }
  };

  const handleLinkBatch = async (e) => {
    e.preventDefault();
    if (!selectedBatchForLink || !targetPackagingOrderId) {
      addToast("Please select a Packaging Order to link.", "warning");
      return;
    }
    try {
      const res = await planningService.linkProcessingBatch(selectedBatchForLink.id, targetPackagingOrderId);
      addToast(res?.message || "Batch successfully linked to Packaging Order!", "success");
      setIsLinkModalOpen(false);
      await fetchProcessingBatches();
      await fetchOrders();
    } catch (err) {
      addToast("Failed to link batch.", "error");
    }
  };

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
    if (!formData.skuId) return availableSkus[0] || null;
    return (
      availableSkus.find(
        (s) => String(s.skuId || s.id) === String(formData.skuId)
      ) || availableSkus[0] || null
    );
  }, [availableSkus, formData.skuId]);

  // Dynamically resolve Line details
  const selectedLine = useMemo(() => {
    if (!formData.lineId) return availableLines[0] || null;
    return (
      availableLines.find(
        (l) => String(l.lineId || l.id) === String(formData.lineId)
      ) || availableLines[0] || null
    );
  }, [availableLines, formData.lineId]);

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

  const handleOpenCreateModal = async () => {
    await loadMasterData();
    const currentSkus = dbSkus.length > 0 ? dbSkus : availableSkus;
    const currentLines = dbLines.length > 0 ? dbLines : availableLines;
    const firstSkuVal = currentSkus[0]?.id || currentSkus[0]?.skuId || "";
    const firstLineVal = currentLines[0]?.id || currentLines[0]?.lineId || "";
    setFormData({
      orderNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      skuId: firstSkuVal,
      lineId: firstLineVal,
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
      productCode: selectedSku?.skuCode || selectedSku?.code || selectedSku?.skuId || "SKU-PROD",
      productName: selectedSku?.name || selectedSku?.productName || "Finished Goods",
      producedQuantity: 0,
      targetQuantity: payload.targetQuantity,
      unit: selectedSku?.uom || "Bottles",
      status: formData.status || "SCHEDULED",
      line: selectedLine?.name || selectedLine?.lineName || "Line 1",
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
      await fetchOrders();
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
            onClick={() => { fetchOrders(); fetchProcessingBatches(); }}
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
            variant="secondary"
            icon={Plus}
            onClick={() => setIsBatchModalOpen(true)}
            style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 700 }}
          >
            + Create Bulk Processing Batch
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenCreateModal}
            style={{ fontSize: "13px", padding: "8px 16px", fontWeight: 700 }}
          >
            + Create Packaging Order
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

      {/* Main Content Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("PACKAGING")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 800,
              backgroundColor: activeTab === "PACKAGING" ? "#C89547" : "var(--bg-card-subtle)",
              color: activeTab === "PACKAGING" ? "#261603" : "var(--text-secondary)",
              border: activeTab === "PACKAGING" ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Package size={15} /> Packaging Orders (Line Packing Runs) ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("PROCESSING")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 800,
              backgroundColor: activeTab === "PROCESSING" ? "#C89547" : "var(--bg-card-subtle)",
              color: activeTab === "PROCESSING" ? "#261603" : "var(--text-secondary)",
              border: activeTab === "PROCESSING" ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Layers size={15} /> Processing Orders (Bulk Vessel Batches) ({processingBatches.length})
          </button>

          <button
            onClick={() => setActiveTab("LINKAGE")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 800,
              backgroundColor: activeTab === "LINKAGE" ? "#C89547" : "var(--bg-card-subtle)",
              color: activeTab === "LINKAGE" ? "#261603" : "var(--text-secondary)",
              border: activeTab === "LINKAGE" ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <ArrowRight size={15} /> 1 Processing Batch ➔ Multiple Packaging Runs Tree
          </button>
        </div>

        {/* TAB 1: PACKAGING ORDERS */}
        {activeTab === "PACKAGING" && (
          <>
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
                        <tr key={po.id || po.orderNumber} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                              {po.orderNumber || po.id}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                              {typeof po.productName === "string" ? po.productName : (po.sku?.name || "Finished Product")}
                            </div>
                            <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                              {typeof po.productCode === "string" ? po.productCode : (po.sku?.skuCode || po.skuId || "SKU-5001")}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                              {typeof po.line === "object" ? (po.line?.name || "Line 1") : (po.line || "Line 1")}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                              {Number(po.targetQuantity || 0).toLocaleString()} {typeof po.unit === "object" ? (po.unit?.name || "Bottles") : (po.unit || "Bottles")}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", minWidth: "140px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                              <span>{produced.toLocaleString()}</span>
                              <span style={{ fontWeight: 800, color: percent >= 100 ? "#8C5B23" : "#C89547" }}>{percent}%</span>
                            </div>
                            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${percent}%`, height: "100%", backgroundColor: percent >= 100 ? "#8C5B23" : "#C89547" }} />
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              {po.startTime ? String(po.startTime).substring(0, 10) : (po.plannedStart ? String(po.plannedStart).substring(0, 10) : "2026-08-31")}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <Badge variant={status.includes("RUN") ? "amber" : status.includes("COMP") ? "neutral" : "amber"}>
                              {po.status || "SCHEDULED"}
                            </Badge>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                              {status !== "RUNNING" && status !== "COMPLETED" && (
                                <Button variant="secondary" size="sm" icon={Play} onClick={() => handleUpdateStatus(po.id, "RUNNING")}>Run</Button>
                              )}
                              {status === "RUNNING" && (
                                <Button variant="secondary" size="sm" icon={Pause} onClick={() => handleUpdateStatus(po.id, "PAUSED")}>Pause</Button>
                              )}
                              {status !== "COMPLETED" && (
                                <Button variant="secondary" size="sm" icon={Check} onClick={() => handleUpdateStatus(po.id, "COMPLETED")}>Done</Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)" }}>
                        No packaging production orders match current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: PROCESSING ORDERS (BULK VESSEL BATCHES) */}
        {activeTab === "PROCESSING" && (
          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "950px" }}>
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Assigned Vessel / Tank</th>
                  <th>Recipe & SKU</th>
                  <th>Target Volume</th>
                  <th>Current Step</th>
                  <th>Status</th>
                  <th>Linked Packaging Runs</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processingBatches.length > 0 ? (
                  processingBatches.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {b.batchNumber}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                        <Badge variant="cyan">{b.tankNumber || "Tank-01"}</Badge>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 700 }}>{b.skuName || "Bulk Liquid Formulation"}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{b.recipeVersion || "Standard R1"}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                        {Number(b.targetVolume || 0).toLocaleString()} {b.uom || "Liters"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        Step {b.currentStep || 1} ({b.progressPercent || 0}%)
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Badge variant={b.status === "In Process" ? "amber" : "neutral"}>{b.status || "PLANNED"}</Badge>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {b.linkedPackagingOrders && b.linkedPackagingOrders.length > 0 ? (
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {b.linkedPackagingOrders.map((l, idx) => (
                              <Badge key={idx} variant="purple">{l.orderNumber}</Badge>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Unlinked</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedBatchForLink(b);
                            setIsLinkModalOpen(true);
                          }}
                        >
                          + Link Packaging Order
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)" }}>
                      No processing batches found in PostgreSQL database. Click "+ Create Bulk Processing Batch" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: 1 BATCH -> MULTIPLE PACKAGING RUNS TREE */}
        {activeTab === "LINKAGE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              1 Bulk Processing Batch ➔ Multiple Packaging Line Runs Hierarchy
            </h3>
            {processingBatches.map((b) => (
              <div
                key={b.id}
                style={{
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "16px",
                  backgroundColor: "var(--bg-card-subtle)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {b.batchNumber}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", marginLeft: "10px" }}>
                      Vessel: <strong>{b.tankNumber || "Tank-01"}</strong> | Volume: <strong>{Number(b.targetVolume).toLocaleString()} {b.uom || "Liters"}</strong>
                    </span>
                  </div>
                  <Badge variant="amber">{b.status || "PLANNED"}</Badge>
                </div>

                <div style={{ paddingLeft: "24px", borderLeft: "3px solid #C89547", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#8C5B23", textTransform: "uppercase" }}>
                    Linked Child Packaging Line Runs:
                  </div>
                  {b.linkedPackagingOrders && b.linkedPackagingOrders.length > 0 ? (
                    b.linkedPackagingOrders.map((po, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "6px",
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <strong style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>{po.orderNumber}</strong>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "12px" }}>
                            Target Output: {po.targetQuantity} Bottles
                          </span>
                        </div>
                        <Badge variant="purple">{po.status || "SCHEDULED"}</Badge>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No child packaging runs linked yet to this bulk batch. Click "+ Link Packaging Order" in Processing Batches tab to connect.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* CREATE PROCESSING BATCH MODAL */}
      {isBatchModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBatchModalOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(38, 22, 3, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div className="modal-content" style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", width: "100%", maxWidth: "500px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Create Bulk Processing Batch</h3>
              <button onClick={() => setIsBatchModalOpen(false)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateBatch} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Batch Number</label>
                <input className="form-input" value={batchFormData.batchNumber} onChange={(e) => setBatchFormData({ ...batchFormData, batchNumber: e.target.value })} required />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Assigned Processing Vessel / Tank</label>
                <select className="form-input" value={batchFormData.tankNumber} onChange={(e) => setBatchFormData({ ...batchFormData, tankNumber: e.target.value })}>
                  <option value="Tank-01">Tank-01 (Mixing Vessel 5,000L)</option>
                  <option value="Tank-02">Tank-02 (Aseptic Holding Tank 10,000L)</option>
                  <option value="Vessel-03">Vessel-03 (Cooker Kettle 3,500L)</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Target Bulk Volume (Liters)</label>
                <input type="number" className="form-input" value={batchFormData.targetVolume} onChange={(e) => setBatchFormData({ ...batchFormData, targetVolume: Number(e.target.value) })} required />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <Button variant="secondary" onClick={() => setIsBatchModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Batch in DB</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK BATCH TO PACKAGING ORDER MODAL */}
      {isLinkModalOpen && selectedBatchForLink && (
        <div className="modal-backdrop" onClick={() => setIsLinkModalOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(38, 22, 3, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div className="modal-content" style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", width: "100%", maxWidth: "500px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Link Batch to Packaging Order</h3>
              <button onClick={() => setIsLinkModalOpen(false)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: "13px", marginBottom: "16px", color: "var(--text-secondary)" }}>
              Link Processing Batch <strong>{selectedBatchForLink.batchNumber}</strong> ({selectedBatchForLink.tankNumber}) to a child Packaging Line Order:
            </div>
            <form onSubmit={handleLinkBatch} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700 }}>Select Packaging Line Order</label>
                <select className="form-input" value={targetPackagingOrderId} onChange={(e) => setTargetPackagingOrderId(e.target.value)} required>
                  <option value="">-- Choose Packaging Order --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber || o.id} — {typeof o.productName === "string" ? o.productName : "Product"} ({o.targetQuantity} Bottles)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <Button variant="secondary" onClick={() => setIsLinkModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Linkage in DB</Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    {availableLines.map((l) => (
                      <option key={l.lineId || l.id} value={l.lineId || l.id}>
                        {l.lineCode || l.code ? `${l.lineCode || l.code} — ` : ""}{l.name || l.lineName}
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

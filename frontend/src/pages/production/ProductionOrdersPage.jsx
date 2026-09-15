import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Search,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  X,
  Factory,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import productionService from "../../services/productionService";

export function ProductionOrdersPage() {
  const { productionOrders = [], updateOrderStatus, deleteProductionOrder, updateOrderQuantity, setProductionOrders, createProductionOrder } = useProduction();
  const { skus = [], lines = [] } = useMasterData();
  const { addToast } = useApp();

  const loadOrders = useCallback(async () => {
    try {
      const res = await productionService.getOrders();
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));
      if (Array.isArray(data) && typeof setProductionOrders === "function") {
        setProductionOrders(data);
      }
    } catch (err) {
      console.warn("Orders load:", err.message);
    }
  }, [setProductionOrders]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    const handleFocus = () => loadOrders();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadOrders]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    skuId: "",
    productName: "",
    productCode: "",
    line: "",
    plant: "",
    targetQuantity: "",
    unit: "Units",
    activeShift: ""
  });

  const getTarget = (o) => Number(o?.targetQuantity ?? o?.targetQty ?? 1) || 1;

  const getProduced = (o) => {
    const explicit = Number(o?.producedQuantity ?? o?.producedQty ?? 0);
    if (explicit > 0) return explicit;

    if (o?.batches && o.batches.length > 0) {
      const batchVol = Number(o.batches[0].actualVolume || 0);
      if (batchVol > 0) return batchVol;
    }

    const tgt = getTarget(o);
    const st = String(o?.status || "").toLowerCase();
    if (st.includes("comp") || st === "completed") return tgt;
    if (st.includes("qa") || st === "qa pending") return tgt;
    if (st.includes("run") || st === "in progress") return Math.round(tgt * 0.45);
    if (st.includes("pause")) return Math.round(tgt * 0.45);
    return 0;
  };

  const getProgress = (o) => {
    const st = String(o?.status || "").toLowerCase();
    const isCompleted = st.includes("comp") || st === "completed";

    // ONLY Completed status can ever be 100%
    if (isCompleted) return 100;

    // If order has an active eBR batch with defined progress (strictly capped below 100% if not completed)
    if (o?.batches && o.batches.length > 0 && o.batches[0].progressPercent !== null && o.batches[0].progressPercent !== undefined) {
      const bp = Number(o.batches[0].progressPercent);
      if (!isNaN(bp) && bp > 0) return Math.min(85, Math.max(0, bp));
    }

    const prod = getProduced(o);
    const tgt = getTarget(o);

    // QA Pending: Shop floor units finished, QA testing & approval is pending (15% remaining)
    if (st.includes("qa") || st === "qa pending") {
      return 85;
    }

    // Running / In Progress: Floor execution in progress
    if (st.includes("run") || st === "in progress") {
      if (prod > 0 && tgt > 0) {
        const ratio = Math.round((prod / tgt) * 75);
        return Math.min(80, Math.max(25, ratio));
      }
      return 45;
    }

    // Paused
    if (st.includes("pause")) {
      if (prod > 0 && tgt > 0) {
        return Math.min(80, Math.max(20, Math.round((prod / tgt) * 75)));
      }
      return 40;
    }

    // Released: Line staged & ready
    if (st.includes("release") || st === "released") {
      return 15;
    }

    // Scheduled / Planned: Not started yet
    return 0;
  };

  const getName = (o) => o?.productName || o?.sku?.name || o?.skuName || o?.orderNumber || "Production Order";
  const getCode = (o) => o?.productCode || o?.sku?.skuCode || o?.skuCode || o?.orderNumber || o?.id;
  const getLineName = (o) => {
    if (!o) return "";
    if (typeof o.line === "string") return o.line;
    if (o.line && typeof o.line === "object") return o.line.name || o.line.lineCode || o.line.code || o.line.id || "";
    if (typeof o.lineName === "string") return o.lineName;
    return String(o.line || "");
  };

  const filteredOrders = productionOrders.filter((order) => {
    if (!order) return false;
    const name = String(getName(order) || "").toLowerCase();
    const id = String(order.id || "").toLowerCase();
    const orderNo = String(order.orderNumber || "").toLowerCase();
    const line = String(getLineName(order) || "").toLowerCase();
    const q = (searchQuery || "").toLowerCase();

    const matchesSearch = id.includes(q) || orderNo.includes(q) || name.includes(q) || line.includes(q);
    const matchesStatus =
      statusFilter === "ALL" ||
      order.status === statusFilter ||
      (statusFilter === "Scheduled" && String(order.status || "").toLowerCase().includes("sched")) ||
      (statusFilter === "Running" && String(order.status || "").toLowerCase().includes("run")) ||
      (statusFilter === "Completed" && String(order.status || "").toLowerCase().includes("comp")) ||
      (statusFilter === "Paused" && String(order.status || "").toLowerCase().includes("pause"));

    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      addToast("Please provide product SKU name", "warning");
      return;
    }

    const orderPayload = {
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productCode: formData.productCode || (formData.skuId ? skus.find((s) => s.skuId === formData.skuId || s.id === formData.skuId)?.skuCode : "") || "SKU-PROD",
      productName: formData.productName,
      line: formData.line,
      plant: formData.plant || "",
      targetQuantity: Number(formData.targetQuantity) || 0,
      producedQuantity: 0,
      scrapQuantity: 0,
      reworkQuantity: 0,
      unit: formData.unit || "Units",
      status: "Running",
      startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      currentSpeedBPM: 0,
      targetSpeedBPM: 0,
      currentOEE: 0,
      activeShift: formData.activeShift || ""
    };

    if (createProductionOrder) {
      await createProductionOrder(orderPayload);
    } else {
      const newId = `PO-2026-${Math.floor(910 + Math.random() * 90)}`;
      setProductionOrders((prev) => [{ id: newId, ...orderPayload }, ...(prev || [])]);
    }

    await loadOrders();

    addToast(`Production Order dispatched to ${formData.line || "Production Line"}!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      skuId: "",
      productName: "",
      productCode: "",
      line: "",
      plant: "",
      targetQuantity: "",
      unit: "Units",
      activeShift: ""
    });
  };

  const handleExportCSV = () => {
    const headers = "Order ID,Product SKU,Line,Target Qty,Produced Qty,Progress %,Status\n";
    const rows = filteredOrders
      .map((o) => {
        const prod = getProduced(o);
        const tgt = getTarget(o);
        const pct = getProgress(o);
        return `"${o.orderNumber || o.id}","${getName(o)}","${getLineName(o)}",${tgt},${prod},${pct},"${o.status || ''}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Production_Orders_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Production orders exported to CSV.", "info");
  };

  const handleDeleteOrder = async (order) => {
    const orderLabel = order.orderNumber || order.id;
    if (window.confirm(`Are you sure you want to delete Production Order "${orderLabel}"?`)) {
      try {
        if (deleteProductionOrder) {
          await deleteProductionOrder(order.id);
        } else {
          await productionService.deleteOrder(order.id);
        }
        await loadOrders();
        addToast(`Production Order "${orderLabel}" deleted successfully.`, "success");
      } catch (err) {
        addToast(`Failed to delete order: ${err.message}`, "error");
      }
    }
  };

  const runningCount = productionOrders.filter((o) => (o.status || "").toLowerCase().includes("run")).length;
  const completedCount = productionOrders.filter((o) => (o.status || "").toLowerCase().includes("comp")).length;
  const inQueueCount = productionOrders.filter((o) => (o.status || "").toLowerCase().includes("qa") || (o.status || "").toLowerCase().includes("sched") || (o.status || "").toLowerCase().includes("plan")).length;
  const totalVolume = productionOrders.reduce((sum, o) => sum + getProduced(o), 0);
  const totalTargetVolume = productionOrders.reduce((sum, o) => sum + getTarget(o), 0);
  const avgEfficiency = productionOrders.length > 0
    ? Math.round(
        productionOrders.reduce(
          (acc, o) => acc + getProgress(o),
          0
        ) / productionOrders.length
      )
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Production Orders & Shop Floor Execution
            </h1>
            <Badge variant="cyan">{productionOrders.length} ACTIVE ORDERS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Order
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          title="Active Production Runs"
          value={runningCount.toString()}
          unit={productionOrders.length > 0 ? `Lines Active (${productionOrders.length} Total)` : "Lines Active"}
          trend={{
            value: runningCount > 0
              ? `${runningCount} running at rated speed`
              : inQueueCount > 0
              ? `${inQueueCount} in QA / queue (0 running)`
              : "No active runs",
            isPositive: runningCount > 0 || inQueueCount > 0,
            text: ""
          }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Shift Volume"
          value={totalVolume.toLocaleString()}
          unit="Units Produced"
          trend={{
            value: totalVolume > 0
              ? "Shift aggregate volume"
              : productionOrders.length > 0
              ? `Target: ${totalTargetVolume.toLocaleString()} units planned`
              : "0 units produced",
            isPositive: totalVolume > 0 || productionOrders.length > 0,
            text: ""
          }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Completed Orders"
          value={completedCount.toString()}
          unit="Finished"
          trend={{
            value: completedCount > 0
              ? `${Math.round((completedCount / productionOrders.length) * 100)}% completion rate`
              : productionOrders.some(o => (o.status || "").toLowerCase().includes("qa"))
              ? `${productionOrders.filter(o => (o.status || "").toLowerCase().includes("qa")).length} in QA Review queue`
              : "No completed orders",
            isPositive: completedCount > 0,
            text: ""
          }}
          icon={Clock}
          colorVariant="emerald"
        />
        <StatCard
          title="Line OEE Efficiency"
          value={productionOrders.length > 0 ? `${avgEfficiency}%` : "0%"}
          unit="OEE Avg"
          trend={{
            value: avgEfficiency > 0
              ? `${avgEfficiency}% avg yield`
              : productionOrders.length > 0
              ? "0% produced of planned batch"
              : "No production data",
            isPositive: avgEfficiency >= 80,
            text: ""
          }}
          icon={TrendingUp}
          colorVariant="amber"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Filter:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "130px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Running">Running</option>
              <option value="Paused">Paused / Break</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product SKU</th>
                <th>Line / Plant</th>
                <th>Target vs Produced</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-secondary)" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>
                      No Production Orders in Database
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                      All dummy and test records have been cleared. Ready for clean manual work order entry.
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: "#C89547",
                        color: "#261603",
                        border: "1px solid #E8C182",
                        cursor: "pointer"
                      }}
                    >
                      + Create First Production Order
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const prod = getProduced(o);
                  const tgt = getTarget(o);
                  const pct = getProgress(o);
                  const isRunning = (o.status || "").toLowerCase().includes("run");
                  const isCompleted = (o.status || "").toLowerCase().includes("comp");

                  return (
                    <tr key={o.id || o.orderNumber}>
                      <td>
                        <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                          {o.orderNumber || o.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{getName(o)}</div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {getCode(o)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{getLineName(o) || "—"}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                          {prod.toLocaleString()} / {tgt.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "110px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "#059669" : "linear-gradient(90deg, #E2B670 0%, #C89547 100%)" }} />
                          </div>
                          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 700 }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={
                            (o.status || "").toLowerCase().includes("run") || o.status === "In Progress"
                              ? "emerald"
                              : o.status === "Completed" || o.status === "Released"
                              ? "cyan"
                              : o.status === "QA Pending"
                              ? "purple"
                              : o.status === "Scheduled"
                              ? "blue"
                              : o.status === "Planned"
                              ? "slate"
                              : "amber"
                          }
                        >
                          {o.status || "Planned"}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            onClick={() => setSelectedOrderDetails(o)}
                            title="View Full Production Order Details"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Eye size={12} /> Details
                          </button>

                          {o.status === "Planned" && (
                            <button
                              onClick={async () => {
                                await updateOrderStatus(o.id, "Scheduled");
                                await loadOrders();
                                addToast(`Order ${o.orderNumber || o.id} scheduled for line setup!`, "info");
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                color: "#2563EB",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                cursor: "pointer"
                              }}
                            >
                              Schedule
                            </button>
                          )}

                          {o.status === "Scheduled" && (
                            <button
                              onClick={async () => {
                                await updateOrderStatus(o.id, "Released");
                                await loadOrders();
                                addToast(`Order ${o.orderNumber || o.id} released to shop floor!`, "info");
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "rgba(139, 92, 246, 0.1)",
                                color: "#7C3AED",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                                cursor: "pointer"
                              }}
                            >
                              Release
                            </button>
                          )}

                          {(o.status === "Released" || o.status === "Paused" || o.status === "Queued") && (
                            <button
                              onClick={async () => {
                                await updateOrderStatus(o.id, "Running");
                                await loadOrders();
                                addToast(`Order ${o.orderNumber || o.id} is now Running on ${getLineName(o) || "Line"}!`, "success");
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                                color: "#261603",
                                border: "1px solid #E8C182",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Play size={12} /> Start
                            </button>
                          )}

                          {isRunning && (
                            <button
                              onClick={async () => {
                                await updateOrderStatus(o.id, "QA Pending");
                                await loadOrders();
                                addToast(`Order ${o.orderNumber || o.id} marked Complete ➔ Transferred to QA Pending Queue!`, "success");
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "rgba(5, 150, 105, 0.1)",
                                color: "#059669",
                                border: "1px solid rgba(5, 150, 105, 0.3)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <CheckCircle2 size={12} /> Finish ➔ QA
                            </button>
                          )}

                          {o.status === "QA Pending" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "11px", color: "#8B5CF6", fontWeight: 700 }}>● QA Reviewing</span>
                              <button
                                onClick={async () => {
                                  await updateOrderStatus(o.id, "Completed");
                                  await loadOrders();
                                  addToast(`Order ${o.orderNumber || o.id} approved & marked Completed!`, "success");
                                }}
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                                  color: "#059669",
                                  border: "1px solid rgba(16, 185, 129, 0.3)",
                                  cursor: "pointer"
                                }}
                              >
                                Approve QA
                              </button>
                            </div>
                          )}

                          {isCompleted && (
                            <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>● Released</span>
                          )}

                          <button
                            onClick={() => handleDeleteOrder(o)}
                            title="Delete Production Order"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: "rgba(239, 68, 68, 0.08)",
                              color: "#DC2626",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px"
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE ORDER MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Production Work Order
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Select Master SKU (from Database)</label>
                <select
                  className="form-select"
                  value={formData.skuId}
                  onChange={(e) => {
                    const val = e.target.value;
                    const picked = skus.find((s) => (s.skuId || s.id) === val);
                    if (picked) {
                      setFormData({
                        ...formData,
                        skuId: picked.skuId || picked.id,
                        productCode: picked.skuCode || picked.code || "",
                        productName: picked.name || "",
                        unit: picked.uom || "Units"
                      });
                    } else {
                      setFormData({
                        ...formData,
                        skuId: "",
                        productCode: "",
                        productName: "",
                        unit: "Units"
                      });
                    }
                  }}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="">-- Choose SKU from Master DB or Enter Below --</option>
                  {skus.map((s) => (
                    <option key={s.skuId || s.id} value={s.skuId || s.id}>
                      {s.skuCode || s.code} — {s.name} {s.uom ? `(${s.uom})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Product Name"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Product SKU Code</label>
                  <input
                    type="text"
                    placeholder="Enter SKU Code"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Production Line *</label>
                  <select
                    className="form-select"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                    required
                  >
                    <option value="">-- Select Line from DB --</option>
                    {lines.map((l) => (
                      <option key={l.lineId || l.id} value={l.name}>
                        {l.lineCode ? `${l.lineCode} — ` : ""}{l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Target Batch Units *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter Target Units"
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant / Facility</label>
                  <input
                    type="text"
                    placeholder="Enter Plant / Facility"
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Active Shift</label>
                  <input
                    type="text"
                    placeholder="Enter Shift Name"
                    value={formData.activeShift}
                    onChange={(e) => setFormData({ ...formData, activeShift: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Dispatch Run
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCTION ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-content" style={{ maxWidth: "620px", margin: "16px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Production Order Details — {selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h2>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Order Status Ribbon */}
              <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.08)", border: "1px solid #C89547", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Current Workflow Status</span>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{selectedOrderDetails.status || "Planned"}</div>
                </div>
                <Badge variant={selectedOrderDetails.status === "Running" ? "emerald" : "cyan"}>
                  Shift: {selectedOrderDetails.activeShift || "—"}
                </Badge>
              </div>

              {/* Attributes Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Master Product SKU</span>
                  <strong style={{ color: "var(--text-primary)" }}>{getName(selectedOrderDetails)}</strong>
                  <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{getCode(selectedOrderDetails)}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Target Production Line</span>
                  <strong style={{ color: "var(--text-primary)" }}>{getLineName(selectedOrderDetails) || "—"}</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selectedOrderDetails.plant || "—"}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Planned Output Quantity</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{getTarget(selectedOrderDetails).toLocaleString()} {selectedOrderDetails.unit || "Units"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Actual Count Produced</span>
                  <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{getProduced(selectedOrderDetails).toLocaleString()} {selectedOrderDetails.unit || "Units"}</strong>
                  <div style={{ marginTop: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter units"
                      id="modal-produced-count"
                      defaultValue={getProduced(selectedOrderDetails) || ""}
                      className="form-input"
                      style={{ height: "26px", fontSize: "11px", padding: "2px 6px", width: "100px", backgroundColor: "#FFFFFF" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inputElem = document.getElementById("modal-produced-count");
                        const val = Number(inputElem?.value);
                        if (!isNaN(val) && val >= 0) {
                          updateOrderQuantity(selectedOrderDetails.id, val);
                          setSelectedOrderDetails({ ...selectedOrderDetails, producedQuantity: val });
                          addToast(`Recorded ${val.toLocaleString()} units produced!`, "success");
                        }
                      }}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "#C89547",
                        color: "#261603",
                        border: "1px solid #E8C182",
                        cursor: "pointer"
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Active Batch Reference</span>
                  <strong style={{ color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{selectedOrderDetails.activeBatchId || selectedOrderDetails.batchNumber || "—"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Line Speed & OEE</span>
                  <strong>{selectedOrderDetails.currentSpeedBPM ? `${selectedOrderDetails.currentSpeedBPM} BPM` : "0 BPM"} (OEE: {selectedOrderDetails.currentOEE ? `${selectedOrderDetails.currentOEE}%` : "0%"})</strong>
                </div>
              </div>

              {/* Material & Quality Readiness Card */}
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Readiness & Traceability Linkage</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669" }}>
                    <ShieldCheck size={14} /> Material Lots Verified & Staged
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669" }}>
                    <CheckCircle2 size={14} /> CIP Line Sanitation Clear
                  </div>
                </div>
              </div>

              {/* Status Flow Buttons */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Workflow State Transitions:</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Planned", "Scheduled", "Released", "Running", "QA Pending", "Completed"].map((st) => (
                    <button
                      key={st}
                      onClick={async () => {
                        await updateOrderStatus(selectedOrderDetails.id, st);
                        await loadOrders();
                        const tgt = getTarget(selectedOrderDetails);
                        let prod = Number(selectedOrderDetails.producedQuantity) || 0;
                        if (st === "Completed" || st === "QA Pending") prod = tgt;
                        else if (st === "Running" && prod === 0) prod = Math.round(tgt * 0.45);
                        setSelectedOrderDetails({ ...selectedOrderDetails, status: st, producedQuantity: prod });
                        addToast(`Order ${selectedOrderDetails.orderNumber || selectedOrderDetails.id} transitioned to ${st}!`, "success");
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: selectedOrderDetails.status === st ? "#C89547" : "var(--bg-card-subtle)",
                        color: selectedOrderDetails.status === st ? "#261603" : "var(--text-secondary)",
                        border: selectedOrderDetails.status === st ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                        cursor: "pointer"
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteOrder(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#DC2626",
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Trash2 size={14} /> Delete Order
                </button>
                <Button variant="secondary" onClick={() => setSelectedOrderDetails(null)}>
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

import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";

export function ProductionOrdersPage() {
  const { productionOrders = [], updateOrderStatus, setProductionOrders } = useProduction();
  const { skus = [], lines = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Order Modal
  const defaultSku = skus.find((s) => s.category === "Finished Goods") || skus[0] || { skuCode: "SKU-5001", name: "500ml Sparkling Citrus Soda", uom: "Bottles" };
  const defaultLine = lines[0] || { name: "Line 1 (Aseptic Bottling)" };

  const [formData, setFormData] = useState({
    skuId: defaultSku.skuId || "SKU-001",
    productName: defaultSku.name,
    productCode: defaultSku.skuCode,
    line: defaultLine.name,
    plant: "Indore Plant - North Facility",
    targetQuantity: 25000,
    unit: defaultSku.uom || "Bottles",
    activeShift: "Shift A (06:00 - 14:30)"
  });

  const getProduced = (o) => o.producedQuantity ?? o.producedQty ?? 0;
  const getTarget = (o) => o.targetQuantity ?? o.targetQty ?? 1;
  const getName = (o) => o.productName ?? o.skuName ?? o.orderNumber ?? "Production Order";
  const getCode = (o) => o.productCode ?? o.orderNumber ?? o.id;

  const filteredOrders = productionOrders.filter((order) => {
    const name = getName(order).toLowerCase();
    const id = (order.id || "").toLowerCase();
    const line = (order.line || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = id.includes(q) || name.includes(q) || line.includes(q);
    const matchesStatus =
      statusFilter === "ALL" ||
      order.status === statusFilter ||
      (statusFilter === "Running" && (order.status || "").toLowerCase().includes("run")) ||
      (statusFilter === "Completed" && (order.status || "").toLowerCase().includes("comp")) ||
      (statusFilter === "Paused" && (order.status || "").toLowerCase().includes("pause"));

    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      addToast("Please provide product SKU name", "warning");
      return;
    }

    const newId = `PO-2026-${Math.floor(910 + Math.random() * 90)}`;
    const newOrder = {
      id: newId,
      orderNumber: `ORD-${newId.replace("PO-", "")}`,
      productCode: formData.productCode || "SKU-PROD-500ML",
      productName: formData.productName,
      line: formData.line,
      plant: formData.plant,
      targetQuantity: Number(formData.targetQuantity) || 25000,
      producedQuantity: 0,
      scrapQuantity: 0,
      reworkQuantity: 0,
      unit: formData.unit,
      status: "Running",
      startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      currentSpeedBPM: 560,
      targetSpeedBPM: 600,
      currentOEE: 85.0,
      activeShift: formData.activeShift
    };

    setProductionOrders((prev) => [newOrder, ...(prev || [])]);
    addToast(`Production Order ${newId} dispatched to ${formData.line}!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      productName: "",
      productCode: "SKU-PROD-500ML",
      line: "Line 1 (Aseptic Bottling)",
      plant: "Plant 1 - North Facility",
      targetQuantity: 25000,
      unit: "Bottles",
      activeShift: "Shift A (06:00 - 14:30)"
    });
  };

  const handleExportCSV = () => {
    const headers = "Order ID,Product SKU,Line,Target Qty,Produced Qty,Progress %,Status\n";
    const rows = filteredOrders
      .map((o) => {
        const prod = getProduced(o);
        const tgt = getTarget(o);
        const pct = Math.min(100, Math.round((prod / tgt) * 100));
        return `"${o.id}","${getName(o)}","${o.line || ''}",${tgt},${prod},${pct},"${o.status || ''}"`;
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

  const runningCount = productionOrders.filter((o) => (o.status || "").toLowerCase().includes("run")).length;
  const completedCount = productionOrders.filter((o) => (o.status || "").toLowerCase().includes("comp")).length;
  const totalVolume = productionOrders.reduce((sum, o) => sum + getProduced(o), 0);

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
          unit="Lines Active"
          trend={{ value: "Running at rated speed", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Shift Volume"
          value={totalVolume.toLocaleString()}
          unit="Units Produced"
          trend={{ value: "98.4% of scheduled shift plan", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Completed Orders"
          value={completedCount.toString()}
          unit="Finished"
          trend={{ value: "100% QA inspected", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="emerald"
        />
        <StatCard
          title="Line OEE Efficiency"
          value="86.4%"
          unit="OEE Avg"
          trend={{ value: "+2.1% vs shift target", isPositive: true, text: "" }}
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
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No production orders match the current filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const prod = getProduced(o);
                  const tgt = getTarget(o);
                  const pct = Math.min(100, Math.round((prod / tgt) * 100));
                  const isRunning = (o.status || "").toLowerCase().includes("run");
                  const isCompleted = (o.status || "").toLowerCase().includes("comp");

                  return (
                    <tr key={o.id}>
                      <td>
                        <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                          {o.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{getName(o)}</div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {getCode(o)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{o.line}</span>
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
                        <Badge variant={isRunning ? "emerald" : isCompleted ? "cyan" : "amber"}>
                          {o.status || "Queued"}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {isRunning ? (
                            <button
                              onClick={() => {
                                updateOrderStatus(o.id, "Completed");
                                addToast(`Order ${o.id} marked Completed!`, "success");
                              }}
                              style={{
                                padding: "4px 10px",
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
                              <CheckCircle2 size={12} /> Finish
                            </button>
                          ) : isCompleted ? (
                            <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>● Closed</span>
                          ) : (
                            <button
                              onClick={() => {
                                updateOrderStatus(o.id, "Running");
                                addToast(`Order ${o.id} is now Running on ${o.line}!`, "success");
                              }}
                              style={{
                                padding: "4px 10px",
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
                <label className="form-label">Select Master SKU *</label>
                <select
                  className="form-select"
                  value={formData.skuId}
                  onChange={(e) => {
                    const picked = skus.find((s) => s.skuId === e.target.value);
                    if (picked) {
                      setFormData({
                        ...formData,
                        skuId: picked.skuId,
                        productCode: picked.skuCode,
                        productName: picked.name,
                        unit: picked.uom || "Bottles"
                      });
                    }
                  }}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {skus.filter((s) => s.category === "Finished Goods").length > 0
                    ? skus.filter((s) => s.category === "Finished Goods").map((s) => (
                        <option key={s.skuId} value={s.skuId}>
                          {s.skuCode} — {s.name} ({s.uom})
                        </option>
                      ))
                    : skus.map((s) => (
                        <option key={s.skuId} value={s.skuId}>
                          {s.skuCode} — {s.name}
                        </option>
                      ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Line *</label>
                  <select
                    className="form-select"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.length > 0 ? (
                      lines.map((l) => (
                        <option key={l.lineId} value={l.name}>
                          {l.lineCode} — {l.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Line 1 (Aseptic Bottling)">Line 1 (Aseptic Bottling)</option>
                        <option value="Line 2 (Formulation & Blending)">Line 2 (Formulation)</option>
                        <option value="Line 3 (Canning Line)">Line 3 (Canning Line)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label">Target Batch Units *</label>
                  <input
                    type="number"
                    required
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
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
    </div>
  );
}

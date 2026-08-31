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
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionOrdersPage() {
  const { productionOrders, updateOrderStatus, addProductionOrder } = useProduction();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Order Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    skuName: "",
    line: "Line 1 - Aseptic Bottling",
    targetQty: 50000,
    dueDate: new Date().toISOString().substring(0, 10),
    priority: "P2 - High"
  });

  const filteredOrders = productionOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.line.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.skuName) {
      addToast("Please provide product SKU name", "warning");
      return;
    }

    const created = addProductionOrder({
      ...formData,
      targetQty: Number(formData.targetQty),
      producedQty: 0,
      status: "Queued"
    });

    addToast(`Production Order ${created.id} generated!`, "success");
    setIsAddModalOpen(false);
    setFormData({ skuName: "", line: "Line 1 - Aseptic Bottling", targetQty: 50000, dueDate: new Date().toISOString().substring(0, 10), priority: "P2 - High" });
  };

  const handleExportCSV = () => {
    const headers = "Order ID,SKU Product,Line,Target Qty,Produced Qty,Progress (%),Status,Due Date\n";
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.id}","${o.skuName}","${o.line}",${o.targetQty},${o.producedQty},${Math.round((o.producedQty / o.targetQty) * 100)},"${o.status}","${o.dueDate}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Production_Orders_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Production orders exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Production Orders & Shop Floor Execution
            </h1>
            <Badge variant="cyan">{productionOrders.length} Active Orders</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manufacturing work orders, real-time batch progress tracking, line dispatching, and run completions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Create Production Order
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Active Production Runs"
          value={productionOrders.filter((o) => o.status === "Running").length.toString()}
          unit="Lines Active"
          trend={{ value: "Running at rated capacity", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Shift Volume"
          value={`${productionOrders.reduce((s, o) => s + o.producedQty, 0).toLocaleString()}`}
          unit="Units Completed"
          trend={{ value: "98.4% of shift plan", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="blue"
        />
        <StatCard
          title="Queued Orders"
          value={productionOrders.filter((o) => o.status === "Queued").length.toString()}
          unit="Next in Line"
          trend={{ value: "Materials staged & ready", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
      </div>

      {/* Table Card */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search order ID, product name, line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Running">Running</option>
              <option value="Queued">Queued</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product SKU</th>
                <th>Line</th>
                <th>Target vs Produced</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const pct = Math.min(100, Math.round((o.producedQty / o.targetQty) * 100));

                return (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{o.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{o.skuName}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{o.line}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {o.producedQty.toLocaleString()} / {o.targetQty.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-surface)", borderRadius: "3px", overflow: "hidden", minWidth: "80px" }}>
                          <div style={{ width: `${pct}%`, height: "100%", backgroundColor: pct >= 100 ? "#10B981" : "#38BDF8" }} />
                        </div>
                        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#FFFFFF" }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={o.status === "Running" ? "emerald" : o.status === "Completed" ? "cyan" : "amber"}>
                        {o.status}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {o.status === "Queued" && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Play}
                            onClick={() => {
                              updateOrderStatus(o.id, "Running");
                              addToast(`Order ${o.id} is now Running on ${o.line}`, "success");
                            }}
                          >
                            Start
                          </Button>
                        )}
                        {o.status === "Running" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => {
                              updateOrderStatus(o.id, "Completed");
                              addToast(`Order ${o.id} marked as Completed!`, "success");
                            }}
                          >
                            Finish
                          </Button>
                        )}
                        {o.status === "Completed" && (
                          <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE ORDER MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Production Work Order
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">SKU Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500ml Sparkling Citrus Soda"
                  value={formData.skuName}
                  onChange={(e) => setFormData({ ...formData, skuName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Assigned Production Line</label>
                  <select
                    className="form-select"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                  >
                    <option value="Line 1 - Aseptic Bottling">Line 1 - Aseptic Bottling</option>
                    <option value="Line 2 - Formulation & Pasteurizer">Line 2 - Formulation</option>
                    <option value="Line 3 - Canning & Packaging">Line 3 - Canning</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Target Units *</label>
                  <input
                    type="number"
                    required
                    value={formData.targetQty}
                    onChange={(e) => setFormData({ ...formData, targetQty: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Dispatch Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

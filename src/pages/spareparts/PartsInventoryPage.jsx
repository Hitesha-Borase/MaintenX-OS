import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  X,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PartsInventoryPage() {
  const { spareParts = [], addSparePart, issueSparePart, restockSparePart, workOrders = [] } = useCMMS();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  // Add Part Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    partNo: "",
    name: "",
    category: "Bearings & Power Transmission",
    stock: 10,
    minStock: 4,
    unitCost: 50.0,
    location: "Aisle 1 - Shelf A1",
    supplier: "SKF Direct"
  });

  // Issue Part Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedPartForIssue, setSelectedPartForIssue] = useState(null);
  const [issueQty, setIssueQty] = useState(1);
  const [issueWO, setIssueWO] = useState("WO-2026-0891");

  // Restock Modal
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedPartForRestock, setSelectedPartForRestock] = useState(null);
  const [restockQty, setRestockQty] = useState(5);

  const lowStockList = spareParts.filter((p) => p.stock <= p.minStock);
  const totalValuation = spareParts.reduce((sum, p) => sum + (p.stock || 0) * (p.unitCost || 0), 0);

  const filteredParts = spareParts.filter((p) => {
    const matchesSearch =
      p.partNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    const matchesStock =
      stockFilter === "ALL" ||
      (stockFilter === "LOW" && p.stock <= p.minStock) ||
      (stockFilter === "IN_STOCK" && p.stock > p.minStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.partNo || !addFormData.name) {
      addToast("Please provide part number and name.", "warning");
      return;
    }

    const created = addSparePart({
      ...addFormData,
      stock: Number(addFormData.stock),
      minStock: Number(addFormData.minStock),
      unitCost: Number(addFormData.unitCost)
    });

    addToast(`Spare part ${created?.partNo || addFormData.partNo} added to catalog!`, "success");
    setIsAddModalOpen(false);
    setAddFormData({
      partNo: "",
      name: "",
      category: "Bearings & Power Transmission",
      stock: 10,
      minStock: 4,
      unitCost: 50.0,
      location: "Aisle 1 - Shelf A1",
      supplier: "SKF Direct"
    });
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!selectedPartForIssue) return;

    if (issueQty > selectedPartForIssue.stock) {
      addToast("Issue quantity exceeds current on-hand stock!", "warning");
      return;
    }

    issueSparePart(selectedPartForIssue.partNo, Number(issueQty), issueWO);
    addToast(`${issueQty}x ${selectedPartForIssue.partNo} issued to ${issueWO}`, "success");
    setIsIssueModalOpen(false);
    setSelectedPartForIssue(null);
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedPartForRestock) return;

    restockSparePart(selectedPartForRestock.partNo, Number(restockQty));
    addToast(`${restockQty} units added to ${selectedPartForRestock.partNo} inventory.`, "success");
    setIsRestockModalOpen(false);
    setSelectedPartForRestock(null);
  };

  const handleExportCSV = () => {
    const headers = "Part No,Description,Category,On-Hand Stock,Min Level,Unit Cost ($),Location,Supplier,Status\n";
    const rows = filteredParts
      .map(
        (p) =>
          `"${p.partNo}","${p.name}","${p.category}",${p.stock},${p.minStock},${p.unitCost},"${p.location}","${p.supplier}","${p.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Spare_Parts_Inventory_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Spare parts inventory exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Spare Parts Inventory
            </h1>
            <Badge variant="cyan">{spareParts.length} SKUS IN STOCK</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Inventory
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Spare Part SKU
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
          title="Total SKUs Managed"
          value={spareParts.length.toString()}
          unit="Active SKUs"
          trend={{ value: "100% catalogued", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="cyan"
          onClick={() => setStockFilter("ALL")}
        />
        <StatCard
          title="Critical Low Stock"
          value={lowStockList.length.toString()}
          unit="Parts"
          trend={{ value: lowStockList.length > 0 ? "Reorder alerts triggered" : "Stock optimal", isPositive: lowStockList.length === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant={lowStockList.length > 0 ? "rose" : "emerald"}
          onClick={() => setStockFilter("LOW")}
        />
        <StatCard
          title="Total Inventory Value"
          value={`$${Math.round(totalValuation).toLocaleString()}`}
          unit="USD"
          trend={{ value: "MRO Asset Value", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Stock Turnover Health"
          value="96.2%"
          unit="Fill rate"
          trend={{ value: "+1.8% vs last quarter", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="emerald"
        />
      </div>

      {/* Filter and Inventory Table Card */}
      <Card style={{ padding: "16px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between", width: "100%" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "10px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Category:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "140px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="Bearings & Power Transmission">Bearings & Drives</option>
                <option value="Seals & Gaskets">Seals & Gaskets</option>
                <option value="Pneumatics">Pneumatics</option>
                <option value="Instrumentation & Sensors">Sensors & Instruments</option>
                <option value="Lubricants & Chemicals">Lubricants</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Stock:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "125px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="ALL">All Stock</option>
                <option value="LOW">Low Stock Alert</option>
                <option value="IN_STOCK">In Stock (Healthy)</option>
              </select>
            </div>

            {(searchQuery || categoryFilter !== "ALL" || stockFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setStockFilter("ALL");
                }}
                style={{
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Data Table Container with Horizontal Slide */}
        <div
          className="data-table-container"
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100%",
            display: "block",
            boxSizing: "border-box"
          }}
        >
          <table className="data-table" style={{ width: "100%", minWidth: "700px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "110px" }}>Part No</th>
                <th style={{ minWidth: "160px" }}>Part Name & Category</th>
                <th style={{ minWidth: "100px" }}>On-Hand Stock</th>
                <th style={{ minWidth: "80px" }}>Min Level</th>
                <th style={{ minWidth: "90px" }}>Unit Cost</th>
                <th style={{ minWidth: "110px" }}>Bin Location</th>
                <th style={{ minWidth: "90px" }}>Status</th>
                <th style={{ minWidth: "120px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No spare parts matching the filter.
                  </td>
                </tr>
              ) : (
                filteredParts.map((p) => {
                  const isLow = p.stock <= p.minStock;

                  return (
                    <tr key={p.partNo}>
                      <td style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                        {p.partNo}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.category}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "13px", color: isLow ? "#DC2626" : "#059669" }}>
                          {p.stock} units
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                        {p.minStock}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                        ${p.unitCost?.toFixed(2)}
                      </td>
                      <td style={{ fontSize: "12px", color: "#0284C7", fontWeight: 600 }}>
                        {p.location}
                      </td>
                      <td>
                        <Badge variant={isLow ? "rose" : "emerald"} dot={isLow}>
                          {isLow ? "Low Stock" : "In Stock"}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            onClick={() => {
                              setSelectedPartForIssue(p);
                              setIsIssueModalOpen(true);
                            }}
                            title="Issue to Work Order"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                              color: "#261603",
                              border: "1px solid #E8C182",
                              boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <ArrowDownRight size={12} /> Issue
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPartForRestock(p);
                              setIsRestockModalOpen(true);
                            }}
                            title="Restock Inbound"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "var(--bg-card-subtle)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <ArrowUpRight size={12} /> Receive
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

      {/* ISSUE PART MODAL */}
      {isIssueModalOpen && selectedPartForIssue && (
        <div className="modal-backdrop" onClick={() => setIsIssueModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Issue Spare Part from Warehouse
              </h2>
              <button onClick={() => setIsIssueModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Selected Part:</div>
                <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{selectedPartForIssue.partNo} — {selectedPartForIssue.name}</div>
                <div style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginTop: "4px" }}>Available On-Hand: {selectedPartForIssue.stock} units</div>
              </div>

              <div>
                <label className="form-label">Quantity to Issue *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedPartForIssue.stock}
                  value={issueQty}
                  onChange={(e) => setIssueQty(Number(e.target.value))}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                  required
                />
              </div>

              <div>
                <label className="form-label">Link to Maintenance Work Order</label>
                <select
                  className="form-select"
                  value={issueWO}
                  onChange={(e) => setIssueWO(e.target.value)}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.id} — {w.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsIssueModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Issue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK PART MODAL */}
      {isRestockModalOpen && selectedPartForRestock && (
        <div className="modal-backdrop" onClick={() => setIsRestockModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Receive Stock Inbound
              </h2>
              <button onClick={() => setIsRestockModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Restocking SKU:</div>
                <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{selectedPartForRestock.partNo} — {selectedPartForRestock.name}</div>
              </div>

              <div>
                <label className="form-label">Quantity Received *</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsRestockModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add to Inventory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PART SKU MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Add New Spare Part SKU
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Part Number / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BRG-6309-2RS"
                    value={addFormData.partNo}
                    onChange={(e) => setAddFormData({ ...addFormData, partNo: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Bearings & Power Transmission">Bearings & Power Transmission</option>
                    <option value="Seals & Gaskets">Seals & Gaskets</option>
                    <option value="Pneumatics">Pneumatics</option>
                    <option value="Instrumentation & Sensors">Instrumentation & Sensors</option>
                    <option value="Lubricants & Chemicals">Lubricants & Chemicals</option>
                    <option value="Belts & Drives">Belts & Drives</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Part Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Groove Ball Bearing 6309-2RS C3 SKF"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                <div>
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    value={addFormData.stock}
                    onChange={(e) => setAddFormData({ ...addFormData, stock: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Min Stock Level</label>
                  <input
                    type="number"
                    value={addFormData.minStock}
                    onChange={(e) => setAddFormData({ ...addFormData, minStock: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addFormData.unitCost}
                    onChange={(e) => setAddFormData({ ...addFormData, unitCost: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Warehouse Bin Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle 3 - Shelf B2"
                    value={addFormData.location}
                    onChange={(e) => setAddFormData({ ...addFormData, location: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Preferred Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. SKF Direct Supply"
                    value={addFormData.supplier}
                    onChange={(e) => setAddFormData({ ...addFormData, supplier: e.target.value })}
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
                  Save Part SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

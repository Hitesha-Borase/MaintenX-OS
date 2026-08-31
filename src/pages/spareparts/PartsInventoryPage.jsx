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
  const { spareParts, addSparePart, issueSparePart, restockSparePart, workOrders } = useCMMS();
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
  const totalValuation = spareParts.reduce((sum, p) => sum + p.stock * p.unitCost, 0);

  const filteredParts = spareParts.filter((p) => {
    const matchesSearch =
      p.partNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    addToast(`Spare part ${created.partNo} added to catalog!`, "success");
    setIsAddModalOpen(false);
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
    const headers = "Part No,Description,Category,On-Hand Stock,Min Stock,Unit Cost ($),Location,Supplier,Status\n";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Spare Parts Inventory
            </h1>
            <Badge variant="cyan">{spareParts.length} SKUs in Stock</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            MRO store inventory levels, min-max reorder alerts, bin locations, and stock issue/receipt workflows.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Inventory
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Spare Part SKU
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Total SKUs Managed"
          value={spareParts.length.toString()}
          unit="Active SKUs"
          trend={{ value: "100% catalogued", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="cyan"
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

      {/* Filter and Inventory Table */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search part number, description, bin location, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Category:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "150px", fontSize: "12px" }}
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Stock Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "130px", fontSize: "12px" }}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="ALL">All Stock</option>
              <option value="LOW">Low Stock Alert</option>
              <option value="IN_STOCK">In Stock (Healthy)</option>
            </select>
          </div>

          {(searchQuery || categoryFilter !== "ALL" || stockFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
                setStockFilter("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Part No</th>
                <th>Part Name & Category</th>
                <th>On-Hand Stock</th>
                <th>Min Level</th>
                <th>Unit Cost</th>
                <th>Bin Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((p) => {
                const isLow = p.stock <= p.minStock;

                return (
                  <tr key={p.partNo}>
                    <td style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>
                      {p.partNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.category}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "14px", color: isLow ? "#EF4444" : "#10B981" }}>
                        {p.stock} units
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                      {p.minStock}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#FFFFFF" }}>
                      ${p.unitCost?.toFixed(2)}
                    </td>
                    <td style={{ fontSize: "12px", color: "#38BDF8" }}>
                      {p.location}
                    </td>
                    <td>
                      <Badge variant={isLow ? "rose" : "emerald"} dot={isLow}>
                        {isLow ? "Low Stock" : "In Stock"}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={ArrowDownRight}
                          onClick={() => {
                            setSelectedPartForIssue(p);
                            setIsIssueModalOpen(true);
                          }}
                          title="Issue to Work Order"
                        >
                          Issue
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ArrowUpRight}
                          onClick={() => {
                            setSelectedPartForRestock(p);
                            setIsRestockModalOpen(true);
                          }}
                          title="Restock Stock"
                        >
                          Receive
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ISSUE PART MODAL */}
      {isIssueModalOpen && selectedPartForIssue && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Issue Spare Part from Warehouse
              </h2>
              <button onClick={() => setIsIssueModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Selected Part:</div>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{selectedPartForIssue.partNo} — {selectedPartForIssue.name}</div>
                <div style={{ fontSize: "12px", color: "#10B981", marginTop: "4px" }}>Available On-Hand: {selectedPartForIssue.stock} units</div>
              </div>

              <div>
                <label className="form-label">Quantity to Issue</label>
                <input
                  type="number"
                  min="1"
                  max={selectedPartForIssue.stock}
                  value={issueQty}
                  onChange={(e) => setIssueQty(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Link to Maintenance Work Order</label>
                <select
                  className="form-select"
                  value={issueWO}
                  onChange={(e) => setIssueWO(e.target.value)}
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.id} — {w.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Receive Stock Inbound
              </h2>
              <button onClick={() => setIsRestockModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Restocking SKU:</div>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{selectedPartForRestock.partNo} — {selectedPartForRestock.name}</div>
              </div>

              <div>
                <label className="form-label">Quantity Received</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add New Spare Part SKU
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Part Number / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BRG-6309-2RS"
                    value={addFormData.partNo}
                    onChange={(e) => setAddFormData({ ...addFormData, partNo: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
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
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    value={addFormData.stock}
                    onChange={(e) => setAddFormData({ ...addFormData, stock: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Min Stock Level</label>
                  <input
                    type="number"
                    value={addFormData.minStock}
                    onChange={(e) => setAddFormData({ ...addFormData, minStock: e.target.value })}
                    className="form-input"
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
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Warehouse Bin Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle 3 - Shelf B2"
                    value={addFormData.location}
                    onChange={(e) => setAddFormData({ ...addFormData, location: e.target.value })}
                    className="form-input"
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
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

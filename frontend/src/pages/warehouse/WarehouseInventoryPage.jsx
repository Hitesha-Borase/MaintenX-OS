import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  ArrowRight,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Building,
  DollarSign
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useInventory } from "../../context/InventoryContext";
import { useApp } from "../../context/AppContext";

export function WarehouseInventoryPage() {
  const { lots = [], zones = [], addLot } = useInventory();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialName: "",
    materialCode: "RM-RAW-01",
    category: "Raw Material",
    quantity: 1000,
    unit: "kg",
    location: "Cold Storage Zone A - Rack R04-B2",
    supplier: "Citrus Valley Farms Co.",
    costPerUnitUSD: 4.50
  });

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedLotForAdjust, setSelectedLotForAdjust] = useState(null);
  const [adjustData, setAdjustData] = useState({
    adjustmentType: "CORRECTION", // ADD, DEDUCT, CORRECTION
    qtyChange: 0,
    reason: "Routine Cycle Count Variance"
  });

  const [selectedLotForView, setSelectedLotForView] = useState(null);

  const getLotId = (l) => l.lotNumber || l.id || "LOT-REC-001";
  const getName = (l) => l.materialName || l.item || l.materialCode || "Inventory Item";
  const getCode = (l) => l.materialCode || l.sku || "RM-STD-01";
  const getLocation = (l) => l.location || l.zone || "Warehouse Bay";
  const getStatus = (l) => l.qaStatus || l.status || "Approved / Released";
  const getTotalQty = (l) => Number(l.quantity || 0);
  const getReservedQty = (l) => Number(l.reservedQuantity !== undefined ? l.reservedQuantity : Math.round(l.quantity * 0.1));
  const getAvailableQty = (l) => Math.max(0, getTotalQty(l) - getReservedQty(l));
  const getUOM = (l) => l.unit || l.uom || "units";
  const getExpiry = (l) => l.expiryDate || "2027-12-31";

  const filteredLots = (lots || []).filter((l) => {
    const q = searchQuery.toLowerCase();
    const id = getLotId(l).toLowerCase();
    const name = getName(l).toLowerCase();
    const code = getCode(l).toLowerCase();
    const loc = getLocation(l).toLowerCase();

    const matchesSearch = id.includes(q) || name.includes(q) || code.includes(q) || loc.includes(q);
    const matchesCat = categoryFilter === "ALL" || (l.category || "") === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedLotForAdjust) return;

    const change = Number(adjustData.qtyChange) || 0;
    let newQty = getTotalQty(selectedLotForAdjust);

    if (adjustData.adjustmentType === "ADD") {
      newQty += change;
    } else if (adjustData.adjustmentType === "DEDUCT") {
      newQty = Math.max(0, newQty - change);
    } else {
      newQty = change;
    }

    if (setLots) {
      setLots((prev) =>
        prev.map((l) =>
          getLotId(l) === getLotId(selectedLotForAdjust)
            ? { ...l, quantity: newQty }
            : l
        )
      );
    }

    addToast(`Inventory for ${getName(selectedLotForAdjust)} adjusted to ${newQty.toLocaleString()} ${getUOM(selectedLotForAdjust)}. Reason: ${adjustData.reason}`, "success");
    setIsAdjustModalOpen(false);
    setSelectedLotForAdjust(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.materialName.trim()) {
      addToast("Please provide item name", "warning");
      return;
    }

    const lotNumber = `LOT-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLot = {
      lotNumber,
      materialCode: formData.materialCode,
      materialName: formData.materialName,
      category: formData.category,
      quantity: Number(formData.quantity) || 1000,
      reservedQuantity: 0,
      unit: formData.unit,
      location: formData.location,
      supplier: formData.supplier,
      supplierLot: `SUP-${lotNumber}`,
      receivedDate: new Date().toISOString().substring(0, 10),
      expiryDate: "2027-12-31",
      qaStatus: "Approved / Released",
      costPerUnitUSD: Number(formData.costPerUnitUSD) || 1.0
    };

    if (addLot) {
      addLot(newLot);
    }
    addToast(`Material Lot ${lotNumber} added to Warehouse Inventory!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      materialName: "",
      materialCode: "RM-RAW-01",
      category: "Raw Material",
      quantity: 1000,
      unit: "kg",
      location: "Cold Storage Zone A - Rack R04-B2",
      supplier: "Citrus Valley Farms Co.",
      costPerUnitUSD: 4.50
    });
  };

  const handleExportCSV = () => {
    const headers = "Material Name,Material Code,Category,Total Qty,Available Qty,Reserved Qty,UOM,Storage Location,Expiry Date,Status\n";
    const rows = filteredLots
      .map((l) => `"${getName(l)}","${getCode(l)}","${l.category || ''}",${getTotalQty(l)},${getAvailableQty(l)},${getReservedQty(l)},"${getUOM(l)}","${getLocation(l)}","${getExpiry(l)}","${getStatus(l)}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Warehouse_Inventory_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Warehouse inventory exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Inventory & Material Stock Register
            </h1>
            <Badge variant="cyan">{lots.length} TRACKED SKUS & LOTS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Receive Material Lot
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
          title="Stock Availability"
          value="98.1%"
          unit="In Stock"
          trend={{ value: "All high-runner SKUs covered", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Storage Zones"
          value={`${zones.length || 4} Zones`}
          unit="A, B, C, D"
          trend={{ value: "Cold & ambient storage", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Inventory Value"
          value="$124,500"
          unit="Valuation"
          trend={{ value: "Real-time FIFO pricing", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Critical Shortages"
          value="0 Items"
          unit="Clear"
          trend={{ value: "Safety stock maintained", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Inventory Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by SKU, Material Name, Lot Number, Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Category:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "130px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Packaging">Packaging</option>
              <option value="Finished Goods">Finished Goods</option>
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1050px" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Material Name</th>
                <th style={{ whiteSpace: "nowrap" }}>Material Code / SKU</th>
                <th style={{ whiteSpace: "nowrap" }}>Category</th>
                <th style={{ whiteSpace: "nowrap" }}>Total Qty</th>
                <th style={{ whiteSpace: "nowrap" }}>Available Qty</th>
                <th style={{ whiteSpace: "nowrap" }}>Reserved Qty</th>
                <th style={{ whiteSpace: "nowrap" }}>UOM</th>
                <th style={{ whiteSpace: "nowrap" }}>Storage Location</th>
                <th style={{ whiteSpace: "nowrap" }}>Expiry Date</th>
                <th style={{ whiteSpace: "nowrap" }}>Status</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLots.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No material records match your search query.
                  </td>
                </tr>
              ) : (
                filteredLots.map((l, idx) => {
                  const status = getStatus(l);
                  const isApproved = status.toLowerCase().includes("app") || status.toLowerCase().includes("rel");

                  return (
                    <tr key={l.lotNumber || idx}>
                      <td style={{ minWidth: "180px" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{getName(l)}</div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          Lot: {getLotId(l)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: 700, color: "#8C5B23", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                          {getCode(l)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <Badge variant="cyan">{l.category || "Raw Material"}</Badge>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                          {getTotalQty(l).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                          {getAvailableQty(l).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#0284C7" }}>
                          {getReservedQty(l).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {getUOM(l)}
                        </span>
                      </td>
                      <td style={{ minWidth: "160px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                          {getLocation(l)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                          {getExpiry(l)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <Badge variant={isApproved ? "emerald" : "amber"}>
                          {status}
                        </Badge>
                      </td>
                      <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedLotForView(l)}
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                          >
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedLotForAdjust(l);
                              setAdjustData({
                                adjustmentType: "CORRECTION",
                                qtyChange: getTotalQty(l),
                                reason: "Routine Cycle Count Variance"
                              });
                              setIsAdjustModalOpen(true);
                            }}
                            style={{ fontSize: "11px", padding: "4px 8px", color: "#8C5B23" }}
                          >
                            Adjust Stock
                          </Button>
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

      {/* RECEIVE LOT MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Receive Material Inbound Lot
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Material Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valencia Organic Orange Juice Concentrate"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Material Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Finished Goods">Finished Goods</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Received Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Storage Bin / Location *</label>
                  <select
                    className="form-select"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Cold Storage Zone A - Rack R04-B2">Cold Storage Zone A - Rack R04-B2</option>
                    <option value="Ambient Storage Bay 2 - Bin G-12">Ambient Storage Bay 2 - Bin G-12</option>
                    <option value="Warehouse Bay 3 - Racks P01-P06">Warehouse Bay 3 - Racks P01-P06</option>
                    <option value="Finished Goods High-Bay - Bin FG-44">Finished Goods High-Bay - Bin FG-44</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
                  Receive & Register Lot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {isAdjustModalOpen && selectedLotForAdjust && (
        <div className="modal-backdrop" onClick={() => setIsAdjustModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Adjust Stock Balance: {getCode(selectedLotForAdjust)}
                </h2>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {getName(selectedLotForAdjust)} • Lot {getLotId(selectedLotForAdjust)}
                </span>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Current Recorded Total:</span>
                  <strong style={{ fontSize: "16px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {getTotalQty(selectedLotForAdjust).toLocaleString()} {getUOM(selectedLotForAdjust)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Available:</span>
                  <strong style={{ fontSize: "16px", color: "#10B981", fontFamily: "var(--font-mono)" }}>
                    {getAvailableQty(selectedLotForAdjust).toLocaleString()} {getUOM(selectedLotForAdjust)}
                  </strong>
                </div>
              </div>

              <div>
                <label className="form-label">Adjustment Mode *</label>
                <select
                  className="form-select"
                  value={adjustData.adjustmentType}
                  onChange={(e) => setAdjustData({ ...adjustData, adjustmentType: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="CORRECTION">Direct Count Override (Set New Absolute Qty)</option>
                  <option value="ADD">Add Stock (+ Stock Inbound / Return)</option>
                  <option value="DEDUCT">Deduct Stock (- Consumption / Scrap / Damaged)</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  {adjustData.adjustmentType === "CORRECTION" ? "New Total Count *" : "Quantity Adjustment *"} ({getUOM(selectedLotForAdjust)})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustData.qtyChange}
                  onChange={(e) => setAdjustData({ ...adjustData, qtyChange: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Adjustment Reason Code *</label>
                <select
                  className="form-select"
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Routine Cycle Count Variance">Routine Cycle Count Variance</option>
                  <option value="Physical Audit Discrepancy">Physical Audit Discrepancy</option>
                  <option value="Damaged / Leaking Material Written Off">Damaged / Leaking Material Written Off</option>
                  <option value="Supplier Over-Delivery Accepted">Supplier Over-Delivery Accepted</option>
                  <option value="Production Floor Line Return">Production Floor Line Return</option>
                  <option value="Quality Inspection Scrap">Quality Inspection Scrap</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAdjustModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Stock Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LOT DOSSIER MODAL */}
      {selectedLotForView && (
        <div className="modal-backdrop" onClick={() => setSelectedLotForView(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#8C5B23" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Inventory Lot Dossier: {getLotId(selectedLotForView)}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    SKU: {getCode(selectedLotForView)} • {selectedLotForView.category || "Raw Material"}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedLotForView(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {getName(selectedLotForView)}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Supplier: {selectedLotForView.supplier || "Approved Direct Vendor"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Total Quantity:</span>
                  <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                    {getTotalQty(selectedLotForView).toLocaleString()} {getUOM(selectedLotForView)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Available:</span>
                  <strong style={{ fontSize: "14px", color: "#10B981" }}>
                    {getAvailableQty(selectedLotForView).toLocaleString()} {getUOM(selectedLotForView)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Reserved:</span>
                  <strong style={{ fontSize: "14px", color: "#0284C7" }}>
                    {getReservedQty(selectedLotForView).toLocaleString()} {getUOM(selectedLotForView)}
                  </strong>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Location:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{getLocation(selectedLotForView)}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Expiry Date:</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{getExpiry(selectedLotForView)}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>QA Status:</span>
                  <Badge variant="emerald">{getStatus(selectedLotForView)}</Badge>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Unit Cost (FIFO):</span>
                  <strong style={{ color: "#10B981", fontFamily: "var(--font-mono)" }}>
                    ${(selectedLotForView.costPerUnitUSD || 4.50).toFixed(2)} USD
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedLotForView(null)}>
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

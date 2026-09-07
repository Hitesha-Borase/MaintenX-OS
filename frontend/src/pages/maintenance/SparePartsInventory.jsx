import React, { useState } from "react";
import {
  Package,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Download,
  RotateCcw,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function SparePartsInventory() {
  const { spareParts, addSparePart, issueSparePart, returnSparePart } = useCMMS();
  const { addToast } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPart, setNewPart] = useState({
    partNo: "",
    name: "",
    category: "Pneumatics",
    stock: 10,
    minStock: 5,
    location: "BIN-A-12",
    unitCost: 45.0,
    supplier: "Festool Automation"
  });

  const [issueModalPart, setIssueModalPart] = useState(null);
  const [issueQty, setIssueQty] = useState(1);
  const [woNumber, setWoNumber] = useState("WO-2026-0891");

  const [returnModalPart, setReturnModalPart] = useState(null);
  const [returnQty, setReturnQty] = useState(1);

  const lowStockCount = spareParts.filter((p) => p.status.includes("Low Stock")).length;
  const totalValuation = spareParts.reduce((sum, p) => sum + p.stock * p.unitCost, 0);

  const handleAddPartSubmit = (e) => {
    e.preventDefault();
    if (!newPart.partNo.trim() || !newPart.name.trim()) {
      addToast("Please provide part number and description.", "warning");
      return;
    }
    if (addSparePart) {
      addSparePart(newPart);
    }
    addToast(`Spare Part ${newPart.partNo} (${newPart.name}) added to catalog!`, "success");
    setIsAddModalOpen(false);
    setNewPart({
      partNo: "",
      name: "",
      category: "Pneumatics",
      stock: 10,
      minStock: 5,
      location: "BIN-A-12",
      unitCost: 45.0,
      supplier: "Festool Automation"
    });
  };

  const handleIssue = (e) => {
    e.preventDefault();
    if (!issueModalPart) return;
    issueSparePart(issueModalPart.partNo, issueQty, woNumber);
    addToast(`Issued ${issueQty} units of ${issueModalPart.partNo} to ${woNumber}`, "success");
    setIssueModalPart(null);
  };

  const handleReturn = (e) => {
    e.preventDefault();
    if (!returnModalPart) return;
    returnSparePart(returnModalPart.partNo, returnQty);
    addToast(`Returned ${returnQty} units of ${returnModalPart.partNo} to stock`, "success");
    setReturnModalPart(null);
  };

  const columns = [
    {
      header: "Part Number & Description",
      accessor: "partNo",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23" }}>
            <Package size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{row.partNo}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{row.name}</div>
          </div>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category",
      render: (val) => <Badge variant="slate">{val}</Badge>
    },
    {
      header: "Stock Level",
      accessor: "stock",
      render: (val, row) => (
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val <= row.minStock ? "#DC2626" : "var(--text-primary)" }}>
            {val} units
          </span>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Min: {row.minStock}</div>
        </div>
      )
    },
    {
      header: "Location / Bin",
      accessor: "location",
      render: (val) => <span style={{ fontSize: "12px", color: "#8C5B23", fontWeight: 600 }}>{val}</span>
    },
    {
      header: "Unit Cost",
      accessor: "unitCost",
      render: (val) => <span style={{ fontFamily: "var(--font-mono)", color: "#059669", fontWeight: 700 }}>${Number(val).toFixed(2)}</span>
    },
    {
      header: "Supplier",
      accessor: "supplier",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{val}</span>
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const variant = val === "In Stock" ? "emerald" : "rose";
        return <Badge variant={variant} dot={val !== "In Stock"}>{val}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowDownLeft}
            onClick={() => setIssueModalPart(row)}
            title="Issue Part to Work Order"
          >
            Issue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowUpRight}
            onClick={() => setReturnModalPart(row)}
            title="Return Unused Part to Stock"
          >
            Return
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Maintenance Spare Parts Inventory
            </h1>
            <Badge variant="cyan">{spareParts.length} Critical SKUs</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add New Part
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
          title="Total Parts Inventory"
          value={spareParts.length.toString()}
          unit="SKUs"
          icon={Package}
          colorVariant="blue"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount.toString()}
          unit="SKUs"
          icon={AlertTriangle}
          colorVariant={lowStockCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Inventory Valuation"
          value={`$${totalValuation.toLocaleString()}`}
          unit="Carrying Cost"
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Stock Availability"
          value="98.5%"
          unit="Ready Rate"
          icon={CheckCircle2}
          colorVariant="cyan"
        />
      </div>

      {/* Parts Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <DataTable
          title="Spare Parts Master Inventory"
          columns={columns}
          data={spareParts}
          searchPlaceholder="Search part number, description, bin location, supplier..."
          exportFilename="flowstate_spare_parts.csv"
        />
      </Card>

      {/* ADD NEW PART MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add New Spare Part
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPartSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Part Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PN-MTR-4001"
                    value={newPart.partNo}
                    onChange={(e) => setNewPart({ ...newPart, partNo: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newPart.category}
                    onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Pneumatics">Pneumatics</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Bearings & Seals">Bearings & Seals</option>
                    <option value="Sensors">Sensors</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Part Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Phase Servo Motor 5.5kW IP65"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newPart.stock}
                    onChange={(e) => setNewPart({ ...newPart, stock: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Safety Stock</label>
                  <input
                    type="number"
                    min="1"
                    value={newPart.minStock}
                    onChange={(e) => setNewPart({ ...newPart, minStock: parseInt(e.target.value) || 1 })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPart.unitCost}
                    onChange={(e) => setNewPart({ ...newPart, unitCost: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Storage Bin / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. BIN-C-04"
                    value={newPart.location}
                    onChange={(e) => setNewPart({ ...newPart, location: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Primary OEM / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Festool Automation"
                    value={newPart.supplier}
                    onChange={(e) => setNewPart({ ...newPart, supplier: e.target.value })}
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
                  Save Part
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Part Modal */}
      <Modal
        isOpen={!!issueModalPart}
        onClose={() => setIssueModalPart(null)}
        title="Issue Spare Part to Work Order"
        subtitle={`Deduct parts from inventory stock for ${issueModalPart?.partNo}`}
      >
        <form onSubmit={handleIssue} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{issueModalPart?.partNo} - {issueModalPart?.name}</div>
            <div style={{ fontSize: "12px", color: "#8C5B23", marginTop: "2px" }}>Location: {issueModalPart?.location} • Current Stock: {issueModalPart?.stock}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity to Issue</label>
            <input
              type="number"
              min="1"
              max={issueModalPart?.stock || 10}
              className="form-input"
              value={issueQty}
              onChange={(e) => setIssueQty(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Charge to Work Order ID</label>
            <input
              type="text"
              className="form-input"
              value={woNumber}
              onChange={(e) => setWoNumber(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIssueModalPart(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={ArrowDownLeft}>
              Issue Part to WO
            </Button>
          </div>
        </form>
      </Modal>

      {/* Return Part Modal */}
      <Modal
        isOpen={!!returnModalPart}
        onClose={() => setReturnModalPart(null)}
        title="Return Spare Part to Stock"
        subtitle={`Restock unused components for ${returnModalPart?.partNo}`}
      >
        <form onSubmit={handleReturn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Quantity to Restock</label>
            <input
              type="number"
              min="1"
              max="20"
              className="form-input"
              value={returnQty}
              onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setReturnModalPart(null)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" icon={ArrowUpRight}>
              Confirm Restock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

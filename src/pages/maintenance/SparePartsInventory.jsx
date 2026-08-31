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
  RotateCcw
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
  const { spareParts, issueSparePart, returnSparePart } = useCMMS();
  const { addToast } = useApp();

  const [issueModalPart, setIssueModalPart] = useState(null);
  const [issueQty, setIssueQty] = useState(1);
  const [woNumber, setWoNumber] = useState("WO-2026-0891");

  const [returnModalPart, setReturnModalPart] = useState(null);
  const [returnQty, setReturnQty] = useState(1);

  const lowStockCount = spareParts.filter((p) => p.status.includes("Low Stock")).length;
  const totalValuation = spareParts.reduce((sum, p) => sum + p.stock * p.unitCost, 0);

  const handleIssue = (e) => {
    e.preventDefault();
    if (!issueModalPart) return;
    issueSparePart(issueModalPart.partNo, issueQty, woNumber);
    addToast(`Issued ${issueQty} units of ${issueModalPart.partNo} to ${woNumber}`);
    setIssueModalPart(null);
  };

  const handleReturn = (e) => {
    e.preventDefault();
    if (!returnModalPart) return;
    returnSparePart(returnModalPart.partNo, returnQty);
    addToast(`Returned ${returnQty} units of ${returnModalPart.partNo} to stock`);
    setReturnModalPart(null);
  };

  const columns = [
    {
      header: "Part Number & Description",
      accessor: "partNo",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <Package size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{row.partNo}</div>
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
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val <= row.minStock ? "#EF4444" : "#FFFFFF" }}>
            {val} units
          </span>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Min: {row.minStock}</div>
        </div>
      )
    },
    {
      header: "Location / Bin",
      accessor: "location",
      render: (val) => <span style={{ fontSize: "12px", color: "#38BDF8" }}>{val}</span>
    },
    {
      header: "Unit Cost",
      accessor: "unitCost",
      render: (val) => <span style={{ fontFamily: "var(--font-mono)" }}>${val.toFixed(2)}</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Maintenance Spare Parts Inventory
            </h1>
            <Badge variant="cyan">{spareParts.length} Critical SKUs</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Stock tracking, minimum safety thresholds, automatic reorder flags, and work order part issuance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => addToast("Add Spare Part modal opened.")}>
            + Add New Part
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Total Parts Inventory"
          value={spareParts.length.toString()}
          unit="SKUs"
          trend={{ value: "Catalog Master", isPositive: true, text: "indexed" }}
          icon={Package}
          colorVariant="blue"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount.toString()}
          unit="SKUs"
          trend={{ value: "Gaskets & Sensors", isPositive: false, text: "below safety level" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Total Valuation"
          value={`$${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          unit="USD"
          trend={{ value: "Working Capital", isPositive: true, text: "on hand" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Stock Availability"
          value="98.5%"
          unit=""
          trend={{ value: "Fill Rate", isPositive: true, text: "for work orders" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
      </div>

      {/* Data Table */}
      <Card>
        <DataTable
          title="Spare Parts Master Inventory"
          columns={columns}
          data={spareParts}
          searchPlaceholder="Search part number, description, bin location, supplier..."
          exportFilename="flowstate_spare_parts.csv"
        />
      </Card>

      {/* Issue Part Modal */}
      <Modal
        isOpen={!!issueModalPart}
        onClose={() => setIssueModalPart(null)}
        title="Issue Spare Part to Work Order"
        subtitle={`Deduct parts from inventory stock for ${issueModalPart?.partNo}`}
      >
        <form onSubmit={handleIssue} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{issueModalPart?.partNo} - {issueModalPart?.name}</div>
            <div style={{ fontSize: "12px", color: "#38BDF8", marginTop: "2px" }}>Location: {issueModalPart?.location} • Current Stock: {issueModalPart?.stock}</div>
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

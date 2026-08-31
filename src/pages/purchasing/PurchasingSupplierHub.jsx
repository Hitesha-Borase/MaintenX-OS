import React, { useState } from "react";
import {
  ShoppingBag,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Building2,
  Download
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { INITIAL_PURCHASE_ORDERS, SUPPLIERS } from "../../data/mockPurchasing";
import { useApp } from "../../context/AppContext";

export function PurchasingSupplierHub() {
  const { addToast } = useApp();
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [suppliers, setSuppliers] = useState(SUPPLIERS);

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || "Citrus Valley Farms Co.");
  const [totalAmount, setTotalAmount] = useState("15000");

  const totalPoSpend = purchaseOrders.reduce((sum, p) => sum + p.totalAmountUSD, 0);

  const handleCreatePO = (e) => {
    e.preventDefault();
    const newPO = {
      poNumber: `PO-SUP-2026-${Math.floor(500 + Math.random() * 500)}`,
      supplierName,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDueDate: "2026-09-10",
      totalAmountUSD: parseFloat(totalAmount) || 15000,
      itemsCount: 1,
      status: "Submitted",
      buyer: "Purchasing Lead",
      priority: "Standard",
      lines: [{ item: "Bulk Supply Item", qty: "1,000 units", unitPrice: 15.0, total: parseFloat(totalAmount) || 15000 }]
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    addToast(`Purchase Order ${newPO.poNumber} created and dispatched to supplier!`);
    setIsPoModalOpen(false);
  };

  const poColumns = [
    {
      header: "PO Number",
      accessor: "poNumber",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <ShoppingBag size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.orderDate}</div>
          </div>
        </div>
      )
    },
    {
      header: "Supplier",
      accessor: "supplierName",
      render: (val) => <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{val}</span>
    },
    {
      header: "Total Amount (USD)",
      accessor: "totalAmountUSD",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#34D399" }}>
          ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: "Delivery Due",
      accessor: "deliveryDueDate",
      render: (val) => <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>{val}</span>
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const variant = val === "Received" ? "emerald" : val.includes("Expedited") ? "rose" : "cyan";
        return <Badge variant={variant} dot>{val}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            addToast(`Viewing PO lines and ASN for ${row.poNumber}`);
          }}
        >
          View PO
        </Button>
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
              Purchasing, Supply Chain & Vendor Scorecards
            </h1>
            <Badge variant="cyan">Supplier SLA Portal</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Direct material procurement, emergency spare parts replenishment, and vendor OTIF performance scorecards.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsPoModalOpen(true)}>
            + Create Purchase Order
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Active Procurement Spend"
          value={`$${totalPoSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          unit="USD"
          trend={{ value: "3 POs In Flight", isPositive: true, text: "contract terms" }}
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="Supplier Mean OTIF"
          value="96.2%"
          unit=""
          trend={{ value: "+1.2%", isPositive: true, text: "on-time in-full" }}
          icon={Truck}
          colorVariant="blue"
        />
        <StatCard
          title="Expedited Shipments"
          value="1"
          unit="urgent"
          trend={{ value: "Alfa Laval Gaskets", isPositive: false, text: "for HT-105" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Quality Acceptance"
          value="99.4%"
          unit="CoA"
          trend={{ value: "Raw Ingredients", isPositive: true, text: "passed receiving QC" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
      </div>

      {/* Supplier Scorecards */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Approved Vendor Performance Scorecards
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Quality acceptance ratings, on-time delivery rates, and lead time tracking
            </p>
          </div>
          <Badge variant="emerald">ISO 9001 Approved</Badge>
        </div>

        <div className="grid-3">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {sup.name}
                </span>
                <Badge variant={sup.riskRating.includes("Low") ? "emerald" : "amber"}>
                  {sup.riskRating.split(" ")[0]}
                </Badge>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {sup.category}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                <span>OTIF Delivery: <strong style={{ color: "#34D399" }}>{sup.otifScore}%</strong></span>
                <span>Avg Lead Time: <strong>{sup.avgLeadTimeDays} days</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <DataTable
          title="Purchase Orders Master Register"
          columns={poColumns}
          data={purchaseOrders}
          searchPlaceholder="Search PO number, supplier, buyer..."
          exportFilename="flowstate_purchase_orders.csv"
        />
      </Card>

      {/* Create PO Modal */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Create Direct Purchase Order"
        subtitle="Issue purchase requisition to approved supplier"
      >
        <form onSubmit={handleCreatePO} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Vendor / Supplier *</label>
            <select className="form-select" value={supplierName} onChange={(e) => setSupplierName(e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Total Amount (USD) *</label>
            <input
              type="number"
              className="form-input"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsPoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus}>
              Submit Purchase Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

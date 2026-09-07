import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
  Download,
  Eye,
  X,
  FileText,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Mail,
  Phone,
  CalendarRange,
  RotateCcw
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
  const location = useLocation();
  const { addToast } = useApp();

  // Detect which menu item was clicked
  const isSuppliersPage = location.pathname.includes("supplier");

  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [suppliers, setSuppliers] = useState(SUPPLIERS);

  // PO Modals & Edit States
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isEditPoModalOpen, setIsEditPoModalOpen] = useState(false);
  const [selectedPoForModal, setSelectedPoForModal] = useState(null);
  const [editingPo, setEditingPo] = useState(null);
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || "Citrus Valley Farms Co.");
  const [orderItem, setOrderItem] = useState("Aseptic HDPE Bottle Preforms (28mm)");
  const [orderQty, setOrderQty] = useState("15,000 units");
  const [totalAmount, setTotalAmount] = useState("14500");
  const [deliveryDueDate, setDeliveryDueDate] = useState("2026-09-18");

  // Supplier Modals & Edit States
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    supplierCode: "",
    category: "Raw Material Concentrate",
    materialsSupplied: "",
    contactEmail: "",
    contactPhone: "",
    avgLeadTimeDays: 4,
    riskRating: "Low Risk"
  });

  const totalPoSpend = purchaseOrders.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);

  // Handle PO Creation
  const handleCreatePO = (e) => {
    e.preventDefault();
    const matchedSup = suppliers.find((s) => s.name === supplierName);
    const newPO = {
      poNumber: `PO-SUP-2026-${Math.floor(600 + Math.random() * 400)}`,
      supplierName,
      supplierCode: matchedSup?.supplierCode || `VND-${Math.floor(10 + Math.random() * 90)}`,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDueDate: deliveryDueDate || "2026-09-20",
      totalAmountUSD: parseFloat(totalAmount) || 14500,
      itemsCount: 1,
      status: "Submitted",
      receivingStatus: "Pending Dock Arrival",
      buyer: "Materials Procurement Lead",
      priority: "Standard",
      lines: [
        {
          item: orderItem,
          qty: orderQty || "15,000 units",
          unitPrice: (parseFloat(totalAmount) / 15000).toFixed(2),
          total: parseFloat(totalAmount) || 14500
        }
      ]
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    addToast(`Purchase Order ${newPO.poNumber} created & dispatched to ${supplierName}!`, "success");
    setIsPoModalOpen(false);
  };

  // Handle PO Edit
  const handleUpdatePO = (e) => {
    e.preventDefault();
    if (!editingPo) return;
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.poNumber === editingPo.poNumber ? { ...editingPo } : po))
    );
    addToast(`Purchase Order ${editingPo.poNumber} updated successfully.`, "success");
    setIsEditPoModalOpen(false);
    setEditingPo(null);
  };

  // Handle PO Workflow Actions
  const handleApprovePO = (po) => {
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.poNumber === po.poNumber ? { ...p, status: "Confirmed", receivingStatus: "Dock Ready / Dispatched" } : p
      )
    );
    addToast(`Purchase Order ${po.poNumber} approved & confirmed.`, "success");
  };

  const handleReceivePO = (po) => {
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.poNumber === po.poNumber ? { ...p, status: "Received", receivingStatus: "Received Full (Put-Away Complete)" } : p
      )
    );
    addToast(`Purchase Order ${po.poNumber} marked as fully received at Dock 3.`, "success");
  };

  const handleCancelPO = (po) => {
    if (window.confirm(`Are you sure you want to cancel PO ${po.poNumber}?`)) {
      setPurchaseOrders((prev) =>
        prev.map((p) =>
          p.poNumber === po.poNumber ? { ...p, status: "Cancelled", receivingStatus: "Cancelled" } : p
        )
      );
      addToast(`Purchase Order ${po.poNumber} has been cancelled.`, "info");
    }
  };

  // Handle Supplier Registration
  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) {
      addToast("Please provide vendor company name", "warning");
      return;
    }
    const supCode = newSupplier.supplierCode || `VND-${newSupplier.name.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const created = {
      id: `SUP-${Math.floor(100 + Math.random() * 900)}`,
      supplierCode: supCode,
      name: newSupplier.name,
      category: newSupplier.category,
      materialsSupplied: newSupplier.materialsSupplied || "Packaging & Ingredients",
      status: "Active",
      otifScore: 98.0,
      qualityAcceptanceRate: 99.5,
      avgLeadTimeDays: parseFloat(newSupplier.avgLeadTimeDays) || 4.0,
      riskRating: newSupplier.riskRating,
      contactEmail: newSupplier.contactEmail || "procurement@vendor.com",
      contactPhone: newSupplier.contactPhone || "+1 (555) 000-0000",
      lastOrder: "Pending Initial PO",
      openOrdersCount: 0,
      activeContractsCount: 1
    };
    setSuppliers((prev) => [created, ...prev]);
    addToast(`Approved Supplier ${created.name} (${created.supplierCode}) registered!`, "success");
    setIsAddSupplierModalOpen(false);
    setNewSupplier({
      name: "",
      supplierCode: "",
      category: "Raw Material Concentrate",
      materialsSupplied: "",
      contactEmail: "",
      contactPhone: "",
      avgLeadTimeDays: 4,
      riskRating: "Low Risk"
    });
  };

  // Handle Supplier Edit
  const handleUpdateSupplier = (e) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setSuppliers((prev) =>
      prev.map((s) => (s.id === editingSupplier.id ? { ...editingSupplier } : s))
    );
    addToast(`Supplier ${editingSupplier.name} profile updated.`, "success");
    setIsEditSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  // Toggle Supplier Status
  const handleToggleSupplierStatus = (supplier) => {
    const nextStatus = supplier.status === "Active" ? "Inactive" : "Active";
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplier.id ? { ...s, status: nextStatus } : s))
    );
    addToast(`Supplier ${supplier.name} is now ${nextStatus}.`, nextStatus === "Active" ? "success" : "warning");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Received":
        return <Badge variant="emerald" dot>Received</Badge>;
      case "In Transit":
        return <Badge variant="blue" dot>In Transit</Badge>;
      case "Confirmed":
        return <Badge variant="cyan" dot>Confirmed</Badge>;
      case "Submitted":
        return <Badge variant="amber" dot>Submitted</Badge>;
      case "Expedited":
        return <Badge variant="rose" dot>Expedited</Badge>;
      case "Cancelled":
        return <Badge variant="slate">Cancelled</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const getReceivingBadge = (status) => {
    if (!status) return <Badge variant="slate">Pending</Badge>;
    if (status.includes("Full") || status.includes("Released") || status.includes("Pumped")) {
      return <Badge variant="emerald" dot>{status}</Badge>;
    }
    if (status.includes("Dock") || status.includes("Partially")) {
      return <Badge variant="blue" dot>{status}</Badge>;
    }
    if (status.includes("Cancelled")) {
      return <Badge variant="rose">{status}</Badge>;
    }
    return <Badge variant="amber" dot>{status}</Badge>;
  };

  // PO Columns for Purchasing & POs Page
  const poColumns = [
    {
      header: "PO Number",
      accessor: "poNumber",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "150px" }}>
          <div style={{ padding: "6px", borderRadius: "6px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23" }}>
            <ShoppingBag size={14} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Order: {row.orderDate}</div>
          </div>
        </div>
      )
    },
    {
      header: "Supplier",
      accessor: "supplierName",
      render: (val, row) => (
        <div style={{ minWidth: "160px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Building2 size={13} color="#8C5B23" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{val}</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", paddingLeft: "18px" }}>
            {row.supplierCode || "VND-GEN"}
          </div>
        </div>
      )
    },
    {
      header: "Items",
      accessor: "lines",
      render: (lines, row) => (
        <div style={{ minWidth: "180px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "220px" }} title={lines?.[0]?.item}>
            {lines?.[0]?.item || "Raw Ingredients / Packaging"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {row.itemsCount || 1} line item(s)
          </div>
        </div>
      )
    },
    {
      header: "Quantity",
      accessor: "lines",
      render: (lines) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", minWidth: "90px", display: "inline-block" }}>
          {lines?.[0]?.qty || "10,000 units"}
        </span>
      )
    },
    {
      header: "Order Date",
      accessor: "orderDate",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", minWidth: "85px", display: "inline-block" }}>
          {val}
        </span>
      )
    },
    {
      header: "Expected Delivery",
      accessor: "deliveryDueDate",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, minWidth: "95px", display: "inline-block" }}>
          {val}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => getStatusBadge(val)
    },
    {
      header: "Total Value",
      accessor: "totalAmountUSD",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981", fontSize: "13px", minWidth: "95px", display: "inline-block" }}>
          ${val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: "Receiving Status",
      accessor: "receivingStatus",
      render: (val) => getReceivingBadge(val)
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "210px" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPoForModal(row);
            }}
            title="View PO Details"
          >
            View
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingPo({ ...row });
              setIsEditPoModalOpen(true);
            }}
            title="Edit PO"
          >
            Edit
          </Button>

          {row.status === "Submitted" && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApprovePO(row);
              }}
              style={{ backgroundColor: "#059669", borderColor: "#059669" }}
              title="Approve PO"
            >
              Approve
            </Button>
          )}

          {row.status !== "Received" && row.status !== "Cancelled" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReceivePO(row);
              }}
              style={{ color: "#10B981" }}
              title="Mark as Received"
            >
              Receive
            </Button>
          )}

          {row.status !== "Cancelled" && row.status !== "Received" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelPO(row);
              }}
              style={{ color: "#EF4444", padding: "4px 8px" }}
              title="Cancel PO"
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  // Supplier Columns for Supplier Management Page
  const supplierColumns = [
    {
      header: "Supplier Name",
      accessor: "name",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "170px" }}>
          <div style={{ padding: "6px", borderRadius: "6px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#0284C7" }}>
            <Building2 size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.id}</div>
          </div>
        </div>
      )
    },
    {
      header: "Supplier Code",
      accessor: "supplierCode",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px", color: "#8C5B23", minWidth: "110px", display: "inline-block" }}>
          {val || "VND-GEN"}
        </span>
      )
    },
    {
      header: "Contact",
      accessor: "contactEmail",
      render: (val, row) => (
        <div style={{ minWidth: "180px", fontSize: "12px" }}>
          <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.contactPhone || "+1 (555) 012-3456"}</div>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Materials Supplied",
      accessor: "materialsSupplied",
      render: (val) => (
        <div style={{ minWidth: "180px", maxWidth: "240px", fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={val}>
          {val || "Standard Packaging & Ingredients"}
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => (
        <Badge variant={val === "Active" ? "emerald" : "slate"} dot={val === "Active"}>
          {val || "Active"}
        </Badge>
      )
    },
    {
      header: "Performance",
      accessor: "otifScore",
      render: (val, row) => (
        <div style={{ minWidth: "120px" }}>
          <div style={{ fontSize: "12px" }}>
            OTIF: <strong style={{ color: "#10B981" }}>{val}%</strong>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            QA: <strong style={{ color: "#0284C7" }}>{row.qualityAcceptanceRate || 99.4}%</strong>
          </div>
        </div>
      )
    },
    {
      header: "Last Order",
      accessor: "lastOrder",
      render: (val) => (
        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", minWidth: "120px", display: "inline-block" }}>
          {val || "2026-08-28"}
        </span>
      )
    },
    {
      header: "Open Orders",
      accessor: "openOrdersCount",
      render: (val) => (
        <Badge variant={val > 0 ? "blue" : "slate"}>
          {val ?? 1} Open
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "210px" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedSupplierForModal(row)}
            title="View Dossier"
          >
            View
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingSupplier({ ...row });
              setIsEditSupplierModalOpen(true);
            }}
            title="Edit Supplier"
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleSupplierStatus(row)}
            style={{
              color: row.status === "Active" ? "#EF4444" : "#10B981",
              fontSize: "11px",
              padding: "4px 8px"
            }}
            title={row.status === "Active" ? "Deactivate Supplier" : "Activate Supplier"}
          >
            {row.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* ========================================================= */}
      {/* PAGE SCENARIO 1: SUPPLIER SCORECARDS (/warehouse/suppliers) */}
      {/* ========================================================= */}
      {isSuppliersPage ? (
        <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
                  Approved Supplier & Vendor SLA Scorecards
                </h1>
                <Badge variant="emerald">ISO-9001 Approved Vendors</Badge>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddSupplierModalOpen(true)}
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                Register Approved Vendor
              </Button>
            </div>
          </div>

          {/* Supplier Specific KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", width: "100%" }}>
            <StatCard
              title="Approved Active Vendors"
              value={suppliers.length.toString()}
              unit="Companies"
              trend={{ value: "100% Audited", isPositive: true, text: "ISO compliant" }}
              icon={Building2}
              colorVariant="blue"
            />
            <StatCard
              title="Fleet Mean OTIF"
              value="96.2%"
              unit="On-Time In-Full"
              trend={{ value: "+1.8%", isPositive: true, text: "vs last quarter" }}
              icon={Truck}
              colorVariant="emerald"
            />
            <StatCard
              title="Average Lead Time"
              value="4.8 Days"
              unit="SLA Commitment"
              trend={{ value: "Low Transit Risk", isPositive: true, text: "contract terms" }}
              icon={Clock}
              colorVariant="amber"
            />
            <StatCard
              title="Inbound Quality Rate"
              value="99.4%"
              unit="Acceptance Rate"
              trend={{ value: "Zero Rejections", isPositive: true, text: "CoA Verified" }}
              icon={CheckCircle2}
              colorVariant="cyan"
            />
          </div>

          {/* Scorecards Grid Overview */}
          <Card style={{ padding: "20px", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Strategic Supplier Performance Summary
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Delivery punctuality, quality pass rates, and active master service agreements.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {suppliers.map((sup) => (
                <div
                  key={sup.id}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>
                        {sup.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sup.category}</span>
                    </div>
                    <Badge variant={sup.riskRating.includes("Low") ? "emerald" : "amber"}>
                      {sup.riskRating.split(" ")[0]} Risk
                    </Badge>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "8px",
                      padding: "10px",
                      backgroundColor: "var(--bg-card)",
                      borderRadius: "6px",
                      fontSize: "11px"
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>OTIF Delivery:</span>
                      <strong style={{ color: "#10B981", fontSize: "13px" }}>{sup.otifScore}%</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Avg Lead Time:</span>
                      <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>{sup.avgLeadTimeDays} Days</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span>Active Contracts: {sup.activeContractsCount || 2}</span>
                    <button
                      onClick={() => setSelectedSupplierForModal(sup)}
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", fontSize: "11px", color: "#8C5B23", fontWeight: 700 }}
                    >
                      Audit Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Supplier Table */}
          <Card style={{ padding: "18px", borderRadius: "14px" }}>
            <DataTable
              title="Approved Vendor Master Directory"
              columns={supplierColumns}
              data={suppliers}
              searchPlaceholder="Search vendor name, category, ID..."
              exportFilename="flowstate_suppliers_directory.csv"
            />
          </Card>
        </>
      ) : (
        /* ========================================================= */
        /* PAGE SCENARIO 2: PURCHASING & POS (/warehouse/purchasing) */
        /* ========================================================= */
        <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
                  Purchase Orders & Inbound Material Requisitions
                </h1>
                <Badge variant="emerald">Inbound Material Pipeline</Badge>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setIsPoModalOpen(true)}
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                + Create Purchase Order
              </Button>
            </div>
          </div>

          {/* Purchasing Specific KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", width: "100%" }}>
            <StatCard
              title="Active Procurement Spend"
              value={`$${totalPoSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              unit="CAD/USD"
              trend={{ value: `${purchaseOrders.length} Active Orders`, isPositive: true, text: "in supply pipeline" }}
              icon={DollarSign}
              colorVariant="emerald"
            />
            <StatCard
              title="Inbound Shipments In Flight"
              value={purchaseOrders.filter((p) => p.status.includes("Transit") || p.status.includes("Submitted")).length.toString()}
              unit="En Route"
              trend={{ value: "Dock ETA on schedule", isPositive: true, text: "live ASNs" }}
              icon={Truck}
              colorVariant="blue"
            />
            <StatCard
              title="Expedited / Priority Freight"
              value="1"
              unit="Emergency"
              trend={{ value: "Pasteurizer Gaskets", isPositive: false, text: "for HT-105" }}
              icon={AlertTriangle}
              colorVariant="rose"
            />
            <StatCard
              title="Received & Staged"
              value={purchaseOrders.filter((p) => p.status === "Received").length.toString()}
              unit="Completed"
              trend={{ value: "100% Inbound Matched", isPositive: true, text: "barcode verified" }}
              icon={CheckCircle2}
              colorVariant="cyan"
            />
          </div>

          {/* Purchase Orders Table */}
          <Card style={{ padding: "18px", borderRadius: "14px" }}>
            <DataTable
              title="Purchase Orders Master Register"
              columns={poColumns}
              data={purchaseOrders}
              searchPlaceholder="Search PO number, supplier, items..."
              exportFilename="flowstate_purchase_orders.csv"
            />
          </Card>
        </>
      )}

      {/* ========================================================= */}
      {/* SHARED MODALS */}
      {/* ========================================================= */}

      {/* VIEW PO DETAILS MODAL */}
      {selectedPoForModal && (
        <div className="modal-backdrop" onClick={() => setSelectedPoForModal(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: "620px", margin: "16px", borderRadius: "14px", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23" }}>
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Purchase Order Dossier: {selectedPoForModal.poNumber}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Direct ERP / Supply Chain Integration Record
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPoForModal(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "12px", display: "block" }}>Vendor:</span>
                  <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{selectedPoForModal.supplierName}</strong>
                </div>
                {getStatusBadge(selectedPoForModal.status)}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                  padding: "14px",
                  backgroundColor: "var(--bg-card-subtle)",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Order Date:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedPoForModal.orderDate}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Delivery Due Date:</span>
                  <strong style={{ color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{selectedPoForModal.deliveryDueDate}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Buyer / Requester:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedPoForModal.buyer || "Materials Lead"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Total PO Value:</span>
                  <strong style={{ color: "#10B981", fontSize: "14px", fontFamily: "var(--font-mono)" }}>
                    ${selectedPoForModal.totalAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} CAD/USD
                  </strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  Material Line Items & Deliverables:
                </h4>
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                        <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Item Description</th>
                        <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Quantity</th>
                        <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "10px 12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {selectedPoForModal.lines?.[0]?.item || "Raw Ingredients / Packaging Material"}
                        </td>
                        <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                          {selectedPoForModal.lines?.[0]?.qty || "10,000 units"}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#10B981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                          ${selectedPoForModal.totalAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedPoForModal(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={() => {
                    addToast(`PO ${selectedPoForModal.poNumber} PDF downloaded.`);
                    setSelectedPoForModal(null);
                  }}
                >
                  Print PO Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SUPPLIER DOSSIER MODAL */}
      {selectedSupplierForModal && (
        <div className="modal-backdrop" onClick={() => setSelectedSupplierForModal(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: "600px", margin: "16px", borderRadius: "14px", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#0284C7" }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Vendor SLA & Compliance Dossier
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Supplier ID: {selectedSupplierForModal.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSupplierForModal(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {selectedSupplierForModal.name}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Category: <strong>{selectedSupplierForModal.category}</strong>
                  </div>
                </div>
                <Badge variant={selectedSupplierForModal.riskRating?.includes("Low") ? "emerald" : "amber"}>
                  {selectedSupplierForModal.riskRating}
                </Badge>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                  padding: "14px",
                  backgroundColor: "var(--bg-card-subtle)",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>OTIF Delivery Performance:</span>
                  <strong style={{ color: "#10B981", fontSize: "15px" }}>{selectedSupplierForModal.otifScore}%</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Quality Acceptance Rate:</span>
                  <strong style={{ color: "#0284C7", fontSize: "15px" }}>{selectedSupplierForModal.qualityAcceptanceRate}%</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Average Lead Time:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedSupplierForModal.avgLeadTimeDays} Days</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Contact Channel:</span>
                  <strong style={{ color: "#8C5B23" }}>{selectedSupplierForModal.contactEmail}</strong>
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.08)", borderLeft: "3px solid #10B981", fontSize: "12px" }}>
                <strong>Quality Certification:</strong> ISO-9001 / GFSI / HACCP Audit Passed. Valid Certificate on File.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedSupplierForModal(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={() => {
                    addToast(`Vendor scorecard exported for ${selectedSupplierForModal.name}`);
                    setSelectedSupplierForModal(null);
                  }}
                >
                  Download Scorecard PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {isPoModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPoModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Issue Direct Purchase Order
              </h2>
              <button
                onClick={() => setIsPoModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePO} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label">Vendor / Approved Supplier *</label>
                <select className="form-select" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} style={{ backgroundColor: "var(--bg-card)" }}>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Material Description / Requisition Item *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={orderItem}
                  onChange={(e) => setOrderItem(e.target.value)}
                  placeholder="e.g. HDPE Preforms, Natural Citrus Extract, Aseptic Caps"
                  style={{ backgroundColor: "var(--bg-card)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">PO Amount (CAD/USD) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    required
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Delivery Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={deliveryDueDate}
                    onChange={(e) => setDeliveryDueDate(e.target.value)}
                    required
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <Button variant="secondary" onClick={() => setIsPoModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Issue Purchase Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER APPROVED VENDOR MODAL */}
      {isAddSupplierModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddSupplierModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Register Approved Supplier
              </h2>
              <button
                onClick={() => setIsAddSupplierModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label">Company / Vendor Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Apex Packaging Solutions Ltd."
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  style={{ backgroundColor: "var(--bg-card)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <option value="Raw Material Concentrate">Raw Material Concentrate</option>
                    <option value="Packaging Containers">Packaging Containers</option>
                    <option value="Specialty Flavors & Extracts">Specialty Flavors & Extracts</option>
                    <option value="Sanitation Chemicals">Sanitation Chemicals</option>
                    <option value="Spare Parts & Tooling">Spare Parts & Tooling</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Risk Rating *</label>
                  <select
                    className="form-select"
                    value={newSupplier.riskRating}
                    onChange={(e) => setNewSupplier({ ...newSupplier, riskRating: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <option value="Low Risk">Low Risk (Tier 1)</option>
                    <option value="Medium Risk">Medium Risk</option>
                    <option value="High Risk">High Risk (Audit Pending)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Average Lead Time (Days) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={newSupplier.avgLeadTimeDays}
                    onChange={(e) => setNewSupplier({ ...newSupplier, avgLeadTimeDays: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>

                <div>
                  <label className="form-label">Procurement Contact Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="orders@vendor.com"
                    value={newSupplier.contactEmail}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <Button variant="secondary" onClick={() => setIsAddSupplierModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Save Supplier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PO MODAL */}
      {isEditPoModalOpen && editingPo && (
        <div className="modal-backdrop" onClick={() => setIsEditPoModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Purchase Order: {editingPo.poNumber}
              </h2>
              <button
                onClick={() => setIsEditPoModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePO} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="form-label">Vendor / Supplier *</label>
                <select
                  className="form-select"
                  value={editingPo.supplierName}
                  onChange={(e) => {
                    const sup = suppliers.find((s) => s.name === e.target.value);
                    setEditingPo({
                      ...editingPo,
                      supplierName: e.target.value,
                      supplierCode: sup?.supplierCode || editingPo.supplierCode
                    });
                  }}
                  style={{ backgroundColor: "var(--bg-card)" }}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.supplierCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Material Description / Requisition Item *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editingPo.lines?.[0]?.item || ""}
                  onChange={(e) =>
                    setEditingPo({
                      ...editingPo,
                      lines: [
                        {
                          ...editingPo.lines?.[0],
                          item: e.target.value
                        }
                      ]
                    })
                  }
                  style={{ backgroundColor: "var(--bg-card)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Quantity *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editingPo.lines?.[0]?.qty || ""}
                    onChange={(e) =>
                      setEditingPo({
                        ...editingPo,
                        lines: [
                          {
                            ...editingPo.lines?.[0],
                            qty: e.target.value
                          }
                        ]
                      })
                    }
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>

                <div>
                  <label className="form-label">PO Amount (USD) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={editingPo.totalAmountUSD || 0}
                    onChange={(e) =>
                      setEditingPo({
                        ...editingPo,
                        totalAmountUSD: parseFloat(e.target.value) || 0
                      })
                    }
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Expected Delivery Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={editingPo.deliveryDueDate || ""}
                    onChange={(e) =>
                      setEditingPo({
                        ...editingPo,
                        deliveryDueDate: e.target.value
                      })
                    }
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>

                <div>
                  <label className="form-label">PO Status *</label>
                  <select
                    className="form-select"
                    value={editingPo.status}
                    onChange={(e) =>
                      setEditingPo({
                        ...editingPo,
                        status: e.target.value
                      })
                    }
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Receiving Status *</label>
                <select
                  className="form-select"
                  value={editingPo.receivingStatus || "Pending Dock Arrival"}
                  onChange={(e) =>
                    setEditingPo({
                      ...editingPo,
                      receivingStatus: e.target.value
                    })
                  }
                  style={{ backgroundColor: "var(--bg-card)" }}
                >
                  <option value="Pending Dock Arrival">Pending Dock Arrival</option>
                  <option value="Dock Inspected (Pre-Check)">Dock Inspected (Pre-Check)</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Received Full (Put-Away Complete)">Received Full (Put-Away Complete)</option>
                  <option value="Received Full (QA Released)">Received Full (QA Released)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <Button variant="secondary" onClick={() => setIsEditPoModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Purchase Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUPPLIER MODAL */}
      {isEditSupplierModalOpen && editingSupplier && (
        <div className="modal-backdrop" onClick={() => setIsEditSupplierModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Supplier: {editingSupplier.name}
              </h2>
              <button
                onClick={() => setIsEditSupplierModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSupplier} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Supplier Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editingSupplier.name}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>
                <div>
                  <label className="form-label">Supplier Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editingSupplier.supplierCode || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, supplierCode: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={editingSupplier.category}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, category: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <option value="Raw Material Concentrate">Raw Material Concentrate</option>
                    <option value="Packaging Containers">Packaging Containers</option>
                    <option value="Specialty Flavors & Extracts">Specialty Flavors & Extracts</option>
                    <option value="Sanitation Chemicals">Sanitation Chemicals</option>
                    <option value="Spare Parts & Tooling">Spare Parts & Tooling</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={editingSupplier.status || "Active"}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, status: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Materials Supplied</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingSupplier.materialsSupplied || ""}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, materialsSupplied: e.target.value })}
                  style={{ backgroundColor: "var(--bg-card)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingSupplier.contactEmail || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactEmail: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>

                <div>
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingSupplier.contactPhone || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPhone: e.target.value })}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <Button variant="secondary" onClick={() => setIsEditSupplierModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

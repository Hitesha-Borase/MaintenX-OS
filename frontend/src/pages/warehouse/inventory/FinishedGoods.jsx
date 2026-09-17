import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Package,
  Search,
  Filter,
  Download,
  Eye,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  MapPin,
  Calendar,
  Layers,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Check
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function FinishedGoods() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  // Live Database Records
  const [finishedGoodsList, setFinishedGoodsList] = useState([]);
  const [metrics, setMetrics] = useState({
    totalFinishedPallets: "0 Pallets",
    readyForDispatch: "0 Pallets",
    qaReleaseRate: "0%",
    highBayOccupancy: "0%"
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals State
  const [selectedGoodForView, setSelectedGoodForView] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGood, setEditingGood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sku: "",
    productName: "",
    finishedLot: "",
    batchNumber: "",
    quantity: "",
    storageLocation: "",
    productionDate: new Date().toISOString().substring(0, 10),
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
    qaStatus: "QA Released",
    palletSerial: "",
    shipmentStatus: "Ready to Ship",
    destination: "",
    tempCheck: "18.5°C Controlled",
    notes: ""
  });

  // Fetch Live Data from PostgreSQL
  const fetchFinishedGoods = async () => {
    setIsLoading(true);
    try {
      const res = await warehouseService.getFinishedGoods({
        search: searchQuery,
        status: statusFilter
      });
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setFinishedGoodsList(Array.isArray(data.finishedGoods) ? data.finishedGoods : []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch finished goods:", err.message);
      addToast("Error loading finished goods from database", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinishedGoods();
  }, []);

  // Filter in memory for instantaneous search UI response
  const filteredGoods = useMemo(() => {
    return finishedGoodsList.filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (g.sku && g.sku.toLowerCase().includes(q)) ||
        (g.finishedLot && g.finishedLot.toLowerCase().includes(q)) ||
        (g.batch && g.batch.toLowerCase().includes(q)) ||
        (g.productName && g.productName.toLowerCase().includes(q)) ||
        (g.location && g.location.toLowerCase().includes(q)) ||
        (g.destination && g.destination.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || g.shipmentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [finishedGoodsList, searchQuery, statusFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      sku: `SKU-CAN-330ML-ORG`,
      productName: "Sparkling Organic Soda 330ml Can",
      finishedLot: `LOT-FG-2026-${randomNum}`,
      batchNumber: `BAT-2026-${randomNum}`,
      quantity: "36,000 cans (1,500 Cases)",
      storageLocation: "Finished Goods High-Bay - Bin FG-44",
      productionDate: new Date().toISOString().substring(0, 10),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      qaStatus: "QA Released",
      palletSerial: "20 Pallets",
      shipmentStatus: "Ready to Ship",
      destination: "Metro Supermarkets Distribution Hub",
      tempCheck: "18.5°C Controlled",
      notes: ""
    });
    setIsCreateModalOpen(true);
  };

  // Submit Create -> Save to PostgreSQL
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sku.trim() || !formData.finishedLot.trim()) {
      addToast("SKU and Finished Lot are required", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await warehouseService.createFinishedGood(formData);
      addToast(`Finished Good ${formData.sku} successfully saved to database!`, "success");
      setIsCreateModalOpen(false);
      await fetchFinishedGoods();
    } catch (err) {
      console.error("Create error:", err);
      addToast("Failed to save finished good: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingGood(item);
    setFormData({
      sku: item.sku || "",
      productName: item.productName || "",
      finishedLot: item.finishedLot || "",
      batchNumber: item.batchNumber || item.batch || "",
      quantity: item.quantity || "",
      storageLocation: item.storageLocation || item.location || "",
      productionDate: item.productionDate || new Date().toISOString().substring(0, 10),
      expiryDate: item.expiryDate || new Date().toISOString().substring(0, 10),
      qaStatus: item.qaStatus || item.status || "QA Released",
      palletSerial: item.palletSerial || item.pallet || "",
      shipmentStatus: item.shipmentStatus || "Ready to Ship",
      destination: item.destination || "",
      tempCheck: item.tempCheck || "18.5°C Controlled",
      notes: item.notes || ""
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit -> Update in PostgreSQL
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingGood) return;
    setIsSubmitting(true);
    try {
      await warehouseService.updateFinishedGood(editingGood.id, formData);
      addToast(`Finished Good ${formData.sku} updated in database!`, "success");
      setIsEditModalOpen(false);
      setEditingGood(null);
      await fetchFinishedGoods();
    } catch (err) {
      console.error("Update error:", err);
      addToast("Failed to update finished good: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item -> Delete from PostgreSQL
  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete Finished Good "${item.productName} (${item.finishedLot})" from the database?`);
    if (!confirmDelete) return;

    try {
      await warehouseService.deleteFinishedGood(item.id);
      addToast(`Record "${item.finishedLot}" deleted from database table.`, "success");
      await fetchFinishedGoods();
    } catch (err) {
      console.error("Delete error:", err);
      addToast("Failed to delete record: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleTraceLot = (lotCode) => {
    addToast(`Loading 360° Traceability for Finished Lot ${lotCode}...`, "info");
    navigate(`/warehouse/traceability?lot=${lotCode}`);
  };

  const handleExportCSV = () => {
    const headers = "SKU,Product Name,Finished Lot,Batch,Quantity,Location,Production Date,Expiry Date,Status,Pallet,Shipment Status,Destination\n";
    const rows = filteredGoods
      .map(
        (g) =>
          `"${g.sku}","${g.productName}","${g.finishedLot}","${g.batch}","${g.quantity}","${g.location}","${g.productionDate}","${g.expiryDate}","${g.status}","${g.pallet}","${g.shipmentStatus}","${g.destination}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Finished_Goods_Inventory_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Finished goods inventory exported to CSV.", "info");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "QA Released":
        return <Badge variant="emerald" dot>QA Released</Badge>;
      case "QA Hold":
      case "Quarantined":
        return <Badge variant="rose" dot>{status}</Badge>;
      default:
        return <Badge variant="slate">{status || "Pending"}</Badge>;
    }
  };

  const getShipmentBadge = (status) => {
    switch (status) {
      case "Ready to Ship":
        return <Badge variant="emerald">Ready to Ship</Badge>;
      case "Staged":
        return <Badge variant="blue">Staged</Badge>;
      case "Allocated":
        return <Badge variant="amber">Allocated</Badge>;
      case "Hold / Quarantined":
        return <Badge variant="rose">Quarantined</Badge>;
      default:
        return <Badge variant="slate">{status || "Scheduled"}</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Finished Goods Inventory & Pallet Staging
            </h1>
            <Badge variant="emerald">100% LOT & BATCH TRACEABLE</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time warehouse tracking of released finished product batches, pallet serials, and outbound shipment allocation connected directly to PostgreSQL.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* PRIMARY BUTTON: + Add Finished Good (Form) */}
          <button
            onClick={handleOpenCreateModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              color: "#261603",
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Plus size={16} /> + Add Finished Good (Form)
          </button>

          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "8px 14px" }}>
            Export CSV
          </Button>

          <button
            onClick={fetchFinishedGoods}
            title="Refresh database records"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "var(--text-secondary)"
            }}
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
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
          title="Total Finished Pallets"
          value={metrics.totalFinishedPallets}
          unit="In Warehouse Storage"
          trend={{ value: `${finishedGoodsList.length} Finished SKUs`, isPositive: true, text: "" }}
          icon={Boxes}
          colorVariant="blue"
        />
        <StatCard
          title="Ready For Dispatch"
          value={metrics.readyForDispatch}
          unit="Ready to Ship"
          trend={{ value: "Customer orders confirmed", isPositive: true, text: "" }}
          icon={Truck}
          colorVariant="emerald"
        />
        <StatCard
          title="QA Release Rate"
          value={metrics.qaReleaseRate}
          unit="CoA Verified"
          trend={{ value: "Database Validated", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="High-Bay Occupancy"
          value={metrics.highBayOccupancy}
          unit="Capacity"
          trend={{ value: "Plenty of staging buffer", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by SKU, Finished Lot, Batch, Product Name, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Shipment Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "150px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Shipment Statuses</option>
              <option value="Ready to Ship">Ready to Ship</option>
              <option value="Staged">Staged</option>
              <option value="Allocated">Allocated</option>
              <option value="Hold / Quarantined">Hold / Quarantined</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1150px" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>SKU</th>
                <th style={{ whiteSpace: "nowrap" }}>Finished Lot</th>
                <th style={{ whiteSpace: "nowrap" }}>Batch</th>
                <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                <th style={{ whiteSpace: "nowrap" }}>Storage Location</th>
                <th style={{ whiteSpace: "nowrap" }}>Production Date</th>
                <th style={{ whiteSpace: "nowrap" }}>Expiry</th>
                <th style={{ whiteSpace: "nowrap" }}>QA Status</th>
                <th style={{ whiteSpace: "nowrap" }}>Pallet Serial</th>
                <th style={{ whiteSpace: "nowrap" }}>Shipment Status</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoods.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(200, 149, 71, 0.15)", color: "#B27E33", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Boxes size={24} />
                      </div>
                      <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                        No Finished Goods in Database
                      </strong>
                      <p style={{ fontSize: "12.5px", color: "var(--text-muted)", maxWidth: "450px", margin: 0 }}>
                        The PostgreSQL table <code>public.finished_goods</code> is currently empty. Click the button below to add your first real product record.
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        style={{
                          marginTop: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 18px",
                          background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 800,
                          color: "#261603",
                          cursor: "pointer"
                        }}
                      >
                        <Plus size={15} /> + Open Form & Add Finished Good
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGoods.map((g) => (
                  <tr key={g.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23", fontSize: "12px" }}>
                        {g.sku}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)", fontSize: "12.5px" }}>
                        {g.finishedLot}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#0284C7", fontSize: "12px" }}>
                        {g.batch}
                      </span>
                    </td>
                    <td style={{ minWidth: "160px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12.5px" }}>{g.quantity}</div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{g.productName}</span>
                    </td>
                    <td style={{ minWidth: "160px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{g.location}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{g.productionDate}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 600 }}>{g.expiryDate}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {getStatusBadge(g.status)}
                    </td>
                    <td style={{ minWidth: "150px" }}>
                      <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{g.pallet}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {getShipmentBadge(g.shipmentStatus)}
                    </td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedGoodForView(g)}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={GitBranch}
                          onClick={() => handleTraceLot(g.finishedLot)}
                          style={{ fontSize: "11px", padding: "4px 8px", backgroundColor: "#0284C7", borderColor: "#0284C7" }}
                          title="Trace Finished Lot to Ingredients & Pallet Delivery"
                        >
                          Trace
                        </Button>
                        <button
                          onClick={() => handleOpenEditModal(g)}
                          title="Edit Record in Database"
                          style={{
                            padding: "4px 7px",
                            borderRadius: "6px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid var(--border-subtle, #E8DDCF)",
                            color: "#0284c7",
                            cursor: "pointer"
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          title="Delete Record from Database"
                          style={{
                            padding: "4px 7px",
                            borderRadius: "6px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #fca5a5",
                            color: "#dc2626",
                            cursor: "pointer"
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE FINISHED GOOD MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Finished Good Record (Database Form)"
        subtitle="Create a new finished goods inventory record directly into the PostgreSQL `public.finished_goods` table."
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                SKU Code <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. SKU-CAN-330ML-ORG"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="form-input"
                  style={{ flex: 1, height: "36px", fontSize: "12.5px" }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sku: `SKU-CAN-330ML-${Math.floor(100 + Math.random() * 900)}` })}
                  style={{ padding: "0 10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF", fontSize: "11px", fontWeight: 750, cursor: "pointer", color: "#B27E33" }}
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Product Name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sparkling Organic Orange Soda 330ml Can"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Finished Lot Number <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LOT-FG-2026-0885"
                value={formData.finishedLot}
                onChange={(e) => setFormData({ ...formData, finishedLot: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Production Batch Number <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BAT-2026-0885"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Quantity Produced <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 36,000 cans (1,500 Cases)"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Storage Location <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Finished Goods High-Bay - Bin FG-44"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Production Date
              </label>
              <input
                type="date"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                QA Status
              </label>
              <select
                value={formData.qaStatus}
                onChange={(e) => setFormData({ ...formData, qaStatus: e.target.value })}
                className="form-select"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              >
                <option value="QA Released">QA Released</option>
                <option value="QA Hold">QA Hold</option>
                <option value="Under Inspection">Under Inspection</option>
                <option value="Quarantined">Quarantined</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Pallet Serialization
              </label>
              <input
                type="text"
                placeholder="e.g. 20 Pallets (PLT-0885-01..20)"
                value={formData.palletSerial}
                onChange={(e) => setFormData({ ...formData, palletSerial: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Shipment Allocation Status
              </label>
              <select
                value={formData.shipmentStatus}
                onChange={(e) => setFormData({ ...formData, shipmentStatus: e.target.value })}
                className="form-select"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              >
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="Staged">Staged</option>
                <option value="Allocated">Allocated</option>
                <option value="Hold / Quarantined">Hold / Quarantined</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Destination / Customer
              </label>
              <input
                type="text"
                placeholder="e.g. Metro Supermarkets Hub (Toronto)"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Temperature SLA Check
              </label>
              <input
                type="text"
                placeholder="e.g. 18.5°C Controlled"
                value={formData.tempCheck}
                onChange={(e) => setFormData({ ...formData, tempCheck: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
              Notes / Audit Comments
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes regarding pallet batch..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input"
              style={{ width: "100%", padding: "8px", fontSize: "12.5px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: "pointer", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#261603",
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              <Check size={16} /> {isSubmitting ? "Saving to Database..." : "Save to Database"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT FINISHED GOOD MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Finished Good: ${editingGood?.finishedLot || ""}`}
        subtitle="Modify records directly in the PostgreSQL database table `public.finished_goods`."
        maxWidth="680px"
      >
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                SKU Code
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Finished Lot Number
              </label>
              <input
                type="text"
                required
                value={formData.finishedLot}
                onChange={(e) => setFormData({ ...formData, finishedLot: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Production Batch Number
              </label>
              <input
                type="text"
                required
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Quantity Produced
              </label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Storage Location
              </label>
              <input
                type="text"
                required
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Production Date
              </label>
              <input
                type="date"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                QA Status
              </label>
              <select
                value={formData.qaStatus}
                onChange={(e) => setFormData({ ...formData, qaStatus: e.target.value })}
                className="form-select"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              >
                <option value="QA Released">QA Released</option>
                <option value="QA Hold">QA Hold</option>
                <option value="Under Inspection">Under Inspection</option>
                <option value="Quarantined">Quarantined</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Pallet Serialization
              </label>
              <input
                type="text"
                value={formData.palletSerial}
                onChange={(e) => setFormData({ ...formData, palletSerial: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Shipment Allocation Status
              </label>
              <select
                value={formData.shipmentStatus}
                onChange={(e) => setFormData({ ...formData, shipmentStatus: e.target.value })}
                className="form-select"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              >
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="Staged">Staged</option>
                <option value="Allocated">Allocated</option>
                <option value="Hold / Quarantined">Hold / Quarantined</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Destination / Customer
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
                Temperature SLA Check
              </label>
              <input
                type="text"
                value={formData.tempCheck}
                onChange={(e) => setFormData({ ...formData, tempCheck: e.target.value })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 750, color: "var(--text-primary)", marginBottom: "4px" }}>
              Notes / Audit Comments
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input"
              style={{ width: "100%", padding: "8px", fontSize: "12.5px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: "pointer", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#261603",
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              <Check size={16} /> {isSubmitting ? "Updating..." : "Update Database Record"}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      {selectedGoodForView && (
        <div className="modal-backdrop" onClick={() => setSelectedGoodForView(null)}>
          <div className="modal-content" style={{ maxWidth: "580px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Boxes size={18} color="#8C5B23" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Finished Goods Dossier: {selectedGoodForView.finishedLot}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    SKU: {selectedGoodForView.sku} • Batch: {selectedGoodForView.batch}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedGoodForView(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {selectedGoodForView.productName}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Target Destination: <strong style={{ color: "#0284C7" }}>{selectedGoodForView.destination}</strong>
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Total Quantity:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedGoodForView.quantity}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Pallet Serialization:</span>
                  <strong style={{ color: "#8C5B23" }}>{selectedGoodForView.pallet}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Storage Location:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedGoodForView.location}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Ambient / Cold SLA:</span>
                  <strong style={{ color: "#10B981" }}>{selectedGoodForView.tempCheck}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Production Date:</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{selectedGoodForView.productionDate}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Expiry Date:</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{selectedGoodForView.expiryDate}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button
                  variant="primary"
                  icon={GitBranch}
                  onClick={() => {
                    const lot = selectedGoodForView.finishedLot;
                    setSelectedGoodForView(null);
                    handleTraceLot(lot);
                  }}
                  style={{ backgroundColor: "#0284C7", borderColor: "#0284C7" }}
                >
                  Trace 360° Genealogy
                </Button>

                <Button variant="secondary" onClick={() => setSelectedGoodForView(null)}>
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

export default FinishedGoods;

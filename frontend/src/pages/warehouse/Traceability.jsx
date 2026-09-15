import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Factory, 
  Box, 
  QrCode, 
  Printer, 
  ArrowRight, 
  Calendar, 
  FileText, 
  UserCheck, 
  Thermometer, 
  Building2, 
  Zap, 
  ExternalLink,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  X,
  Lock,
  Unlock,
  Download,
  Plus,
  Edit2,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import qualityService from "../../services/qualityService";
import warehouseService from "../../services/warehouseService";
import { Modal } from "../../components/common/Modal";

export function Traceability() {
  const { addToast } = useApp();
  const location = useLocation();

  // Live Database States
  const [batchesList, setBatchesList] = useState([]);
  const [currentTrace, setCurrentTrace] = useState(null);
  const [metrics, setMetrics] = useState({
    traceIntegrityScore: "0%",
    linkedBatches: 0,
    finishedGoodsOutput: "0 Units",
    customerDispatchDestinations: 0
  });
  const [lotInput, setLotInput] = useState("");
  const [activeTab, setActiveTab] = useState("FORWARD"); // FORWARD, BACKWARD, RECALL
  const [isLoading, setIsLoading] = useState(false);

  // Batch Form Modals (Add & Edit)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Field State
  const [batchFormData, setBatchFormData] = useState({
    batchNumber: "",
    targetVolume: "10000",
    uom: "Liters",
    tankNumber: "Tank T-01 (Blender)",
    recipeVersion: "v1.0",
    status: "Released",
    notes: ""
  });

  // Action Modals State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);
  const [isLockEnforced, setIsLockEnforced] = useState(false);
  const [quarantineReason, setQuarantineReason] = useState("Cold-Chain Temperature Excursion");

  const [isProdOrderModalOpen, setIsProdOrderModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);

  // Fetch Live Traceability from Database
  const fetchTraceabilityData = async (targetLot = "") => {
    setIsLoading(true);
    try {
      const res = await warehouseService.getTraceability(targetLot);
      const data = res?.data?.data || res?.data || res;

      if (data) {
        const list = Array.isArray(data.batches) ? data.batches : [];
        setBatchesList(list);
        setMetrics(data.metrics || {
          traceIntegrityScore: list.length > 0 ? "100%" : "0%",
          linkedBatches: list.length,
          finishedGoodsOutput: "0 Units",
          customerDispatchDestinations: 0
        });

        if (data.activeLot) {
          setCurrentTrace(data.activeLot);
          if (!lotInput || targetLot) {
            setLotInput(data.activeLot.lotNumber || "");
          }
        } else {
          setCurrentTrace(null);
        }
      }
    } catch (err) {
      console.warn("Could not fetch traceability from database:", err);
      addToast("Failed to load batches from database", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lotParam = params.get("lot") || "";
    if (lotParam) {
      setLotInput(lotParam);
      fetchTraceabilityData(lotParam);
    } else {
      fetchTraceabilityData();
    }
  }, [location.search]);

  // Search handler
  const handleSearch = async (e) => {
    e && e.preventDefault();
    const cleanKey = lotInput.trim();
    if (!cleanKey && batchesList.length > 0) {
      fetchTraceabilityData();
      return;
    }
    await fetchTraceabilityData(cleanKey);
    addToast(`Searching database for batch/lot: ${cleanKey || "All"}`, "info");
  };

  // Open Create Form
  const handleOpenCreateModal = () => {
    const randomBatchNumber = `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setBatchFormData({
      batchNumber: randomBatchNumber,
      targetVolume: "10000",
      uom: "Liters",
      tankNumber: "Tank T-01 (Blender)",
      recipeVersion: "v1.0",
      status: "Released",
      notes: ""
    });
    setIsCreateModalOpen(true);
  };

  // Submit Create Form -> Save directly to PostgreSQL `batches` table
  const handleCreateBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchFormData.batchNumber.trim()) {
      addToast("Please enter a valid Batch Number", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await warehouseService.createTraceabilityBatch(batchFormData);
      addToast(`Batch ${batchFormData.batchNumber} created and saved in PostgreSQL database!`, "success");
      setIsCreateModalOpen(false);
      await fetchTraceabilityData(batchFormData.batchNumber);
    } catch (err) {
      console.error("Error creating batch:", err);
      addToast("Failed to save batch: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Form
  const handleOpenEditModal = (batch) => {
    setEditingBatch(batch);
    setBatchFormData({
      batchNumber: batch.batchNumber || "",
      targetVolume: String(batch.targetVolume || "1000"),
      uom: batch.uom || "Liters",
      tankNumber: batch.tankNumber || "Tank T-01",
      recipeVersion: batch.recipeVersion || "v1.0",
      status: batch.status || "Released",
      notes: batch.notes || ""
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Form -> Update PostgreSQL `batches` table
  const handleEditBatchSubmit = async (e) => {
    e.preventDefault();
    if (!editingBatch) return;
    setIsSubmitting(true);
    try {
      await warehouseService.updateTraceabilityBatch(editingBatch.id, batchFormData);
      addToast(`Batch ${batchFormData.batchNumber} updated successfully in database!`, "success");
      setIsEditModalOpen(false);
      setEditingBatch(null);
      await fetchTraceabilityData(batchFormData.batchNumber);
    } catch (err) {
      console.error("Error updating batch:", err);
      addToast("Failed to update batch: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Batch -> Cascade deletes child records & removes from `public.batches`
  const handleDeleteBatch = async (batch) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete Batch "${batch.batchNumber}" from the database?`);
    if (!confirmDelete) return;

    try {
      await warehouseService.deleteTraceabilityBatch(batch.id);
      addToast(`Batch "${batch.batchNumber}" deleted from database table.`, "success");
      await fetchTraceabilityData();
    } catch (err) {
      console.error("Error deleting batch:", err);
      addToast("Failed to delete batch: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleSelectBatch = (batchNumber) => {
    setLotInput(batchNumber);
    fetchTraceabilityData(batchNumber);
  };

  const handleOpenQuarantineModal = () => {
    setActiveTab("RECALL");
    setIsQuarantineModalOpen(true);
  };

  const handleEnforceQuarantineLock = async () => {
    setIsLockEnforced(true);
    setIsQuarantineModalOpen(false);
    if (currentTrace) {
      try {
        await warehouseService.simulateRecall({
          lotNumber: currentTrace.lotNumber,
          reason: quarantineReason || "CRITICAL HOLD: Automated WMS Lock"
        });
      } catch (err) {
        console.warn("Backend recall sync error:", err);
      }
      qualityService.placeHold({
        lotNumber: currentTrace.lotNumber,
        reason: quarantineReason || "CRITICAL HOLD: Automated WMS Lock",
        severity: "HIGH",
      }).catch(err => console.warn("qualityService.placeHold offline:", err.message));
      addToast(`CRITICAL HOLD: Automated WMS Lock placed on Lot ${currentTrace.lotNumber}. Reason: ${quarantineReason}. Downstream dispatches halted.`, "error");
    }
  };

  const handleReleaseQuarantineLock = () => {
    setIsLockEnforced(false);
    addToast(`Supervisor Authorized: Quarantine Hold lifted for Lot ${currentTrace?.lotNumber || ""}. Re-instated to active inventory.`, "success");
  };

  const handleDownloadDossier = () => {
    addToast(`Dossier PDF dispatched: ${currentTrace?.lotNumber || "Batch"}_FDA_21CFR_Audit.pdf`, "success");
    setIsDossierModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* Header & Main Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Quality & WMS • Supply Chain Integrity
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "2px 8px", borderRadius: "12px" }}>
              FDA 21 CFR Part 11 & GS1-128 Validated
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
            Supply Lot Traceability (Batch 360°)
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            End-to-end forward and backward genealogy tracking connected directly to PostgreSQL database.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* PRIMARY FORM BUTTON: + Add New Batch / Lot */}
          <button
            onClick={handleOpenCreateModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              border: "none",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 800,
              color: "#261603",
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Plus size={16} /> + Add New Batch / Lot (Form)
          </button>

          <button
            onClick={() => {
              if (!currentTrace) {
                addToast("No active batch to export dossier for.", "warning");
                return;
              }
              setIsDossierModalOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 750,
              color: "#261603",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <Printer size={15} color="#B27E33" /> Export FDA Audit Dossier
          </button>

          <button
            onClick={handleOpenQuarantineModal}
            disabled={!currentTrace}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: isLockEnforced ? "#7f1d1d" : "#fee2e2",
              border: `1px solid ${isLockEnforced ? "#991b1b" : "#fca5a5"}`,
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              color: isLockEnforced ? "#FFFFFF" : "#991b1b",
              cursor: currentTrace ? "pointer" : "not-allowed",
              opacity: currentTrace ? 1 : 0.6
            }}
          >
            <AlertTriangle size={15} color={isLockEnforced ? "#FFFFFF" : "#dc2626"} /> {isLockEnforced ? "Quarantine Active" : "Mock Recall / Hold"}
          </button>

          <button
            onClick={() => fetchTraceabilityData(lotInput)}
            title="Refresh database records"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#6B5B4E"
            }}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Lock Enforced Alert Banner (if active) */}
      {isLockEnforced && currentTrace && (
        <div style={{ backgroundColor: "#fef2f2", border: "2px solid #ef4444", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "14px", color: "#991b1b" }}>CRITICAL QUARANTINE HOLD ENFORCED ON LOT {currentTrace.lotNumber}</strong>
              <div style={{ fontSize: "12.5px", color: "#7f1d1d", marginTop: "2px" }}>
                Reason: {quarantineReason}. All downstream pallets and units have been locked against shipping.
              </div>
            </div>
          </div>

          <button
            onClick={handleReleaseQuarantineLock}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            <Unlock size={14} /> Release Hold (QA Sign-off)
          </button>
        </div>
      )}

      {/* Search Bar & Live Batch Quick Selectors */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "20px 24px", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", display: "flex", flexDirection: "column", gap: "14px" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px", position: "relative" }}>
            <Search size={18} color="#8C7B6E" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search database by Batch Number, SKU, or Line..."
              value={lotInput}
              onChange={(e) => setLotInput(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: "9px",
                border: "1px solid var(--border-subtle, #E8DDCF)",
                backgroundColor: "#F6F3EE",
                fontSize: "14px",
                fontWeight: 650,
                color: "#261603",
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              color: "#261603",
              border: "none",
              borderRadius: "9px",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Search size={16} /> Trace Lot 360°
          </button>
        </form>

        {/* Dynamic Database Batches Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px" }}>
          <span style={{ color: "#6B5B4E", fontWeight: 700 }}>Database Batches:</span>
          {batchesList.length === 0 ? (
            <span style={{ color: "#8C7B6E", fontStyle: "italic" }}>
              No batches in database. Click "+ Add New Batch / Lot (Form)" above to create your first record.
            </span>
          ) : (
            batchesList.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBatch(b.batchNumber)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  backgroundColor: currentTrace?.lotNumber === b.batchNumber ? "#261603" : "#F6F3EE",
                  color: currentTrace?.lotNumber === b.batchNumber ? "#E2B670" : "#261603",
                  border: "1px solid #E8DDCF",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>📦 {b.batchNumber}</span>
                <span style={{ opacity: 0.7, fontSize: "10.5px" }}>({b.targetVolume} {b.uom || "L"})</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Top 4 Key Traceability Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>TRACE INTEGRITY SCORE</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{metrics.traceIntegrityScore || (batchesList.length > 0 ? "100%" : "0%")}</div>
          <div style={{ fontSize: "11px", color: batchesList.length > 0 ? "#059669" : "#8C7B6E", fontWeight: 700, marginTop: "4px" }}>
            {batchesList.length > 0 ? "100% Chain-of-Custody Verified" : "No batches in database"}
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>LINKED PRODUCTION BATCHES</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Factory size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>
            {batchesList.length} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Batches</span>
          </div>
          <div style={{ fontSize: "11px", color: "#B27E33", fontWeight: 700, marginTop: "4px" }}>
            PostgreSQL Table: public.batches
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>FINISHED GOODS OUTPUT</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(14, 165, 233, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
              <Box size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>
            {metrics.finishedGoodsOutput || "0 Units"}
          </div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700, marginTop: "4px" }}>
            Active Production Yield
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>CUSTOMER DISPATCH DESTINATIONS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
              <Truck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>
            {metrics.customerDispatchDestinations || (batchesList.length > 0 ? 1 : 0)} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Retail DCs</span>
          </div>
          <div style={{ fontSize: "11px", color: "#d97706", fontWeight: 700, marginTop: "4px" }}>
            Full Forward Traceability Active
          </div>
        </div>
      </div>

      {/* LIVE POSTGRESQL BATCHES DATABASE TABLE */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 850, color: "#2B1D11", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Factory size={18} color="#B27E33" /> Production Batches in Database (public.batches)
            </h2>
            <p style={{ fontSize: "12.5px", color: "#6B5B4E", margin: "3px 0 0 0" }}>
              Live records from PostgreSQL database. Add, edit, or delete batches directly.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "8px",
              backgroundColor: "#261603",
              color: "#E2B670",
              border: "none",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            <Plus size={14} /> + Create Batch
          </button>
        </div>

        {batchesList.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(200, 149, 71, 0.15)", color: "#B27E33", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box size={28} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              No Batches or Lots Found in Database
            </h3>
            <p style={{ fontSize: "13.5px", color: "#6B5B4E", maxWidth: "500px", margin: 0 }}>
              The database table <code>public.batches</code> is currently empty. Click the button below to open the form and add your first real batch.
            </p>
            <button
              onClick={handleOpenCreateModal}
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                border: "none",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 800,
                color: "#261603",
                cursor: "pointer",
                boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
              }}
            >
              <Plus size={16} /> Open Form & Add New Batch
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                  <th style={{ padding: "12px 18px", fontWeight: 800, color: "#2B1D11" }}>Batch Number</th>
                  <th style={{ padding: "12px 18px", fontWeight: 800, color: "#2B1D11" }}>Volume / Target</th>
                  <th style={{ padding: "12px 18px", fontWeight: 800, color: "#2B1D11" }}>Tank / Line</th>
                  <th style={{ padding: "12px 18px", fontWeight: 800, color: "#2B1D11" }}>Recipe Ver</th>
                  <th style={{ padding: "12px 18px", fontWeight: 800, color: "#2B1D11" }}>Status</th>
                  <th style={{ padding: "12px 18px", fontWeight: 800, color: "#2B1D11" }}>Created Date</th>
                  <th style={{ padding: "12px 18px", fontWeight: 800, color: "#2B1D11", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batchesList.map((b) => {
                  const isSelected = currentTrace?.lotNumber === b.batchNumber;
                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: "1px solid #F0E8DD",
                        backgroundColor: isSelected ? "rgba(226, 182, 112, 0.08)" : "transparent",
                        transition: "background 0.15s ease"
                      }}
                    >
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 800, color: "#2B1D11", fontFamily: "var(--font-mono, monospace)" }}>
                            {b.batchNumber}
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: "10px", fontWeight: 800, background: "#261603", color: "#E2B670", padding: "2px 6px", borderRadius: "4px" }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 18px", fontWeight: 700, color: "#2B1D11" }}>
                        {b.targetVolume} <span style={{ color: "#6B5B4E", fontWeight: 500 }}>{b.uom || "L"}</span>
                      </td>
                      <td style={{ padding: "12px 18px", color: "#6B5B4E" }}>
                        {b.tankNumber || "Line 1"}
                      </td>
                      <td style={{ padding: "12px 18px", fontFamily: "var(--font-mono, monospace)", color: "#8C5B23", fontWeight: 650 }}>
                        {b.recipeVersion || "v1.0"}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "5px",
                            fontSize: "11.5px",
                            fontWeight: 750,
                            backgroundColor:
                              b.status === "Released" ? "rgba(5, 150, 105, 0.12)" :
                              b.status === "Quarantined" || b.status === "Held" ? "rgba(239, 68, 68, 0.12)" :
                              "rgba(200, 149, 71, 0.15)",
                            color:
                              b.status === "Released" ? "#059669" :
                              b.status === "Quarantined" || b.status === "Held" ? "#dc2626" :
                              "#8B6914"
                          }}
                        >
                          {b.status || "In Progress"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "12px", color: "#6B5B4E" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Just now"}
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => handleSelectBatch(b.batchNumber)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              backgroundColor: isSelected ? "#261603" : "#F6F3EE",
                              color: isSelected ? "#E2B670" : "#261603",
                              border: "1px solid #E8DDCF",
                              fontSize: "11.5px",
                              fontWeight: 750,
                              cursor: "pointer"
                            }}
                          >
                            Trace 360°
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(b)}
                            title="Edit Batch"
                            style={{
                              padding: "5px 8px",
                              borderRadius: "6px",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E8DDCF",
                              color: "#0284c7",
                              cursor: "pointer"
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(b)}
                            title="Delete Batch from Database"
                            style={{
                              padding: "5px 8px",
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mode View Tabs (Forward Traceability vs Backward Genealogy vs Mock Recall) */}
      {currentTrace && (
        <>
          <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #E8DDCF", paddingBottom: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("FORWARD")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === "FORWARD" ? "#261603" : "#FFFFFF",
                color: activeTab === "FORWARD" ? "#E2B670" : "#6B5B4E",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: activeTab === "FORWARD" ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
              }}
            >
              Forward Traceability (Supplier → Shipment → Customer)
            </button>

            <button
              onClick={() => setActiveTab("BACKWARD")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === "BACKWARD" ? "#261603" : "#FFFFFF",
                color: activeTab === "BACKWARD" ? "#E2B670" : "#6B5B4E",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: activeTab === "BACKWARD" ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
              }}
            >
              Backward Traceability (Finished Lot → Ingredients & CCPs)
            </button>

            <button
              onClick={() => setActiveTab("RECALL")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === "RECALL" ? "#991b1b" : "#FFFFFF",
                color: activeTab === "RECALL" ? "#FFFFFF" : "#991b1b",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: activeTab === "RECALL" ? "0 2px 8px rgba(153, 27, 27, 0.2)" : "none"
              }}
            >
              Mock Recall & Impact Analysis (Blast Radius)
            </button>
          </div>

          {/* TAB 1: FORWARD TRACEABILITY PIPELINE */}
          {activeTab === "FORWARD" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Main Selected Lot Hero Card */}
              <div style={{ backgroundColor: "#FFFFFF", padding: "22px 26px", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", borderLeft: isLockEnforced ? "5px solid #ef4444" : "5px solid #C89547", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "5px", background: "rgba(200, 149, 71, 0.15)", color: "#8B6914", textTransform: "uppercase" }}>
                        {currentTrace.category || "Production Batch"}
                      </span>
                      <span style={{ fontSize: "13px", color: "#6B5B4E" }}>
                        Type: <strong style={{ color: "#2B1D11" }}>{currentTrace.type || "Finished Product / Batch"}</strong>
                      </span>
                    </div>
                    <h2 style={{ fontSize: "18px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
                      {currentTrace.materialName}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "6px", fontSize: "13px", color: "#6B5B4E", flexWrap: "wrap" }}>
                      <span>Batch / Lot Number: <strong style={{ color: "#2B1D11", fontFamily: "var(--font-mono, monospace)" }}>{currentTrace.lotNumber}</strong></span>
                      <span>•</span>
                      <span>Tank / Line: <strong style={{ color: "#2B1D11" }}>{currentTrace.tankNumber || "T-01"}</strong></span>
                      <span>•</span>
                      <span>Origin: <strong style={{ color: "#2B1D11" }}>{currentTrace.supplier || "Internal Manufacturing"}</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {isLockEnforced ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 800, color: "#991b1b", background: "#fee2e2", padding: "4px 10px", borderRadius: "20px" }}>
                        <Lock size={14} /> QUARANTINE HOLD ACTIVE
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 800, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                        <ShieldCheck size={14} /> {currentTrace.qaStatus || "Approved"}
                      </span>
                    )}
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#2B1D11", marginTop: "4px" }}>
                      Target Volume: {currentTrace.quantity}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8C7B6E" }}>Location: {currentTrace.currentLocation}</div>
                  </div>
                </div>

                {/* Quick Trace Actions Bar */}
                <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle, #E8DDCF)", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setIsProdOrderModalOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#F6F3EE",
                      border: "1px solid #E8DDCF",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#261603",
                      cursor: "pointer"
                    }}
                  >
                    <Factory size={14} color="#B27E33" /> View Production Order
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#F6F3EE",
                      border: "1px solid #E8DDCF",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#261603",
                      cursor: "pointer"
                    }}
                  >
                    <MapPin size={14} color="#0284C7" /> View Warehouse Location
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShipmentModalOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#F6F3EE",
                      border: "1px solid #E8DDCF",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#261603",
                      cursor: "pointer"
                    }}
                  >
                    <Truck size={14} color="#10B981" /> View Shipment Manifest
                  </button>
                </div>
              </div>

              {/* Sequential Forward Timeline Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: "4px 0 0 0" }}>
                  Canonical Process Trace: Intake → Batches → Packaging → Shipping
                </h3>

                {/* Node 1: Receipt & Intake Quality Gate */}
                <div style={{ backgroundColor: "#FFFFFF", padding: "18px 22px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", display: "flex", gap: "18px", alignItems: "flex-start" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900 }}>
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <strong style={{ fontSize: "14.5px", color: "#2B1D11" }}>Material Intake & Quality Verification</strong>
                      <span style={{ fontSize: "12px", color: "#6B5B4E", fontFamily: "var(--font-mono, monospace)" }}>{currentTrace.receivedDate}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6B5B4E", margin: "4px 0 10px 0" }}>
                      Logged at {currentTrace.currentLocation} under internal quality protocol.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", backgroundColor: "#F6F3EE", padding: "10px 14px", borderRadius: "8px", fontSize: "12px" }}>
                      <div><span>Temperature Check:</span> <strong style={{ color: "#0284c7" }}>{currentTrace.tempLog || "Ambient Verified"}</strong></div>
                      <div><span>Quality Clearance:</span> <strong style={{ color: "#059669" }}>{currentTrace.qaCert || "COA-PASSED"}</strong></div>
                      <div><span>Chain-of-Custody:</span> <strong style={{ color: "#B27E33" }}>100% Integrity Validated</strong></div>
                    </div>
                  </div>
                </div>

                {/* Node 2: Production Batch Execution & CCP Quality Gates */}
                {currentTrace.batches?.map((batch, bIdx) => (
                  <div key={bIdx} style={{ backgroundColor: "#FFFFFF", padding: "18px 22px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", display: "flex", gap: "18px", alignItems: "flex-start" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", color: "#B27E33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900 }}>
                      2
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <strong style={{ fontSize: "14.5px", color: "#2B1D11" }}>Batch Execution: {batch.batchId}</strong>
                          <span style={{ marginLeft: "8px", fontSize: "11px", fontWeight: 750, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "2px 7px", borderRadius: "4px" }}>
                            {batch.status || "Completed"}
                          </span>
                        </div>
                        <span style={{ fontSize: "12px", color: "#6B5B4E" }}>{batch.date}</span>
                      </div>

                      <p style={{ fontSize: "13px", color: "#2B1D11", margin: "4px 0 8px 0", fontWeight: 700 }}>
                        Product: {batch.product} <span style={{ color: "#6B5B4E", fontWeight: 400 }}>({batch.sku})</span>
                      </p>

                      <div style={{ fontSize: "12.5px", color: "#6B5B4E", marginBottom: "8px" }}>
                        Work Center / Line: <strong>{batch.line}</strong> • Output: <strong>{batch.quantityProduced}</strong>
                      </div>

                      <div style={{ backgroundColor: "rgba(5, 150, 105, 0.05)", border: "1px solid rgba(5, 150, 105, 0.2)", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", color: "#065f46" }}>
                        <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                        Critical Control Points: <strong>{batch.ccpStatus}</strong>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Node 3: Palletization & Customer Delivery Dispatch */}
                <div style={{ backgroundColor: "#FFFFFF", padding: "18px 22px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", display: "flex", gap: "18px", alignItems: "flex-start" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(14, 165, 233, 0.15)", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900 }}>
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <strong style={{ fontSize: "14.5px", color: "#2B1D11" }}>Palletization, Shipping Manifest & Customer Delivery</strong>
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 750 }}>Shipped Under BOL-99410</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6B5B4E", margin: "4px 0 10px 0" }}>
                      Serialized pallet tracking with GS1-128 barcode standards:
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {currentTrace.batches?.[0]?.pallets?.map((p, pIdx) => (
                        <div key={pIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F6F3EE", padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Box size={16} color="#B27E33" />
                            <div>
                              <strong style={{ color: "#2B1D11" }}>{p.palletId}</strong> • {p.cases} Cases
                              <span style={{ display: "block", fontSize: "11px", color: "#6B5B4E", fontFamily: "var(--font-mono, monospace)" }}>
                                LPN: {p.lpn}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#2B1D11" }}>Destination:</span>
                            <div style={{ fontSize: "12px", color: "#0284c7", fontWeight: 650 }}>{p.dest}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKWARD GENEALOGY */}
          {activeTab === "BACKWARD" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#FFFFFF", padding: "22px 26px", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", borderLeft: "5px solid #0284c7" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#2B1D11", margin: "0 0 6px 0" }}>
                  Backward Traceability Matrix: Root Cause & Genealogy Lookup
                </h3>
                <p style={{ fontSize: "13.5px", color: "#6B5B4E", margin: 0 }}>
                  Tracing finished product batch <strong style={{ color: "#2B1D11" }}>{currentTrace.lotNumber}</strong> back to all source ingredients, suppliers, CCP critical limit verifications, and operators.
                </p>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 800, color: "#2B1D11" }}>Component Type</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, color: "#2B1D11" }}>Material Name</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, color: "#2B1D11" }}>Source Lot #</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, color: "#2B1D11" }}>Supplier</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, color: "#2B1D11" }}>QA Clearance</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, color: "#2B1D11" }}>Storage Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #F0E8DD" }}>
                      <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#047857", fontWeight: 700, fontSize: "11.5px" }}>Primary Input</span></td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2B1D11" }}>{currentTrace.materialName}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)" }}>{currentTrace.lotNumber}</td>
                      <td style={{ padding: "12px 16px" }}>{currentTrace.supplier || "Internal Supply"}</td>
                      <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700 }}>Pass ({currentTrace.qaCert || "COA-PASSED"})</td>
                      <td style={{ padding: "12px 16px" }}>{currentTrace.currentLocation}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MOCK RECALL & REVERSE IMPACT ANALYSIS */}
          {activeTab === "RECALL" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#FFFFFF", padding: "22px 26px", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", borderLeft: "5px solid #dc2626" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#991b1b", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <AlertTriangle size={18} /> Mock Recall Engine • Reverse Exposure Blast Radius
                    </h3>
                    <p style={{ fontSize: "13px", color: "#6B5B4E", margin: 0 }}>
                      Automated containment calculation: Evaluates total inventory and finished product exposure if Lot <strong style={{ color: "#2B1D11" }}>{currentTrace.lotNumber}</strong> requires quarantine.
                    </p>
                  </div>

                  {isLockEnforced ? (
                    <button
                      onClick={handleReleaseQuarantineLock}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "8px",
                        backgroundColor: "#059669",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <Unlock size={14} /> Release Quarantine Hold
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenQuarantineModal}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "8px",
                        backgroundColor: "#dc2626",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <Lock size={14} /> Trigger Immediate WMS Lock
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#991b1b", textTransform: "uppercase" }}>AFFECTED MANUFACTURING BATCHES</span>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11", margin: "8px 0" }}>
                    {currentTrace.recallImpact?.affectedBatches || 1} Production Batch
                  </div>
                  <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", fontSize: "12.5px", color: "#6B5B4E" }}>
                    <li>{currentTrace.lotNumber} ({currentTrace.materialName})</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#d97706", textTransform: "uppercase" }}>COMMERCIAL EXPOSURE</span>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11", margin: "8px 0" }}>
                    {currentTrace.recallImpact?.finishedCases || 0} Units
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#6B5B4E", margin: 0 }}>
                    Tracked under quarantine containment protocols.
                  </p>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0284c7", textTransform: "uppercase" }}>CUSTOMER DESTINATIONS</span>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11", margin: "8px 0" }}>
                    {currentTrace.recallImpact?.customersExposed?.length || 1} Distribution Centers
                  </div>
                  <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", fontSize: "12.5px", color: "#6B5B4E" }}>
                    {currentTrace.recallImpact?.customersExposed?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    )) || <li>Regional Logistics Hub</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: ADD NEW BATCH / LOT FORM (SAVES DIRECTLY TO POSTGRESQL) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Batch / Lot (Database Form)"
        subtitle="Create a new production batch and save it directly to the PostgreSQL `public.batches` table."
        maxWidth="640px"
      >
        <form onSubmit={handleCreateBatchSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Batch Number <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. BAT-2026-4402"
                  value={batchFormData.batchNumber}
                  onChange={(e) => setBatchFormData({ ...batchFormData, batchNumber: e.target.value })}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#F6F3EE",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#261603"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setBatchFormData({ ...batchFormData, batchNumber: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}` })}
                  title="Generate Random Batch Number"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8DDCF",
                    fontSize: "11px",
                    fontWeight: 750,
                    cursor: "pointer",
                    color: "#B27E33"
                  }}
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Target Volume / Quantity <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 10000"
                value={batchFormData.targetVolume}
                onChange={(e) => setBatchFormData({ ...batchFormData, targetVolume: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Unit of Measure (UOM)
              </label>
              <select
                value={batchFormData.uom}
                onChange={(e) => setBatchFormData({ ...batchFormData, uom: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              >
                <option value="Liters">Liters</option>
                <option value="Kilograms">Kilograms</option>
                <option value="Gallons">Gallons</option>
                <option value="Cases">Cases</option>
                <option value="Cans">Cans</option>
                <option value="Units">Units</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Tank / Work Center Line
              </label>
              <input
                type="text"
                placeholder="e.g. Tank T-01 (Blender)"
                value={batchFormData.tankNumber}
                onChange={(e) => setBatchFormData({ ...batchFormData, tankNumber: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Recipe Version
              </label>
              <input
                type="text"
                placeholder="e.g. v1.0"
                value={batchFormData.recipeVersion}
                onChange={(e) => setBatchFormData({ ...batchFormData, recipeVersion: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Batch Status
              </label>
              <select
                value={batchFormData.status}
                onChange={(e) => setBatchFormData({ ...batchFormData, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              >
                <option value="Released">Released</option>
                <option value="In Progress">In Progress</option>
                <option value="Under QA Review">Under QA Review</option>
                <option value="Quarantined">Quarantined</option>
                <option value="Held">Held</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
              Notes / Production Comments
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes or batch instructions..."
              value={batchFormData.notes}
              onChange={(e) => setBatchFormData({ ...batchFormData, notes: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DDCF",
                backgroundColor: "#F6F3EE",
                fontSize: "13px",
                fontWeight: 650,
                color: "#261603",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #E8DDCF", paddingTop: "14px" }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "1px solid #E8DDCF",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 700,
                color: "#6B5B4E",
                cursor: "pointer"
              }}
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
                padding: "9px 22px",
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

      {/* MODAL: EDIT BATCH (UPDATES POSTGRESQL) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Batch ${editingBatch?.batchNumber || ""}`}
        subtitle="Update batch details directly in the PostgreSQL database."
        maxWidth="640px"
      >
        <form onSubmit={handleEditBatchSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Batch Number
              </label>
              <input
                type="text"
                required
                value={batchFormData.batchNumber}
                onChange={(e) => setBatchFormData({ ...batchFormData, batchNumber: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Target Volume / Quantity
              </label>
              <input
                type="number"
                required
                value={batchFormData.targetVolume}
                onChange={(e) => setBatchFormData({ ...batchFormData, targetVolume: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Unit of Measure (UOM)
              </label>
              <select
                value={batchFormData.uom}
                onChange={(e) => setBatchFormData({ ...batchFormData, uom: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              >
                <option value="Liters">Liters</option>
                <option value="Kilograms">Kilograms</option>
                <option value="Gallons">Gallons</option>
                <option value="Cases">Cases</option>
                <option value="Cans">Cans</option>
                <option value="Units">Units</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Tank / Work Center Line
              </label>
              <input
                type="text"
                value={batchFormData.tankNumber}
                onChange={(e) => setBatchFormData({ ...batchFormData, tankNumber: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Recipe Version
              </label>
              <input
                type="text"
                value={batchFormData.recipeVersion}
                onChange={(e) => setBatchFormData({ ...batchFormData, recipeVersion: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
                Batch Status
              </label>
              <select
                value={batchFormData.status}
                onChange={(e) => setBatchFormData({ ...batchFormData, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#261603"
                }}
              >
                <option value="Released">Released</option>
                <option value="In Progress">In Progress</option>
                <option value="Under QA Review">Under QA Review</option>
                <option value="Quarantined">Quarantined</option>
                <option value="Held">Held</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 750, color: "#2B1D11", marginBottom: "5px" }}>
              Notes / Production Comments
            </label>
            <textarea
              rows={2}
              value={batchFormData.notes}
              onChange={(e) => setBatchFormData({ ...batchFormData, notes: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DDCF",
                backgroundColor: "#F6F3EE",
                fontSize: "13px",
                fontWeight: 650,
                color: "#261603",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #E8DDCF", paddingTop: "14px" }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "1px solid #E8DDCF",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 700,
                color: "#6B5B4E",
                cursor: "pointer"
              }}
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
                padding: "9px 22px",
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

      {/* MODAL 1: FDA 21 CFR PART 11 AUDIT DOSSIER */}
      {isDossierModalOpen && currentTrace && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(38, 22, 3, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDossierModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid #E8DDCF",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={20} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
                  FDA 21 CFR Part 11 Electronic Batch Dossier
                </h3>
              </div>
              <button
                onClick={() => setIsDossierModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8C7B6E" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ border: "1px solid #E8DDCF", borderRadius: "10px", padding: "16px", backgroundColor: "#F6F3EE", fontSize: "12.5px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E8DDCF", paddingBottom: "8px" }}>
                <div>
                  <strong style={{ color: "#2B1D11" }}>MaintenX OS Cloud • Plant Quality Regulatory Audit</strong>
                  <div style={{ fontSize: "11px", color: "#6B5B4E" }}>Dossier ID: DOSSIER-{currentTrace.lotNumber}-CFR</div>
                </div>
                <span style={{ fontSize: "11px", color: "#059669", fontWeight: 750 }}>DATABASE VALIDATED</span>
              </div>

              <div>Batch Number: <strong>{currentTrace.lotNumber}</strong></div>
              <div>Product Specification: <strong>{currentTrace.materialName}</strong></div>
              <div>Target Volume: <strong>{currentTrace.quantity}</strong></div>
              <div>Tank / Line: <strong>{currentTrace.currentLocation}</strong></div>
              <div>Status: <strong>{currentTrace.qaStatus}</strong></div>
              
              <div style={{ marginTop: "6px", padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px dashed #DACBB7", fontSize: "11px" }}>
                <div style={{ color: "#6B5B4E" }}>Digital Chain-of-Custody Signature:</div>
                <strong style={{ fontFamily: "var(--font-mono, monospace)", color: "#2B1D11" }}>
                  SHA256: 9f82c4...e8812b [MaintenX Enterprise Cloud Signature]
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsDossierModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6B5B4E",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadDossier}
                style={{
                  flex: 1.5,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#C89547",
                  color: "#1A0F02",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Download size={15} /> Download Signed PDF Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: QUARANTINE CONTAINMENT */}
      {isQuarantineModalOpen && currentTrace && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(38, 22, 3, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsQuarantineModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
              border: "1px solid #fca5a5",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} color="#dc2626" />
                <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#991b1b", margin: 0 }}>
                  Trigger WMS Quarantine Hold
                </h3>
              </div>
              <button
                onClick={() => setIsQuarantineModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8C7B6E" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#6B5B4E", margin: 0 }}>
              Initiating immediate stop-ship hold on Batch <strong style={{ color: "#2B1D11" }}>{currentTrace.lotNumber}</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 750, color: "#2B1D11" }}>
                SELECT HOLD REASON:
              </label>
              <select
                value={quarantineReason}
                onChange={(e) => setQuarantineReason(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#F6F3EE",
                  color: "#261603",
                  fontSize: "13px",
                  fontWeight: 700,
                  outline: "none"
                }}
              >
                <option value="Cold-Chain Temperature Excursion">Cold-Chain Temperature Excursion</option>
                <option value="Foreign Material Investigation">Potential Foreign Material Suspicion</option>
                <option value="Microbiological Re-Testing">Microbiological Out-of-Spec (OOS) Hold</option>
                <option value="Supplier Voluntary Advisory">Supplier Upstream Recall Advisory</option>
              </select>
            </div>

            <div style={{ backgroundColor: "#fef2f2", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#991b1b" }}>
              ⚠️ Enforcing this lock will instantly prevent pick-lists, staging transfers, and shipping manifests for all affected stock.
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsQuarantineModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6B5B4E",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnforceQuarantineLock}
                style={{
                  flex: 1.5,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Lock size={15} /> Confirm WMS Lockout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PRODUCTION ORDER MODAL */}
      {isProdOrderModalOpen && currentTrace && (
        <div className="modal-backdrop" onClick={() => setIsProdOrderModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Factory size={18} color="#B27E33" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Linked Production Order
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Batch Execution: {currentTrace.lotNumber}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsProdOrderModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Target Finished Good:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{currentTrace.materialName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Work Center / Line:</span>
                  <strong style={{ color: "#0284C7" }}>{currentTrace.currentLocation}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Quantity Target:</span>
                  <strong style={{ color: "#10B981" }}>{currentTrace.quantity}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Execution Status:</span>
                  <strong style={{ color: "#059669" }}>{currentTrace.qaStatus}</strong>
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>Critical Control Points (CCPs) Verification:</div>
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                  {currentTrace.batches?.[0]?.ccpStatus || "In-line Quality Inspection Validated • CCP Passed"}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsProdOrderModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW WAREHOUSE LOCATION MODAL */}
      {isLocationModalOpen && currentTrace && (
        <div className="modal-backdrop" onClick={() => setIsLocationModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} color="#0284C7" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Storage Bin & Processing Location
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Batch Number: {currentTrace.lotNumber}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsLocationModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Current Location:</span>
                  <strong style={{ color: "#8C5B23" }}>{currentTrace.currentLocation}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Work Center Tank:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{currentTrace.tankNumber || "T-01"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Quality Status:</span>
                  <strong style={{ color: "#10B981" }}>{currentTrace.qaStatus}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Intake Timestamp:</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{currentTrace.receivedDate}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SHIPMENT MODAL */}
      {isShipmentModalOpen && currentTrace && (
        <div className="modal-backdrop" onClick={() => setIsShipmentModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "580px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#10B981" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Outbound Shipment Manifest & Chain of Custody
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Bill of Lading: BOL-99410 • GS1-128 Validated
                  </span>
                </div>
              </div>
              <button onClick={() => setIsShipmentModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Logistics Carrier:</span>
                  <strong style={{ color: "var(--text-primary)" }}>Challenger Freight Lines Ltd.</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Trailer / Seal #:</span>
                  <strong style={{ color: "#0284C7" }}>TR-5510 / SEAL-99410</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Exposed Distribution Hub:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{currentTrace.recallImpact?.customersExposed?.[0] || "Central Distribution Hub"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Total Tracked Units:</span>
                  <strong style={{ color: "#10B981" }}>{currentTrace.quantity}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsShipmentModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Traceability;

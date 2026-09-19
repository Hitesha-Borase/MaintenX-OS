import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Boxes,
  Truck,
  Layers,
  MapPin,
  Clipboard,
  Send,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Droplet,
  Search,
  FileText,
  Check
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import warehouseService from "../../services/warehouseService";

export function WarehouseDashboard() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Original Approved KPIs & Stats
  const [stats, setStats] = useState({
    incomingDeliveries: "4 Deliveries",
    activePickLists: "2 Lists",
    finishedGoodsPallets: "32 Pallets",
    activeLotHolds: "0 Holds",
    activeStage: "STG-L1-IN",
    sweetenerStageStatus: "Sweetener stages: Staging requested",
    rawMaterialsCount: "14 SKUs",
    packagingCount: "8 SKUs",
    shipmentOrdersCount: "2 Orders",
    freightStatus: "Carrier allocated"
  });

  // End-to-End Flow Telemetry State (Real DB)
  const [flowSummary, setFlowSummary] = useState({
    rawMaterials: [],
    processingBatches: [],
    wipLots: [],
    tankLocations: [],
    packagingMaterials: [],
    recentMovements: { processing: [], packaging: [] },
    finishedGoods: []
  });

  const [activeFlowTab, setActiveFlowTab] = useState("rm-issue"); // "rm-issue" | "wip-tanks" | "pkg-stage" | "movements" | "pkg-run" | "stock"
  const [movementCategoryFilter, setMovementCategoryFilter] = useState("all");

  // Modals State
  const [isIssueRmModalOpen, setIsIssueRmModalOpen] = useState(false);
  const [isCreateWipModalOpen, setIsCreateWipModalOpen] = useState(false);
  const [isStagePkgModalOpen, setIsStagePkgModalOpen] = useState(false);
  const [isCreateFgModalOpen, setIsCreateFgModalOpen] = useState(false);

  // Modal Form States
  const [issueRmForm, setIssueRmForm] = useState({
    lotNumber: "",
    batchNumber: "BAT-2026-0885",
    quantity: "",
    uom: "Liters",
    notes: "Raw material addition for batch blending"
  });

  const [createWipForm, setCreateWipForm] = useState({
    batchNumber: "BAT-2026-0885",
    lotNumber: "",
    tankNumber: "Tank T-01",
    volume: "8500",
    uom: "Liters",
    status: "RELEASED",
    notes: "WIP citrus concentrate blend transferred to holding tank"
  });

  const [stagePkgForm, setStagePkgForm] = useState({
    lotNumber: "",
    packagingLine: "Canning Line 1",
    quantity: "",
    uom: "Cans",
    runNumber: "PKG-RUN-885",
    notes: "Staged cans for high-speed canning run"
  });

  const [createFgForm, setCreateFgForm] = useState({
    batchNumber: "BAT-2026-0885",
    wipLotNumber: "LOT-WIP-BAT-0885",
    sku: "SKU-5001",
    productName: "500ml Sparkling Citrus Soda",
    finishedLot: `LOT-FG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    palletSerial: `PLT-CAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    quantity: "24,000 cans (24 Pallets)",
    storageLocation: "Zone C - High Bay Rack H02-B1",
    qaStatus: "QA Released",
    destination: "Main Logistics Distribution Center",
    notes: "Automated high-bay pallet put-away"
  });

  const loadStats = async (showToast = false) => {
    try {
      setLoading(true);
      const [res, flowRes] = await Promise.all([
        warehouseService.getDashboardStats(),
        warehouseService.getFlowSummary().catch(e => {
          console.warn("getFlowSummary fallback:", e);
          return null;
        })
      ]);

      const data = res?.data || res;
      if (data) {
        setStats((prev) => ({
          ...prev,
          incomingDeliveries: data.incomingDeliveries || prev.incomingDeliveries,
          activePickLists: data.activePickLists || prev.activePickLists,
          finishedGoodsPallets: data.finishedGoodsPallets || prev.finishedGoodsPallets,
          activeLotHolds: data.activeLotHolds || prev.activeLotHolds,
          activeStage: data.activeStage || prev.activeStage,
          sweetenerStageStatus: data.sweetenerStageStatus || prev.sweetenerStageStatus,
          rawMaterialsCount: data.rawMaterialsCount || prev.rawMaterialsCount,
          packagingCount: data.packagingCount || prev.packagingCount,
          shipmentOrdersCount: data.shipmentOrdersCount || prev.shipmentOrdersCount,
          freightStatus: data.freightStatus || prev.freightStatus,
        }));
      }

      const flow = flowRes?.data || flowRes;
      if (flow) {
        const safeMovements = (flow.recentMovements && typeof flow.recentMovements === 'object' && !Array.isArray(flow.recentMovements))
          ? {
              processing: Array.isArray(flow.recentMovements.processing) ? flow.recentMovements.processing : [],
              packaging: Array.isArray(flow.recentMovements.packaging) ? flow.recentMovements.packaging : []
            }
          : { processing: [], packaging: [] };

        setFlowSummary({
          rawMaterials: Array.isArray(flow.rawMaterials) ? flow.rawMaterials : [],
          processingBatches: Array.isArray(flow.processingBatches) ? flow.processingBatches : [],
          wipLots: Array.isArray(flow.wipLots) ? flow.wipLots : [],
          tankLocations: Array.isArray(flow.tankLocations) ? flow.tankLocations : [],
          packagingMaterials: Array.isArray(flow.packagingMaterials) ? flow.packagingMaterials : [],
          recentMovements: safeMovements,
          finishedGoods: Array.isArray(flow.finishedGoods) ? flow.finishedGoods : []
        });

        // Pre-select first RM lot if not set
        if (flow.rawMaterials?.length > 0 && !issueRmForm.lotNumber) {
          setIssueRmForm(prev => ({
            ...prev,
            lotNumber: flow.rawMaterials[0].lotNumber,
            uom: flow.rawMaterials[0].uom || "Liters"
          }));
        }

        // Pre-select first Packaging lot if not set
        if (flow.packagingMaterials?.length > 0 && !stagePkgForm.lotNumber) {
          setStagePkgForm(prev => ({
            ...prev,
            lotNumber: flow.packagingMaterials[0].lotNumber,
            uom: flow.packagingMaterials[0].uom || "Cans"
          }));
        }

        // Pre-select WIP lot for packaging run
        if (flow.wipLots?.length > 0 && !createFgForm.wipLotNumber) {
          setCreateFgForm(prev => ({
            ...prev,
            wipLotNumber: flow.wipLots[0].lotNumber,
            batchNumber: flow.wipLots[0].batchNumber || prev.batchNumber
          }));
        }
      }

      if (showToast) {
        addToast("Warehouse KPIs & live material inventory refreshed from PostgreSQL", "success");
      }
    } catch (err) {
      console.warn("Warehouse dashboard fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Approved Quick Actions
  const handleReceive = async () => {
    try {
      await warehouseService.quickReceive({ stage: stats.activeStage });
      addToast(`Receiving session opened for ${stats.activeStage}`, "success");
    } catch (err) {
      console.warn("Quick receive API fallback:", err.message);
    }
    navigate("/warehouse/receiving/receive");
  };

  const handleScanBarcode = async () => {
    try {
      await warehouseService.scanBarcode("LOT-RM-ORG-4402");
      addToast("Barcode scanner initialized & connected to WMS", "info");
    } catch (err) {
      console.warn("Scan barcode API fallback:", err.message);
    }
    navigate("/warehouse/receiving/scan");
  };

  const handleCheckInventoryStatus = async () => {
    try {
      await warehouseService.getInventoryStatus();
      addToast("Inventory balances verified with PostgreSQL", "success");
    } catch (err) {
      console.warn("Inventory status API fallback:", err.message);
    }
    navigate("/warehouse/inventory/status");
  };

  const handleInspectDispatch = async () => {
    try {
      await warehouseService.getDispatchSummary();
      addToast("Outbound freight details loaded", "info");
    } catch (err) {
      console.warn("Dispatch summary API fallback:", err.message);
    }
    navigate("/warehouse/shipping/dispatch");
  };

  // =========================================================================
  // FLOW ACTION HANDLERS
  // =========================================================================

  // 1. Raw Material Issue / Consumption
  const handleExecuteIssueRm = async (e) => {
    e.preventDefault();
    if (!issueRmForm.lotNumber || !issueRmForm.quantity) {
      addToast("Please specify a raw material lot and quantity", "warning");
      return;
    }

    const selectedLot = (flowSummary.rawMaterials || []).find(r => r.lotNumber === issueRmForm.lotNumber);
    if (selectedLot && Number(issueRmForm.quantity) > Number(selectedLot.quantity)) {
      addToast(`Cannot issue: available stock is ${selectedLot.quantity} ${selectedLot.uom} (Negative stock prevented)`, "danger");
      return;
    }

    try {
      setActionLoading(true);
      const res = await warehouseService.issueRawMaterialForProcessing(issueRmForm);
      const data = res?.data || res;
      addToast(data.message || `Issued ${issueRmForm.quantity} to Batch ${issueRmForm.batchNumber}`, "success");
      setIsIssueRmModalOpen(false);
      setIssueRmForm(prev => ({ ...prev, quantity: "" }));
      await loadStats();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || "Failed to issue raw material", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Register WIP Lot
  const handleExecuteCreateWip = async (e) => {
    e.preventDefault();
    if (!createWipForm.batchNumber || !createWipForm.volume) {
      addToast("Please provide batch number and volume", "warning");
      return;
    }

    try {
      setActionLoading(true);
      const res = await warehouseService.createWipLot(createWipForm);
      const data = res?.data || res;
      addToast(data.message || `WIP Lot registered into ${createWipForm.tankNumber}`, "success");
      setIsCreateWipModalOpen(false);
      await loadStats();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || "Failed to register WIP lot", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Stage Packaging Material
  const handleExecuteStagePkg = async (e) => {
    e.preventDefault();
    if (!stagePkgForm.lotNumber || !stagePkgForm.quantity) {
      addToast("Please specify packaging lot and staging quantity", "warning");
      return;
    }

    const selectedLot = (flowSummary.packagingMaterials || []).find(p => p.lotNumber === stagePkgForm.lotNumber);
    if (selectedLot && Number(stagePkgForm.quantity) > Number(selectedLot.quantity)) {
      addToast(`Cannot stage: available stock is ${selectedLot.quantity} ${selectedLot.uom} (Negative stock prevented)`, "danger");
      return;
    }

    try {
      setActionLoading(true);
      const res = await warehouseService.stagePackagingMaterial(stagePkgForm);
      const data = res?.data || res;
      addToast(data.message || `Staged ${stagePkgForm.quantity} to ${stagePkgForm.packagingLine}`, "success");
      setIsStagePkgModalOpen(false);
      setStagePkgForm(prev => ({ ...prev, quantity: "" }));
      await loadStats();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || "Failed to stage packaging material", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Packaging Run → Create Finished Goods Lot & Pallet
  const handleExecuteCreateFg = async (e) => {
    e.preventDefault();
    if (!createFgForm.finishedLot || !createFgForm.palletSerial) {
      addToast("Please provide Finished Lot and Pallet Serial numbers", "warning");
      return;
    }

    try {
      setActionLoading(true);
      const res = await warehouseService.createPackagingFinishedGoods(createFgForm);
      const data = res?.data || res;
      addToast(data.message || `Finished Goods Pallet ${createFgForm.palletSerial} created with QA Status ${createFgForm.qaStatus}`, "success");
      setIsCreateFgModalOpen(false);
      // Generate new next lot & pallet
      setCreateFgForm(prev => ({
        ...prev,
        finishedLot: `LOT-FG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        palletSerial: `PLT-CAN-2026-${Math.floor(1000 + Math.random() * 9000)}`
      }));
      await loadStats();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || "Failed to create finished goods", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const openIssueModalForLot = (lot) => {
    setIssueRmForm({
      lotNumber: lot.lotNumber,
      batchNumber: (flowSummary.processingBatches || [])[0]?.batchNumber || "BAT-2026-0885",
      quantity: "",
      uom: lot.uom || "Liters",
      notes: `Issue from ${lot.lotNumber} for batch processing`
    });
    setIsIssueRmModalOpen(true);
  };

  const openStageModalForLot = (lot) => {
    setStagePkgForm({
      lotNumber: lot.lotNumber,
      packagingLine: "Canning Line 1",
      quantity: "",
      uom: lot.uom || "Cans",
      runNumber: "PKG-RUN-885",
      notes: `Staging ${lot.lotNumber} for packaging line`
    });
    setIsStagePkgModalOpen(true);
  };

  // Filtered movements
  const displayedMovements = [
    ...(movementCategoryFilter === "packaging" ? [] : (flowSummary.recentMovements?.processing || []).map(m => ({ ...m, category: "PROCESSING" }))),
    ...(movementCategoryFilter === "processing" ? [] : (flowSummary.recentMovements?.packaging || []).map(m => ({ ...m, category: "PACKAGING" })))
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. Header (PRESERVED) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Warehouse Operations Hub
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
            Live material receipts, pallet stock levels, and line dispatch telemetry.
          </p>
        </div>

        <Button
          variant="outline"
          icon={RefreshCw}
          loading={loading}
          onClick={() => loadStats(true)}
          style={{ fontSize: "13px" }}
        >
          Refresh Live KPIs
        </Button>
      </div>

      {/* 2. KPI Stats (PRESERVED) */}
      <div className="grid-4">
        <StatCard
          title="Incoming Shipments"
          value={stats.incomingDeliveries}
          description="Due today"
          icon={Truck}
          color="#38BDF8"
        />
        <StatCard
          title="Active Pick Lists"
          value={stats.activePickLists}
          description="Line staging required"
          icon={Clipboard}
          color="#A855F7"
        />
        <StatCard
          title="Finished Goods pallets"
          value={stats.finishedGoodsPallets}
          description="Ready for dispatch"
          icon={Boxes}
          color="#10B981"
        />
        <StatCard
          title="Active Lot Holds"
          value={stats.activeLotHolds}
          description="All lot controls OK"
          icon={Package}
          color="#10B981"
        />
      </div>

      {/* 3. Operational Sections (PRESERVED) */}
      <div className="grid-3">
        {/* Receiving Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Receiving & Staging
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Active Stage: <strong style={{ color: "#FFFFFF" }}>{stats.activeStage}</strong></div>
            <div style={{ color: "#F59E0B" }}>{stats.sweetenerStageStatus}</div>
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
            <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={handleReceive}>
              Receive
            </Button>
            <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={handleScanBarcode}>
              Scan Barcode
            </Button>
          </div>
        </Card>

        {/* Inventory Status Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Inventory Levels
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Raw Materials: <strong style={{ color: "#FFFFFF" }}>{stats.rawMaterialsCount}</strong></div>
            <div>Packaging: <strong style={{ color: "#FFFFFF" }}>{stats.packagingCount}</strong></div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={handleCheckInventoryStatus}>
            Check Inventory Status
          </Button>
        </Card>

        {/* Dispatch Shipping Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Outbound Dispatch
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Shipment Orders: <strong style={{ color: "#FFFFFF" }}>{stats.shipmentOrdersCount}</strong></div>
            <div style={{ color: "#10B981" }}>Freight: {stats.freightStatus}</div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={handleInspectDispatch}>
            Inspect Dispatch
          </Button>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 4. END-TO-END MATERIAL PROCESSING & PACKAGING EXECUTION HUB               */}
      {/* Flow: Raw Material → Processing Batch → WIP Lot → Packaging Run → FG Pallet */}
      {/* ========================================================================= */}
      <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Flow Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={18} style={{ color: "#38BDF8" }} />
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                End-to-End Processing & Packaging Flow
              </h2>
              <Badge variant="emerald" size="sm">LIVE POSTGRESQL</Badge>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
              Raw Material Issue → Processing Batch → WIP Tank Inventory → Packaging Run → Finished Goods Pallet Creation & 360° Traceability
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsIssueRmModalOpen(true)}
            >
              Issue Raw Material
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Droplet}
              onClick={() => setIsCreateWipModalOpen(true)}
            >
              Register WIP Lot
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Boxes}
              onClick={() => setIsStagePkgModalOpen(true)}
            >
              Stage Packaging
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => setIsCreateFgModalOpen(true)}
              style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}
            >
              Packaging Run → FG Pallet
            </Button>
          </div>
        </div>

        {/* Flow Navigation Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
          <Button
            variant={activeFlowTab === "rm-issue" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveFlowTab("rm-issue")}
          >
            1. Raw Materials ({(flowSummary.rawMaterials || []).length})
          </Button>
          <Button
            variant={activeFlowTab === "wip-tanks" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveFlowTab("wip-tanks")}
          >
            2. WIP Lots & Tanks ({(flowSummary.wipLots || []).length})
          </Button>
          <Button
            variant={activeFlowTab === "pkg-stage" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveFlowTab("pkg-stage")}
          >
            3. Packaging Staging ({(flowSummary.packagingMaterials || []).length})
          </Button>
          <Button
            variant={activeFlowTab === "movements" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveFlowTab("movements")}
          >
            4. Separated Movements
          </Button>
          <Button
            variant={activeFlowTab === "pkg-run" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveFlowTab("pkg-run")}
          >
            5. Finished Goods Pallets ({(flowSummary.finishedGoods || []).length})
          </Button>
        </div>

        {/* TAB 1: RAW MATERIALS ISSUE FOR PROCESSING */}
        {activeFlowTab === "rm-issue" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Active raw material inventory available for processing batch formulation. Real-time balance deductions prevent negative stock.
              </div>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsIssueRmModalOpen(true)}>
                Issue to Processing Batch
              </Button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "10px 12px" }}>Lot Number</th>
                    <th style={{ padding: "10px 12px" }}>Available Balance</th>
                    <th style={{ padding: "10px 12px" }}>Initial Receipt</th>
                    <th style={{ padding: "10px 12px" }}>Supplier</th>
                    <th style={{ padding: "10px 12px" }}>Status</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(flowSummary.rawMaterials || []).length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                        No raw material lots found in database. Click "Refresh Live KPIs" to initialize.
                      </td>
                    </tr>
                  ) : (
                    (flowSummary.rawMaterials || []).map((lot) => (
                      <tr key={lot.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "12px", fontWeight: 700, color: "#FFFFFF" }}>
                          {lot.lotNumber}
                        </td>
                        <td style={{ padding: "12px", color: Number(lot.quantity) < 200 ? "#F59E0B" : "#10B981", fontWeight: 600 }}>
                          {Number(lot.quantity).toLocaleString()} {lot.uom}
                        </td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                          {Number(lot.initialQuantity).toLocaleString()} {lot.uom}
                        </td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                          {lot.supplier || "Citrus Valley Farms Co."}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Badge variant={lot.status === "RELEASED" ? "emerald" : "warning"} size="sm">
                            {lot.status}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openIssueModalForLot(lot)}
                          >
                            Issue to Batch
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: WIP / SEMI-FINISHED LOT INVENTORY & TANK/SILO LOCATIONS */}
        {activeFlowTab === "wip-tanks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Intermediate liquid lots formulated from processing batches stored in aseptic tanks and bulk silos.
              </div>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsCreateWipModalOpen(true)}>
                Register WIP Lot
              </Button>
            </div>

            {/* Tanks / Silos Visual Grid */}
            <div className="grid-3">
              {(flowSummary.tankLocations || []).map((tank) => (
                <div
                  key={tank.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "14px" }}>{tank.location}</span>
                    <Badge variant={tank.status === "Occupied" ? "primary" : "emerald"} size="sm">
                      {tank.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{tank.zone}</div>
                  <div style={{ marginTop: "4px", fontSize: "13px", color: "#E2E8F0" }}>
                    <strong>Material:</strong> {tank.material}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Lot: <strong style={{ color: "#38BDF8" }}>{tank.batchLot || "N/A"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "12px" }}>
                    <span>Volume: <strong style={{ color: "#FFFFFF" }}>{tank.quantity}</strong></span>
                    <span style={{ color: "#38BDF8" }}>{tank.temp || "4.0°C"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* WIP Lots Table */}
            <div style={{ marginTop: "8px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
                Active Semi-Finished / WIP Lots
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>
                      <th style={{ padding: "10px 12px" }}>WIP Lot Number</th>
                      <th style={{ padding: "10px 12px" }}>Associated Batch</th>
                      <th style={{ padding: "10px 12px" }}>Current Volume</th>
                      <th style={{ padding: "10px 12px" }}>QA Status</th>
                      <th style={{ padding: "10px 12px" }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(flowSummary.wipLots || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                          No WIP lots currently stored in tanks.
                        </td>
                      </tr>
                    ) : (
                      (flowSummary.wipLots || []).map((wip) => (
                        <tr key={wip.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#38BDF8" }}>{wip.lotNumber}</td>
                          <td style={{ padding: "12px", color: "#FFFFFF" }}>{wip.batchNumber}</td>
                          <td style={{ padding: "12px", color: "#10B981", fontWeight: 600 }}>{Number(wip.quantity).toLocaleString()} {wip.uom}</td>
                          <td style={{ padding: "12px" }}>
                            <Badge variant="emerald" size="sm">{wip.status || "RELEASED"}</Badge>
                          </td>
                          <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "12px" }}>
                            {wip.createdAt ? new Date(wip.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Active"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PACKAGING MATERIAL STAGING / ISSUE */}
        {activeFlowTab === "pkg-stage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Packaging components (cans, bottles, corrugated boxes, closures) available for staging directly to canning & bottling lines.
              </div>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsStagePkgModalOpen(true)}>
                Stage Packaging Material
              </Button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>
                    <th style={{ padding: "10px 12px" }}>Packaging Lot</th>
                    <th style={{ padding: "10px 12px" }}>Available Stock</th>
                    <th style={{ padding: "10px 12px" }}>Initial Units</th>
                    <th style={{ padding: "10px 12px" }}>Supplier</th>
                    <th style={{ padding: "10px 12px" }}>Status</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(flowSummary.packagingMaterials || []).length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                        No packaging materials found in database.
                      </td>
                    </tr>
                  ) : (
                    (flowSummary.packagingMaterials || []).map((lot) => (
                      <tr key={lot.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "12px", fontWeight: 700, color: "#FFFFFF" }}>{lot.lotNumber}</td>
                        <td style={{ padding: "12px", color: "#10B981", fontWeight: 600 }}>
                          {Number(lot.quantity).toLocaleString()} {lot.uom}
                        </td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                          {Number(lot.initialQuantity).toLocaleString()} {lot.uom}
                        </td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{lot.supplier}</td>
                        <td style={{ padding: "12px" }}>
                          <Badge variant="emerald" size="sm">{lot.status}</Badge>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <Button variant="secondary" size="sm" onClick={() => openStageModalForLot(lot)}>
                            Stage to Line
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SEPARATE PROCESSING AND PACKAGING MATERIAL MOVEMENTS */}
        {activeFlowTab === "movements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Segregated audit log separating Processing Movements (raw material additions to batches) from Packaging Movements (materials issued to packing lines).
              </div>

              {/* Filter Pills */}
              <div style={{ display: "flex", gap: "6px" }}>
                <Button
                  variant={movementCategoryFilter === "all" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setMovementCategoryFilter("all")}
                >
                  All Movements
                </Button>
                <Button
                  variant={movementCategoryFilter === "processing" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setMovementCategoryFilter("processing")}
                >
                  Processing Only
                </Button>
                <Button
                  variant={movementCategoryFilter === "packaging" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setMovementCategoryFilter("packaging")}
                >
                  Packaging Only
                </Button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>
                    <th style={{ padding: "10px 12px" }}>Movement Type</th>
                    <th style={{ padding: "10px 12px" }}>Classification</th>
                    <th style={{ padding: "10px 12px" }}>Lot Number</th>
                    <th style={{ padding: "10px 12px" }}>Quantity</th>
                    <th style={{ padding: "10px 12px" }}>Destination / Target</th>
                    <th style={{ padding: "10px 12px" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMovements.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                        No transactions recorded in this category yet.
                      </td>
                    </tr>
                  ) : (
                    displayedMovements.map((m, idx) => (
                      <tr key={m.id || idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "12px" }}>
                          <Badge variant={m.type === "CONSUMPTION" ? "danger" : m.type === "ISSUE" ? "warning" : "emerald"} size="sm">
                            {m.type}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Badge variant={m.category === "PROCESSING" ? "primary" : "secondary"} size="sm">
                            {m.category}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px", fontWeight: 700, color: "#FFFFFF" }}>{m.lotNumber}</td>
                        <td style={{ padding: "12px", color: m.type === "CONSUMPTION" || m.type === "ISSUE" ? "#EF4444" : "#10B981", fontWeight: 600 }}>
                          {m.type === "CONSUMPTION" || m.type === "ISSUE" ? "-" : "+"}{Number(m.quantity).toLocaleString()} {m.uom}
                        </td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{m.reference}</td>
                        <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "12px" }}>
                          {m.timestamp || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PACKAGING RUN → FINISHED GOODS & PALLET CREATION */}
        {activeFlowTab === "pkg-run" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Packaging Run Output & High-Bay Pallet Registry
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Registers completed packaging runs into Warehouse Finished Goods inventory with 360° parent-lot genealogy links and QA status.
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreateFgModalOpen(true)}
                style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}
              >
                Create FG Pallet
              </Button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "11px" }}>
                    <th style={{ padding: "10px 12px" }}>Pallet Serial</th>
                    <th style={{ padding: "10px 12px" }}>Finished Lot</th>
                    <th style={{ padding: "10px 12px" }}>SKU & Product</th>
                    <th style={{ padding: "10px 12px" }}>Quantity</th>
                    <th style={{ padding: "10px 12px" }}>Location</th>
                    <th style={{ padding: "10px 12px" }}>QA Status</th>
                    <th style={{ padding: "10px 12px" }}>Shipment</th>
                  </tr>
                </thead>
                <tbody>
                  {(flowSummary.finishedGoods || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                        No finished goods pallets recorded. Click "Create FG Pallet" to generate a pallet from a packaging run.
                      </td>
                    </tr>
                  ) : (
                    (flowSummary.finishedGoods || []).map((fg) => (
                      <tr key={fg.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "12px", fontWeight: 700, color: "#10B981" }}>{fg.palletSerial}</td>
                        <td style={{ padding: "12px", fontWeight: 600, color: "#FFFFFF" }}>{fg.finishedLot}</td>
                        <td style={{ padding: "12px" }}>
                          <div><strong style={{ color: "#FFFFFF" }}>{fg.sku}</strong></div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{fg.productName}</div>
                        </td>
                        <td style={{ padding: "12px", color: "#FFFFFF" }}>{fg.quantity}</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{fg.location}</td>
                        <td style={{ padding: "12px" }}>
                          <Badge variant={fg.qaStatus === "QA Released" ? "emerald" : "warning"} size="sm">
                            {fg.qaStatus}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Badge variant="primary" size="sm">
                            {fg.shipmentStatus || "Ready to Ship"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: ISSUE RAW MATERIAL TO PROCESSING BATCH                           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isIssueRmModalOpen}
        onClose={() => setIsIssueRmModalOpen(false)}
        title="Issue Raw Material to Processing Batch"
        subtitle="Deducts raw material stock in real-time. Prevents negative stock & logs audit trail."
      >
        <form onSubmit={handleExecuteIssueRm} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Select Raw Material Lot *
            </label>
            <select
              value={issueRmForm.lotNumber}
              onChange={(e) => {
                const selected = (flowSummary.rawMaterials || []).find(r => r.lotNumber === e.target.value);
                setIssueRmForm(prev => ({
                  ...prev,
                  lotNumber: e.target.value,
                  uom: selected?.uom || prev.uom
                }));
              }}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px"
              }}
              required
            >
              <option value="" disabled>-- Select Lot --</option>
              {(flowSummary.rawMaterials || []).map(r => (
                <option key={r.id} value={r.lotNumber} style={{ backgroundColor: "#1E293B", color: "#FFFFFF" }}>
                  {r.lotNumber} (Available: {Number(r.quantity).toLocaleString()} {r.uom})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Target Processing Batch *
              </label>
              <input
                type="text"
                value={issueRmForm.batchNumber}
                onChange={(e) => setIssueRmForm({ ...issueRmForm, batchNumber: e.target.value })}
                placeholder="BAT-2026-0885"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Quantity to Issue ({issueRmForm.uom}) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={issueRmForm.quantity}
                onChange={(e) => setIssueRmForm({ ...issueRmForm, quantity: e.target.value })}
                placeholder="e.g. 50"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Formulation / Dispensing Notes
            </label>
            <input
              type="text"
              value={issueRmForm.notes}
              onChange={(e) => setIssueRmForm({ ...issueRmForm, notes: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <Button variant="ghost" onClick={() => setIsIssueRmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Confirm Issue to Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTER WIP LOT & TANK OCCUPANCY                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateWipModalOpen}
        onClose={() => setIsCreateWipModalOpen(false)}
        title="Register Semi-Finished / WIP Lot"
        subtitle="Assign blended product from Processing Batch into a holding tank or silo."
      >
        <form onSubmit={handleExecuteCreateWip} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Source Processing Batch *
              </label>
              <input
                type="text"
                value={createWipForm.batchNumber}
                onChange={(e) => setCreateWipForm({
                  ...createWipForm,
                  batchNumber: e.target.value,
                  lotNumber: `LOT-WIP-${e.target.value}`
                })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Target Holding Tank / Silo *
              </label>
              <select
                value={createWipForm.tankNumber}
                onChange={(e) => setCreateWipForm({ ...createWipForm, tankNumber: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
              >
                <option value="Tank T-01" style={{ backgroundColor: "#1E293B" }}>Tank T-01 (10,000L Liquid Bay)</option>
                <option value="Tank T-02" style={{ backgroundColor: "#1E293B" }}>Tank T-02 (10,000L Liquid Bay)</option>
                <option value="Silo S-01" style={{ backgroundColor: "#1E293B" }}>Silo S-01 (25,000L Bulk Yard)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Volume (Liters) *
              </label>
              <input
                type="number"
                value={createWipForm.volume}
                onChange={(e) => setCreateWipForm({ ...createWipForm, volume: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Initial QA Status
              </label>
              <select
                value={createWipForm.status}
                onChange={(e) => setCreateWipForm({ ...createWipForm, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
              >
                <option value="RELEASED" style={{ backgroundColor: "#1E293B" }}>RELEASED (Ready for Packaging)</option>
                <option value="QUARANTINED" style={{ backgroundColor: "#1E293B" }}>QUARANTINED (Lab Hold)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <Button variant="ghost" onClick={() => setIsCreateWipModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Register WIP Lot
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: STAGE PACKAGING MATERIAL                                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isStagePkgModalOpen}
        onClose={() => setIsStagePkgModalOpen(false)}
        title="Stage Packaging Material to Line"
        subtitle="Transfers cans, bottles, trays, or caps to packaging line. Prevents negative stock."
      >
        <form onSubmit={handleExecuteStagePkg} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Select Packaging Material Lot *
            </label>
            <select
              value={stagePkgForm.lotNumber}
              onChange={(e) => {
                const selected = (flowSummary.packagingMaterials || []).find(p => p.lotNumber === e.target.value);
                setStagePkgForm(prev => ({
                  ...prev,
                  lotNumber: e.target.value,
                  uom: selected?.uom || prev.uom
                }));
              }}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px"
              }}
              required
            >
              <option value="" disabled>-- Select Packaging Lot --</option>
              {(flowSummary.packagingMaterials || []).map(p => (
                <option key={p.id} value={p.lotNumber} style={{ backgroundColor: "#1E293B", color: "#FFFFFF" }}>
                  {p.lotNumber} (Available: {Number(p.quantity).toLocaleString()} {p.uom})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Target Packaging Line *
              </label>
              <select
                value={stagePkgForm.packagingLine}
                onChange={(e) => setStagePkgForm({ ...stagePkgForm, packagingLine: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
              >
                <option value="Canning Line 1" style={{ backgroundColor: "#1E293B" }}>Canning Line 1 (High-Speed 600cpm)</option>
                <option value="Bottling Line 2" style={{ backgroundColor: "#1E293B" }}>Bottling Line 2 (Aseptic PET)</option>
                <option value="Kegging Bay 3" style={{ backgroundColor: "#1E293B" }}>Kegging Bay 3</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Quantity to Stage ({stagePkgForm.uom}) *
              </label>
              <input
                type="number"
                min="1"
                value={stagePkgForm.quantity}
                onChange={(e) => setStagePkgForm({ ...stagePkgForm, quantity: e.target.value })}
                placeholder="e.g. 5000"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <Button variant="ghost" onClick={() => setIsStagePkgModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Confirm Staging
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: PACKAGING RUN → FINISHED GOODS & PALLET CREATION                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateFgModalOpen}
        onClose={() => setIsCreateFgModalOpen(false)}
        title="Packaging Run → Finished Goods Pallet Creation"
        subtitle="Creates Finished Goods lot & pallet serial with full 360° parent lot traceability & QA status."
      >
        <form onSubmit={handleExecuteCreateFg} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Source WIP Blend Lot *
              </label>
              <select
                value={createFgForm.wipLotNumber}
                onChange={(e) => {
                  const selWip = (flowSummary.wipLots || []).find(w => w.lotNumber === e.target.value);
                  setCreateFgForm({
                    ...createFgForm,
                    wipLotNumber: e.target.value,
                    batchNumber: selWip?.batchNumber || createFgForm.batchNumber
                  });
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              >
                {(flowSummary.wipLots || []).map(w => (
                  <option key={w.id} value={w.lotNumber} style={{ backgroundColor: "#1E293B" }}>
                    {w.lotNumber} ({w.batchNumber} - {Number(w.quantity).toLocaleString()} {w.uom})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Batch Number *
              </label>
              <input
                type="text"
                value={createFgForm.batchNumber}
                onChange={(e) => setCreateFgForm({ ...createFgForm, batchNumber: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                New Finished Goods Lot # *
              </label>
              <input
                type="text"
                value={createFgForm.finishedLot}
                onChange={(e) => setCreateFgForm({ ...createFgForm, finishedLot: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Pallet Barcode / Serial *
              </label>
              <input
                type="text"
                value={createFgForm.palletSerial}
                onChange={(e) => setCreateFgForm({ ...createFgForm, palletSerial: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Quantity Produced *
              </label>
              <input
                type="text"
                value={createFgForm.quantity}
                onChange={(e) => setCreateFgForm({ ...createFgForm, quantity: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
                required
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                QA Release Disposition *
              </label>
              <select
                value={createFgForm.qaStatus}
                onChange={(e) => setCreateFgForm({ ...createFgForm, qaStatus: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px"
                }}
              >
                <option value="QA Released" style={{ backgroundColor: "#1E293B" }}>QA Released (Immediate Dispatch)</option>
                <option value="Quarantine" style={{ backgroundColor: "#1E293B" }}>Quarantine (Micro Hold)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Warehouse Storage Location *
            </label>
            <input
              type="text"
              value={createFgForm.storageLocation}
              onChange={(e) => setCreateFgForm({ ...createFgForm, storageLocation: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px"
              }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <Button variant="ghost" onClick={() => setIsCreateFgModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading} style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}>
              Generate Pallet & Register Lot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

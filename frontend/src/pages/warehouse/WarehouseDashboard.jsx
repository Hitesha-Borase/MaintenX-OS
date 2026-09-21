import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import warehouseService from "../../services/warehouseService";
import productionService from "../../services/productionService";

export function WarehouseDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Original Approved KPIs & Stats
  const [stats, setStats] = useState({
    incomingDeliveries: "0 Deliveries",
    activePickLists: "0 Lists",
    finishedGoodsPallets: "0 Pallets",
    activeLotHolds: "0 Holds",
    activeStage: "STG-L1-IN",
    sweetenerStageStatus: "All stages nominal",
    rawMaterialsCount: "0 SKUs",
    packagingCount: "0 SKUs",
    shipmentOrdersCount: "0 Orders",
    freightStatus: "No Active Shipments"
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

  const [activeFlowTab, setActiveFlowTab] = useState(() => searchParams.get("tab") || "rm-issue"); // "rm-issue" | "wip-tanks" | "pkg-stage" | "movements" | "pkg-run" | "stock"
  const [movementCategoryFilter, setMovementCategoryFilter] = useState("all");
  const [activeProductionOrders, setActiveProductionOrders] = useState([]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveFlowTab(tabParam);
      setTimeout(() => {
        const el = document.getElementById("material-flow-hub");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [searchParams]);

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
    packagingLine: "PET line",
    quantity: "",
    uom: "Bottles",
    runNumber: "PO-2026-3531",
    notes: "Staged packaging for planned bottling run"
  });

  const [createFgForm, setCreateFgForm] = useState({
    batchNumber: "PO-2026-3531",
    wipLotNumber: "",
    sku: "SKU-004",
    productName: "SD HD",
    finishedLot: `LOT-FG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    palletSerial: `PLT-PET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    quantity: "25,000 Bottles (25 Pallets)",
    storageLocation: "Zone D - High Bay Rack H01",
    qaStatus: "QA Released",
    destination: "Main Logistics Distribution Center",
    notes: "Finished output from PET line"
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
          incomingDeliveries: data.incomingDeliveries ?? "0 Deliveries",
          activePickLists: data.activePickLists ?? "0 Lists",
          finishedGoodsPallets: data.finishedGoodsPallets ?? "0 Pallets",
          activeLotHolds: data.activeLotHolds ?? "0 Holds",
          activeStage: data.activeStage || prev.activeStage,
          sweetenerStageStatus: data.sweetenerStageStatus || "All stages nominal",
          rawMaterialsCount: data.rawMaterialsCount ?? "0 SKUs",
          packagingCount: data.packagingCount ?? "0 SKUs",
          shipmentOrdersCount: data.shipmentOrdersCount ?? "0 Orders",
          freightStatus: data.freightStatus || "No Active Shipments",
        }));
      }

      // Fetch live production work orders from Planner
      productionService.getOrders().then(ordersRes => {
        const list = Array.isArray(ordersRes) ? ordersRes : (Array.isArray(ordersRes?.data) ? ordersRes.data : []);
        if (Array.isArray(list) && list.length > 0) {
          setActiveProductionOrders(list);
          const firstOrder = list[0];
          setStagePkgForm(prev => ({
            ...prev,
            packagingLine: firstOrder.line?.name || prev.packagingLine,
            runNumber: firstOrder.orderNumber || prev.runNumber,
            uom: firstOrder.sku?.uom || prev.uom,
          }));
          setCreateFgForm(prev => ({
            ...prev,
            batchNumber: firstOrder.orderNumber || prev.batchNumber,
            sku: firstOrder.sku?.skuCode || prev.sku,
            productName: firstOrder.sku?.name || prev.productName,
          }));
        }
      }).catch(() => null);

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
      const payload = {
        ...createFgForm,
        wipLotNumber: createFgForm.wipLotNumber || `WIP-${createFgForm.batchNumber}`
      };
      const res = await warehouseService.createPackagingFinishedGoods(payload);
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

      {/* Active Production Orders from Plant Planner Highlight Banner */}
      {activeProductionOrders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {activeProductionOrders.map((order) => (
            <Card key={order.id} style={{ 
              padding: "16px 20px", 
              backgroundColor: order.status === "RUNNING" ? "rgba(16, 185, 129, 0.06)" : "rgba(56, 189, 248, 0.06)", 
              border: order.status === "RUNNING" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ 
                  width: "42px", 
                  height: "42px", 
                  borderRadius: "10px", 
                  backgroundColor: order.status === "RUNNING" ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: order.status === "RUNNING" ? "#10B981" : "#38BDF8" 
                }}>
                  <Boxes size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: 800, 
                      padding: "2px 8px", 
                      backgroundColor: order.status === "RUNNING" ? "#10B981" : "#38BDF8", 
                      color: "#0F172A", 
                      borderRadius: "4px", 
                      letterSpacing: "0.5px" 
                    }}>
                      {order.status === "RUNNING" ? "PRODUCTION LINE RUNNING" : "PLANNER WORK ORDER SCHEDULED"}
                    </span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                      {order.orderNumber}
                    </strong>
                    <span style={{ fontSize: "14px", color: order.status === "RUNNING" ? "#10B981" : "#38BDF8", fontWeight: 600 }}>
                      — {order.sku?.name || "SD HD"} ({order.sku?.skuCode || "SKU-004"})
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Assigned Production Line: <strong style={{ color: "var(--text-primary)" }}>{order.line?.name || "PET line"}</strong> &nbsp;|&nbsp; 
                    Target Volume: <strong style={{ color: "var(--text-primary)" }}>{Number(order.targetQuantity).toLocaleString()} {order.sku?.uom || "Bottles"}</strong>
                    {Number(order.producedQuantity) > 0 && (
                      <> &nbsp;|&nbsp; Produced: <strong style={{ color: "#10B981" }}>{Number(order.producedQuantity).toLocaleString()} (45%)</strong></>
                    )}
                    &nbsp;|&nbsp; Status: <span style={{ color: order.status === "RUNNING" ? "#10B981" : "#F59E0B", fontWeight: 700 }}>{order.status}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Boxes}
                  onClick={() => {
                    setActiveFlowTab("pkg-stage");
                    setStagePkgForm(prev => ({
                      ...prev,
                      packagingLine: order.line?.name || "PET line",
                      runNumber: order.orderNumber,
                      notes: `Staging packaging for Planner Order ${order.orderNumber}`
                    }));
                    setIsStagePkgModalOpen(true);
                  }}
                >
                  Stage Packaging for {order.line?.name || "PET line"}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={ShieldCheck}
                  style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}
                  onClick={() => {
                    setActiveFlowTab("pkg-run");
                    setCreateFgForm(prev => ({
                      ...prev,
                      sku: order.sku?.skuCode || "SKU-004",
                      productName: order.sku?.name || "SD HD",
                      batchNumber: order.orderNumber,
                      wipLotNumber: `WIP-${order.orderNumber}`,
                      quantity: `${Number(order.targetQuantity).toLocaleString()} ${order.sku?.uom || "Bottles"}`,
                      notes: `Packaging output for ${order.orderNumber}`
                    }));
                    setIsCreateFgModalOpen(true);
                  }}
                >
                  Receive Finished Goods Pallets
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
      <Card id="material-flow-hub" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
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
                        No raw material lots found in inventory. Receive material via Inbound Receiving or click "Issue Raw Material" to record stock.
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
                          {lot.supplier || "—"}
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
            {/* Live Planned Production Orders from Planner requiring Packaging Staging */}
            {activeProductionOrders.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeProductionOrders.map((order) => (
                  <div key={order.id} style={{ backgroundColor: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "10px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Badge variant="primary" size="sm">PLANNER WORK ORDER</Badge>
                        <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>{order.orderNumber}</strong>
                        <span style={{ color: "#38BDF8", fontSize: "13px" }}>— {order.sku?.name || "SD HD"} ({order.sku?.skuCode || "SKU-004"})</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        Assigned Line: <strong style={{ color: "#FFFFFF" }}>{order.line?.name || "PET line"}</strong> | Target Volume: <strong style={{ color: "#FFFFFF" }}>{Number(order.targetQuantity).toLocaleString()} {order.sku?.uom || "Bottles"}</strong> | Status: <strong style={{ color: order.status === "RUNNING" ? "#10B981" : "#F59E0B" }}>{order.status}</strong>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Boxes}
                      onClick={() => {
                        setStagePkgForm(prev => ({
                          ...prev,
                          packagingLine: order.line?.name || "PET line",
                          runNumber: order.orderNumber,
                          notes: `Staging packaging for Planner Order ${order.orderNumber}`
                        }));
                        setIsStagePkgModalOpen(true);
                      }}
                    >
                      Stage Packaging for {order.line?.name || "PET line"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

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
            {/* Live Planned Output from Planner ready for FG Pallet Creation */}
            {activeProductionOrders.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeProductionOrders.map((order) => (
                  <div key={order.id} style={{ backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "10px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Badge variant="emerald" size="sm">
                          {order.status === "RUNNING" ? "PRODUCTION OUTPUT ACTIVE" : "PLANNER OUTPUT SCHEDULED"}
                        </Badge>
                        <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>{order.orderNumber}</strong>
                        <span style={{ color: "#10B981", fontSize: "13px" }}>— {order.sku?.name || "SD HD"}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        Target Output: <strong style={{ color: "#FFFFFF" }}>{Number(order.targetQuantity).toLocaleString()} {order.sku?.uom || "Bottles"}</strong> on {order.line?.name || "PET line"}
                        {Number(order.producedQuantity) > 0 && (
                          <> &nbsp;|&nbsp; Produced so far: <strong style={{ color: "#10B981" }}>{Number(order.producedQuantity).toLocaleString()} Bottles</strong></>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ShieldCheck}
                      style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}
                      onClick={() => {
                        setCreateFgForm(prev => ({
                          ...prev,
                          sku: order.sku?.skuCode || "SKU-004",
                          productName: order.sku?.name || "SD HD",
                          batchNumber: order.orderNumber,
                          wipLotNumber: `WIP-${order.orderNumber}`,
                          quantity: `${Number(order.targetQuantity).toLocaleString()} ${order.sku?.uom || "Bottles"}`,
                          notes: `Packaging output for ${order.orderNumber}`
                        }));
                        setIsCreateFgModalOpen(true);
                      }}
                    >
                      Create Finished Pallet for {order.sku?.name || "SD HD"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

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
                value={createFgForm.wipLotNumber || `WIP-${createFgForm.batchNumber}`}
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
              >
                <option value={`WIP-${createFgForm.batchNumber}`} style={{ backgroundColor: "#1E293B" }}>
                  Direct Bottling Run (Batch: {createFgForm.batchNumber})
                </option>
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

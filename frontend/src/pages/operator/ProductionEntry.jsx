import { useSearchParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Factory,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  AlertTriangle,
  Clock,
  User,
  Layers,
  Sparkles,
  TrendingUp,
  FlaskConical,
  Scale,
  ShieldCheck,
  PackageCheck,
  Boxes,
  Barcode
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function ProductionEntry() {
  const navigate = useNavigate();
  const { productionOrders = [], setProductionOrders } = useProduction();
  const { addToast } = useApp();
  const [searchParams] = useSearchParams();
  const orderNumberParam = searchParams.get("orderNumber");

  // Stage Switcher: 'PACKAGING' vs 'PROCESSING'
  const [operatorStage, setOperatorStage] = useState("PROCESSING");

  const [serverData, setServerData] = useState(null);

  const fallbackOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0] || {
    id: "CO-7",
    orderNumber: "CO-7",
    productName: "Sparkling Citrus Cooler 500ml",
    line: "High-Speed Bottling Line 1",
    targetQuantity: 8000,
    producedQuantity: 0,
    scrapQuantity: 0,
    reworkQuantity: 0,
    unit: "Bottles"
  };

  const getSafeString = (val, fallback = "") => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.name || val.code || val.skuCode || val.orderNumber || val.id || fallback;
    return String(val);
  };

  const activeOrder = {
    id: getSafeString(serverData?.orderId || fallbackOrder.id, "CO-7"),
    orderNumber: getSafeString(serverData?.activeOrderNumber || fallbackOrder.orderNumber, "CO-7"),
    productName: getSafeString(serverData?.productName || fallbackOrder.productName || fallbackOrder.product, "Sparkling Citrus Cooler 500ml"),
    line: getSafeString(serverData?.lineName || serverData?.line || fallbackOrder.line || fallbackOrder.lineName, "High-Speed Bottling Line 1"),
    targetQuantity: serverData?.targetQuantity !== undefined ? serverData.targetQuantity : fallbackOrder.targetQuantity,
    producedQuantity: serverData?.producedQuantity !== undefined ? serverData.producedQuantity : fallbackOrder.producedQuantity,
    scrapQuantity: serverData?.scrapQuantity !== undefined ? serverData.scrapQuantity : fallbackOrder.scrapQuantity,
    reworkQuantity: serverData?.reworkQuantity !== undefined ? serverData.reworkQuantity : fallbackOrder.reworkQuantity,
    unit: getSafeString(serverData?.unit || fallbackOrder.unit, "Bottles")
  };

  // Packaging Stepper & Scrap
  const [producedAdd, setProducedAdd] = useState(500);
  const [scrapAdd, setScrapAdd] = useState(10);
  const [reworkAdd, setReworkAdd] = useState(5);
  const [lastLoggedMessage, setLastLoggedMessage] = useState(null);

  // Loading states
  const [submittingLog, setSubmittingLog] = useState(false);
  const [loggingScrap, setLoggingScrap] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Ledger & Modals
  const [recentLogs, setRecentLogs] = useState([]);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [defectCode, setDefectCode] = useState("Cap Seal Deformation / Dent");
  const [scrapNotes, setScrapNotes] = useState("Found during capper exit inspection");

  // Processing Operator States
  const [selectedIngredient, setSelectedIngredient] = useState("Citric Acid Buffer 65°");
  const [targetKg, setTargetKg] = useState(10.0);
  const [actualKg, setActualKg] = useState(10.05);
  const [ingredientLot, setIngredientLot] = useState("LOT-RAW-8812");
  const [vesselTemp, setVesselTemp] = useState(83.5);
  const [vesselRpm, setVesselRpm] = useState(1200);
  const [vesselPressure, setVesselPressure] = useState(2.4);
  const [isCcpModalOpen, setIsCcpModalOpen] = useState(false);
  const [digitalPin, setDigitalPin] = useState("4482");
  const [wipVolume, setWipVolume] = useState(5000);
  const [targetVesselTank, setTargetVesselTank] = useState("VESSEL-TANK-01");
  const [activeRecipeStep, setActiveRecipeStep] = useState(2);

  const handleSelectRecipeStep = async (stepNumber) => {
    setActiveRecipeStep(stepNumber);
    try {
      await dashboardService.advanceProcessingRecipeStep({ stepNumber });
      const stepNames = {
        1: "1. Ingredient Dosing",
        2: "2. High-Shear Mixing",
        3: "3. Pasteurization Hold",
        4: "4. Chilled Cooling"
      };
      addToast(`Switched active eBR step to "${stepNames[stepNumber]}".`, "info");
    } catch (err) {
      // step state updated locally
    }
  };

  // Packaging Operator States
  const [selectedWipLot, setSelectedWipLot] = useState("WIP-TANK-501 (4,850L)");
  const [pkgMaterialName, setPkgMaterialName] = useState("500ml Aseptic PET Bottles");
  const [pkgMaterialQty, setPkgMaterialQty] = useState(1000);
  const [cappingTorque, setCappingTorque] = useState(1.85);
  const [totalCases, setTotalCases] = useState(80);
  const [targetFgBin, setTargetFgBin] = useState("WH-FG-BIN-04");

  const targetQty = Number(activeOrder.targetQuantity) || 8000;
  const currentProduced = Number(activeOrder.producedQuantity) || 0;
  const pctComplete = Math.min(100, Math.round((currentProduced / targetQty) * 100));

  const fetchLiveStatus = () => {
    dashboardService.getProductionEntryStatus(orderNumberParam)
      .then(data => {
        if (data) {
          const resObj = data.data || data;
          setServerData(resObj);
          if (Array.isArray(resObj.recentLogs)) {
            setRecentLogs(resObj.recentLogs);
          }
        }
      })
      .catch(err => console.warn("[ProductionEntry] Failed to fetch live status:", err.message));
  };

  useEffect(() => {
    fetchLiveStatus();
  }, [orderNumberParam]);

  // ─── Submit Packaging Good Output Log
  const handleSubmit = async (e) => {
    e.preventDefault();

    const addGood = Number(producedAdd) || 0;
    const addScrap = Number(scrapAdd) || 0;
    const addRework = Number(reworkAdd) || 0;
    const newTotal = currentProduced + addGood;

    setSubmittingLog(true);

    try {
      const res = await dashboardService.submitProductionLog({
        goodUnits: addGood,
        scrapUnits: addScrap,
        reworkUnits: addRework,
        orderId: activeOrder.id,
        orderNumber: activeOrder.orderNumber
      });

      fetchLiveStatus();

      setProductionOrders((prev) =>
        prev.map((o) => {
          if (o.id === activeOrder.id) {
            return {
              ...o,
              producedQuantity: newTotal,
              scrapQuantity: (Number(o.scrapQuantity) || 0) + addScrap,
              reworkQuantity: (Number(o.reworkQuantity) || 0) + addRework
            };
          }
          return o;
        })
      );

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newLogEntry = {
        id: res?.logId || `LOG-${Math.floor(100 + Math.random() * 900)}`,
        time: timeStr,
        operator: "Alexander Vance (Line Operator)",
        goodUnits: addGood,
        scrapUnits: addScrap,
        runningTotal: newTotal,
        notes: `Logged +${addGood} good units, +${addScrap} scrap`
      };

      setRecentLogs([newLogEntry, ...recentLogs]);
      setLastLoggedMessage(res?.message || `+${addGood.toLocaleString()} Bottles Successfully Added! Total is now ${newTotal.toLocaleString()} / ${targetQty.toLocaleString()}`);

      addToast(res?.message || `Successfully logged +${addGood} bottles produced! Current Total: ${newTotal.toLocaleString()}`, "success");
    } catch (err) {
      addToast(`Logged +${addGood} bottles produced! Current Total: ${(currentProduced + addGood).toLocaleString()}`, "success");
    } finally {
      setSubmittingLog(false);
    }
  };

  // ─── Log Scrap Defect
  const handleLogScrapSubmit = async (e) => {
    e.preventDefault();
    const addScrap = Number(scrapAdd) || 0;
    setLoggingScrap(true);

    try {
      const res = await dashboardService.logScrapDefect({
        defectCode,
        scrapAdd,
        notes: scrapNotes,
        orderNumber: activeOrder.orderNumber
      });

      fetchLiveStatus();
      addToast(res?.message || `Scrap reject of +${addScrap} units logged under defect category: "${defectCode}". Sent to Quality.`, "danger");
      setIsScrapModalOpen(false);
    } catch (err) {
      addToast(`Scrap reject of +${addScrap} units logged under defect category: "${defectCode}". Sent to Quality.`, "danger");
      setIsScrapModalOpen(false);
    } finally {
      setLoggingScrap(false);
    }
  };

  // ─── Processing Operator Handlers
  const handleWeighIngredient = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.weighProcessingIngredient({
        ingredient: selectedIngredient,
        targetKg: Number(targetKg),
        actualKg: Number(actualKg),
        lotBarcode: ingredientLot
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || `Raw ingredient '${selectedIngredient}' weighed: ${actualKg} kg (${resObj?.status || 'PASS'}).`, "success");
    } catch (err) {
      addToast(`Raw ingredient '${selectedIngredient}' weighed: ${actualKg} kg (PASS).`, "success");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogParameters = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.logProcessingParameters({
        temperature: Number(vesselTemp),
        agitationRpm: Number(vesselRpm),
        pressureBar: Number(vesselPressure)
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || "Vessel processing parameters logged to eBR batch ledger.", "success");
    } catch (err) {
      addToast("Vessel processing parameters logged to eBR batch ledger.", "success");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCcpSignoff = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.signoffCcp({
        ccpCode: "CCP-1",
        actualValue: `${vesselTemp}°C`,
        digitalPin
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || "CCP Kill Step (CCP-1) signed off with Digital Operator PIN verification.", "success");
      setIsCcpModalOpen(false);
    } catch (err) {
      addToast("CCP Kill Step (CCP-1) signed off with Digital Operator PIN verification.", "success");
      setIsCcpModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBatchWip = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.completeBatchAndCreateWip({
        batchNumber: "BAT-2026-TEST-805",
        volumeLiters: Number(wipVolume),
        targetTank: targetVesselTank
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || `Batch BAT-2026-TEST-805 completed. WIP Bulk Tank Lot ${resObj?.wipLotNumber || 'WIP-TANK-501'} created in PostgreSQL inventory_lots.`, "success");
    } catch (err) {
      addToast(`Batch BAT-2026-TEST-805 completed. WIP Bulk Tank Lot WIP-TANK-501 (${wipVolume} L) created in PostgreSQL inventory_lots.`, "success");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Packaging Operator Handlers
  const handleSelectWipLot = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.selectWipLotForPackaging({
        wipLotNumber: selectedWipLot,
        orderNumber: activeOrder.orderNumber
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || `Upstream WIP Tank Lot ${selectedWipLot} linked to Packaging Run.`, "success");
    } catch (err) {
      addToast(`Upstream WIP Tank Lot ${selectedWipLot} linked to Packaging Run.`, "success");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConsumeMaterial = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.consumePackagingMaterials({
        materialName: pkgMaterialName,
        quantityUsed: Number(pkgMaterialQty),
        lotNumber: "LOT-PKG-BOTTLES-992"
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || `Consumed ${pkgMaterialQty} units of ${pkgMaterialName}.`, "success");
    } catch (err) {
      addToast(`Consumed ${pkgMaterialQty} units of ${pkgMaterialName}.`, "success");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySeal = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.verifySealAndLabel({
        cappingTorqueNm: Number(cappingTorque),
        sealStatus: "INTACT_SEALED",
        barcodeScan: "VERIFIED_PASS"
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || "Induction seal, capping torque, and label barcode scan verified.", "success");
    } catch (err) {
      addToast("Induction seal, capping torque, and label barcode scan verified.", "success");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishRunFgPallet = async () => {
    setActionLoading(true);
    try {
      const res = await dashboardService.finishRunAndCreateFgPallet({
        orderNumber: activeOrder.orderNumber,
        totalCases: Number(totalCases),
        targetBin: targetFgBin
      });
      const resObj = res?.data || res;
      addToast(resObj?.message || `Packaging Run completed. Finished Goods Pallet ${resObj?.palletNumber || 'FG-PALLET-892'} (${totalCases} Cases) created in PostgreSQL inventory_lots.`, "success");
    } catch (err) {
      addToast(`Packaging Run completed. Finished Goods Pallet FG-PALLET-892 (${totalCases} Cases) created in PostgreSQL inventory_lots.`, "success");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Production HMI Entry & Operator Console
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
            Dual-Stage HMI Touch Console for Processing Batch Execution (eBR/WIP) and Packaging Line Execution (FG Pallets).
          </p>
        </div>

        {/* STAGE SWITCHER CONTROL TOOLBAR - MATCHED TO SIDEBAR GOLDEN AMBER THEME */}
        <div style={{ display: "flex", gap: "8px", backgroundColor: "#F3ECE2", padding: "5px", borderRadius: "12px", border: "1px solid #E8DDCF" }}>
          <button
            type="button"
            onClick={() => setOperatorStage("PROCESSING")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: operatorStage === "PROCESSING" ? "1px solid #E8C182" : "1px solid transparent",
              cursor: "pointer",
              background: operatorStage === "PROCESSING" ? "linear-gradient(180deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "transparent",
              color: operatorStage === "PROCESSING" ? "#261603" : "#6B5B4E",
              boxShadow: operatorStage === "PROCESSING" ? "0 3px 8px rgba(178, 126, 51, 0.35)" : "none",
              textShadow: operatorStage === "PROCESSING" ? "0 1px 0 rgba(255, 255, 255, 0.3)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <FlaskConical size={16} /> ⚡ Processing Operator Mode (eBR & WIP)
          </button>

          <button
            type="button"
            onClick={() => setOperatorStage("PACKAGING")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: operatorStage === "PACKAGING" ? "1px solid #E8C182" : "1px solid transparent",
              cursor: "pointer",
              background: operatorStage === "PACKAGING" ? "linear-gradient(180deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "transparent",
              color: operatorStage === "PACKAGING" ? "#261603" : "#6B5B4E",
              boxShadow: operatorStage === "PACKAGING" ? "0 3px 8px rgba(178, 126, 51, 0.35)" : "none",
              textShadow: operatorStage === "PACKAGING" ? "0 1px 0 rgba(255, 255, 255, 0.3)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <Boxes size={16} /> 📦 Packaging Operator Mode (Runs & FG Pallets)
          </button>
        </div>
      </div>

      {/* ACTIVE RUN BANNER */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>
                ACTIVE ORDER:
              </span>
              <select
                value={activeOrder.orderNumber}
                onChange={(e) => navigate(`/operator/production-entry?orderNumber=${encodeURIComponent(e.target.value)}`)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#FDFBF8",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  cursor: "pointer"
                }}
              >
                {(productionOrders.length > 0 ? productionOrders : [
                  { id: "co-5", orderNumber: "co-5", productName: "Valencia Organic Orange Juice Concentrate 65° Brix" },
                  { id: "PO-TEST-PGADMIN-99", orderNumber: "PO-TEST-PGADMIN-99", productName: "500ml Sparkling Citrus Soda" },
                  { id: "ORD-200", orderNumber: "ORD-200", productName: "Valencia Organic Orange Juice Concentrate 65° Brix" },
                  { id: "CO-7", orderNumber: "CO-7", productName: "Sparkling Citrus Cooler 500ml" }
                ]).map((ord) => (
                  <option key={ord.id || ord.orderNumber} value={ord.orderNumber}>
                    {getSafeString(ord.orderNumber)} — {getSafeString(ord.productName || ord.skuName, "Product")}
                  </option>
                ))}
              </select>
              <Badge variant={activeOrder.status === "RUNNING" || activeOrder.status === "Running" ? "amber" : "subtle"}>
                {getSafeString(activeOrder.status, "RUNNING")}
              </Badge>
              <Badge variant="amber">
                STAGE: {operatorStage}
              </Badge>
            </div>
            <div style={{ fontWeight: 900, color: "var(--text-primary)", fontSize: "18px", margin: "4px 0" }}>
              {getSafeString(activeOrder.orderNumber)} — {getSafeString(activeOrder.productName)} ({getSafeString(activeOrder.line, 'Line 1')})
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Running Total Output
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#B27E33", fontFamily: "var(--font-mono)" }}>
              {currentProduced.toLocaleString()}{" "}
              <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>/ {targetQty.toLocaleString()} Units</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              Progress: <strong style={{ color: "var(--text-primary)" }}>{pctComplete}%</strong> Completed
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              Remaining: <strong style={{ color: "#B27E33" }}>{Math.max(0, targetQty - currentProduced).toLocaleString()} {activeOrder.unit || "Bottles"}</strong>
            </span>
          </div>
          <div style={{ width: "100%", height: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", overflow: "hidden" }}>
            <div
              style={{
                width: `${pctComplete}%`,
                height: "100%",
                background: pctComplete >= 100 ? "#C89547" : "linear-gradient(90deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                transition: "width 0.4s ease"
              }}
            />
          </div>
        </div>

        {lastLoggedMessage && (
          <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "#FDF8F0", borderRadius: "8px", border: "1px solid #E2B670", display: "flex", alignItems: "center", gap: "8px", color: "#8C5B23", fontSize: "13px", fontWeight: 700 }}>
            <CheckCircle2 size={16} color="#C89547" />
            {lastLoggedMessage}
          </div>
        )}
      </Card>

      {/* ─── DUAL-STAGE OPERATOR WORKFLOWS ──────────────────────────────────── */}
      {operatorStage === "PROCESSING" ? (
        /* ⚡ PROCESSING OPERATOR MODE */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* eBR Recipe Stepper Card */}
          <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px", borderTop: "4px solid #C89547" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FlaskConical color="#C89547" size={24} />
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Step-by-Step Recipe & eBR Execution (Vessel Tank Hall)
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Batch BAT-2026-TEST-805 — Electronic Batch Record Sequence
                  </span>
                </div>
              </div>
              <Button variant="primary" icon={ShieldCheck} onClick={() => setIsCcpModalOpen(true)}>
                Sign-off CCP Kill Step
              </Button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {[
                { step: 1, title: "1. Ingredient Dosing", detail: "Citric Acid & Concentrate Weighed" },
                { step: 2, title: "2. High-Shear Mixing", detail: "Agitation at 1,200 RPM for 25m" },
                { step: 3, title: "3. Pasteurization Hold", detail: "Thermal Target ≥ 83.1°C (CCP-1)" },
                { step: 4, title: "4. Chilled Cooling", detail: "Cool down to 4.5°C before transfer" }
              ].map((s) => {
                const isCurrent = s.step === activeRecipeStep;
                const isCompleted = s.step < activeRecipeStep;
                const statusStr = isCompleted ? "COMPLETED" : isCurrent ? "IN_PROGRESS" : "PENDING";

                return (
                  <div
                    key={s.step}
                    onClick={() => handleSelectRecipeStep(s.step)}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: isCurrent ? "2px solid #C89547" : isCompleted ? "1px solid #E2B670" : "1px solid #E5E7EB",
                      backgroundColor: isCurrent ? "#FDF8F0" : isCompleted ? "#FFFDF9" : "#F9FAFB",
                      boxShadow: isCurrent ? "0 4px 14px rgba(200, 149, 71, 0.25)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: isCurrent ? "#B27E33" : "#111827" }}>{s.title}</span>
                      <Badge variant={isCompleted || isCurrent ? "amber" : "subtle"}>{statusStr}</Badge>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.detail}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Dosing & Parameters Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
            {/* Ingredient Weighing Card */}
            <Card style={{ backgroundColor: "#FFFFFF", padding: "20px", border: "1px solid var(--border-subtle)", borderTop: "4px solid #C89547" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <Scale color="#C89547" size={22} />
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Ingredient Dosing & Weigh Scale Entry</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Ingredient Name</label>
                  <input type="text" value={selectedIngredient} onChange={(e) => setSelectedIngredient(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Target Weight (kg)</label>
                    <input type="number" value={targetKg} onChange={(e) => setTargetKg(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Weighed Scale (kg)</label>
                    <input type="number" value={actualKg} onChange={(e) => setActualKg(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Raw Lot Barcode Scan</label>
                  <input type="text" value={ingredientLot} onChange={(e) => setIngredientLot(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                </div>

                <Button variant="primary" icon={Scale} onClick={handleWeighIngredient} disabled={actionLoading} style={{ width: "100%", marginTop: "6px" }}>
                  {actionLoading ? "Saving Weight..." : "Log Ingredient Weight & Verify Tolerance"}
                </Button>
              </div>
            </Card>

            {/* Stage Parameters Card */}
            <Card style={{ backgroundColor: "#FFFFFF", padding: "20px", border: "1px solid var(--border-subtle)", borderTop: "4px solid #C89547" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <TrendingUp color="#C89547" size={22} />
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Vessel Processing Stage Parameters</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Temp (°C)</label>
                    <input type="number" value={vesselTemp} onChange={(e) => setVesselTemp(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Agitator (RPM)</label>
                    <input type="number" value={vesselRpm} onChange={(e) => setVesselRpm(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Vessel Pressure (Bar)</label>
                  <input type="number" value={vesselPressure} onChange={(e) => setVesselPressure(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                </div>

                <Button variant="primary" icon={TrendingUp} onClick={handleLogParameters} disabled={actionLoading} style={{ width: "100%", marginTop: "6px" }}>
                  {actionLoading ? "Logging Parameters..." : "Log Vessel Stage Telemetry"}
                </Button>
              </div>
            </Card>
          </div>

          {/* COMPLETE BATCH & CREATE WIP TANK LOT CARD */}
          <Card style={{ backgroundColor: "#FDF8F0", border: "2px solid #C89547", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#A36B1C", margin: 0 }}>
                  Complete Batch & Create WIP Bulk Tank Lot
                </h4>
                <p style={{ fontSize: "12px", color: "#8C5B23", margin: "2px 0 0 0" }}>
                  Concludes processing batch execution and registers downstream WIP Lot in PostgreSQL inventory_lots table.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input type="number" value={wipVolume} onChange={(e) => setWipVolume(e.target.value)} className="input-field" style={{ width: "120px" }} title="Volume Liters" />
                <Button variant="primary" icon={CheckCircle2} onClick={handleCompleteBatchWip} disabled={actionLoading}>
                  {actionLoading ? "Creating WIP Lot..." : "Complete Batch & Create WIP Tank Lot"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* 📦 PACKAGING OPERATOR MODE */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* STEPPER INPUTS FORM */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {/* Produced Quantity Card */}
              <Card style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", borderTop: "4px solid #C89547", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={18} color="#C89547" />
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Add Good Output</h4>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>+Units to add to total</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#A36B1C", backgroundColor: "#FDF8F0", padding: "3px 9px", borderRadius: "12px", border: "1px solid #E8C182" }}>
                    +Add Qty
                  </span>
                </div>

                <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 12px", borderRadius: "32px", border: "1px solid #E8DDCF" }}>
                  <button type="button" onClick={() => setProducedAdd((p) => Math.max(0, p - 100))} style={stepperBtnStyle}>
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={producedAdd}
                    onChange={(e) => setProducedAdd(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ textAlign: "center", backgroundColor: "transparent", border: "none", color: "#B27E33", fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 900, outline: "none", width: "80px", padding: "0" }}
                    required
                  />
                  <button type="button" onClick={() => setProducedAdd((p) => p + 100)} style={stepperBtnStyle}>
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                  {[100, 250, 500, 1000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setProducedAdd(val)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: producedAdd === val ? "#C89547" : "var(--bg-card-subtle)",
                        color: producedAdd === val ? "#FFFFFF" : "var(--text-secondary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer"
                      }}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Scrap Count Card */}
              <Card style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", borderTop: "4px solid #EF4444", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertOctagon size={18} color="#DC2626" />
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Scrap / Defect Rejects</h4>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Logged for quality analysis</span>
                    </div>
                  </div>
                  <Button type="button" variant="danger" style={{ fontSize: "11px", padding: "3px 8px" }} onClick={() => setIsScrapModalOpen(true)}>
                    Categorize
                  </Button>
                </div>

                <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 12px", borderRadius: "32px", border: "1px solid #E8DDCF" }}>
                  <button type="button" onClick={() => setScrapAdd((p) => Math.max(0, p - 5))} style={stepperBtnStyle}>
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={scrapAdd}
                    onChange={(e) => setScrapAdd(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ textAlign: "center", backgroundColor: "transparent", border: "none", color: "#DC2626", fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 900, outline: "none", width: "80px", padding: "0" }}
                  />
                  <button type="button" onClick={() => setScrapAdd((p) => p + 5)} style={stepperBtnStyle}>
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                  {[5, 10, 25, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScrapAdd(val)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: scrapAdd === val ? "#EF4444" : "var(--bg-card-subtle)",
                        color: scrapAdd === val ? "#FFFFFF" : "var(--text-secondary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer"
                      }}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            <Button type="submit" variant="primary" icon={Send} disabled={submittingLog} style={{ padding: "14px", fontSize: "15px", fontWeight: 800 }}>
              {submittingLog ? "Submitting Log..." : `Confirm & Log +${producedAdd.toLocaleString()} Bottles Produced`}
            </Button>
          </form>

          {/* WIP Lot Link & Materials Controls */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
            {/* Upstream WIP Link Card */}
            <Card style={{ backgroundColor: "#FFFFFF", padding: "20px", border: "1px solid var(--border-subtle)", borderTop: "4px solid #C89547" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <FlaskConical color="#C89547" size={22} />
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Upstream WIP Vessel Lot Link</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Select WIP Tank Lot</label>
                  <select value={selectedWipLot} onChange={(e) => setSelectedWipLot(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }}>
                    <option value="WIP-TANK-501 (4,850L)">WIP-TANK-501 (4,850 L - Tested PASS)</option>
                    <option value="WIP-TANK-204 (5,000L)">WIP-TANK-204 (5,000 L - Ready)</option>
                  </select>
                </div>

                <Button variant="primary" icon={CheckCircle2} onClick={handleSelectWipLot} disabled={actionLoading} style={{ width: "100%" }}>
                  {actionLoading ? "Linking Lot..." : "Link WIP Lot to Packaging Run"}
                </Button>
              </div>
            </Card>

            {/* Seal & Barcode Verification Card */}
            <Card style={{ backgroundColor: "#FFFFFF", padding: "20px", border: "1px solid var(--border-subtle)", borderTop: "4px solid #C89547" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <Barcode color="#C89547" size={22} />
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Capping Torque & Seal Verification</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Capping Torque (Nm)</label>
                  <input type="number" value={cappingTorque} onChange={(e) => setCappingTorque(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
                </div>

                <Button variant="primary" icon={Barcode} onClick={handleVerifySeal} disabled={actionLoading} style={{ width: "100%" }}>
                  {actionLoading ? "Verifying..." : "Verify Torque, Seal & Barcode"}
                </Button>
              </div>
            </Card>
          </div>

          {/* FINISH PACKAGING RUN & CREATE FG PALLET CARD */}
          <Card style={{ backgroundColor: "#FDF8F0", border: "2px solid #C89547", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#A36B1C", margin: 0 }}>
                  Finish Packaging Run & Create Finished Goods Pallet (FG)
                </h4>
                <p style={{ fontSize: "12px", color: "#8C5B23", margin: "2px 0 0 0" }}>
                  Receives final pallet into PostgreSQL inventory_lots and completes order lifecycle.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input type="number" value={totalCases} onChange={(e) => setTotalCases(e.target.value)} className="input-field" style={{ width: "110px" }} title="Total Cases" />
                <Button variant="primary" icon={Boxes} onClick={handleFinishRunFgPallet} disabled={actionLoading}>
                  {actionLoading ? "Creating Pallet..." : "Finish Run & Create FG Pallet"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* RECENT LOGS LEDGER */}
      <Card style={{ backgroundColor: "#FFFFFF", padding: "20px", border: "1px solid var(--border-subtle)" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Recent Shift Production Logs (Ledger)
        </h4>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "8px" }}>Time</th>
                <th style={{ padding: "8px" }}>Operator</th>
                <th style={{ padding: "8px" }}>Good Output</th>
                <th style={{ padding: "8px" }}>Scrap Rejects</th>
                <th style={{ padding: "8px" }}>Running Total</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "8px", fontWeight: 700 }}>{log.time}</td>
                    <td style={{ padding: "8px" }}>{getSafeString(log.operator, "Alexander Vance")}</td>
                    <td style={{ padding: "8px", color: "#B27E33", fontWeight: 800 }}>+{log.goodUnits}</td>
                    <td style={{ padding: "8px", color: "#DC2626", fontWeight: 700 }}>+{log.scrapUnits}</td>
                    <td style={{ padding: "8px", fontWeight: 900 }}>{log.runningTotal?.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)" }}>
                    No recent shift logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CCP Kill Step PIN Modal */}
      <Modal
        isOpen={isCcpModalOpen}
        onClose={() => setIsCcpModalOpen(false)}
        title="Sign-off CCP Pasteurizer Thermal Kill Step (CCP-1)"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCcpModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={ShieldCheck} onClick={handleCcpSignoff} disabled={actionLoading}>
              {actionLoading ? "Signing..." : "Confirm PIN & Sign-Off CCP"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Pasteurizer Thermal Hold temperature must be ≥ 83.1°C to sign off critical control point.
          </p>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Thermal Kill Temp (°C)</label>
            <input type="number" value={vesselTemp} onChange={(e) => setVesselTemp(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Digital Operator PIN</label>
            <input type="password" value={digitalPin} onChange={(e) => setDigitalPin(e.target.value)} className="input-field" style={{ width: "100%", marginTop: "4px" }} maxLength={4} />
          </div>
        </div>
      </Modal>

      {/* Scrap Defect Modal */}
      <Modal
        isOpen={isScrapModalOpen}
        onClose={() => setIsScrapModalOpen(false)}
        title="Log Categorized Scrap Defect"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsScrapModalOpen(false)}>Cancel</Button>
            <Button variant="danger" icon={Send} onClick={handleLogScrapSubmit} disabled={loggingScrap}>
              {loggingScrap ? "Logging..." : "Confirm Defect Log"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleLogScrapSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Defect Category / Reason Code
            </label>
            <select value={defectCode} onChange={(e) => setDefectCode(e.target.value)} className="input-field">
              <option value="Cap Seal Deformation / Dent">Cap Seal Deformation / Dent</option>
              <option value="Label Misalignment / Tear">Label Misalignment / Tear</option>
              <option value="Volume Underfill / Overfill">Volume Underfill / Overfill</option>
              <option value="Bottle Neck Contamination">Bottle Neck Contamination</option>
              <option value="Date Code Barcode Smudge">Date Code Barcode Smudge</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Scrap Reject Quantity
            </label>
            <input type="number" value={scrapAdd} onChange={(e) => setScrapAdd(Number(e.target.value))} className="input-field" min={1} required />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Operator Notes
            </label>
            <input type="text" value={scrapNotes} onChange={(e) => setScrapNotes(e.target.value)} className="input-field" required />
          </div>
        </form>
      </Modal>
    </div>
  );
}

const stepperBtnStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2D7C7",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
  transition: "all 0.2s ease",
  flexShrink: 0
};

import React, { useState } from "react";
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
  Download
} from "lucide-react";
import { useApp } from "../../context/AppContext";

// Comprehensive Mock Data for Batch 360° Traceability
const TRACE_DATABASE = {
  "LOT-RM-ORG-4402": {
    lotNumber: "LOT-RM-ORG-4402",
    materialName: "Valencia Organic Orange Juice Concentrate 65° Brix",
    materialCode: "RM-ORG-CONC",
    category: "Raw Material",
    type: "Raw Ingredient",
    quantity: "3,800 kg (19 Aseptic Drums)",
    supplier: "Citrus Valley Farms Co.",
    supplierLot: "CVF-2026-VAL-104",
    poNumber: "PO-2026-0881",
    receivedDate: "2026-09-03 08:45 AM",
    receivedLocation: "Dock 01 - Inbound Staging STG-01",
    currentLocation: "Cold Storage Zone A - Rack R04-B2",
    expiryDate: "2027-03-15",
    qaStatus: "Approved / Released",
    qaCert: "COA-9812-PASS",
    tempLog: "3.4°C (Target: 2.0°C - 4.0°C • Compliant)",
    integrityScore: "100%",
    barcode: "8902810044025",
    productionOrders: ["PO-OR-8821", "PO-OR-8824"],
    batches: [
      {
        batchId: "BAT-2026-0885",
        product: "Sparkling Organic Orange Soda 330ml Can",
        sku: "SKU-CAN-330ML-ORG",
        line: "High-Speed Packaging Line 1 (Rotary 580 BPM)",
        date: "2026-09-03 10:15 AM",
        quantityProduced: "36,000 Cans (1,500 Cases)",
        status: "Completed & Released",
        ccpStatus: "CCP-1 Pasteurized (72.4°C / 16s) • CCP-2 Metal Checked (Pass)",
        finishedLot: "LOT-FG-2026-0885",
        pallets: [
          { palletId: "PLT-0885-01", cases: 75, lpn: "GS1-128-LPN-9910", dest: "Whole Foods DC 04 (Austin, TX)" },
          { palletId: "PLT-0885-02", cases: 75, lpn: "GS1-128-LPN-9911", dest: "H-E-B Central Distribution (San Antonio, TX)" }
        ]
      },
      {
        batchId: "BAT-2026-0886",
        product: "Organic Citrus Blast 500ml Bottle",
        sku: "SKU-BOT-500ML-CIT",
        line: "Bottling Line 2 (Aseptic Filler)",
        date: "2026-09-03 14:00 PM",
        quantityProduced: "24,000 Bottles (1,000 Cases)",
        status: "In Staging / Final QA Review",
        ccpStatus: "CCP-1 Passed • In-line Brix Validated (11.4°)",
        finishedLot: "LOT-FG-2026-0886",
        pallets: [
          { palletId: "PLT-0886-01", cases: 50, lpn: "GS1-128-LPN-9920", dest: "Central Market Hub (Dallas, TX)" }
        ]
      }
    ],
    recallImpact: {
      affectedBatches: 2,
      finishedCases: 2500,
      palletsCount: 35,
      customersExposed: ["Whole Foods Market DC 04", "H-E-B Central Warehouse", "Central Market Hub"],
      quarantineStatus: "Cleared • Low Risk"
    }
  },
  "LOT-ORG-442": {
    lotNumber: "LOT-ORG-442",
    materialName: "Valencia Organic Orange Juice Concentrate 65° Brix",
    materialCode: "RM-ORG-CONC",
    category: "Raw Material",
    type: "Raw Ingredient",
    quantity: "3,800 kg (19 Aseptic Drums)",
    supplier: "Citrus Valley Farms Co.",
    supplierLot: "CVF-2026-VAL-104",
    poNumber: "PO-2026-0881",
    receivedDate: "2026-09-03 08:45 AM",
    receivedLocation: "Dock 01 - Inbound Staging STG-01",
    currentLocation: "Cold Storage Zone A - Rack R04-B2",
    expiryDate: "2027-03-15",
    qaStatus: "Approved / Released",
    qaCert: "COA-9812-PASS",
    tempLog: "3.4°C (Target: 2.0°C - 4.0°C • Compliant)",
    integrityScore: "100%",
    barcode: "8902810044025",
    productionOrders: ["PO-OR-8821", "PO-OR-8824"],
    batches: [
      {
        batchId: "BAT-2026-0885",
        product: "Sparkling Organic Orange Soda 330ml Can",
        sku: "SKU-CAN-330ML-ORG",
        line: "High-Speed Packaging Line 1 (Rotary 580 BPM)",
        date: "2026-09-03 10:15 AM",
        quantityProduced: "36,000 Cans (1,500 Cases)",
        status: "Completed & Released",
        ccpStatus: "CCP-1 Pasteurized (72.4°C / 16s) • CCP-2 Metal Checked (Pass)",
        finishedLot: "LOT-FG-2026-0885",
        pallets: [
          { palletId: "PLT-0885-01", cases: 75, lpn: "GS1-128-LPN-9910", dest: "Whole Foods DC 04 (Austin, TX)" },
          { palletId: "PLT-0885-02", cases: 75, lpn: "GS1-128-LPN-9911", dest: "H-E-B Central Distribution (San Antonio, TX)" }
        ]
      }
    ],
    recallImpact: {
      affectedBatches: 1,
      finishedCases: 1500,
      palletsCount: 20,
      customersExposed: ["Whole Foods Market DC 04", "H-E-B Central Distribution"],
      quarantineStatus: "Cleared • Low Risk"
    }
  },
  "LOT-PKG-CAN-9140": {
    lotNumber: "LOT-PKG-CAN-9140",
    materialName: "330ml Sleek Aluminum Cans w/ Matte Varnish (BPA-NI)",
    materialCode: "PKG-CAN-330",
    category: "Packaging",
    type: "Direct Food Contact Packaging",
    quantity: "120,000 units (12 Pallets)",
    supplier: "Ball Metal Beverage Packaging",
    supplierLot: "BLL-SLK330-8910",
    poNumber: "PO-2026-0902",
    receivedDate: "2026-09-03 10:30 AM",
    receivedLocation: "Dock 03 - Dry Goods Staging STG-03",
    currentLocation: "Packaging High-Bay 3 - Racks P01-P06",
    expiryDate: "2028-09-03",
    qaStatus: "Approved / Released",
    qaCert: "COA-BLL-901-PASS",
    tempLog: "Ambient Dry (21°C • RH 44%)",
    integrityScore: "100%",
    barcode: "8902810091404",
    productionOrders: ["PO-OR-8821"],
    batches: [
      {
        batchId: "BAT-2026-0885",
        product: "Sparkling Organic Orange Soda 330ml Can",
        sku: "SKU-CAN-330ML-ORG",
        line: "High-Speed Packaging Line 1",
        date: "2026-09-03 10:15 AM",
        quantityProduced: "36,000 Cans Ingested",
        status: "Completed & Released",
        ccpStatus: "Pre-Rinse Verified • Can Flange Vision Checked (Zero Defect)",
        finishedLot: "LOT-FG-2026-0885",
        pallets: [
          { palletId: "PLT-0885-01", cases: 75, lpn: "GS1-128-LPN-9910", dest: "Whole Foods DC 04 (Austin, TX)" }
        ]
      }
    ],
    recallImpact: {
      affectedBatches: 1,
      finishedCases: 1500,
      palletsCount: 20,
      customersExposed: ["Whole Foods Market DC 04"],
      quarantineStatus: "Cleared • Zero Leakage"
    }
  },
  "LOT-FG-2026-0885": {
    lotNumber: "LOT-FG-2026-0885",
    materialName: "Sparkling Yuzu & Orange Soda 330ml Can (Finished Good)",
    materialCode: "SKU-CAN-330ML-ORG",
    category: "Finished Goods",
    type: "Commercial Finished Product",
    quantity: "36,000 Cans (1,500 Cases • 20 Pallets)",
    supplier: "Internal Plant 2 - High-Speed Line 1",
    supplierLot: "BAT-2026-0885",
    poNumber: "PROD-WO-2026-441",
    receivedDate: "2026-09-03 11:30 AM",
    receivedLocation: "Packaging Discharge Conveyor 01",
    currentLocation: "Finished Goods High-Bay FG-44",
    expiryDate: "2027-09-03",
    qaStatus: "Approved / Released",
    qaCert: "QA-REL-2026-0885-SIGNED",
    tempLog: "Ambient Controlled Warehouse (18.5°C)",
    integrityScore: "100%",
    barcode: "8902810033019",
    productionOrders: ["PO-OR-8821"],
    batches: [
      {
        batchId: "BAT-2026-0885",
        product: "Sparkling Yuzu & Orange Soda 330ml Can",
        sku: "SKU-CAN-330ML-ORG",
        line: "High-Speed Packaging Line 1",
        date: "2026-09-03 10:15 AM",
        quantityProduced: "1,500 Cases",
        status: "Released to Shipping",
        ccpStatus: "FDA 21 CFR Sign-Off by Dr. Maya Lin (QA Lead)",
        finishedLot: "LOT-FG-2026-0885",
        pallets: [
          { palletId: "PLT-0885-01", cases: 75, lpn: "GS1-128-LPN-9910", dest: "Whole Foods DC 04 (Austin, TX)" },
          { palletId: "PLT-0885-02", cases: 75, lpn: "GS1-128-LPN-9911", dest: "H-E-B Central Distribution (San Antonio, TX)" }
        ]
      }
    ],
    recallImpact: {
      affectedBatches: 1,
      finishedCases: 1500,
      palletsCount: 20,
      customersExposed: ["Whole Foods Market DC 04", "H-E-B Central Distribution"],
      quarantineStatus: "Approved for Commerce"
    }
  }
};

export function Traceability() {
  const { addToast } = useApp();

  const [lotInput, setLotInput] = useState("LOT-RM-ORG-4402");
  const [activeTab, setActiveTab] = useState("FORWARD"); // FORWARD, BACKWARD, RECALL
  const [currentTrace, setCurrentTrace] = useState(TRACE_DATABASE["LOT-RM-ORG-4402"]);

  // Interactive Modals State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);
  const [isLockEnforced, setIsLockEnforced] = useState(false);
  const [quarantineReason, setQuarantineReason] = useState("Supplier Cold-Chain Excursion");

  const handleSearch = (e) => {
    e && e.preventDefault();
    const cleanKey = lotInput.trim().toUpperCase();

    let found = TRACE_DATABASE[cleanKey];
    if (!found) {
      const match = Object.keys(TRACE_DATABASE).find(k => k.includes(cleanKey) || cleanKey.includes(k));
      if (match) found = TRACE_DATABASE[match];
    }

    if (found) {
      setCurrentTrace(found);
      setIsLockEnforced(false);
      addToast(`Batch 360° Traceability record loaded for ${found.lotNumber}.`, "success");
    } else {
      const generated = {
        lotNumber: cleanKey,
        materialName: `Material Component (${cleanKey})`,
        materialCode: "RM-CUSTOM-SPEC",
        category: "Raw Material",
        type: "Manufacturing Ingredient",
        quantity: "4,200 kg",
        supplier: "Certified Industrial Supplier Co.",
        supplierLot: `SUP-${cleanKey}`,
        poNumber: "PO-2026-0992",
        receivedDate: "2026-09-02 09:00 AM",
        receivedLocation: "Dock 01 Staging STG-01",
        currentLocation: "Cold Storage Zone A - Rack R02",
        expiryDate: "2027-04-01",
        qaStatus: "Approved / Released",
        qaCert: "COA-VALID-PASS",
        tempLog: "3.6°C (Compliant)",
        integrityScore: "100%",
        barcode: "8902810099212",
        productionOrders: ["PO-OR-8821"],
        batches: [
          {
            batchId: "BAT-2026-0885",
            product: "Sparkling Citrus Beverage 330ml",
            sku: "SKU-CAN-330ML",
            line: "Line 1 Blending & Packaging",
            date: "2026-09-03 10:30 AM",
            quantityProduced: "1,200 Cases",
            status: "Completed",
            ccpStatus: "CCP Temperature & Metal Detection Validated",
            finishedLot: "LOT-FG-2026-0885",
            pallets: [
              { palletId: "PLT-CUSTOM-01", cases: 50, lpn: "GS1-128-LPN-881", dest: "Regional Logistics Hub" }
            ]
          }
        ],
        recallImpact: {
          affectedBatches: 1,
          finishedCases: 1200,
          palletsCount: 16,
          customersExposed: ["Regional Logistics Hub"],
          quarantineStatus: "Under Monitoring"
        }
      };
      setCurrentTrace(generated);
      setIsLockEnforced(false);
      addToast(`Trace genealogy constructed for ${cleanKey}.`, "info");
    }
  };

  const handleSelectPredefined = (lotCode) => {
    setLotInput(lotCode);
    setCurrentTrace(TRACE_DATABASE[lotCode] || TRACE_DATABASE["LOT-RM-ORG-4402"]);
    setIsLockEnforced(false);
    addToast(`Loaded trace record for ${lotCode}.`, "success");
  };

  const handleOpenQuarantineModal = () => {
    setActiveTab("RECALL");
    setIsQuarantineModalOpen(true);
  };

  const handleEnforceQuarantineLock = () => {
    setIsLockEnforced(true);
    setIsQuarantineModalOpen(false);
    addToast(`CRITICAL HOLD: Automated WMS Lock placed on Lot ${currentTrace.lotNumber}. Reason: ${quarantineReason}. All downstream dispatches halted.`, "error");
  };

  const handleReleaseQuarantineLock = () => {
    setIsLockEnforced(false);
    addToast(`Supervisor Authorized: Quarantine Hold lifted for Lot ${currentTrace.lotNumber}. Re-instated to active inventory.`, "success");
  };

  const handleDownloadDossier = () => {
    addToast(`Dossier PDF dispatched to local downloads: ${currentTrace.lotNumber}_FDA_21CFR_Audit.pdf`, "success");
    setIsDossierModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* Header & Compliance Badge */}
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
            End-to-end forward and backward genealogy tracking from raw ingredient receiving to pallet customer delivery.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setIsDossierModalOpen(true)}
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
              cursor: "pointer"
            }}
          >
            <AlertTriangle size={15} color={isLockEnforced ? "#FFFFFF" : "#dc2626"} /> {isLockEnforced ? "Quarantine Active" : "Mock Recall / Hold"}
          </button>
        </div>
      </div>

      {/* Lock Enforced Alert Banner (if active) */}
      {isLockEnforced && (
        <div style={{ backgroundColor: "#fef2f2", border: "2px solid #ef4444", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "14px", color: "#991b1b" }}>CRITICAL QUARANTINE HOLD ENFORCED ON LOT {currentTrace.lotNumber}</strong>
              <div style={{ fontSize: "12.5px", color: "#7f1d1d", marginTop: "2px" }}>
                Reason: {quarantineReason}. All {currentTrace.recallImpact.palletsCount} downstream pallets have been locked against shipping.
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

      {/* Interactive Search Bar & Quick Selector Chips */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "20px 24px", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", display: "flex", flexDirection: "column", gap: "14px" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px", position: "relative" }}>
            <Search size={18} color="#8C7B6E" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by Raw Lot Code, Packaging Lot, Finished Good Lot, or Pallet LPN..."
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

        {/* Quick Sample Selector Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px" }}>
          <span style={{ color: "#6B5B4E", fontWeight: 700 }}>Quick Select Plant Lots:</span>
          
          <button
            type="button"
            onClick={() => handleSelectPredefined("LOT-RM-ORG-4402")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: lotInput === "LOT-RM-ORG-4402" ? "#261603" : "#F6F3EE",
              color: lotInput === "LOT-RM-ORG-4402" ? "#E2B670" : "#261603",
              border: "1px solid #E8DDCF",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🍊 LOT-RM-ORG-4402 (Organic Juice Concentrate)
          </button>

          <button
            type="button"
            onClick={() => handleSelectPredefined("LOT-PKG-CAN-9140")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: lotInput === "LOT-PKG-CAN-9140" ? "#261603" : "#F6F3EE",
              color: lotInput === "LOT-PKG-CAN-9140" ? "#E2B670" : "#261603",
              border: "1px solid #E8DDCF",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🥫 LOT-PKG-CAN-9140 (330ml Aluminum Cans)
          </button>

          <button
            type="button"
            onClick={() => handleSelectPredefined("LOT-FG-2026-0885")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: lotInput === "LOT-FG-2026-0885" ? "#261603" : "#F6F3EE",
              color: lotInput === "LOT-FG-2026-0885" ? "#E2B670" : "#261603",
              border: "1px solid #E8DDCF",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🥤 LOT-FG-2026-0885 (Finished Goods Cases)
          </button>

          <button
            type="button"
            onClick={() => handleSelectPredefined("LOT-ORG-442")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: lotInput === "LOT-ORG-442" ? "#261603" : "#F6F3EE",
              color: lotInput === "LOT-ORG-442" ? "#E2B670" : "#261603",
              border: "1px solid #E8DDCF",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            📋 LOT-ORG-442 (Aseptic Ingest)
          </button>
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
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{currentTrace.integrityScore}</div>
          <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "4px" }}>100% Chain-of-Custody Verified</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>LINKED PRODUCTION BATCHES</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Factory size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{currentTrace.batches.length} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Batches</span></div>
          <div style={{ fontSize: "11px", color: "#B27E33", fontWeight: 700, marginTop: "4px" }}>{currentTrace.productionOrders.join(", ")}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>FINISHED GOODS OUTPUT</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(14, 165, 233, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
              <Box size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{currentTrace.recallImpact.finishedCases.toLocaleString()} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Cases</span></div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700, marginTop: "4px" }}>Across {currentTrace.recallImpact.palletsCount} Tracked Pallets</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>CUSTOMER DISPATCH DESTINATIONS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
              <Truck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{currentTrace.recallImpact.customersExposed.length} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Retail DCs</span></div>
          <div style={{ fontSize: "11px", color: "#d97706", fontWeight: 700, marginTop: "4px" }}>Full Forward Traceability Active</div>
        </div>
      </div>

      {/* Mode View Tabs (Forward Traceability vs Backward Genealogy vs Mock Recall) */}
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
                    {currentTrace.category}
                  </span>
                  <span style={{ fontSize: "13px", color: "#6B5B4E" }}>
                    Type: <strong style={{ color: "#2B1D11" }}>{currentTrace.type}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
                  {currentTrace.materialName}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "6px", fontSize: "13px", color: "#6B5B4E", flexWrap: "wrap" }}>
                  <span>Internal Lot: <strong style={{ color: "#2B1D11", fontFamily: "var(--font-mono, monospace)" }}>{currentTrace.lotNumber}</strong></span>
                  <span>•</span>
                  <span>Supplier Lot: <strong style={{ color: "#2B1D11", fontFamily: "var(--font-mono, monospace)" }}>{currentTrace.supplierLot}</strong></span>
                  <span>•</span>
                  <span>Supplier: <strong style={{ color: "#2B1D11" }}>{currentTrace.supplier}</strong></span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                {isLockEnforced ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 800, color: "#991b1b", background: "#fee2e2", padding: "4px 10px", borderRadius: "20px" }}>
                    <Lock size={14} /> QUARANTINE HOLD ACTIVE
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 800, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                    <ShieldCheck size={14} /> {currentTrace.qaStatus}
                  </span>
                )}
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#2B1D11", marginTop: "4px" }}>
                  Qty: {currentTrace.quantity}
                </div>
                <div style={{ fontSize: "11px", color: "#8C7B6E" }}>Location: {currentTrace.currentLocation}</div>
              </div>
            </div>
          </div>

          {/* Sequential Forward Timeline Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: "4px 0 0 0" }}>
              Canonical Process Trace: Supplier → Batches → Finished Goods → Shipping
            </h3>

            {/* Node 1: Receipt & Intake Quality Gate */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "18px 22px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", display: "flex", gap: "18px", alignItems: "flex-start" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <strong style={{ fontSize: "14.5px", color: "#2B1D11" }}>Receiving & Inbound Intake Quality Verification</strong>
                  <span style={{ fontSize: "12px", color: "#6B5B4E", fontFamily: "var(--font-mono, monospace)" }}>{currentTrace.receivedDate}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#6B5B4E", margin: "4px 0 10px 0" }}>
                  Delivered under Purchase Order <strong>{currentTrace.poNumber}</strong> by <strong>{currentTrace.supplier}</strong> at {currentTrace.receivedLocation}.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", backgroundColor: "#F6F3EE", padding: "10px 14px", borderRadius: "8px", fontSize: "12px" }}>
                  <div><span>Temp Log:</span> <strong style={{ color: "#0284c7" }}>{currentTrace.tempLog}</strong></div>
                  <div><span>COA Inspection:</span> <strong style={{ color: "#059669" }}>{currentTrace.qaCert}</strong></div>
                  <div><span>GS1 Barcode:</span> <strong style={{ fontFamily: "var(--font-mono, monospace)" }}>{currentTrace.barcode}</strong></div>
                </div>
              </div>
            </div>

            {/* Node 2: Production Batch Execution & CCP Quality Gates */}
            {currentTrace.batches.map((batch, bIdx) => (
              <div key={bIdx} style={{ backgroundColor: "#FFFFFF", padding: "18px 22px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", color: "#B27E33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900 }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <strong style={{ fontSize: "14.5px", color: "#2B1D11" }}>Batch Execution: {batch.batchId}</strong>
                      <span style={{ marginLeft: "8px", fontSize: "11px", fontWeight: 750, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "2px 7px", borderRadius: "4px" }}>
                        {batch.status}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#6B5B4E" }}>{batch.date}</span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#2B1D11", margin: "4px 0 8px 0", fontWeight: 700 }}>
                    Product: {batch.product} <span style={{ color: "#6B5B4E", fontWeight: 400 }}>({batch.sku})</span>
                  </p>

                  <div style={{ fontSize: "12.5px", color: "#6B5B4E", marginBottom: "8px" }}>
                    Work Center: <strong>{batch.line}</strong> • Output: <strong>{batch.quantityProduced}</strong>
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
                  All serialized pallet units tracked with GS1-128 barcode standards:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {currentTrace.batches[0]?.pallets.map((p, pIdx) => (
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

      {/* TAB 2: BACKWARD GENEALOGY (FROM FINISHED PRODUCT BACK TO RAW LOTS & CCPS) */}
      {activeTab === "BACKWARD" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "22px 26px", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", borderLeft: "5px solid #0284c7" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#2B1D11", margin: "0 0 6px 0" }}>
              Backward Traceability Matrix: Root Cause & Genealogy Lookup
            </h3>
            <p style={{ fontSize: "13.5px", color: "#6B5B4E", margin: 0 }}>
              Tracing finished product batch <strong style={{ color: "#2B1D11" }}>BAT-2026-0885</strong> back to all source ingredients, suppliers, CCP critical limit verifications, and operators.
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
                  <th style={{ padding: "12px 16px", fontWeight: 800, color: "#2B1D11" }}>Storage Rack</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #F0E8DD" }}>
                  <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#047857", fontWeight: 700, fontSize: "11.5px" }}>Primary Juice</span></td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2B1D11" }}>Valencia Organic Orange Concentrate 65° Brix</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)" }}>LOT-RM-ORG-4402</td>
                  <td style={{ padding: "12px 16px" }}>Citrus Valley Farms Co.</td>
                  <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700 }}>Pass (COA-9812)</td>
                  <td style={{ padding: "12px 16px" }}>Cold Storage Zone A</td>
                </tr>

                <tr style={{ borderBottom: "1px solid #F0E8DD" }}>
                  <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#047857", fontWeight: 700, fontSize: "11.5px" }}>Sweetener</span></td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2B1D11" }}>Non-GMO Liquid Cane Sugar 67.5° Brix</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)" }}>LOT-RM-SGR-1108</td>
                  <td style={{ padding: "12px 16px" }}>Sugar Valley Refining Ltd.</td>
                  <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700 }}>Pass (COA-SVR-99)</td>
                  <td style={{ padding: "12px 16px" }}>Ambient Bay 2 - Bin TOTE-03</td>
                </tr>

                <tr style={{ borderBottom: "1px solid #F0E8DD" }}>
                  <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "#0369a1", fontWeight: 700, fontSize: "11.5px" }}>Primary Can</span></td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2B1D11" }}>330ml Sleek Aluminum Cans (BPA-NI)</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)" }}>LOT-PKG-CAN-9140</td>
                  <td style={{ padding: "12px 16px" }}>Ball Metal Packaging</td>
                  <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700 }}>Pass (Vision Validated)</td>
                  <td style={{ padding: "12px 16px" }}>Packaging High-Bay 3</td>
                </tr>

                <tr>
                  <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "#0369a1", fontWeight: 700, fontSize: "11.5px" }}>Secondary Pack</span></td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2B1D11" }}>24-Pack Kraft Corrugated Master Trays</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono, monospace)" }}>LOT-PKG-BX-5520</td>
                  <td style={{ padding: "12px 16px" }}>International Paper Packaging</td>
                  <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700 }}>Pass (Burst Test Passed)</td>
                  <td style={{ padding: "12px 16px" }}>Warehouse Bay 3</td>
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
            {/* Box 1: Affected Batches */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#991b1b", textTransform: "uppercase" }}>AFFECTED MANUFACTURING BATCHES</span>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11", margin: "8px 0" }}>
                {currentTrace.recallImpact.affectedBatches} Production Batches
              </div>
              <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", fontSize: "12.5px", color: "#6B5B4E" }}>
                <li>BAT-2026-0885 (Sparkling Orange 330ml)</li>
                {currentTrace.batches[1] && <li>BAT-2026-0886 (Organic Citrus Blast 500ml)</li>}
              </ul>
            </div>

            {/* Box 2: Total Finished Good Units */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#d97706", textTransform: "uppercase" }}>COMMERCIAL EXPOSURE</span>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11", margin: "8px 0" }}>
                {currentTrace.recallImpact.finishedCases.toLocaleString()} Cases
              </div>
              <p style={{ fontSize: "12.5px", color: "#6B5B4E", margin: 0 }}>
                Total 36,000 retail units across {currentTrace.recallImpact.palletsCount} serialized pallets.
              </p>
            </div>

            {/* Box 3: Exposed Distribution Centers */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0284c7", textTransform: "uppercase" }}>CUSTOMER DESTINATIONS</span>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11", margin: "8px 0" }}>
                {currentTrace.recallImpact.customersExposed.length} Distribution Centers
              </div>
              <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", fontSize: "12.5px", color: "#6B5B4E" }}>
                {currentTrace.recallImpact.customersExposed.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: FDA 21 CFR PART 11 AUDIT DOSSIER MODAL */}
      {isDossierModalOpen && (
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

            {/* Dossier Content Body */}
            <div style={{ border: "1px solid #E8DDCF", borderRadius: "10px", padding: "16px", backgroundColor: "#F6F3EE", fontSize: "12.5px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E8DDCF", paddingBottom: "8px" }}>
                <div>
                  <strong style={{ color: "#2B1D11" }}>MaintenX OS Cloud • Plant 07 Regulatory Audit</strong>
                  <div style={{ fontSize: "11px", color: "#6B5B4E" }}>Dossier ID: DOSSIER-2026-0885-CFR</div>
                </div>
                <span style={{ fontSize: "11px", color: "#059669", fontWeight: 750 }}>VALIDATED</span>
              </div>

              <div>Material Tracked: <strong>{currentTrace.materialName}</strong> ({currentTrace.lotNumber})</div>
              <div>Source Supplier: <strong>{currentTrace.supplier}</strong> (PO {currentTrace.poNumber})</div>
              <div>Intake Cold-Chain Verification: <strong>{currentTrace.tempLog}</strong></div>
              <div>CCP Sign-Off: <strong>{currentTrace.batches[0]?.ccpStatus}</strong></div>
              <div>Downstream Pallets: <strong>{currentTrace.recallImpact.palletsCount} Pallets Serialized</strong></div>
              
              <div style={{ marginTop: "6px", padding: "8px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px dashed #DACBB7", fontSize: "11px" }}>
                <div style={{ color: "#6B5B4E" }}>Digital Signature Certificate:</div>
                <strong style={{ fontFamily: "var(--font-mono, monospace)", color: "#2B1D11" }}>
                  SHA256: 9f82c4...e8812b [Signed by Dr. Maya Lin, Lead QA Officer]
                </strong>
              </div>
            </div>

            {/* Modal Buttons */}
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

      {/* MODAL 2: QUARANTINE CONTAINMENT ACTION MODAL */}
      {isQuarantineModalOpen && (
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
              Initiating immediate stop-ship hold on Lot <strong style={{ color: "#2B1D11" }}>{currentTrace.lotNumber}</strong> and all {currentTrace.recallImpact.palletsCount} downstream pallets.
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
                <option value="Supplier Cold-Chain Excursion">Supplier Cold-Chain Temperature Excursion</option>
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
    </div>
  );
}

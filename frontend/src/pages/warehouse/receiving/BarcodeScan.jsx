import React, { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  Camera,
  QrCode,
  Barcode,
  Scan,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Box,
  Truck,
  ArrowRight,
  Printer,
  Download,
  RefreshCw,
  Volume2,
  VolumeX,
  Sliders,
  Keyboard,
  FileText,
  Check,
  Eye,
  ArrowDownToLine,
  Search,
  Filter,
  Layers,
  Tag,
  Copy,
  Zap,
  Radio,
  Flame,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";

export function BarcodeScan() {
  const { addToast } = useApp();
  const { addLot } = useInventory();

  // Scanner State
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [isLpnModalOpen, setIsLpnModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [symbologyFilter, setSymbologyFilter] = useState("ALL");

  const inputRef = useRef(null);

  // Audio Beep generator using Web Audio API
  const playScanBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2100, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // AudioContext blocked or not allowed in browser
    }
  };

  // Sample Presets for Realistic Warehouse Scans
  const presetSamples = [
    {
      id: "PRESET-1",
      name: "Orange Concentrate (GS1-128)",
      symbology: "GS1-128",
      rawBarcode: "(01)00890281940212(10)LOT-RM-ORG-4402(17)261231(21)SN-9814420(3102)004500(400)PO-SUP-2026-441",
      gtin: "00890281940212",
      lotCode: "LOT-RM-ORG-4402",
      serialNo: "SN-9814420",
      materialName: "Valencia Organic Orange Concentrate 65° Brix",
      category: "Raw Material (Cold Chain)",
      supplier: "Citrus Valley Farms Co.",
      poNumber: "PO-SUP-2026-441",
      quantity: "4,500 kg (6 Drums)",
      qtyNum: 4500,
      unit: "kg",
      dockBay: "Dock Bay 01",
      tempCheck: "3.2°C (Optimal Cold Chain)",
      targetBin: "Cold Zone A - Rack R04-B2",
      expiryDate: "2026-12-31",
      qaStatus: "CoA Verified - PASSED",
      confidence: "99.8%"
    },
    {
      id: "PRESET-2",
      name: "PET Preforms (SSCC-18 Pallet)",
      symbology: "SSCC-18",
      rawBarcode: "(00)308902810091402218(01)00890281940502(10)LOT-PKG-CAN-9140(400)PO-SUP-2026-446",
      gtin: "00890281940502",
      lotCode: "LOT-PKG-CAN-9140",
      serialNo: "SSCC-308902810091402218",
      materialName: "500ml Clear PET Preforms (28mm PCO)",
      category: "Packaging Material",
      supplier: "Amcor Rigid Packaging",
      poNumber: "PO-SUP-2026-446",
      quantity: "120,000 units (12 Pallets)",
      qtyNum: 120000,
      unit: "units",
      dockBay: "Dock Bay 04",
      tempCheck: "Ambient (Dry)",
      targetBin: "Packaging Bay 3 - Racks P01-P06",
      expiryDate: "2028-09-01",
      qaStatus: "CoA Verified - PASSED",
      confidence: "99.9%"
    },
    {
      id: "PRESET-3",
      name: "Liquid Cane Sugar (GS1 DataMatrix)",
      symbology: "DataMatrix",
      rawBarcode: "(01)00890281940809(10)LOT-RM-SGR-1108(17)270630(3102)006000(400)PO-SUP-2026-447",
      gtin: "00890281940809",
      lotCode: "LOT-RM-SGR-1108",
      serialNo: "SN-SGR-88402",
      materialName: "Non-GMO Liquid Cane Sugar 67.5° Brix",
      category: "Raw Material",
      supplier: "Dominion Cane Sugars",
      poNumber: "PO-SUP-2026-447",
      quantity: "6,000 L (5 Totes)",
      qtyNum: 6000,
      unit: "L",
      dockBay: "Dock Bay 02",
      tempCheck: "Ambient (20.5°C)",
      targetBin: "Ambient Bay 2 - Bin G-12",
      expiryDate: "2027-06-30",
      qaStatus: "CoA Verified - PASSED",
      confidence: "99.7%"
    },
    {
      id: "PRESET-4",
      name: "Aluminum Cans 330ml (SSCC-18)",
      symbology: "SSCC-18",
      rawBarcode: "(00)308902810091402301(10)LOT-PKG-BX-5520(400)PO-SUP-2026-448",
      gtin: "00890281940901",
      lotCode: "LOT-PKG-BX-5520",
      serialNo: "SSCC-308902810091402301",
      materialName: "330ml Sleek Aluminum Cans + 202 CDL Ends",
      category: "Packaging Material",
      supplier: "Crown Packaging Canada",
      poNumber: "PO-SUP-2026-448",
      quantity: "150,000 cans (15 Plts)",
      qtyNum: 150000,
      unit: "cans",
      dockBay: "Dock Bay 03",
      tempCheck: "Dry Clean Storage",
      targetBin: "Packaging Bay 1 - Bin K-04",
      expiryDate: "2029-01-15",
      qaStatus: "CoA Verified - PASSED",
      confidence: "99.9%"
    },
    {
      id: "PRESET-5",
      name: "Filling Valve Kit (2D QR Code)",
      symbology: "QR Code",
      rawBarcode: "(01)00890281940991(10)LOT-SP-KRN-8812(21)SN-KRN-4401(400)PO-SUP-2026-449",
      gtin: "00890281940991",
      lotCode: "LOT-SP-KRN-8812",
      serialNo: "SN-KRN-4401",
      materialName: "Filling Valve Seal Overhaul Kit (EPDM Food Grade)",
      category: "Maintenance MRO Spare",
      supplier: "Krones OEM Spare Parts",
      poNumber: "PO-SUP-2026-449",
      quantity: "8 Overhaul Kits",
      qtyNum: 8,
      unit: "kits",
      dockBay: "Dock Bay 03",
      tempCheck: "Clean Storage",
      targetBin: "Spare Parts Cage - Shelf S-02",
      expiryDate: "2028-12-31",
      qaStatus: "OEM Certified - PASSED",
      confidence: "100%"
    }
  ];

  // Scanned History Logs
  const [scanHistory, setScanHistory] = useState([
    {
      id: "SCN-1092",
      time: "12:14:22 PM",
      symbology: "GS1-128",
      rawCode: "(01)00890281940212(10)LOT-RM-ORG-4402(17)261231(400)PO-SUP-2026-441",
      lotCode: "LOT-RM-ORG-4402",
      materialName: "Valencia Organic Orange Concentrate",
      supplier: "Citrus Valley Farms Co.",
      poNumber: "PO-SUP-2026-441",
      quantity: "4,500 kg",
      dockBay: "Dock Bay 01",
      qaStatus: "PASSED",
      wmsStatus: "Ingested"
    },
    {
      id: "SCN-1091",
      time: "11:50:04 AM",
      symbology: "SSCC-18",
      rawCode: "(00)308902810091402218(10)LOT-PKG-CAN-9140(400)PO-SUP-2026-446",
      lotCode: "LOT-PKG-CAN-9140",
      materialName: "500ml PET Bottles",
      supplier: "Amcor Rigid Packaging",
      poNumber: "PO-SUP-2026-446",
      quantity: "120,000 units",
      dockBay: "Dock Bay 04",
      qaStatus: "PASSED",
      wmsStatus: "Ingested"
    },
    {
      id: "SCN-1090",
      time: "10:32:18 AM",
      symbology: "DataMatrix",
      rawCode: "(01)00890281940809(10)LOT-RM-SGR-1108(400)PO-SUP-2026-447",
      lotCode: "LOT-RM-SGR-1108",
      materialName: "Liquid Cane Sugar 67.5° Brix",
      supplier: "Dominion Cane Sugars",
      poNumber: "PO-SUP-2026-447",
      quantity: "6,000 L",
      dockBay: "Dock Bay 02",
      qaStatus: "PASSED",
      wmsStatus: "Ingested"
    }
  ]);

  // Set first preset as active on initial mount so screen is never blank!
  useEffect(() => {
    if (!scannedData) {
      setScannedData(presetSamples[0]);
    }
  }, []);

  // Execute a Scan Simulation or Manual Parse
  const triggerScan = (preset = null) => {
    const selected = preset || presetSamples[Math.floor(Math.random() * presetSamples.length)];
    setScanning(true);

    setTimeout(() => {
      setScanning(false);
      setScannedData(selected);
      playScanBeep();

      const newScanLog = {
        id: `SCN-${Math.floor(1093 + scanHistory.length)}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        symbology: selected.symbology,
        rawCode: selected.rawBarcode,
        lotCode: selected.lotCode,
        materialName: selected.materialName,
        supplier: selected.supplier,
        poNumber: selected.poNumber,
        quantity: selected.quantity,
        dockBay: selected.dockBay,
        qaStatus: "PASSED",
        wmsStatus: "Scanned"
      };

      setScanHistory((prev) => [newScanLog, ...prev]);
      addToast(`Decoded ${selected.symbology}: ${selected.lotCode} (${selected.materialName})`, "success");
    }, 600);
  };

  // Handle Manual Barcode Submit (Handheld scanner gun or manual keyboard input)
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    // Search existing preset or construct custom
    const match = presetSamples.find(
      (p) =>
        p.lotCode.toLowerCase().includes(manualInput.toLowerCase()) ||
        p.rawBarcode.toLowerCase().includes(manualInput.toLowerCase()) ||
        p.poNumber.toLowerCase().includes(manualInput.toLowerCase())
    );

    if (match) {
      triggerScan(match);
    } else {
      const customItem = {
        id: `CUSTOM-${Date.now()}`,
        name: `Custom Inbound Item (${manualInput})`,
        symbology: manualInput.startsWith("(00)") ? "SSCC-18" : manualInput.startsWith("(01)") ? "GS1-128" : "Code 128",
        rawBarcode: manualInput,
        gtin: "00890281949999",
        lotCode: manualInput.startsWith("LOT-") ? manualInput : `LOT-INB-${manualInput.slice(0, 8)}`,
        serialNo: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        materialName: "Direct Gate Inbound Material Lot",
        category: "Raw Material",
        supplier: "Vendor Direct Logistics",
        poNumber: "PO-SUP-2026-AUTO",
        quantity: "1,000 units",
        qtyNum: 1000,
        unit: "units",
        dockBay: "Dock Bay 01",
        tempCheck: "Ambient Inspected",
        targetBin: "Ambient Bay 1 - Bin A-02",
        expiryDate: "2027-12-31",
        qaStatus: "CoA Verified - PASSED",
        confidence: "99.5%"
      };
      triggerScan(customItem);
    }
    setManualInput("");
  };

  // Ingest Lot into live Inventory Context
  const handleIngestIntoWms = () => {
    if (!scannedData) return;

    addLot({
      lotNumber: scannedData.lotCode,
      materialCode: scannedData.gtin || "RM-GEN-01",
      materialName: scannedData.materialName,
      category: scannedData.category,
      quantity: scannedData.qtyNum || 1000,
      unit: scannedData.unit || "kg",
      location: scannedData.targetBin,
      supplier: scannedData.supplier,
      supplierLot: scannedData.serialNo,
      qaStatus: "Released",
      barcode: scannedData.rawBarcode
    });

    // Update history log status
    setScanHistory((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, wmsStatus: "Ingested" } : s))
    );

    addToast(`Lot ${scannedData.lotCode} officially ingested into WMS & allocated to ${scannedData.targetBin}!`, "success");
  };

  // Export Scan Log to CSV
  const handleExportCsv = () => {
    const headers = ["Scan ID", "Time", "Symbology", "Lot Number", "Material Name", "Supplier", "PO Number", "Quantity", "Dock Bay", "QA Status", "WMS Status"];
    const rows = scanHistory.map((s) => [
      s.id,
      s.time,
      s.symbology,
      s.lotCode,
      `"${s.materialName}"`,
      `"${s.supplier}"`,
      s.poNumber,
      `"${s.quantity}"`,
      s.dockBay,
      s.qaStatus,
      s.wmsStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wms_inbound_scans_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Scan history exported to CSV.", "info");
  };

  // Filter history
  const filteredHistory = scanHistory.filter((item) => {
    const matchesSearch =
      item.lotCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.materialName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.poNumber.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesSymbology = symbologyFilter === "ALL" || item.symbology === symbologyFilter;
    return matchesSearch && matchesSymbology;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", minWidth: 0 }}>
      {/* Laser Scanning CSS Animation Styles */}
      <style>{`
        @keyframes laserMove {
          0% { top: 8%; opacity: 0.7; }
          50% { top: 88%; opacity: 1; }
          100% { top: 8%; opacity: 0.7; }
        }
        @keyframes laserGlow {
          0% { box-shadow: 0 0 12px #EF4444, 0 0 24px rgba(239, 68, 68, 0.6); }
          50% { box-shadow: 0 0 20px #EF4444, 0 0 36px rgba(239, 68, 68, 0.9); }
          100% { box-shadow: 0 0 12px #EF4444, 0 0 24px rgba(239, 68, 68, 0.6); }
        }
        @keyframes reticlePulse {
          0% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); opacity: 0.85; }
        }
        .scanner-hud-reticle {
          animation: reticlePulse 3s infinite ease-in-out;
        }
      `}</style>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", width: "100%" }}>
        <div style={{ minWidth: "260px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
              Inbound Barcode & QR Receiving Scanner
            </h1>
            <Badge variant="amber">WMS OPTICAL DECODER</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", marginBottom: 0 }}>
            High-speed optical and laser symbology decoder for GS1-128, SSCC-18 pallet tags, and 2D DataMatrix with instant ERP ingestion.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Audio Beep Toggle */}
          <Button
            variant={soundEnabled ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              addToast(`Scanner audio feedback ${!soundEnabled ? "Enabled" : "Disabled"}.`, "info");
            }}
            title={soundEnabled ? "Mute scan beep" : "Unmute scan beep"}
          >
            {soundEnabled ? <Volume2 size={16} color="#10B981" /> : <VolumeX size={16} color="var(--text-muted)" />}
            <span style={{ fontSize: "12px" }}>{soundEnabled ? "Audio On" : "Muted"}</span>
          </Button>

          {/* Continuous Scan Toggle */}
          <Button
            variant={continuousMode ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setContinuousMode(!continuousMode);
              addToast(`Continuous rapid scan mode ${!continuousMode ? "Activated" : "Deactivated"}.`, "info");
            }}
          >
            <Zap size={15} />
            <span style={{ fontSize: "12px" }}>{continuousMode ? "Continuous Mode" : "Single Scan"}</span>
          </Button>

          {/* Hardware Status Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)"
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#10B981" }}>Laser HID Ready</span>
          </div>
        </div>
      </div>

      {/* KPI Overview Row */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Today's Intake Scans"
          value={(148 + scanHistory.length - 3).toString()}
          unit="Pallets / Units"
          trend={{ value: "+14% vs yesterday", isPositive: true, text: "" }}
          icon={Barcode}
          colorVariant="amber"
        />
        <StatCard
          title="First-Pass Read Rate"
          value="99.8%"
          unit="Optical Accuracy"
          trend={{ value: "Avg 120ms decode", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Receiving Docks"
          value="3 Docks"
          unit="Bays 01, 02, 04"
          trend={{ value: "All docks connected", isPositive: true, text: "" }}
          icon={Truck}
          colorVariant="blue"
        />
        <StatCard
          title="Pending Put-Away"
          value="12 Lots"
          unit="Dock Staging Buffer"
          trend={{ value: "Cold chain prioritized", isPositive: false, text: "" }}
          icon={Box}
          colorVariant="cyan"
        />
      </div>

      {/* MAIN SCANNER WORKSPACE: 2-COLUMN LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "18px",
          width: "100%",
          alignItems: "start"
        }}
      >
        {/* LEFT COLUMN: CAMERA / SCANNER VIEWFINDER HUD */}
        <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Camera size={18} color="#C89547" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Optical Viewfinder & Camera Sensor
              </h3>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setTorchOn(!torchOn)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: torchOn ? "#FEF3C7" : "transparent",
                  color: torchOn ? "#B45309" : "var(--text-secondary)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🔦 Flash {torchOn ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => setCameraActive(!cameraActive)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: cameraActive ? "rgba(16, 185, 129, 0.1)" : "transparent",
                  color: cameraActive ? "#10B981" : "var(--text-secondary)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {cameraActive ? "Live Feed" : "Paused"}
              </button>
            </div>
          </div>

          {/* High-Tech Viewfinder Screen */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "300px",
              backgroundColor: "#0B1120",
              borderRadius: "14px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #1E293B",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
            }}
          >
            {/* Background Grid Pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(circle at 50% 50%, rgba(200, 149, 71, 0.08) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 20px 20px, 20px 20px"
              }}
            />

            {/* Flash Light Overlay */}
            {torchOn && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  pointerEvents: "none"
                }}
              />
            )}

            {/* Viewfinder Target Brackets / Reticle */}
            <div
              className="scanner-hud-reticle"
              style={{
                position: "relative",
                width: "72%",
                height: "65%",
                border: "2px dashed rgba(200, 149, 71, 0.4)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {/* Corner 1: Top-Left */}
              <div
                style={{
                  position: "absolute",
                  top: "-3px",
                  left: "-3px",
                  width: "24px",
                  height: "24px",
                  borderTop: "4px solid #C89547",
                  borderLeft: "4px solid #C89547",
                  borderTopLeftRadius: "6px"
                }}
              />
              {/* Corner 2: Top-Right */}
              <div
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  width: "24px",
                  height: "24px",
                  borderTop: "4px solid #C89547",
                  borderRight: "4px solid #C89547",
                  borderTopRightRadius: "6px"
                }}
              />
              {/* Corner 3: Bottom-Left */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-3px",
                  left: "-3px",
                  width: "24px",
                  height: "24px",
                  borderBottom: "4px solid #C89547",
                  borderLeft: "4px solid #C89547",
                  borderBottomLeftRadius: "6px"
                }}
              />
              {/* Corner 4: Bottom-Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-3px",
                  right: "-3px",
                  width: "24px",
                  height: "24px",
                  borderBottom: "4px solid #C89547",
                  borderRight: "4px solid #C89547",
                  borderBottomRightRadius: "6px"
                }}
              />

              {/* Animated Laser Scanning Line */}
              {cameraActive && (
                <div
                  style={{
                    position: "absolute",
                    left: "2%",
                    right: "2%",
                    height: "3px",
                    backgroundColor: "#EF4444",
                    boxShadow: "0 0 14px #EF4444, 0 0 24px rgba(239, 68, 68, 0.8)",
                    animation: "laserMove 2.2s infinite ease-in-out, laserGlow 1.8s infinite alternate"
                  }}
                />
              )}

              {/* Barcode Graphic Inside Reticle */}
              <div style={{ opacity: 0.6, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <Barcode size={64} color="#C89547" strokeWidth={1.5} />
                <span style={{ fontSize: "11px", color: "#94A3B8", letterSpacing: "1px", fontWeight: 700, textTransform: "uppercase" }}>
                  Align Barcode / 2D Matrix
                </span>
              </div>
            </div>

            {/* Viewfinder Overlay HUD Info */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                color: "#10B981"
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span>FPS: 60 | RES: 1080p GS1 ENGINE</span>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "12px",
                right: "14px",
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                color: "#94A3B8"
              }}
            >
              AUTOFOCUS: ACTIVE [AF-C]
            </div>
          </div>

          {/* Trigger Scan Button */}
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="primary"
              size="lg"
              icon={scanning ? Sparkles : Scan}
              onClick={() => triggerScan()}
              disabled={scanning}
              style={{ flex: 1, padding: "12px", fontSize: "14px", fontWeight: 700 }}
            >
              {scanning ? "Decoding Symbology..." : "Capture & Decode Frame"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={RefreshCw}
              onClick={() => {
                const nextSample = presetSamples[(presetSamples.findIndex(p => p.id === scannedData?.id) + 1) % presetSamples.length] || presetSamples[0];
                triggerScan(nextSample);
              }}
              title="Cycle Next Sample"
            >
              Next Tag
            </Button>
          </div>

          {/* Handheld Gun / Manual Keyboard Wedge Entry */}
          <form onSubmit={handleManualSubmit} style={{ marginTop: "4px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Laser Wedge Gun Scan / Manual Serial Input
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Keyboard
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Scan with handheld gun or enter Lot/SSCC code..."
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-input, #fff)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <Button variant="secondary" size="sm" type="submit">
                Submit
              </Button>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
              Accepts barcode strings, GS1 AI brackets, or serial numbers (e.g. <code>LOT-RM-ORG-4402</code>).
            </span>
          </form>

          {/* Quick Preset Sample Badges */}
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              Test Barcode Presets (Click to Simulate Scan):
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {presetSamples.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => triggerScan(preset)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: scannedData?.id === preset.id ? "rgba(200, 149, 71, 0.15)" : "var(--bg-card-subtle)",
                    borderColor: scannedData?.id === preset.id ? "#C89547" : "var(--border-subtle)",
                    color: scannedData?.id === preset.id ? "#8C5B23" : "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  <Tag size={12} color="#C89547" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* RIGHT COLUMN: DECODED GS1 TAG & INBOUND INTAKE BREAKDOWN */}
        <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <QrCode size={18} color="#C89547" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Decoded GS1 Tag & Inbound Intake
              </h3>
            </div>
            {scannedData && (
              <Badge variant="emerald">
                <Check size={13} style={{ marginRight: "4px" }} />
                {scannedData.confidence} DECODE CONFIDENCE
              </Badge>
            )}
          </div>

          {scannedData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Raw Barcode String Container */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Raw Symbology String ({scannedData.symbology})
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(scannedData.rawBarcode);
                      addToast("Raw barcode string copied to clipboard.", "info");
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#C89547",
                      cursor: "pointer",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#8C5B23",
                    wordBreak: "break-all"
                  }}
                >
                  {scannedData.rawBarcode}
                </div>
              </div>

              {/* Material & Supplier Highlights */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(200, 149, 71, 0.3)",
                  backgroundColor: "rgba(200, 149, 71, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "6px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#8C5B23", textTransform: "uppercase" }}>
                      {scannedData.category}
                    </span>
                    <h4 style={{ fontSize: "16px", fontWeight: 800, margin: "2px 0 0 0", color: "var(--text-primary)" }}>
                      {scannedData.materialName}
                    </h4>
                  </div>
                  <Badge variant="blue">{scannedData.symbology}</Badge>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <Truck size={15} color="var(--text-muted)" />
                  <span>Supplier: <strong style={{ color: "var(--text-primary)" }}>{scannedData.supplier}</strong></span>
                </div>
              </div>

              {/* Structured GS1 Application Identifier (AI) Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "10px"
                }}
              >
                {/* Lot / Batch */}
                <div style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    AI (10) Lot / Batch No.
                  </span>
                  <strong style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "#8C5B23" }}>
                    {scannedData.lotCode}
                  </strong>
                </div>

                {/* PO Number */}
                <div style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    AI (400) Purchase Order
                  </span>
                  <strong style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>
                    {scannedData.poNumber}
                  </strong>
                </div>

                {/* Quantity */}
                <div style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    AI (3102) Net Quantity
                  </span>
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                    {scannedData.quantity}
                  </strong>
                </div>

                {/* Expiration Date */}
                <div style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    AI (17) Expiration Date
                  </span>
                  <strong style={{ fontSize: "13px", color: "#10B981" }}>
                    {scannedData.expiryDate}
                  </strong>
                </div>

                {/* Assigned Dock Bay */}
                <div style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    Inbound Gate / Bay
                  </span>
                  <strong style={{ fontSize: "13px", color: "#0284C7" }}>
                    {scannedData.dockBay}
                  </strong>
                </div>

                {/* Temp Check SLA */}
                <div style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    Temperature SLA Check
                  </span>
                  <strong style={{ fontSize: "13px", color: "#10B981" }}>
                    {scannedData.tempCheck}
                  </strong>
                </div>
              </div>

              {/* Recommended Storage Bin Allocation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)"
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#10B981", textTransform: "uppercase" }}>
                    Target Warehouse Rack / Bin
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                    {scannedData.targetBin}
                  </div>
                </div>
                <Badge variant="emerald">SLOTTING VERIFIED</Badge>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                <Button
                  variant="primary"
                  icon={ArrowDownToLine}
                  onClick={handleIngestIntoWms}
                  style={{ flex: 1, minWidth: "160px" }}
                >
                  Ingest into WMS
                </Button>
                <Button
                  variant="secondary"
                  icon={Printer}
                  onClick={() => setIsLpnModalOpen(true)}
                  style={{ flex: 1, minWidth: "140px" }}
                >
                  Print LPN Tag
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center",
                gap: "12px"
              }}
            >
              <Smartphone size={44} color="#0284C7" />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                Awaiting camera alignment or handheld scanner input.
              </span>
              <Button variant="primary" icon={Scan} onClick={() => triggerScan()}>
                Start Camera Scan
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* RECENT INBOUND SCANS AUDIT LOG TABLE */}
      <Card style={{ padding: "20px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Recent Inbound Scans Audit Log
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Real-time audit record of all decoded barcodes, SSCC license plates, and supplier shipments.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search Lot, PO, Material..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  padding: "6px 12px 6px 30px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "12px"
                }}
              />
            </div>

            {/* Symbology Filter */}
            <select
              value={symbologyFilter}
              onChange={(e) => setSymbologyFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-input, #fff)",
                color: "var(--text-primary)",
                fontSize: "12px"
              }}
            >
              <option value="ALL">All Symbologies</option>
              <option value="GS1-128">GS1-128</option>
              <option value="SSCC-18">SSCC-18</option>
              <option value="DataMatrix">DataMatrix</option>
              <option value="QR Code">QR Code</option>
            </select>

            {/* Export CSV Button */}
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCsv}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Scan ID</th>
                <th style={{ whiteSpace: "nowrap" }}>Time</th>
                <th style={{ whiteSpace: "nowrap" }}>Symbology</th>
                <th style={{ whiteSpace: "nowrap" }}>Lot Number</th>
                <th style={{ whiteSpace: "nowrap" }}>Material Item</th>
                <th style={{ whiteSpace: "nowrap" }}>Supplier & PO</th>
                <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                <th style={{ whiteSpace: "nowrap" }}>Dock Location</th>
                <th style={{ whiteSpace: "nowrap" }}>QA Verification</th>
                <th style={{ whiteSpace: "nowrap" }}>Status</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((scan) => (
                <tr key={scan.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>{scan.id}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{scan.time}</td>
                  <td>
                    <Badge variant={scan.symbology === "GS1-128" ? "blue" : scan.symbology === "SSCC-18" ? "purple" : "amber"}>
                      {scan.symbology}
                    </Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{scan.lotCode}</td>
                  <td style={{ fontWeight: 600 }}>{scan.materialName}</td>
                  <td>
                    <div>{scan.supplier}</div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{scan.poNumber}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{scan.quantity}</td>
                  <td>
                    <Badge variant="cyan">{scan.dockBay}</Badge>
                  </td>
                  <td>
                    <span style={{ color: "#10B981", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={13} /> {scan.qaStatus}
                    </span>
                  </td>
                  <td>
                    <Badge variant={scan.wmsStatus === "Ingested" ? "emerald" : "amber"}>
                      {scan.wmsStatus}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const matched = presetSamples.find((p) => p.lotCode === scan.lotCode) || {
                            id: scan.id,
                            name: scan.materialName,
                            symbology: scan.symbology,
                            rawBarcode: scan.rawCode,
                            lotCode: scan.lotCode,
                            materialName: scan.materialName,
                            category: "Raw Material",
                            supplier: scan.supplier,
                            poNumber: scan.poNumber,
                            quantity: scan.quantity,
                            dockBay: scan.dockBay,
                            tempCheck: "3.2°C Inspected",
                            targetBin: "Cold Zone A - Rack R04-B2",
                            expiryDate: "2026-12-31",
                            qaStatus: "CoA Verified - PASSED",
                            confidence: "99.8%"
                          };
                          setScannedData(matched);
                          setIsLpnModalOpen(true);
                        }}
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                        title="View & Print Pallet LPN Tag"
                      >
                        <Printer size={14} /> LPN
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SUPPORTED SYMBOLOGY SPECIFICATION GUIDE */}
      <Card style={{ padding: "16px 20px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} color="#C89547" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
              Supported Enterprise Auto-ID Symbologies:
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Badge variant="blue">GS1-128 (Application Identifiers)</Badge>
            <Badge variant="purple">SSCC-18 (Serial Shipping Container Code)</Badge>
            <Badge variant="emerald">GS1 DataMatrix (ISO/IEC 16022)</Badge>
            <Badge variant="amber">ISO 18004 QR Code 2D</Badge>
            <Badge variant="slate">Code 39 & Code 128</Badge>
          </div>
        </div>
      </Card>

      {/* INDUSTRIAL PALLET LICENSE PLATE (LPN) PRINT MODAL */}
      <Modal
        isOpen={isLpnModalOpen}
        onClose={() => setIsLpnModalOpen(false)}
        title="Industrial Pallet License Plate (LPN) Tag"
        subtitle="Zebra 4x6 Thermal Tag format for cold-room & ambient warehouse slotting."
        maxWidth="580px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
            <Button variant="ghost" onClick={() => setIsLpnModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                window.print();
                addToast("License Plate (LPN) sent to Zebra ZT411 Thermal Printer (Dock 01).", "success");
                setIsLpnModalOpen(false);
              }}
            >
              Print to Zebra Thermal
            </Button>
          </div>
        }
      >
        {scannedData && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#FFFFFF",
              color: "#000000",
              border: "3px solid #000000",
              borderRadius: "8px",
              fontFamily: "Arial, sans-serif",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            {/* Tag Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "1px" }}>MAINTENX OS WMS</div>
                <div style={{ fontSize: "11px", fontWeight: 700 }}>INBOUND LICENSE PLATE (LPN)</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", fontWeight: 800 }}>DOCK BAY: {scannedData.dockBay}</div>
                <div style={{ fontSize: "10px" }}>DATE: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Material & Lot Section */}
            <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>MATERIAL COMMODITY:</div>
              <div style={{ fontSize: "16px", fontWeight: 900 }}>{scannedData.materialName}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>SUPPLIER: </span>
                  <span style={{ fontSize: "12px", fontWeight: 800 }}>{scannedData.supplier}</span>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>PO REF: </span>
                  <span style={{ fontSize: "12px", fontWeight: 800 }}>{scannedData.poNumber}</span>
                </div>
              </div>
            </div>

            {/* Quantity & Location Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700 }}>NET QUANTITY:</div>
                <div style={{ fontSize: "18px", fontWeight: 900 }}>{scannedData.quantity}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700 }}>DESTINATION BIN:</div>
                <div style={{ fontSize: "15px", fontWeight: 900, color: "#000" }}>{scannedData.targetBin}</div>
              </div>
            </div>

            {/* Barcode Graphic Simulation */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0" }}>
              <Barcode size={80} strokeWidth={2.5} color="#000" />
              <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 900, letterSpacing: "3px", marginTop: "4px" }}>
                {scannedData.lotCode}
              </div>
              <div style={{ fontSize: "9px", color: "#555", marginTop: "2px" }}>
                {scannedData.rawBarcode}
              </div>
            </div>

            {/* Footer SLAs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #000", paddingTop: "6px", fontSize: "10px", fontWeight: 700 }}>
              <span>TEMP CHECK: {scannedData.tempCheck}</span>
              <span>EXPIRY: {scannedData.expiryDate}</span>
              <span>QA: PASSED</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { QrCode, Camera, ShieldCheck, AlertCircle, Scan, Sparkles, Keyboard, CheckCircle2, Link, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function BarcodeScan() {
  const { addToast } = useApp();
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState("BAT-2026-904 (Juice Run A)");

  const simulateScan = (code, type) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      let details = {};
      if (type === "lot") {
        details = {
          type: "Raw Material Lot",
          id: code,
          item: "Organic Orange Concentrate 1000L",
          supplier: "Valley Organic Farms Co.",
          expiryDate: "2026-12-15",
          qaStatus: "RELEASED",
          allergenFree: "Yes"
        };
      } else if (type === "pallet") {
        details = {
          type: "Finished Goods Pallet",
          id: code,
          item: "Organic Cold-Pressed Orange Juice 500ml",
          producedDate: "2026-08-31 08:30",
          quantity: "1,200 Bottles",
          qaStatus: "RELEASED",
          storageBin: "BIN-Z2-R14"
        };
      } else {
        details = {
          type: "Maintenance Asset QR",
          id: code,
          item: "Aseptic Liquid Filler Station L1",
          lastPMDate: "2026-08-25",
          nextPMDueDate: "2026-09-25",
          safetyTagStatus: "SIGNED OFF",
          assetHealth: "94%"
        };
      }
      setScanResult(details);
      addToast(`Successfully parsed barcode: ${code}`, "success");
    }, 1000);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    simulateScan(manualCode, "lot");
    setManualCode("");
  };

  const handleAttachLotSubmit = (e) => {
    e.preventDefault();
    addToast(`Lot Tag ${scanResult?.id} verified and attached to Active Batch ${activeBatchId}. Traceability record updated (PDF Section 8 Batch 360°).`, "success");
    setIsAttachModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Barcode & QR Code Scanner (GS1-128 / Traceability)
          </h1>
        </div>

        {scanResult && scanResult.type.includes("Lot") && (
          <Button variant="success" icon={Link} onClick={() => setIsAttachModalOpen(true)}>
            Verify Lot & Attach to Batch
          </Button>
        )}
      </div>

      {/* 1. Scanner Viewfinder Card (Full Width) */}
      <Card
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 20px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "200px",
            height: "200px",
            border: "3px solid #C89547",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            backgroundColor: "rgba(200, 149, 71, 0.06)",
            boxShadow: "0 0 20px rgba(200, 149, 71, 0.15)"
          }}
        >
          {scanning && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: "#EF4444",
                boxShadow: "0 0 12px #EF4444",
                animation: "scanLine 2s linear infinite"
              }}
            />
          )}
          <Camera size={52} color="#C89547" />
        </div>

        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block" }}>
            {scanning ? "Aligning laser scanner optical lens..." : "Camera ready. Position barcode inside frame."}
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Supports 1D Barcodes, DataMatrix, and GS1-128 QR Standards
          </span>
        </div>
      </Card>

      {/* 2. Quick Scan Actions Card (Full Width Stacked Below) */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Simulate Quick Scan Actions
            </h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Test barcode parser against shop-floor asset tags and ingredients
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          <Button
            variant="secondary"
            icon={Scan}
            onClick={() => simulateScan("LOT-ORG-442", "lot")}
            style={{ justifyContent: "center", padding: "10px 14px", fontWeight: 700 }}
          >
            Scan Ingredient Lot QR
          </Button>
          <Button
            variant="secondary"
            icon={Scan}
            onClick={() => simulateScan("PAL-2026-990", "pallet")}
            style={{ justifyContent: "center", padding: "10px 14px", fontWeight: 700 }}
          >
            Scan Finished Pallet Tag
          </Button>
          <Button
            variant="secondary"
            icon={Scan}
            onClick={() => simulateScan("FM-001", "asset")}
            style={{ justifyContent: "center", padding: "10px 14px", fontWeight: 700 }}
          >
            Scan Machine Asset Tag
          </Button>
        </div>
      </Card>

      {/* 3. Manual Code Entry Card (Full Width Stacked Below) */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "rgba(107, 91, 78, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
            <Keyboard size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Manual Code Entry
            </h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Manually type serial identifier or lot barcode number
            </span>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Enter serial number (e.g. LOT-ORG-442, PAL-2026-990, FM-001)..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="input-field"
            style={{ flex: "1 1 260px" }}
            required
          />
          <Button type="submit" variant="primary" style={{ padding: "10px 24px" }}>
            Parse Code
          </Button>
        </form>
      </Card>

      {/* 4. Scan Results Card */}
      {scanResult && (
        <Card style={{ borderLeft: "4px solid #10B981", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(16, 185, 129, 0.08)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={18} color="#059669" /> Parser Decoded Information
            </h3>

            {scanResult.type.includes("Lot") && (
              <Button variant="success" size="sm" icon={Link} onClick={() => setIsAttachModalOpen(true)}>
                Verify & Attach to Batch
              </Button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Parsed Class Type:</span>
              <span style={{ fontWeight: 700, color: "#0284C7" }}>{scanResult.type}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Decoded ID Code:</span>
              <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{scanResult.id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Linked Master Item:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{scanResult.item}</span>
            </div>
            {scanResult.supplier && (
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Supplier / Origin:</span>
                <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{scanResult.supplier}</span>
              </div>
            )}
            {scanResult.expiryDate && (
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Expiry Date:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#B27E33" }}>{scanResult.expiryDate}</span>
              </div>
            )}
            {scanResult.qaStatus && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)" }}>QA Release Status:</span>
                <Badge variant="emerald">{scanResult.qaStatus}</Badge>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Verify Lot Tag & Attach to Active Batch Modal */}
      <Modal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        title="Verify & Attach Lot Tag to Active Batch"
        subtitle={`Scanned Lot ID: ${scanResult?.id}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAttachModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={Send} onClick={handleAttachLotSubmit}>
              Confirm Lot Tag Binding
            </Button>
          </>
        }
      >
        <form onSubmit={handleAttachLotSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Active Target Production Batch
            </label>
            <select
              value={activeBatchId}
              onChange={(e) => setActiveBatchId(e.target.value)}
              className="input-field"
            >
              <option value="BAT-2026-904 (Juice Run A)">BAT-2026-904 (Juice Run A - Line 1)</option>
              <option value="BAT-2026-905 (Juice Run B)">BAT-2026-905 (Juice Run B - Line 1)</option>
            </select>
          </div>

          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
            Attaching lot <strong>{scanResult?.id}</strong> binds supplier raw material lots to the active batch for forward & backward 360° traceability audits (PDF Page 3 Section 8).
          </div>
        </form>
      </Modal>
    </div>
  );
}

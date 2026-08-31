import React, { useState } from "react";
import { QrCode, Camera, ShieldCheck, AlertCircle, Scan } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function BarcodeScan() {
  const { addToast } = useApp();
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Barcode & QR Code Scanner
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Scan ingredient bins, final product pallets, and machine QR codes
        </p>
      </div>

      <div className="grid-2">
        {/* Scanner Viewfinder Box */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", justifyContent: "center", minHeight: "300px", position: "relative", overflow: "hidden" }}>
          <div
            style={{
              width: "180px",
              height: "180px",
              border: "3px solid #38BDF8",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              backgroundColor: "rgba(56, 189, 248, 0.05)"
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
                  boxShadow: "0 0 10px #EF4444",
                  animation: "scanLine 2s linear infinite"
                }}
              />
            )}
            <Camera size={48} color="var(--text-muted)" />
          </div>

          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {scanning ? "Aligning laser scanner lens..." : "Camera ready. Position barcode inside frame."}
          </span>
        </Card>

        {/* Action Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
              Simulate Quick Scan Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Button variant="secondary" size="sm" icon={Scan} onClick={() => simulateScan("LOT-ORG-442", "lot")}>
                Scan Ingredient Lot QR
              </Button>
              <Button variant="secondary" size="sm" icon={Scan} onClick={() => simulateScan("PAL-2026-990", "pallet")}>
                Scan Finished Pallet Tag
              </Button>
              <Button variant="secondary" size="sm" icon={Scan} onClick={() => simulateScan("FM-001", "asset")}>
                Scan Machine Asset Tag
              </Button>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Manual Code Entry
            </h3>
            <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter serial number..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="input-field"
                style={{ flex: 1 }}
                required
              />
              <Button type="submit" variant="primary">
                Parse
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* scan results */}
      {scanResult && (
        <Card style={{ borderLeft: "4px solid #10B981" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={16} color="#10B981" /> Parser Decoded Information
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Parsed Class Type:</span>
              <span style={{ fontWeight: 600, color: "#38BDF8" }}>{scanResult.type}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Decoded ID Code:</span>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#FFFFFF" }}>{scanResult.id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Linked Master Item:</span>
              <span style={{ fontWeight: 600 }}>{scanResult.item}</span>
            </div>
            {scanResult.qaStatus && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)" }}>QA release status:</span>
                <Badge variant="emerald">{scanResult.qaStatus}</Badge>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

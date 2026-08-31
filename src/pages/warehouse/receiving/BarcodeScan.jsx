import React, { useState } from "react";
import { Smartphone, Check, Sparkles } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function BarcodeScan() {
  const { addToast } = useApp();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleScan = () => {
    setScanning(true);
    addToast("Initializing device scanner camera...", "info");
    setTimeout(() => {
      setScanning(false);
      setScannedData({
        lotCode: "LOT-CAP-ORG-442",
        part: "Aseptic Orange Caps",
        stage: "STG-L1-IN",
        status: "Verified Stage Lot"
      });
      addToast("Barcode scanned successfully.", "success");
    }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Inbound Barcode / QR Scan
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Scan lot tracking tags to verify warehouse staging levels
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyBox: "center", gap: "12px", padding: "40px", textAlign: "center" }}>
          <Smartphone size={48} color="#0284C7" />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Awaiting barcode alignment scan.
          </span>
          <Button variant="primary" icon={scanning ? Sparkles : Smartphone} onClick={handleScan} disabled={scanning}>
            {scanning ? "Scanning Tag..." : "Start Camera Scan"}
          </Button>
        </Card>

        {scannedData && (
          <Card style={{ borderLeft: "4px solid #10B981" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={16} color="#10B981" /> Scanned Lot Details
            </h3>
            <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div>Lot Code: <strong style={{ color: "#FFFFFF" }}>{scannedData.lotCode}</strong></div>
              <div>Part: {scannedData.part}</div>
              <div>Location: {scannedData.stage}</div>
              <div>Status: <span style={{ color: "#10B981", fontWeight: 700 }}>{scannedData.status}</span></div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

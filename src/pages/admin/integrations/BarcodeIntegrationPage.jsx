import React, { useState } from "react";
import {
  ScanBarcode,
  CheckCircle2,
  Settings,
  Plus
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function BarcodeIntegrationPage() {
  const { addToast } = useApp();

  const [formats] = useState([
    { id: "BC-01", standard: "GS1-128 (UCC/EAN-128)", useCase: "Secondary Case & Pallet Logistics", aiAppPrefix: "(01) GTIN, (10) Batch Lot, (17) Expiry", status: "Active" },
    { id: "BC-02", standard: "2D DataMatrix (ISO/IEC 16022)", useCase: "Primary Direct Bottle Serialization", aiAppPrefix: "High-density micro barcode", status: "Active" },
    { id: "BC-03", standard: "QR Code (ISO/IEC 18004)", useCase: "Maintenance Asset Tagging & SOP Links", aiAppPrefix: "URL Deep Linking", status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Barcode, QR & GS1 Symbology Engine
            </h1>
            <Badge variant="cyan">GS1 Compliant</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Barcode symbologies configuration, GS1 Application Identifiers (AIs), 2D DataMatrix verification, and camera scanner settings.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbology Code</th>
                <th>Standard Format</th>
                <th>Application Use Case</th>
                <th>Data Encoding Structure</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{f.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{f.standard}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{f.useCase}</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#F59E0B" }}>{f.aiAppPrefix}</td>
                  <td>
                    <Badge variant="emerald">{f.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

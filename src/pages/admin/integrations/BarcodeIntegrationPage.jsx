import React, { useState } from "react";
import {
  ScanBarcode,
  CheckCircle2,
  Settings,
  Plus,
  Search,
  X,
  Edit2,
  QrCode,
  Layers,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function BarcodeIntegrationPage() {
  const { addToast } = useApp();

  const [formats, setFormats] = useState([
    { id: "BC-01", standard: "GS1-128 (UCC/EAN-128)", useCase: "Secondary Case & Pallet Logistics", aiAppPrefix: "(01) GTIN, (10) Batch Lot, (17) Expiry", status: "Active" },
    { id: "BC-02", standard: "2D DataMatrix (ISO/IEC 16022)", useCase: "Primary Direct Bottle Serialization", aiAppPrefix: "High-density micro barcode", status: "Active" },
    { id: "BC-03", standard: "QR Code (ISO/IEC 18004)", useCase: "Maintenance Asset Tagging & SOP Links", aiAppPrefix: "URL Deep Linking", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFormat, setNewFormat] = useState({
    standard: "",
    useCase: "",
    aiAppPrefix: "GS1 AI Format"
  });

  const filteredFormats = formats.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.standard.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.useCase.toLowerCase().includes(q) ||
      f.aiAppPrefix.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newFormat.standard.trim() || !newFormat.useCase.trim()) {
      addToast("Please provide symbology standard and application use case.", "warning");
      return;
    }

    const created = {
      id: `BC-0${formats.length + 1}`,
      standard: newFormat.standard,
      useCase: newFormat.useCase,
      aiAppPrefix: newFormat.aiAppPrefix || "Custom String Payload",
      status: "Active"
    };

    setFormats([...formats, created]);
    addToast(`Symbology "${created.id}" configured successfully!`, "success");
    setIsModalOpen(false);
    setNewFormat({ standard: "", useCase: "", aiAppPrefix: "GS1 AI Format" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Barcode, QR & GS1 Symbology Engine
            </h1>
            <Badge variant="cyan">{formats.length} SYMBOLOGY FORMATS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Symbology Format
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active Formats"
          value={formats.length.toString()}
          unit="Engines"
          trend={{ value: "GS1, 2D DataMatrix, QR", isPositive: true, text: "" }}
          icon={ScanBarcode}
          colorVariant="emerald"
        />
        <StatCard
          title="Direct Serialization"
          value="ISO 16022"
          unit="DataMatrix"
          trend={{ value: "Sub-millimeter laser etch", isPositive: true, text: "" }}
          icon={QrCode}
          colorVariant="cyan"
        />
        <StatCard
          title="First-Pass Read Rate"
          value="99.98%"
          unit="Scanners"
          trend={{ value: "Cognex & Keyence camera feed", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="amber"
        />
        <StatCard
          title="GS1 Global Standard"
          value="100%"
          unit="Certified"
          trend={{ value: "Full supply chain traceability", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search format, use case, prefix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Symbology Code</th>
                <th>Standard Format</th>
                <th>Application Use Case</th>
                <th>Data Encoding Structure</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormats.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{f.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{f.standard}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{f.useCase}</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#D97706", fontWeight: 600 }}>{f.aiAppPrefix}</td>
                  <td>
                    <Badge variant="emerald">{f.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened encoder setup for ${f.id}`, "info")}
                      title="Edit Symbology"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD FORMAT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Symbology Encoding Rule
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Standard Symbology Format *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code 39 / Interleaved 2 of 5"
                  value={newFormat.standard}
                  onChange={(e) => setNewFormat({ ...newFormat, standard: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Application Use Case *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Work-in-Progress (WIP) Tote Tracking"
                  value={newFormat.useCase}
                  onChange={(e) => setNewFormat({ ...newFormat, useCase: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Data Encoding Structure / AI Prefix</label>
                <input
                  type="text"
                  placeholder="e.g. (90) Work Order ID + (21) Serial"
                  value={newFormat.aiAppPrefix}
                  onChange={(e) => setNewFormat({ ...newFormat, aiAppPrefix: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Symbology
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

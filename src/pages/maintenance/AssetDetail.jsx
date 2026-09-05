import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Wrench,
  Cpu,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Clock,
  QrCode,
  Edit,
  ExternalLink,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Package,
  Layers,
  ArrowLeft,
  CalendarCheck,
  Zap,
  RotateCcw,
  Sliders,
  FileText
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assets = [], updateAsset, workOrders = [], pmSchedules = [], breakdowns = [], spareParts = [] } = useCMMS();
  const { addToast, openQrModal } = useApp();

  // Selected asset state (defaults to URL param or first asset)
  const initialAsset = assets.find((a) => a.id === id) || assets[0] || {
    id: "AST-001",
    name: "Rotary Bottling Filler (Aseptic)",
    type: "Packaging & Bottling",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    location: "Bay 4A - Main Hall",
    criticality: "Critical",
    status: "Operational",
    health: 94,
    manufacturer: "Krones Synchrobloc",
    model: "Isobaric Aseptic-36",
    serialNumber: "KR-2021-8849-B",
    commissionDate: "2021-03-15",
    warrantyExpiry: "2027-03-15",
    nameplatePower: "45 kW",
    ratedSpeed: "600 BPM",
    operatingVoltage: "480V 3-Phase 60Hz",
    vibration: 1.8,
    temperature: 52.4,
    pressure: 5.8,
    oilLevel: 92,
    runtimeHours: 14820,
    mtbf: 385,
    mttr: 1.3
  };

  const [selectedAssetId, setSelectedAssetId] = useState(initialAsset.id);
  const currentAsset = assets.find((a) => a.id === selectedAssetId) || initialAsset;

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentAsset.name,
    location: currentAsset.location,
    criticality: currentAsset.criticality || "High",
    manufacturer: currentAsset.manufacturer || "Standard OEM",
    model: currentAsset.model || "Series-2026",
    serialNumber: currentAsset.serialNumber || `SN-${currentAsset.id}`,
    nameplatePower: currentAsset.nameplatePower || "45 kW",
    ratedSpeed: currentAsset.ratedSpeed || "600 BPM"
  });

  const handleAssetSwitch = (newId) => {
    setSelectedAssetId(newId);
    const found = assets.find((a) => a.id === newId);
    if (found) {
      setEditForm({
        name: found.name,
        location: found.location,
        criticality: found.criticality || "High",
        manufacturer: found.manufacturer || "Standard OEM",
        model: found.model || "Series-2026",
        serialNumber: found.serialNumber || `SN-${found.id}`,
        nameplatePower: found.nameplatePower || "45 kW",
        ratedSpeed: found.ratedSpeed || "600 BPM"
      });
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateAsset(currentAsset.id, editForm);
    addToast(`Asset specifications for ${currentAsset.id} updated!`, "success");
    setIsEditModalOpen(false);
  };

  // Associated records
  const linkedWOs = workOrders.filter((w) => w.assetId === currentAsset.id);
  const linkedPMs = pmSchedules.filter((p) => p.assetId === currentAsset.id);
  const linkedBDs = breakdowns.filter((b) => b.assetId === currentAsset.id);
  const activeWOCount = linkedWOs.filter((w) => w.status !== "Completed" && w.status !== "Closed").length;
  const activeBDCount = linkedBDs.filter((b) => b.status !== "Resolved" && b.status !== "Closed").length;

  const isOp = currentAsset.status === "Operational";
  const isBD = currentAsset.status === "Breakdown" || currentAsset.status === "DOWN";
  const statusColor = isOp ? "emerald" : isBD ? "rose" : "amber";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Breadcrumb & Asset Selector Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/maintenance/assets")}
            style={{ fontSize: "12px" }}
          >
            Back to Asset List
          </Button>
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>/</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
            Equipment Dossier & Details
          </span>
        </div>

        {/* Machine Quick Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>SWITCH ASSET:</span>
          <select
            className="form-select"
            value={currentAsset.id}
            onChange={(e) => handleAssetSwitch(e.target.value)}
            style={{ fontSize: "12px", padding: "6px 12px", minWidth: "220px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-active)" }}
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.name} ({a.line})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Asset Header Card */}
      <Card style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "260px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#38BDF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Cpu size={30} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {currentAsset.name}
                </h1>
                <Badge variant="cyan">{currentAsset.id}</Badge>
                <Badge variant={statusColor} dot>{currentAsset.status || "Operational"}</Badge>
                <Badge variant={currentAsset.criticality === "Critical" ? "rose" : "amber"}>
                  {currentAsset.criticality || "Medium"} Criticality
                </Badge>
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                <span>Plant: <strong style={{ color: "var(--text-primary)" }}>{currentAsset.plant || "Plant 1"}</strong></span>
                <span>•</span>
                <span>Line: <strong style={{ color: "var(--text-primary)" }}>{currentAsset.line}</strong></span>
                <span>•</span>
                <span>Location: <strong style={{ color: "var(--text-primary)" }}>{currentAsset.location}</strong></span>
                <span>•</span>
                <span>Type: <strong style={{ color: "var(--text-primary)" }}>{currentAsset.type}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={() => setIsEditModalOpen(true)}
              style={{ fontSize: "12px" }}
            >
              Edit Specs
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={QrCode}
              onClick={() => openQrModal(`Asset QR: ${currentAsset.id}`, currentAsset.id, { name: currentAsset.name, location: currentAsset.location })}
              style={{ fontSize: "12px" }}
            >
              Asset QR
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ExternalLink}
              onClick={() => navigate(`/maintenance/asset-360/${currentAsset.id}`)}
              style={{ fontSize: "12px" }}
            >
              Open in Asset 360°
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Tickers */}
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
          title="Health Index"
          value={`${currentAsset.health || 94}%`}
          unit=""
          trend={{ value: currentAsset.health > 80 ? "Optimal Condition" : "Inspection Due", isPositive: currentAsset.health > 80, text: "real-time" }}
          icon={Activity}
          colorVariant={currentAsset.health > 80 ? "emerald" : currentAsset.health > 60 ? "amber" : "rose"}
        />
        <StatCard
          title="MTBF (Reliability)"
          value={`${currentAsset.mtbf || 385}`}
          unit="hrs"
          trend={{ value: "Operating Window", isPositive: true, text: "mean time between" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Active Work Orders"
          value={`${activeWOCount}`}
          unit="orders"
          trend={{ value: activeWOCount > 0 ? "Open Tasks" : "All Clear", isPositive: activeWOCount === 0, text: "scheduled" }}
          icon={Wrench}
          colorVariant={activeWOCount > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/maintenance/work-orders")}
        />
        <StatCard
          title="Active Breakdowns"
          value={`${activeBDCount}`}
          unit="events"
          trend={{ value: activeBDCount > 0 ? "Outage Logged" : "Zero Stoppage", isPositive: activeBDCount === 0, text: "current shift" }}
          icon={AlertOctagon}
          colorVariant={activeBDCount > 0 ? "rose" : "emerald"}
          onClick={() => navigate("/maintenance/breakdowns")}
        />
      </div>

      {/* Detailed Technical Specifications & Sensor Telemetry Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px", width: "100%" }}>
        {/* Technical Identity & Nameplate Card */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={16} style={{ color: "#38BDF8" }} /> Technical Specifications & Nameplate Data
            </h3>
            <Badge variant="slate">OEM SPEC SHEET</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>OEM Manufacturer</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentAsset.manufacturer || "Krones Synchrobloc"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Model / Series</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentAsset.model || "Series 2026-X"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Serial Number</span>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-blue)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {currentAsset.serialNumber || `SN-${currentAsset.id}`}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Nameplate Power</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentAsset.nameplatePower || "45 kW"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Rated Speed</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentAsset.ratedSpeed || "600 BPM"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Commission Date</span>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "4px" }}>
                {currentAsset.commissionDate || "2021-03-15"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Warranty Expiry</span>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#10B981", marginTop: "4px" }}>
                {currentAsset.warrantyExpiry || "2027-03-15"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Operating Hours</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {(currentAsset.runtimeHours || 14820).toLocaleString()} hrs
              </div>
            </div>
          </div>
        </Card>

        {/* Real-time Telemetry & Condition Gauges */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={16} style={{ color: "#10B981" }} /> Real-Time Sensor Telemetry & Health
            </h3>
            <Badge variant="emerald" dot>LIVE TELEMETRY</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Bearing Vibration</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: (currentAsset.vibration || 1.8) > 3.0 ? "#EF4444" : "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {currentAsset.vibration || 1.8} mm/s
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>ISO-10816 limit: &lt; 3.0 mm/s</span>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Housing Temp</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: (currentAsset.temperature || 52.4) > 75 ? "#EF4444" : "#38BDF8", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {currentAsset.temperature || 52.4}°C
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Thermal ceiling: &lt; 80.0°C</span>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Pneumatic Line Pressure</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#F59E0B", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {currentAsset.pressure || 5.8} Bar
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Operating nominal: 6.0 ± 0.5 Bar</span>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Lubricant Reservoir</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {currentAsset.oilLevel || 92}%
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Synthetic food-grade grease</span>
            </div>
          </div>

          <div style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              Need deeper analytics, Weibull reliability curves or complete maintenance history?
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={ExternalLink}
              onClick={() => navigate(`/maintenance/asset-360/${currentAsset.id}`)}
              style={{ fontSize: "11px" }}
            >
              View Consolidated Asset 360°
            </Button>
          </div>
        </Card>
      </div>

      {/* Bill of Materials & Spare Parts Assigned */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={16} style={{ color: "#F59E0B" }} /> Associated Bill of Materials (BOM) & Critical Spares
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Replacement consumables, wear components, and maintenance spares mapped to this machine
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/maintenance/work-orders")}
            style={{ fontSize: "12px" }}
          >
            Create Spares Work Order
          </Button>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Part Number</th>
                <th style={{ padding: "10px" }}>Component Name</th>
                <th style={{ padding: "10px" }}>Criticality</th>
                <th style={{ padding: "10px" }}>Stock Balance</th>
                <th style={{ padding: "10px" }}>Replacement Cycle</th>
                <th style={{ padding: "10px" }}>Lead Time</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-blue)", fontWeight: 600 }}>BRG-6208-2RS</td>
                <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 600 }}>Deep Groove Ceramic Spindle Bearing</td>
                <td style={{ padding: "10px" }}><Badge variant="rose">Critical</Badge></td>
                <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#10B981" }}>4 Units in Stock</td>
                <td style={{ padding: "10px", color: "var(--text-muted)" }}>Every 4,000 hrs</td>
                <td style={{ padding: "10px", color: "var(--text-muted)" }}>3 Days</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-blue)", fontWeight: 600 }}>SEAL-VITON-45</td>
                <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 600 }}>Fluoropolymer Viton Shaft Seal Ring</td>
                <td style={{ padding: "10px" }}><Badge variant="amber">High</Badge></td>
                <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#10B981" }}>12 Units in Stock</td>
                <td style={{ padding: "10px", color: "var(--text-muted)" }}>Every 2,000 hrs</td>
                <td style={{ padding: "10px", color: "var(--text-muted)" }}>1 Day</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-blue)", fontWeight: 600 }}>VALVE-PNEUM-02</td>
                <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 600 }}>High-Speed Solenoid Actuator Valve</td>
                <td style={{ padding: "10px" }}><Badge variant="cyan">Standard</Badge></td>
                <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#F59E0B" }}>2 Units in Stock</td>
                <td style={{ padding: "10px", color: "var(--text-muted)" }}>Condition Based</td>
                <td style={{ padding: "10px", color: "var(--text-muted)" }}>5 Days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Specifications Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Technical Specifications: ${currentAsset.id}`}
        subtitle="Update machine identity, OEM information and operating ratings"
      >
        <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">Machine Name</label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Location / Bay</label>
              <input
                type="text"
                className="form-input"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Criticality</label>
              <select
                className="form-select"
                value={editForm.criticality}
                onChange={(e) => setEditForm({ ...editForm, criticality: e.target.value })}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                type="text"
                className="form-input"
                value={editForm.manufacturer}
                onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                className="form-input"
                value={editForm.model}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Nameplate Power</label>
              <input
                type="text"
                className="form-input"
                value={editForm.nameplatePower}
                onChange={(e) => setEditForm({ ...editForm, nameplatePower: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rated Speed</label>
              <input
                type="text"
                className="form-input"
                value={editForm.ratedSpeed}
                onChange={(e) => setEditForm({ ...editForm, ratedSpeed: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Specifications
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

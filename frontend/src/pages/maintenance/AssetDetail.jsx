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
import masterDataService from "../../services/masterDataService";
import maintenanceService from "../../services/maintenanceService";

export function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    assets = [],
    updateAsset,
    workOrders = [],
    pmSchedules = [],
    breakdowns = [],
    spareParts = [],
    iotTelemetry = {}
  } = useCMMS();
  const { addToast, openQrModal } = useApp();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await masterDataService.getAssetDetails();
      } catch (err) {
        console.warn("API asset detail fetch notice:", err.message || err);
      }
    };
    fetchData();
  }, [id]);

  // Selected asset state (defaults to URL param or first asset)
  const initialAsset = assets.find((a) => a.id === id || a.assetCode === id) || assets[0] || {
    id: id || "FM-001",
    name: "Industrial Asset",
    type: "Packaging & Bottling",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1",
    location: "Bay 4A",
    criticality: "High",
    status: "Operational",
    health: 95,
    manufacturer: "Standard OEM",
    model: "Series-2026",
    serialNumber: `SN-${id || "FM-001"}`,
    commissionDate: new Date().toISOString().substring(0, 10),
    warrantyExpiry: "2027-03-15",
    nameplatePower: "45 kW",
    ratedSpeed: "600 BPM",
    vibration: 1.5,
    temperature: 55.0,
    pressure: 6.0,
    oilLevel: 92,
    runtimeHours: 14820,
    mtbf: 400,
    mttr: 1.5
  };

  const [selectedAssetId, setSelectedAssetId] = useState(initialAsset.id || initialAsset.assetCode);
  const currentAsset = assets.find((a) => a.id === selectedAssetId || a.assetCode === selectedAssetId) || initialAsset;

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentAsset.name || "",
    location: currentAsset.location || "",
    criticality: currentAsset.criticality || "High",
    manufacturer: currentAsset.manufacturer || "",
    model: currentAsset.model || currentAsset.type || "",
    serialNumber: currentAsset.serialNumber || `SN-${currentAsset.id || currentAsset.assetCode}`,
    nameplatePower: currentAsset.nameplatePower || "",
    ratedSpeed: currentAsset.ratedSpeed || "",
    commissionDate: currentAsset.commissionDate || currentAsset.installedDate || "",
    warrantyExpiry: currentAsset.warrantyExpiry || "",
    operatingHours: currentAsset.operatingHours || currentAsset.runtimeHours || 0
  });

  // Keep editForm synced with currentAsset
  React.useEffect(() => {
    if (currentAsset) {
      setEditForm({
        name: currentAsset.name || "",
        location: currentAsset.location || "",
        criticality: currentAsset.criticality || "High",
        manufacturer: currentAsset.manufacturer || "",
        model: currentAsset.model || currentAsset.type || "",
        serialNumber: currentAsset.serialNumber || `SN-${currentAsset.id || currentAsset.assetCode}`,
        nameplatePower: currentAsset.nameplatePower || "",
        ratedSpeed: currentAsset.ratedSpeed || "",
        commissionDate: currentAsset.commissionDate || currentAsset.installedDate || "",
        warrantyExpiry: currentAsset.warrantyExpiry || "",
        operatingHours: currentAsset.operatingHours || currentAsset.runtimeHours || 0
      });
    }
  }, [currentAsset.id, currentAsset.updatedAt, isEditModalOpen]);

  const handleAssetSwitch = (newId) => {
    setSelectedAssetId(newId);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    await updateAsset(currentAsset.id || currentAsset.assetCode, editForm);
    addToast(`Asset specifications for ${currentAsset.id || currentAsset.assetCode} saved to database!`, "success");
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
                {currentAsset.manufacturer || "—"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Model / Series</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentAsset.model || currentAsset.type || "—"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Serial Number</span>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-blue)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {currentAsset.serialNumber || `SN-${currentAsset.id || currentAsset.assetCode}`}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Nameplate Power</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentAsset.nameplatePower || "—"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Rated Speed</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentAsset.ratedSpeed || "—"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Commission Date</span>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "4px" }}>
                {currentAsset.commissionDate || currentAsset.installedDate || "—"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Warranty Expiry</span>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#10B981", marginTop: "4px" }}>
                {currentAsset.warrantyExpiry || "—"}
              </div>
            </div>
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Operating Hours</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {currentAsset.operatingHours || currentAsset.runtimeHours ? `${Number(currentAsset.operatingHours || currentAsset.runtimeHours).toLocaleString()} hrs` : "—"}
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
            <Badge variant="emerald" dot>LIVE TELEMETRY STREAM</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Bearing Vibration</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: Number(iotTelemetry?.vibration || 0) > 3.0 ? "#EF4444" : "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry?.vibration != null ? `${Number(iotTelemetry.vibration).toFixed(2)} mm/s` : "—"}
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>ISO-10816 limit: &lt; 3.0 mm/s</span>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Housing Temp</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: Number(iotTelemetry?.temperature || 0) > 75 ? "#EF4444" : "#38BDF8", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry?.temperature != null ? `${Number(iotTelemetry.temperature).toFixed(1)}°C` : "—"}
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Thermal ceiling: &lt; 80.0°C</span>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Pneumatic Line Pressure</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#F59E0B", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {iotTelemetry?.pressure != null ? `${Number(iotTelemetry.pressure).toFixed(2)} Bar` : "—"}
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Operating nominal: 6.0 ± 0.5 Bar</span>
            </div>

            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Lubricant Reservoir</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {currentAsset.oilLevel != null ? `${currentAsset.oilLevel}%` : "—"}
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
              onClick={() => navigate(`/maintenance/asset-360/${currentAsset.id || currentAsset.assetCode}`)}
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
              {(() => {
                const aid = currentAsset.id || currentAsset.assetCode;
                const linkedSpares = spareParts.filter((p) => {
                  if (!p) return false;
                  const matchesAsset = Array.isArray(p.linkedAssets) && (p.linkedAssets.includes(aid) || p.linkedAssets.includes(currentAsset.assetCode) || p.linkedAssets.includes(currentAsset.id));
                  const matchesDirect = p.assetId === aid || p.assetId === currentAsset.assetCode;
                  return matchesAsset || matchesDirect;
                });

                if (linkedSpares.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        No critical spare parts currently mapped to machine {aid}. Spares can be mapped via Inventory or Work Orders.
                      </td>
                    </tr>
                  );
                }

                return linkedSpares.map((part) => {
                  const pNo = part.partNo || part.partNumber || part.id;
                  const pStock = part.stock ?? part.currentStock ?? 0;
                  const pCrit = part.criticality || (part.minStock && pStock < part.minStock ? "High" : "Standard");
                  return (
                    <tr key={pNo} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-blue)", fontWeight: 600 }}>
                        {pNo}
                      </td>
                      <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {part.name}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <Badge variant={pCrit === "Critical" ? "rose" : pCrit === "High" ? "amber" : "cyan"}>
                          {pCrit}
                        </Badge>
                      </td>
                      <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: pStock > 5 ? "#10B981" : "#F59E0B" }}>
                        {pStock} Units in Stock
                      </td>
                      <td style={{ padding: "10px", color: "var(--text-muted)" }}>
                        {part.replacementCycle || "Condition Based"}
                      </td>
                      <td style={{ padding: "10px", color: "var(--text-muted)" }}>
                        {part.leadTimeDays ? `${part.leadTimeDays} Days` : "2-3 Days"}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Specifications Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Technical Specifications: ${currentAsset.id || currentAsset.assetCode}`}
        subtitle="Update machine identity, OEM information and operating ratings directly in database"
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
              <label className="form-label">OEM Manufacturer</label>
              <input
                type="text"
                className="form-input"
                value={editForm.manufacturer}
                onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model / Series</label>
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
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                className="form-input"
                value={editForm.serialNumber}
                onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nameplate Power</label>
              <input
                type="text"
                className="form-input"
                value={editForm.nameplatePower}
                onChange={(e) => setEditForm({ ...editForm, nameplatePower: e.target.value })}
                placeholder="e.g. 55 kW"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Rated Speed</label>
              <input
                type="text"
                className="form-input"
                value={editForm.ratedSpeed}
                onChange={(e) => setEditForm({ ...editForm, ratedSpeed: e.target.value })}
                placeholder="e.g. 720 BPM"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Commission Date</label>
              <input
                type="date"
                className="form-input"
                value={editForm.commissionDate}
                onChange={(e) => setEditForm({ ...editForm, commissionDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Warranty Expiry</label>
              <input
                type="date"
                className="form-input"
                value={editForm.warrantyExpiry}
                onChange={(e) => setEditForm({ ...editForm, warrantyExpiry: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operating Hours (Runtime)</label>
              <input
                type="number"
                className="form-input"
                value={editForm.operatingHours}
                onChange={(e) => setEditForm({ ...editForm, operatingHours: Number(e.target.value) || 0 })}
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

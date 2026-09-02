import React, { useState } from "react";
import {
  Wrench,
  Search,
  Filter,
  Plus,
  QrCode,
  FileText,
  Activity,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function AssetList() {
  const { assets, updateAssetStatus, addAsset } = useCMMS();
  const { logAudit } = useMasterData();
  const { openQrModal, addToast, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  // New asset form
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Packaging & Bottling");
  const [newPlant, setNewPlant] = useState("Plant 1 - North Facility");
  const [newLine, setNewLine] = useState("Line 1 (Aseptic Bottling)");
  const [newLocation, setNewLocation] = useState("");
  const [newCriticality, setNewCriticality] = useState("Medium");

  const handleCreateAsset = (e) => {
    e.preventDefault();
    const cleanId = newId.trim();
    const cleanName = newName.trim();

    if (!cleanId || !cleanName) {
      addToast("Please fill in required fields: Asset Tag ID and Machine Name", "error");
      return;
    }

    // Duplicate ID check
    const isDuplicate = assets.some((a) => a.id.toLowerCase() === cleanId.toLowerCase());
    if (isDuplicate) {
      addToast(`Asset Tag ID "${cleanId}" already exists. Please enter a unique ID.`, "error");
      return;
    }

    const created = addAsset({
      id: cleanId,
      name: cleanName,
      type: newType,
      plant: newPlant,
      department: "Packaging",
      line: newLine,
      location: newLocation.trim() || "Bay 4A - Main Hall",
      criticality: newCriticality,
      status: "Operational",
      health: 100,
      manufacturer: "Standard OEM",
      model: "Series-2026",
      serialNumber: `SN-${cleanId}`,
      commissionDate: new Date().toISOString().substring(0, 10),
      nameplatePower: "35 kW",
      ratedSpeed: "600 RPM"
    });

    if (logAudit) {
      logAudit({
        entityId: cleanId,
        entityType: "Asset Master",
        action: "Asset Created",
        field: "Registration",
        oldValue: "-",
        newValue: `${cleanName} (${cleanId})`,
        notes: `Registered to ${newLine}, Criticality: ${newCriticality}`
      });
    }

    addToast(`Asset ${cleanId} created successfully in Asset Registry!`);
    setIsAddAssetModalOpen(false);
    setNewId("");
    setNewName("");
    setNewLocation("");
    setNewCriticality("Medium");
    navigate(`/maintenance/assets/${cleanId}`);
  };

  const columns = [
    {
      header: "Asset ID & Name",
      accessor: "id",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <Wrench size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{row.id}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{row.name}</div>
          </div>
        </div>
      )
    },
    {
      header: "Type & Department",
      accessor: "type",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>{row.type}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.department} • {row.line}</div>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const isOp = val === "Operational";
        const isBD = val === "Breakdown";
        const isOOS = val === "Out of Service";
        const variant = isOp ? "emerald" : isBD ? "rose" : isOOS ? "slate" : "amber";
        return <Badge variant={variant} dot={isOp || isBD}>{val}</Badge>;
      }
    },
    {
      header: "Health Index",
      accessor: "health",
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val > 80 ? "#10B981" : val > 60 ? "#F59E0B" : "#EF4444" }}>
            {val}%
          </span>
          <div style={{ width: "45px", height: "4px", backgroundColor: "#1E293B", borderRadius: "2px" }}>
            <div style={{ width: `${val}%`, height: "100%", backgroundColor: val > 80 ? "#10B981" : val > 60 ? "#F59E0B" : "#EF4444" }} />
          </div>
        </div>
      )
    },
    {
      header: "Telemetry (Vib/Temp)",
      accessor: "vibration",
      render: (val, row) => (
        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>
          <span style={{ color: row.vibration > 3.0 ? "#EF4444" : "var(--text-primary)" }}>{row.vibration} mm/s</span>
          <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>•</span>
          <span style={{ color: "var(--text-secondary)" }}>{row.temperature}°C</span>
        </div>
      )
    },
    {
      header: "MTBF / MTTR",
      accessor: "mtbf",
      render: (val, row) => (
        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
          {row.mtbf}h MTBF / {row.mttr}h MTTR
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={QrCode}
            onClick={() => openQrModal(`QR Code: ${row.id}`, row.id, { name: row.name, location: row.location })}
            title="Show QR Code"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/maintenance/assets/${row.id}`)}
          >
            Asset 360°
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Equipment & Assets Registry
            </h1>
            <Badge variant="cyan">{assets.length} Registered Machines</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="secondary" icon={RotateCcw} onClick={() => addToast("Re-scanning asset IoT vibration sensors...")}>
            Poll Telemetry
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddAssetModalOpen(true)}>
            Register New Machine
          </Button>
        </div>
      </div>

      {/* Main Asset Data Table */}
      <Card>
        <DataTable
          title="Factory Machinery Directory"
          columns={columns}
          data={assets}
          searchPlaceholder="Search machine name, asset ID, line, location..."
          onRowClick={(row) => navigate(`/maintenance/assets/${row.id}`)}
          exportFilename="flowstate_assets_registry.csv"
        />
      </Card>

      {/* Register Asset Modal */}
      <Modal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        title="Register New Production Asset"
        subtitle="Add a new machine or line component into the CMMS hierarchy"
      >
        <form onSubmit={handleCreateAsset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Asset Tag ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FM-004"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Machine Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Krones Monobloc Capper"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Asset Classification</label>
              <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="Packaging & Bottling">Packaging & Bottling</option>
                <option value="Processing & Mixing">Processing & Mixing</option>
                <option value="Thermal Processing">Thermal Processing</option>
                <option value="Labeling">Labeling</option>
                <option value="End of Line / Palletizing">End of Line / Palletizing</option>
                <option value="Utilities & Facilities">Utilities & Facilities</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Production Line</label>
              <select className="form-select" value={newLine} onChange={(e) => setNewLine(e.target.value)}>
                <option value="Line 1 (Aseptic Bottling)">Line 1 (Aseptic Bottling)</option>
                <option value="Line 2 (Formulation & Blending)">Line 2 (Formulation & Blending)</option>
                <option value="Line 3 (Canning Line)">Line 3 (Canning Line)</option>
                <option value="Plant Utilities Backbone">Plant Utilities Backbone</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Physical Location / Bay</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bay 4B - Cleanroom Zone B"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Criticality Rating</label>
              <select className="form-select" value={newCriticality} onChange={(e) => setNewCriticality(e.target.value)}>
                <option value="Critical">Critical (Plant Stoppage Risk)</option>
                <option value="High">High (Line Stoppage Risk)</option>
                <option value="Medium">Medium (Secondary Equipment)</option>
                <option value="Low">Low (Non-Critical Auxiliary)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setIsAddAssetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus}>
              Save & Register Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


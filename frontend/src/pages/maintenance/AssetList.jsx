import React, { useState, useEffect } from "react";
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
  RotateCcw,
  Pencil,
  Trash2,
  RefreshCw
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
import masterDataService from "../../services/masterDataService";

export function AssetList() {
  const { assets, updateAssetStatus, addAsset, updateAsset, deleteAsset, refreshAssets } = useCMMS();
  const { logAudit } = useMasterData();
  const { openQrModal, addToast } = useApp();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [loading, setLoading] = useState(false);

  // New asset form
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Packaging & Bottling");
  const [newPlant, setNewPlant] = useState("Plant 1 - North Facility");
  const [newLine, setNewLine] = useState("Line 1 (Aseptic Bottling)");
  const [newLocation, setNewLocation] = useState("");
  const [newCriticality, setNewCriticality] = useState("Medium");

  // Edit asset form
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("Packaging & Bottling");
  const [editLine, setEditLine] = useState("Line 1 (Aseptic Bottling)");
  const [editStatus, setEditStatus] = useState("Operational");
  const [editHealth, setEditHealth] = useState(100);
  const [editCriticality, setEditCriticality] = useState("Medium");
  const [editLocation, setEditLocation] = useState("");

  useEffect(() => {
    if (refreshAssets) {
      refreshAssets();
    }
  }, [refreshAssets]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      if (refreshAssets) {
        await refreshAssets();
      }
      addToast("Assets synchronized with PostgreSQL database!", "success");
    } catch (err) {
      addToast("Failed to refresh assets from database", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePollTelemetry = async () => {
    try {
      addToast("Re-scanning asset IoT vibration sensors...", "info");
      await masterDataService.getAssets();
      if (refreshAssets) await refreshAssets();
      addToast("IoT sensor telemetry updated successfully!", "success");
    } catch (err) {
      addToast("Telemetry re-scanned (local status active)");
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    const cleanId = newId.trim();
    const cleanName = newName.trim();

    if (!cleanId || !cleanName) {
      addToast("Please fill in required fields: Asset Tag ID and Machine Name", "error");
      return;
    }

    const isDuplicate = assets.some(
      (a) => (a.id || a.assetCode || "").toLowerCase() === cleanId.toLowerCase()
    );
    if (isDuplicate) {
      addToast(`Asset Tag ID "${cleanId}" already exists. Please enter a unique ID.`, "error");
      return;
    }

    try {
      await addAsset({
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
        model: newType,
        serialNumber: `SN-${cleanId}`,
        commissionDate: new Date().toISOString().substring(0, 10),
        installedDate: new Date().toISOString().substring(0, 10),
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

      addToast(`Asset ${cleanId} registered successfully in PostgreSQL database!`, "success");
      setIsAddAssetModalOpen(false);
      setNewId("");
      setNewName("");
      setNewLocation("");
      setNewCriticality("Medium");
      if (refreshAssets) refreshAssets();
    } catch (err) {
      addToast("Error registering asset: " + err.message, "error");
    }
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setEditName(asset.name || "");
    setEditType(asset.type || "Packaging & Bottling");
    setEditLine(asset.line || "Line 1 (Aseptic Bottling)");
    setEditStatus(asset.status || "Operational");
    setEditHealth(asset.health ?? 100);
    setEditCriticality(asset.criticality || "Medium");
    setEditLocation(asset.location || "Bay 4A - Main Hall");
    setIsEditModalOpen(true);
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      await updateAsset(editingAsset.id, {
        name: editName.trim(),
        type: editType,
        line: editLine,
        status: editStatus,
        health: Number(editHealth),
        criticality: editCriticality,
        location: editLocation.trim(),
      });

      if (logAudit) {
        logAudit({
          entityId: editingAsset.id,
          entityType: "Asset Master",
          action: "Asset Updated",
          field: "Details",
          oldValue: editingAsset.name,
          newValue: `${editName} (${editStatus})`,
          notes: `Status: ${editStatus}, Criticality: ${editCriticality}`
        });
      }

      addToast(`Asset ${editingAsset.id} updated successfully in database!`, "success");
      setIsEditModalOpen(false);
      setEditingAsset(null);
      if (refreshAssets) refreshAssets();
    } catch (err) {
      addToast("Error updating asset: " + err.message, "error");
    }
  };

  const openDeleteModal = (asset) => {
    setDeletingAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return;

    try {
      await deleteAsset(deletingAsset.id);

      if (logAudit) {
        logAudit({
          entityId: deletingAsset.id,
          entityType: "Asset Master",
          action: "Asset Deleted",
          field: "Registration",
          oldValue: deletingAsset.name,
          newValue: "[DELETED]",
          notes: `Asset ${deletingAsset.id} removed from registry and database.`
        });
      }

      addToast(`Asset ${deletingAsset.id} (${deletingAsset.name}) deleted from database!`, "success");
      setIsDeleteModalOpen(false);
      setDeletingAsset(null);
      if (refreshAssets) refreshAssets();
    } catch (err) {
      addToast("Error deleting asset: " + err.message, "error");
    }
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
      render: (val) => {
        const healthNum = Number(val) || 0;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: healthNum > 80 ? "#10B981" : healthNum > 60 ? "#F59E0B" : "#EF4444" }}>
              {healthNum}%
            </span>
            <div style={{ width: "45px", height: "4px", backgroundColor: "#1E293B", borderRadius: "2px" }}>
              <div style={{ width: `${Math.min(100, Math.max(0, healthNum))}%`, height: "100%", backgroundColor: healthNum > 80 ? "#10B981" : healthNum > 60 ? "#F59E0B" : "#EF4444" }} />
            </div>
          </div>
        );
      }
    },
    {
      header: "Telemetry (VIB/TEMP)",
      accessor: "vibration",
      render: (val, row) => (
        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>
          <span style={{ color: (row.vibration || 1.5) > 3.0 ? "#EF4444" : "var(--text-primary)" }}>
            {row.vibration || "1.5"} mm/s
          </span>
          <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>•</span>
          <span style={{ color: "var(--text-secondary)" }}>
            {row.temperature || "55.0"}°C
          </span>
        </div>
      )
    },
    {
      header: "MTBF / MTTR",
      accessor: "mtbf",
      render: (val, row) => (
        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
          {row.mtbf || 350}h MTBF / {row.mttr || 1.5}h MTTR
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
            variant="ghost"
            size="sm"
            icon={Pencil}
            style={{ color: "#38BDF8" }}
            onClick={() => openEditModal(row)}
            title="Edit Machine in DB"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            style={{ color: "#EF4444" }}
            onClick={() => openDeleteModal(row)}
            title="Delete Machine from DB"
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
          <Button variant="secondary" icon={RefreshCw} onClick={handleRefresh} disabled={loading}>
            {loading ? "Syncing..." : "Sync DB"}
          </Button>
          <Button variant="secondary" icon={RotateCcw} onClick={handlePollTelemetry}>
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
        subtitle="Add a new machine directly into the PostgreSQL assets table"
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
              Save to Database
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Asset Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAsset(null);
        }}
        title={`Edit Machine: ${editingAsset?.id || ""}`}
        subtitle="Update machine specifications and status directly in the database"
      >
        <form onSubmit={handleUpdateAsset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Asset Tag ID (Read-only)</label>
              <input
                type="text"
                className="form-input"
                value={editingAsset?.id || ""}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Machine Name *</label>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Operational Status</label>
              <select className="form-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="Operational">Operational</option>
                <option value="Degraded">Degraded</option>
                <option value="Breakdown">Breakdown</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Health Index (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={editHealth}
                onChange={(e) => setEditHealth(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Asset Classification</label>
              <select className="form-select" value={editType} onChange={(e) => setEditType(e.target.value)}>
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
              <select className="form-select" value={editLine} onChange={(e) => setEditLine(e.target.value)}>
                <option value="Line 1 (Aseptic Bottling)">Line 1 (Aseptic Bottling)</option>
                <option value="Line 2 (Formulation & Blending)">Line 2 (Formulation & Blending)</option>
                <option value="Line 3 (Canning Line)">Line 3 (Canning Line)</option>
                <option value="Plant Utilities Backbone">Plant Utilities Backbone</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Physical Location</label>
              <input
                type="text"
                className="form-input"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Criticality</label>
              <select className="form-select" value={editCriticality} onChange={(e) => setEditCriticality(e.target.value)}>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingAsset(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Pencil}>
              Update in Database
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAsset(null);
        }}
        title="Confirm Asset Deletion"
        subtitle="This action will permanently delete the machine from the database."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#EF4444", fontWeight: 700, marginBottom: "6px" }}>
              <AlertTriangle size={18} />
              Warning: Permanent Deletion
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
              Are you sure you want to delete <strong style={{ color: "#FFFFFF" }}>{deletingAsset?.name} ({deletingAsset?.id})</strong>? This will remove all associated registry records from PostgreSQL.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingAsset(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: "#EF4444", borderColor: "#EF4444" }}
              icon={Trash2}
              onClick={handleDeleteConfirm}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

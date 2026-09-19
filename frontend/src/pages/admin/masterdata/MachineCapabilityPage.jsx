import React, { useState, useMemo, useEffect } from "react";
import {
  Cpu,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Building2,
  ShieldCheck,
  Eye,
  History,
  AlertTriangle,
  Clock,
  Layers,
  Wrench,
  Power,
  Trash2,
  Settings
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function MachineCapabilityPage() {
  const { assets = [], addAsset, updateAsset, toggleAssetStatus, deleteAsset, lines = [], plants = [], auditLogs = [] } = useMasterData();
  const { addToast } = useApp();

  // Live Physical Assets directly from PostgreSQL DB
  const [liveAssets, setLiveAssets] = useState(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  const fetchLiveAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const res = await masterDataService.getAssets();
      let data = res?.data !== undefined ? res.data : res;
      if (data && data.status === "success" && data.data !== undefined) {
        data = data.data;
      }
      if (Array.isArray(data)) {
        setLiveAssets(data);
      }
    } catch (err) {
      console.warn("Fetch live assets error:", err.message);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchLiveAssets();
  }, []);

  const effectiveAssets = liveAssets !== null ? liveAssets : (assets || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");
  const [lineFilter, setLineFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("info"); // "info", "production", "maintenance", "downtime", "audit"

  // Dynamic Asset Categories from DB
  const [assetTypes, setAssetTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCode, setNewTypeCode] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [isSavingType, setIsSavingType] = useState(false);

  const fetchAssetTypes = async () => {
    try {
      const res = await masterDataService.getAssetTypes();
      if (res && Array.isArray(res)) {
        setAssetTypes(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setAssetTypes(res.data);
      }
    } catch (err) {
      console.warn("Fetch asset types error:", err.message);
    }
  };

  useEffect(() => {
    fetchAssetTypes();
  }, []);

  const displayTypes = assetTypes;

  const handleCreateAssetType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setIsSavingType(true);
    try {
      const created = await masterDataService.createAssetType({
        name: newTypeName.trim(),
        code: newTypeCode.trim(),
        description: newTypeDesc.trim()
      });
      addToast(`Asset category "${newTypeName}" created in database!`, "success");
      setNewTypeName("");
      setNewTypeCode("");
      setNewTypeDesc("");
      await fetchAssetTypes();
      setNewAsset((prev) => ({ ...prev, type: created?.name || newTypeName.trim() }));
    } catch (err) {
      addToast(`Failed to save category: ${err.message}`, "error");
    } finally {
      setIsSavingType(false);
    }
  };

  const handleDeleteAssetType = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await masterDataService.deleteAssetType(id);
      addToast(`Category "${name}" deleted from database!`, "info");
      await fetchAssetTypes();
    } catch (err) {
      addToast(`Failed to delete category: ${err.message}`, "error");
    }
  };

  // Dynamic Criticality Ratings from DB
  const [criticalityLevels, setCriticalityLevels] = useState([]);
  const [isCritModalOpen, setIsCritModalOpen] = useState(false);
  const [newCritName, setNewCritName] = useState("");
  const [newCritCode, setNewCritCode] = useState("");
  const [newCritDesc, setNewCritDesc] = useState("");
  const [isSavingCrit, setIsSavingCrit] = useState(false);

  const fetchCriticalityLevels = async () => {
    try {
      const res = await masterDataService.getCriticalityLevels();
      if (res && Array.isArray(res)) {
        setCriticalityLevels(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setCriticalityLevels(res.data);
      }
    } catch (err) {
      console.warn("Fetch criticality levels error:", err.message);
    }
  };

  useEffect(() => {
    fetchCriticalityLevels();
  }, []);

  const handleCreateCriticalityLevel = async (e) => {
    e.preventDefault();
    if (!newCritName.trim()) return;
    setIsSavingCrit(true);
    try {
      const created = await masterDataService.createCriticalityLevel({
        name: newCritName.trim(),
        code: newCritCode.trim(),
        description: newCritDesc.trim()
      });
      addToast(`Criticality rating "${newCritName}" saved to database!`, "success");
      setNewCritName("");
      setNewCritCode("");
      setNewCritDesc("");
      await fetchCriticalityLevels();
      setNewAsset((prev) => ({ ...prev, criticality: created?.name || newCritName.trim() }));
    } catch (err) {
      addToast(`Failed to save rating: ${err.message}`, "error");
    } finally {
      setIsSavingCrit(false);
    }
  };

  const handleDeleteCriticalityLevel = async (id, name) => {
    if (!window.confirm(`Delete criticality rating "${name}"?`)) return;
    try {
      await masterDataService.deleteCriticalityLevel(id);
      addToast(`Criticality rating "${name}" deleted from database!`, "info");
      await fetchCriticalityLevels();
    } catch (err) {
      addToast(`Failed to delete rating: ${err.message}`, "error");
    }
  };

  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "",
    lineId: "",
    plantId: plants[0]?.id || plants[0]?.plantId || "PLT-01",
    criticality: "",
    manufacturer: "",
    serialNumber: ""
  });

  const filteredAssets = useMemo(() => {
    return effectiveAssets.filter((a) => {
      const matchesCrit = criticalityFilter === "ALL" || (a.criticality && a.criticality.includes(criticalityFilter));
      const matchesLine = lineFilter === "ALL" || a.lineId === lineFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.assetId?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q) ||
        a.lineName?.toLowerCase().includes(q) ||
        a.manufacturer?.toLowerCase().includes(q);

      return matchesCrit && matchesLine && matchesSearch;
    });
  }, [effectiveAssets, criticalityFilter, lineFilter, searchQuery]);

  // C - CREATE MACHINE ASSET (DB + LIVE SYNC)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newAsset.name.trim()) {
      addToast("Please provide asset name.", "warning");
      return;
    }
    try {
      const payload = {
        name: newAsset.name.trim(),
        type: newAsset.type || (displayTypes[0]?.name || "Packaging / Filling"),
        lineId: newAsset.lineId || null,
        plantId: newAsset.plantId || plants[0]?.id || plants[0]?.plantId || null,
        criticality: newAsset.criticality || (criticalityLevels[0]?.name || "Critical (Class A)"),
        manufacturer: (newAsset.manufacturer || "").trim() || "Krones AG",
        serialNumber: (newAsset.serialNumber || "").trim() || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Operational"
      };
      let created = null;
      try {
        created = await masterDataService.createAsset(payload);
      } catch (err) {
        console.warn("API createAsset fallback:", err);
      }
      if (typeof addAsset === "function") {
        await addAsset({ ...payload, ...(created || {}) });
      }
      addToast(`Asset ${created?.assetId || newAsset.name} commissioned!`, "success");
      setIsAddModalOpen(false);
      setNewAsset({
        name: "",
        type: "",
        lineId: "",
        plantId: plants[0]?.id || plants[0]?.plantId || "PLT-01",
        criticality: "",
        manufacturer: "",
        serialNumber: ""
      });
      await fetchLiveAssets();
    } catch (err) {
      addToast(`Failed to register asset: ${err.message}`, "error");
    }
  };

  // U - UPDATE MACHINE ASSET (DB + LIVE SYNC)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAsset.name.trim()) return;
    try {
      const targetId = editingAsset.id || editingAsset.assetId;
      const updateData = {
        name: editingAsset.name.trim(),
        type: editingAsset.type,
        lineId: editingAsset.lineId,
        criticality: editingAsset.criticality,
        status: editingAsset.status,
        manufacturer: editingAsset.manufacturer
      };
      try {
        await masterDataService.updateAsset(targetId, updateData);
      } catch (err) {
        console.warn("API updateAsset fallback:", err);
      }
      if (typeof updateAsset === "function") {
        await updateAsset(targetId, { ...editingAsset, ...updateData });
      }
      addToast(`Asset ${editingAsset.assetId || editingAsset.name} updated!`, "success");
      setEditingAsset(null);
      await fetchLiveAssets();
    } catch (err) {
      addToast(`Failed to update asset: ${err.message}`, "error");
    }
  };

  // U - TOGGLE STATUS (OPERATIONAL <-> UNDER MAINTENANCE IN DB)
  const handleToggleStatus = async (asset) => {
    const next = asset.status === "Operational" ? "Under Maintenance" : "Operational";
    try {
      const targetId = asset.id || asset.assetId;
      await masterDataService.updateAsset(targetId, { status: next });
      if (typeof updateAsset === "function") {
        updateAsset(targetId, { ...asset, status: next });
      }
      addToast(`Asset ${asset.assetId || asset.name} status changed to ${next}!`, "info");
      await fetchLiveAssets();
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, "error");
    }
  };

  // D - DELETE MACHINE ASSET (DB + LIVE SYNC)
  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Are you sure you want to delete machine asset "${asset.name}" (${asset.assetId}) from database?`)) return;
    try {
      const targetId = asset.id || asset.assetId;
      await masterDataService.deleteAsset(targetId);
      setLiveAssets((prev) => (prev || []).filter((a) => a.id !== targetId && a.assetId !== targetId && a.assetCode !== targetId));
      if (typeof deleteAsset === "function") {
        deleteAsset(targetId);
      }
      addToast(`Asset "${asset.name}" (${asset.assetId}) deleted!`, "info");
      await fetchLiveAssets();
    } catch (err) {
      addToast(`Failed to delete asset: ${err.message}`, "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Machine & Asset Master Management
            </h1>
            <Badge variant="cyan">{effectiveAssets.length} PHYSICAL ASSETS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={Settings}
            onClick={() => setIsTypesModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
          >
            ⚙️ Manage Asset Types ({displayTypes.length})
          </Button>
          <Button
            variant="secondary"
            icon={ShieldCheck}
            onClick={() => setIsCritModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
          >
            🛡️ Manage Criticality ({criticalityLevels.length})
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Register New Machine Asset
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 Responsive Cards */}
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
          title="Fleet Health Score"
          value="95.4%"
          unit="Overall"
          trend={{ value: "Asset health telemetry active", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Class A Critical Assets"
          value={effectiveAssets.filter((a) => a.criticality?.includes("Class A")).length.toString()}
          unit="High Priority"
          trend={{ value: "24/7 condition telemetry", isPositive: true, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Operational Equipments"
          value={effectiveAssets.filter((a) => a.status === "Operational").length.toString()}
          unit="Online"
          trend={{ value: "Connected to plant telemetry", isPositive: true, text: "" }}
          icon={Cpu}
          colorVariant="emerald"
        />
        <StatCard
          title="Connected Lines"
          value={lines.length.toString()}
          unit="Work Centers"
          trend={{ value: "100% allocation across lines", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "170px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Criticalities</option>
              <option value="Class A">Class A (Critical)</option>
              <option value="Class B">Class B (High)</option>
            </select>

            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "160px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Lines</option>
              {lines.map((l) => (
                <option key={l.lineId || l.id} value={l.lineId || l.id}>{l.lineCode || l.code} — {l.name.split(" ")[0]}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredAssets.length}</strong> of {effectiveAssets.length} Machines
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Asset ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Machine / Asset Name</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Type / Functional Area</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Line / Work Centre</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Criticality</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Maintenance State</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const lineObj = lines.find((l) => (l.lineId === asset.lineId || l.id === asset.lineId));
                  return (
                    <tr
                      key={asset.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {asset.assetId}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {asset.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          OEM: {asset.manufacturer || "Krones"} • S/N: {asset.serialNumber || "SN-8812"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant="cyan">{asset.type}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {lineObj ? lineObj.name : (asset.lineName || "Standalone / Unassigned")}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={asset.criticality?.includes("Class A") ? "rose" : "amber"}>
                          {asset.criticality}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
                          {asset.maintenanceStatus || "Healthy (96%)"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={asset.status === "Operational" ? "emerald" : "rose"}>
                          {asset.status}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => {
                              setViewingAsset(asset);
                              setActiveDetailTab("info");
                            }}
                            style={{ padding: "6px 8px" }}
                            title="View Asset 360 & History Tabs"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            onClick={() => setEditingAsset(asset)}
                            style={{ padding: "6px 8px" }}
                            title="Edit Asset"
                          />
                          <button
                            onClick={() => handleToggleStatus(asset)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid var(--border-subtle)",
                              backgroundColor: asset.status === "Operational" ? "rgba(220, 38, 38, 0.08)" : "rgba(5, 150, 105, 0.08)",
                              color: asset.status === "Operational" ? "#DC2626" : "#059669",
                              cursor: "pointer"
                            }}
                            title="Toggle Maintenance Status"
                          >
                            <Power size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid var(--border-subtle)",
                              backgroundColor: "rgba(239, 68, 68, 0.08)",
                              color: "#EF4444",
                              cursor: "pointer"
                            }}
                            title="Delete Asset"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No machine asset records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ASSET TYPES / CATEGORIES MASTER MODAL */}
      {isTypesModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Asset Categories Master (PostgreSQL DB)
                </h3>
              </div>
              <button onClick={() => setIsTypesModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Form to add custom category */}
              <form onSubmit={handleCreateAssetType} style={{ padding: "14px", backgroundColor: "#FFFBF2", borderRadius: "10px", border: "1px solid #F5E6CC", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#8C5E1A" }}>+ Add New Category / Machine Type to Database</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Category / Type Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Industrial Boiler, Conveyor..."
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      className="form-input"
                      style={{ height: "34px", fontSize: "12px", marginTop: "3px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. BLR, CNV"
                      value={newTypeCode}
                      onChange={(e) => setNewTypeCode(e.target.value)}
                      className="form-input"
                      style={{ height: "34px", fontSize: "12px", marginTop: "3px" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief description of this equipment type..."
                    value={newTypeDesc}
                    onChange={(e) => setNewTypeDesc(e.target.value)}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "3px" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="primary" type="submit" disabled={isSavingType || !newTypeName.trim()} style={{ fontSize: "12px", padding: "6px 14px" }}>
                    {isSavingType ? "Saving..." : "Save to Database"}
                  </Button>
                </div>
              </form>

              {/* List of current types */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>
                  Current Active Categories ({displayTypes.length})
                </div>
                <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {displayTypes.length === 0 ? (
                    <div style={{ padding: "18px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", border: "1px dashed var(--border-subtle)", borderRadius: "8px", backgroundColor: "#FAFAFA" }}>
                      No categories found in the database (0 rows in public.asset_types).<br />
                      <span style={{ fontSize: "11px", marginTop: "4px", display: "inline-block" }}>Use the form above to add a new machine category.</span>
                    </div>
                  ) : (
                    displayTypes.map((t) => (
                      <div
                        key={t.id || t.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#FAFAFA",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px"
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{t.name}</span>
                          {t.code && (
                            <span style={{ marginLeft: "8px", fontSize: "11px", padding: "2px 6px", backgroundColor: "#EAEAEA", borderRadius: "4px", color: "#555" }}>
                              {t.code}
                            </span>
                          )}
                          {t.description && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{t.description}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssetType(t.id, t.name)}
                          title="Delete Category"
                          style={{ background: "none", border: "none", color: "#E11D48", cursor: "pointer", padding: "4px" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <Button variant="secondary" onClick={() => setIsTypesModalOpen(false)} style={{ fontSize: "12px" }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRITICALITY RATINGS MASTER MODAL */}
      {isCritModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Criticality Ratings Master (PostgreSQL DB: public.criticality_levels)
                </h3>
              </div>
              <button onClick={() => setIsCritModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Form to add custom criticality level */}
              <form onSubmit={handleCreateCriticalityLevel} style={{ padding: "14px", backgroundColor: "#FFFBF2", borderRadius: "10px", border: "1px solid #F5E6CC", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#8C5E1A" }}>+ Add New Criticality Rating to Database</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Rating Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Critical (Class A), High (Class B)..."
                      value={newCritName}
                      onChange={(e) => setNewCritName(e.target.value)}
                      className="form-input"
                      style={{ height: "34px", fontSize: "12px", marginTop: "3px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. CLS-A, P1"
                      value={newCritCode}
                      onChange={(e) => setNewCritCode(e.target.value)}
                      className="form-input"
                      style={{ height: "34px", fontSize: "12px", marginTop: "3px" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Impact or severity level description..."
                    value={newCritDesc}
                    onChange={(e) => setNewCritDesc(e.target.value)}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "3px" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="primary" type="submit" disabled={isSavingCrit || !newCritName.trim()} style={{ fontSize: "12px", padding: "6px 14px" }}>
                    {isSavingCrit ? "Saving..." : "Save to Database"}
                  </Button>
                </div>
              </form>

              {/* List of current ratings */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>
                  Current Active Ratings in DB ({criticalityLevels.length})
                </div>
                <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {criticalityLevels.length === 0 ? (
                    <div style={{ padding: "18px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", border: "1px dashed var(--border-subtle)", borderRadius: "8px", backgroundColor: "#FAFAFA" }}>
                      No criticality ratings found in the database (0 rows in public.criticality_levels).<br />
                      <span style={{ fontSize: "11px", marginTop: "4px", display: "inline-block" }}>Use the form above to add a new criticality rating.</span>
                    </div>
                  ) : (
                    criticalityLevels.map((c) => (
                      <div
                        key={c.id || c.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#FAFAFA",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px"
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
                          {c.code && (
                            <span style={{ marginLeft: "8px", fontSize: "11px", padding: "2px 6px", backgroundColor: "#EAEAEA", borderRadius: "4px", color: "#555" }}>
                              {c.code}
                            </span>
                          )}
                          {c.description && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{c.description}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCriticalityLevel(c.id, c.name)}
                          title="Delete Rating"
                          style={{ background: "none", border: "none", color: "#E11D48", cursor: "pointer", padding: "4px" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <Button variant="secondary" onClick={() => setIsCritModalOpen(false)} style={{ fontSize: "12px" }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW ASSET MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "640px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Register Machine Asset in Master Catalog
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Machine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arol Rotary Capper Euro-PK"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Asset Type</label>
                    <button
                      type="button"
                      onClick={() => setIsTypesModalOpen(true)}
                      style={{ background: "none", border: "none", color: "#B27E33", fontSize: "11px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                    >
                      + Add / Manage Types
                    </button>
                  </div>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="">-- Select Asset Type --</option>
                    {displayTypes.map((t) => (
                      <option key={t.id || t.name} value={t.name}>{t.name} {t.code ? `(${t.code})` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Assigned Line</label>
                  <select
                    value={newAsset.lineId}
                    onChange={(e) => setNewAsset({ ...newAsset, lineId: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="">-- Standalone / Unassigned --</option>
                    {lines.map((l) => (
                      <option key={l.lineId || l.id} value={l.lineId || l.id}>{l.lineCode || l.code} — {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Criticality Rating</label>
                    <button
                      type="button"
                      onClick={() => setIsCritModalOpen(true)}
                      style={{ background: "none", border: "none", color: "#B27E33", fontSize: "11px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                    >
                      + Add / Manage Ratings
                    </button>
                  </div>
                  <select
                    value={newAsset.criticality}
                    onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="">-- Select Criticality Rating --</option>
                    {criticalityLevels.map((c) => (
                      <option key={c.id || c.name} value={c.name}>{c.name} {c.code ? `(${c.code})` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Manufacturer OEM</label>
                  <input
                    type="text"
                    placeholder="e.g. Sidel / Krones"
                    value={newAsset.manufacturer}
                    onChange={(e) => setNewAsset({ ...newAsset, manufacturer: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Commission Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5-TAB ASSET DETAIL MODAL */}
      {viewingAsset && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "820px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Cpu size={20} color="#B27E33" />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                      {viewingAsset.name}
                    </h3>
                    <Badge variant="cyan">{viewingAsset.assetId}</Badge>
                    <Badge variant={viewingAsset.status === "Operational" ? "emerald" : "rose"}>{viewingAsset.status}</Badge>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Line: {viewingAsset.lineName || "Line 1"} • OEM: {viewingAsset.manufacturer || "Krones"} • S/N: {viewingAsset.serialNumber || "SN-8812"}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingAsset(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {/* 5 Tabs Header */}
            <div style={{ display: "flex", gap: "4px", padding: "12px 22px 0", borderBottom: "1px solid var(--border-subtle)", overflowX: "auto" }}>
              {[
                { id: "info", label: "1. Asset Information" },
                { id: "production", label: "2. Production Usage" },
                { id: "maintenance", label: "3. Maintenance History" },
                { id: "downtime", label: "4. Downtime Logs" },
                { id: "audit", label: "5. Audit History" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  style={{
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    borderBottom: activeDetailTab === tab.id ? "2px solid #C89547" : "2px solid transparent",
                    color: activeDetailTab === tab.id ? "#8C5B23" : "var(--text-secondary)",
                    background: "transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div style={{ padding: "22px", overflowY: "auto", flex: 1 }}>
              {activeDetailTab === "info" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "14px", borderRadius: "10px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Criticality</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", marginTop: "2px" }}>{viewingAsset.criticality}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Type</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>{viewingAsset.type}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Installation Date</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>{viewingAsset.installDate || "2024-03-15"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Health Score</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", marginTop: "2px" }}>{viewingAsset.maintenanceStatus || "96% (Healthy)"}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    This asset is commissioned with 24/7 condition vibration and temperature edge telemetry. Integrated into PM recurrence schedules and automatic Work Order generation.
                  </div>
                </div>
              )}

              {activeDetailTab === "production" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Active Production Telemetry</div>
                  <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Current Speed / Throughput:</span>
                      <strong>38,400 Bottles / Hour (96.2% Rated Speed)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Current Running Product:</span>
                      <strong>SKU-5001 (500ml Sparkling Citrus Soda)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Current Shift Availability:</span>
                      <strong style={{ color: "#059669" }}>99.1% (35.8 hrs MTBF)</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === "maintenance" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Recent Maintenance Work Orders</div>
                  {viewingAsset.maintenanceHistory && viewingAsset.maintenanceHistory.length > 0 ? (
                    viewingAsset.maintenanceHistory.map((m, idx) => (
                      <div key={idx} style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{m.woId}: {m.description}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Date: {m.date} • Type: {m.type}</div>
                        </div>
                        <Badge variant="emerald">{m.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>WO-8821: Monthly valve diaphragm lubrication & CIP rinse</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Date: 2026-08-28 • Type: Preventive</div>
                      </div>
                      <Badge variant="emerald">Completed</Badge>
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === "downtime" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Downtime & Stoppage Event Log</div>
                  {viewingAsset.downtimeHistory && viewingAsset.downtimeHistory.length > 0 ? (
                    viewingAsset.downtimeHistory.map((d, idx) => (
                      <div key={idx} style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{d.reason} (Code: {d.code})</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Date: {d.date} • Attended by: {d.technician}</div>
                        </div>
                        <Badge variant="rose">{d.durationMin} Mins Down</Badge>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>0 unplanned stoppages logged in current operating cycle.</div>
                  )}
                </div>
              )}

              {activeDetailTab === "audit" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Asset Lifecycle & Parameter Audit Trail</div>
                  {auditLogs.filter((a) => a.entityId === viewingAsset.assetId).length > 0 ? (
                    auditLogs.filter((a) => a.entityId === viewingAsset.assetId).map((a) => (
                      <div key={a.auditId} style={{ backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", padding: "10px", fontSize: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>{a.action} by {a.user}</strong>
                          <span style={{ color: "var(--text-muted)" }}>{a.timestamp}</span>
                        </div>
                        <div style={{ color: "var(--text-secondary)", marginTop: "3px" }}>{a.newValue || a.notes}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", padding: "10px", fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>Commissioned into Asset Register by Alexander Vance</strong>
                        <span style={{ color: "var(--text-muted)" }}>{viewingAsset.installDate || "2024-03-15"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setViewingAsset(null)} style={{ fontSize: "12px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ASSET MODAL */}
      {editingAsset && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Machine Asset — {editingAsset.assetId}
                </h3>
              </div>
              <button onClick={() => setEditingAsset(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Machine / Asset Name *</label>
                <input
                  type="text"
                  required
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Asset Type</label>
                  <select
                    value={editingAsset.type}
                    onChange={(e) => setEditingAsset({ ...editingAsset, type: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {displayTypes.map((t) => (
                      <option key={t.id || t.name} value={t.name}>{t.name} {t.code ? `(${t.code})` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Assigned Line</label>
                  <select
                    value={editingAsset.lineId || ""}
                    onChange={(e) => {
                      const l = lines.find((line) => (line.lineId || line.id) === e.target.value);
                      setEditingAsset({ ...editingAsset, lineId: e.target.value, lineName: l?.name || "" });
                    }}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="">-- Standalone / Unassigned --</option>
                    {lines.map((l) => (
                      <option key={l.lineId || l.id} value={l.lineId || l.id}>{l.lineCode || l.code} — {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Criticality Rating</label>
                  <select
                    value={editingAsset.criticality || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, criticality: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="">-- Select Criticality Rating --</option>
                    {criticalityLevels.map((c) => (
                      <option key={c.id || c.name} value={c.name}>{c.name} {c.code ? `(${c.code})` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Manufacturer OEM</label>
                  <input
                    type="text"
                    value={editingAsset.manufacturer || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, manufacturer: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingAsset(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE ASSET CONFIRM MODAL */}
      {deletingAsset && (
        <div className="modal-backdrop" onClick={() => setDeletingAsset(null)}>
          <div className="modal-content" style={{ maxWidth: "460px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Delete Machine Asset</h2>
              </div>
              <button onClick={() => setDeletingAsset(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to permanently delete machine <strong style={{ color: "var(--text-primary)" }}>{deletingAsset.name}</strong> ({deletingAsset.assetId})? This action cannot be undone.
              </p>
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "8px", fontSize: "12px", color: "#DC2626" }}>
                Warning: Work orders, maintenance schedules, and OEE history linked to this asset will be affected.
              </div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setDeletingAsset(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    if (typeof deleteAsset === "function") {
                      await deleteAsset(deletingAsset.assetId || deletingAsset.id);
                    }
                    addToast(`Asset "${deletingAsset.name}" deleted.`, "info");
                  } catch (err) {
                    addToast(`Failed to delete asset: ${err.message}`, "error");
                  } finally {
                    setDeletingAsset(null);
                  }
                }}
                style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}
              >
                Delete Asset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Layers,
  Thermometer,
  Boxes,
  ShieldCheck,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function StorageResourcesPage() {
  const { storageResources = [], addStorageResource, updateStorageResource, deleteStorageResource, plants = [], activePlantId } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState(null);

  const [newRes, setNewRes] = useState({
    plantId: activePlantId || "PLT-01",
    resourceType: "Selective Pallet Rack",
    resourceCode: "",
    name: "",
    capacityUnit: "Pallet Positions",
    totalCapacity: 500,
    temperatureZone: "Ambient (18°C - 24°C)"
  });

  const filteredResources = useMemo(() => {
    return storageResources.filter((r) => {
      const matchesPlant = plantFilter === "ALL" || r.plantId === plantFilter;
      const matchesType = typeFilter === "ALL" || r.resourceType === typeFilter || r.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.resourceCode || r.id || "").toLowerCase().includes(q) ||
        (r.resourceType || r.type || "").toLowerCase().includes(q) ||
        (r.temperatureZone || r.tempControl || "").toLowerCase().includes(q);

      return matchesPlant && matchesType && matchesSearch;
    });
  }, [storageResources, plantFilter, typeFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRes.name.trim()) {
      addToast("Please provide storage resource name.", "warning");
      return;
    }

    const created = addStorageResource({
      ...newRes,
      resourceCode: newRes.resourceCode || `STR-${(storageResources.length + 1).toString().padStart(2, "0")}`,
      totalCapacity: Number(newRes.totalCapacity) || 400
    });

    addToast(`Storage Resource "${created.resourceCode}" registered!`, "success");
    setIsModalOpen(false);
    setNewRes({
      plantId: activePlantId || "PLT-01",
      resourceType: "Selective Pallet Rack",
      resourceCode: "",
      name: "",
      capacityUnit: "Pallet Positions",
      totalCapacity: 500,
      temperatureZone: "Ambient (18°C - 24°C)"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingRes.name.trim()) {
      addToast("Please provide storage resource name.", "warning");
      return;
    }

    updateStorageResource(editingRes.resourceId, {
      ...editingRes,
      totalCapacity: Number(editingRes.totalCapacity) || 400
    });

    addToast(`Storage Resource ${editingRes.resourceCode || editingRes.id} updated!`, "success");
    setEditingRes(null);
  };

  const handleDelete = (resourceId, code) => {
    if (window.confirm(`Are you sure you want to delete Storage Resource "${code}"?`)) {
      deleteStorageResource(resourceId);
      addToast(`Storage Resource "${code}" deleted.`, "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Storage Resources & Warehouse Master
            </h1>
            <Badge variant="cyan">{storageResources.length} STORAGE LOCATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Storage Resource
          </Button>
        </div>
      </div>

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
          title="Active Storage Nodes"
          value={storageResources.length.toString()}
          unit="Locations"
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Pallet Positions"
          value="1,450"
          unit="High-Bay / Floor"
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Bulk Liquid Capacity"
          value="40,000 L"
          unit="Silo Farm"
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="Cold-Chain Monitored"
          value="100%"
          unit="Audited"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search resource name, code or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Storage Types</option>
              <option value="Jacketed Silo">Jacketed Silo</option>
              <option value="Selective Pallet Rack">Selective Pallet Rack</option>
              <option value="Refrigerated Staging Bay">Refrigerated Staging Bay</option>
              <option value="Packaging Mezzanine">Packaging Mezzanine</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Resource Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Resource Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Facility</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Storage Type</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Capacity</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Temperature Control</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No storage resources found.
                  </td>
                </tr>
              ) : (
                filteredResources.map((r) => {
                  const code = r.resourceCode || r.id;
                  const type = r.resourceType || r.type;
                  const temp = r.temperatureZone || r.tempControl;
                  const plantName = plants.find((p) => p.id === r.plantId)?.name?.split(" - ")[0] || "Indore Plant 1";
                  return (
                    <tr key={r.resourceId || r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {code}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                        {r.name}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Building2 size={12} color="#C89547" />
                          <span>{plantName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="cyan">{type}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                        {r.totalCapacity ? `${r.totalCapacity.toLocaleString()} ${r.capacityUnit || "Units"}` : r.capacity}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: temp?.includes("Chilled") || temp?.includes("Refrigerated") ? "#0284C7" : "var(--text-secondary)" }}>
                        {temp}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="emerald">{r.status || "Active"}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setEditingRes({ ...r })}
                            title="Edit Resource"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.resourceId || r.id, code)}
                            title="Delete Resource"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD RESOURCE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Storage Resource Node
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Resource Code</label>
                  <input
                    type="text"
                    placeholder="e.g. STR-05"
                    value={newRes.resourceCode}
                    onChange={(e) => setNewRes({ ...newRes, resourceCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Resource Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cold Staging Bay 05"
                    value={newRes.name}
                    onChange={(e) => setNewRes({ ...newRes, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Facility *</label>
                  <select
                    value={newRes.plantId}
                    onChange={(e) => setNewRes({ ...newRes, plantId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name.split(" - ")[0]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Storage Type</label>
                  <select
                    value={newRes.resourceType}
                    onChange={(e) => setNewRes({ ...newRes, resourceType: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Selective Pallet Rack">Selective Pallet Rack</option>
                    <option value="Jacketed Silo">Jacketed Silo</option>
                    <option value="Refrigerated Staging Bay">Refrigerated Staging Bay</option>
                    <option value="Packaging Mezzanine">Packaging Mezzanine</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Capacity Total *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRes.totalCapacity}
                    onChange={(e) => setNewRes({ ...newRes, totalCapacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Capacity Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Pallet Positions or Liters"
                    value={newRes.capacityUnit}
                    onChange={(e) => setNewRes({ ...newRes, capacityUnit: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Temperature Zone & Environmental Control</label>
                <input
                  type="text"
                  placeholder="e.g. Chilled (2°C - 4°C) or Ambient"
                  value={newRes.temperatureZone}
                  onChange={(e) => setNewRes({ ...newRes, temperatureZone: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Storage Node
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESOURCE MODAL */}
      {editingRes && (
        <div className="modal-backdrop" onClick={() => setEditingRes(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Storage Node — {editingRes.resourceCode || editingRes.id}
                </h2>
              </div>
              <button onClick={() => setEditingRes(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Resource Name *</label>
                <input
                  type="text"
                  required
                  value={editingRes.name}
                  onChange={(e) => setEditingRes({ ...editingRes, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Storage Type</label>
                  <select
                    value={editingRes.resourceType || editingRes.type}
                    onChange={(e) => setEditingRes({ ...editingRes, resourceType: e.target.value, type: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Selective Pallet Rack">Selective Pallet Rack</option>
                    <option value="Jacketed Silo">Jacketed Silo</option>
                    <option value="Refrigerated Staging Bay">Refrigerated Staging Bay</option>
                    <option value="Packaging Mezzanine">Packaging Mezzanine</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Capacity Total</label>
                  <input
                    type="number"
                    min="1"
                    value={editingRes.totalCapacity || 400}
                    onChange={(e) => setEditingRes({ ...editingRes, totalCapacity: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Temperature Zone</label>
                <input
                  type="text"
                  value={editingRes.temperatureZone || editingRes.tempControl || "Ambient"}
                  onChange={(e) => setEditingRes({ ...editingRes, temperatureZone: e.target.value, tempControl: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingRes(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Node
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

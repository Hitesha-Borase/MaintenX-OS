import React, { useState } from "react";
import {
  Package,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Layers,
  Thermometer,
  Boxes,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function StorageResourcesPage() {
  const { addToast } = useApp();

  const [resources, setResources] = useState([
    { id: "STR-01", name: "Bulk Liquid Syrup Tank 01", type: "Jacketed Silo", capacity: "20,000 Liters", tempControl: "4°C - 8°C Chilled", zone: "Zone C - Silo Farm", status: "Active" },
    { id: "STR-02", name: "Bulk Liquid Syrup Tank 02", type: "Jacketed Silo", capacity: "20,000 Liters", tempControl: "4°C - 8°C Chilled", zone: "Zone C - Silo Farm", status: "Active" },
    { id: "STR-03", name: "Warehouse High-Bay Racking A1", type: "Selective Pallet Rack", capacity: "450 Pallet Positions", tempControl: "Ambient", zone: "Zone B - Finished Goods", status: "Active" },
    { id: "STR-04", name: "Cold Storage Staging Bay 04", type: "Refrigerated Dock", capacity: "120 Pallet Positions", tempControl: "2°C - 4°C", zone: "Zone D - Cold Dock", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRes, setNewRes] = useState({
    name: "",
    type: "Selective Pallet Rack",
    capacity: "300 Pallets",
    tempControl: "Ambient",
    zone: "Zone B - Finished Goods"
  });

  const filteredResources = resources.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRes.name.trim()) {
      addToast("Please provide storage resource name.", "warning");
      return;
    }

    const created = {
      id: `STR-0${resources.length + 1}`,
      name: newRes.name,
      type: newRes.type,
      capacity: newRes.capacity || "100 Positions",
      tempControl: newRes.tempControl || "Ambient",
      zone: newRes.zone,
      status: "Active"
    };

    setResources([...resources, created]);
    addToast(`Storage location "${created.id}" provisioned!`, "success");
    setIsModalOpen(false);
    setNewRes({ name: "", type: "Selective Pallet Rack", capacity: "300 Pallets", tempControl: "Ambient", zone: "Zone B - Finished Goods" });
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
            <Badge variant="cyan">{resources.length} STORAGE LOCATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Storage Location
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
          title="Storage Resources"
          value={resources.length.toString()}
          unit="Active Nodes"
          trend={{ value: "Liquid silos, docks & racks", isPositive: true, text: "" }}
          icon={Boxes}
          colorVariant="emerald"
        />
        <StatCard
          title="Liquid Silo Capacity"
          value="40,000 L"
          unit="Syrup Tanks"
          trend={{ value: "Jacketed chilling active", isPositive: true, text: "" }}
          icon={Thermometer}
          colorVariant="cyan"
        />
        <StatCard
          title="Pallet Positions"
          value="570 Bays"
          unit="Total Capacity"
          trend={{ value: "84% warehouse utilization", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="WMS Real-Time Sync"
          value="100%"
          unit="RFID Live"
          trend={{ value: "Sub-second bin location tracking", isPositive: true, text: "" }}
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
              placeholder="Search storage name, code, type, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "720px" }}>
            <thead>
              <tr>
                <th>Resource Code</th>
                <th>Storage Name</th>
                <th>Resource Type</th>
                <th>Capacity</th>
                <th>Thermal Envelope</th>
                <th>Warehouse Zone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{r.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{r.type}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{r.capacity}</td>
                  <td style={{ fontSize: "12px", color: "#D97706", fontWeight: 600 }}>{r.tempControl}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{r.zone}</td>
                  <td>
                    <Badge variant="emerald">{r.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened storage allocation for ${r.name}`, "info")}
                      title="Edit Location"
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

      {/* ADD STORAGE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Storage Resource / Bay
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Storage Resource Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liquid Sugar Silo 03"
                  value={newRes.name}
                  onChange={(e) => setNewRes({ ...newRes, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Resource Type</label>
                  <select
                    className="form-select"
                    value={newRes.type}
                    onChange={(e) => setNewRes({ ...newRes, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Jacketed Silo">Jacketed Silo</option>
                    <option value="Selective Pallet Rack">Selective Pallet Rack</option>
                    <option value="Refrigerated Dock">Refrigerated Dock</option>
                    <option value="Chemical Storage Vault">Chemical Storage Vault</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Capacity Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 25,000 Liters"
                    value={newRes.capacity}
                    onChange={(e) => setNewRes({ ...newRes, capacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Thermal Envelope</label>
                  <input
                    type="text"
                    placeholder="e.g. 4°C - 8°C Chilled"
                    value={newRes.tempControl}
                    onChange={(e) => setNewRes({ ...newRes, tempControl: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Warehouse Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Zone C - Silo Farm"
                    value={newRes.zone}
                    onChange={(e) => setNewRes({ ...newRes, zone: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Location
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

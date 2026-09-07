import React, { useState } from "react";
import {
  Layers,
  Search,
  Plus,
  QrCode,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  Download,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function AssetRegister() {
  const { assets = [], addAsset, updateAssetStatus } = useCMMS();
  const { addToast, openQrModal } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");
  const [selectedPlant, setSelectedPlant] = useState("ALL");

  // Add Asset Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Packaging & Bottling",
    plant: "Plant 1 - North Facility",
    department: "Packaging",
    line: "Line 1 (Aseptic Bottling)",
    location: "Bay 4 - Zone A",
    criticality: "High",
    manufacturer: "",
    serialNumber: "",
    operator: "Assigned Tech"
  });

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.line?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || asset.status === statusFilter;
    const matchesCriticality = criticalityFilter === "ALL" || asset.criticality === criticalityFilter;
    const matchesPlant = selectedPlant === "ALL" || asset.plant?.includes(selectedPlant);

    return matchesSearch && matchesStatus && matchesCriticality && matchesPlant;
  });

  const handleCreateAsset = (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast("Please enter an asset name.", "warning");
      return;
    }

    const created = addAsset(formData);
    addToast(`Asset ${created?.id || "NEW"} registered successfully!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      type: "Packaging & Bottling",
      plant: "Plant 1 - North Facility",
      department: "Packaging",
      line: "Line 1 (Aseptic Bottling)",
      location: "Bay 4 - Zone A",
      criticality: "High",
      manufacturer: "",
      serialNumber: "",
      operator: "Assigned Tech"
    });
  };

  const handleExportCSV = () => {
    const headers = "Asset ID,Name,Type,Department,Line,Status,Health (%),Vibration (mm/s),Criticality\n";
    const rows = filteredAssets
      .map(
        (a) =>
          `"${a.id}","${a.name}","${a.type}","${a.department}","${a.line}","${a.status}",${a.health},${a.vibration},"${a.criticality}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Asset_Register_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Asset register exported to CSV.", "info");
  };

  const opCount = assets.filter((a) => a.status === "Operational").length;
  const degCount = assets.filter((a) => a.status === "Degraded").length;
  const bdCount = assets.filter((a) => a.status === "Breakdown" || a.status === "Out of Service").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Asset Register
            </h1>
            <Badge variant="cyan">{assets.length} TOTAL REGISTERED ASSETS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Register New Asset
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards - 2x2 on mobile, 3 on desktop */}
      <div
        className="kpi-grid-responsive grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Operational Fleet"
          value={`${opCount} / ${assets.length}`}
          unit="Active"
          trend={{ value: `${((opCount / (assets.length || 1)) * 100).toFixed(1)}% availability`, isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => setStatusFilter("Operational")}
        />
        <StatCard
          title="Degraded Equipment"
          value={degCount.toString()}
          unit="Assets"
          trend={{ value: "Requires scheduled PM / inspection", isPositive: degCount === 0, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
          onClick={() => setStatusFilter("Degraded")}
        />
        <StatCard
          title="Unplanned Outages"
          value={bdCount.toString()}
          unit="Assets"
          trend={{ value: bdCount > 0 ? "Active repair in progress" : "No active breakdowns", isPositive: bdCount === 0, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
          onClick={() => setStatusFilter("Breakdown")}
        />
      </div>

      {/* Filters & Search Card */}
      <Card style={{ padding: "16px", minWidth: 0, width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "10px" }}
            />
          </div>

          {/* Filter Dropdowns Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Status:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "115px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="Degraded">Degraded</option>
                <option value="Breakdown">Breakdown</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            {/* Criticality Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Crit:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "110px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value)}
              >
                <option value="ALL">All Criticality</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Plant Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Plant:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "110px", fontSize: "12px", backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
              >
                <option value="ALL">All Plants</option>
                <option value="Plant 1">Plant 1</option>
                <option value="Plant 2">Plant 2</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== "ALL" || criticalityFilter !== "ALL" || selectedPlant !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setCriticalityFilter("ALL");
                  setSelectedPlant("ALL");
                }}
                style={{
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Asset Table Card */}
      <Card style={{ padding: "16px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Assets Inventory Table ({filteredAssets.length})
            </h3>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              Click on any asset for 360° telemetry, work orders, and PM checklists.
            </p>
          </div>
        </div>

        {/* Scrollable Container with Horizontal Slide */}
        <div
          className="data-table-container"
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100%",
            display: "block",
            boxSizing: "border-box"
          }}
        >
          <table className="data-table" style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "150px" }}>Asset ID / Name</th>
                <th style={{ minWidth: "140px" }}>Department & Line</th>
                <th style={{ minWidth: "120px" }}>Status</th>
                <th style={{ minWidth: "100px" }}>Health Index</th>
                <th style={{ minWidth: "90px" }}>Vibration</th>
                <th style={{ minWidth: "80px" }}>Open WOs</th>
                <th style={{ minWidth: "90px" }}>Criticality</th>
                <th style={{ minWidth: "120px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No matching equipment found in register.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isOp = asset.status === "Operational";
                  const isBD = asset.status === "Breakdown";
                  const badgeVar = isOp ? "emerald" : isBD ? "rose" : "amber";

                  return (
                    <tr key={asset.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                          {asset.id}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {asset.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{asset.manufacturer || "OEM Model"}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{asset.department}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{asset.line}</div>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{
                            height: "28px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: isOp ? "rgba(16, 185, 129, 0.15)" : isBD ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: isOp ? "#059669" : isBD ? "#DC2626" : "#D97706",
                            border: "1px solid currentColor",
                            borderRadius: "6px"
                          }}
                          value={asset.status}
                          onChange={(e) => {
                            updateAssetStatus(asset.id, e.target.value);
                            addToast(`Asset ${asset.id} status changed to ${e.target.value}`, "info");
                          }}
                        >
                          <option value="Operational">Operational</option>
                          <option value="Degraded">Degraded</option>
                          <option value="Breakdown">Breakdown</option>
                          <option value="Out of Service">Out of Service</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: asset.health > 80 ? "#059669" : asset.health > 60 ? "#D97706" : "#DC2626" }}>
                            {asset.health}%
                          </span>
                          <div style={{ width: "40px", height: "4px", backgroundColor: "#E8DDCF", borderRadius: "2px" }}>
                            <div style={{ width: `${asset.health}%`, height: "100%", backgroundColor: asset.health > 80 ? "#059669" : asset.health > 60 ? "#D97706" : "#DC2626", borderRadius: "2px" }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: asset.vibration > 3.0 ? "#DC2626" : "var(--text-primary)" }}>
                        {asset.vibration} mm/s
                      </td>
                      <td>
                        {asset.openWorkOrders > 0 ? (
                          <Badge variant="amber">{asset.openWorkOrders} Open</Badge>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>0</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={asset.criticality === "Critical" ? "rose" : asset.criticality === "High" ? "amber" : "cyan"}>
                          {asset.criticality}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={QrCode}
                            onClick={() => openQrModal(`${asset.name} QR`, asset.id, { name: asset.name, location: asset.location })}
                            title="View Asset QR"
                            style={{ padding: "4px 8px" }}
                          />
                          <button
                            onClick={() => navigate(`/assets/360?id=${asset.id}`)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "7px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                              color: "#261603",
                              border: "1px solid #E8C182",
                              boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            Asset 360
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

      {/* ADD ASSET MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Register New Equipment Asset
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Asset Name / Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Pressure Centrifugal CIP Pump 15kW"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Asset Category</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging & Bottling">Packaging & Bottling</option>
                    <option value="Processing & Mixing">Processing & Mixing</option>
                    <option value="Thermal Processing">Thermal Processing</option>
                    <option value="Utilities & Facilities">Utilities & Facilities</option>
                    <option value="Conveying & Handling">Conveying & Handling</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Criticality Rating</label>
                  <select
                    className="form-select"
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Critical">Critical (P1 Production Impact)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Facility</label>
                  <select
                    className="form-select"
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Plant 1 - North Facility">Plant 1 - North Facility</option>
                    <option value="Plant 2 - South Facility">Plant 2 - South Facility</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Processing">Processing</option>
                    <option value="Facilities & Utilities">Facilities & Utilities</option>
                    <option value="Warehouse & Shipping">Warehouse & Shipping</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Production Line</label>
                  <input
                    type="text"
                    placeholder="e.g. Line 1 (Aseptic Bottling)"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Bay / Physical Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 3C - Wet Area"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">OEM Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Krones / Alfa Laval / Grundfos"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-2026-8812"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

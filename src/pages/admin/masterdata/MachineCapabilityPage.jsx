import React, { useState, useMemo } from "react";
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
  Power
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function MachineCapabilityPage() {
  const { assets = [], addAsset, updateAsset, toggleAssetStatus, lines = [], plants = [], auditLogs = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");
  const [lineFilter, setLineFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("info"); // "info", "production", "maintenance", "downtime", "audit"

  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "Packaging / Filling",
    lineId: "LIN-01",
    plantId: "PLT-01",
    criticality: "Critical (Class A)",
    manufacturer: "Krones AG",
    serialNumber: ""
  });

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesCrit = criticalityFilter === "ALL" || a.criticality?.includes(criticalityFilter);
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
  }, [assets, criticalityFilter, lineFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAsset.name.trim()) {
      addToast("Please provide asset name.", "warning");
      return;
    }
    const created = addAsset(newAsset);
    addToast(`Asset ${created.assetId} (${created.name}) commissioned!`, "success");
    setIsAddModalOpen(false);
    setNewAsset({
      name: "",
      type: "Packaging / Filling",
      lineId: "LIN-01",
      plantId: "PLT-01",
      criticality: "Critical (Class A)",
      manufacturer: "Krones AG",
      serialNumber: ""
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingAsset.name.trim()) return;
    updateAsset(editingAsset.assetId, editingAsset);
    addToast(`Asset ${editingAsset.assetId} updated successfully!`, "success");
    setEditingAsset(null);
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
            <Badge variant="cyan">{assets.length} PHYSICAL ASSETS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
          value={assets.filter((a) => a.criticality?.includes("Class A")).length.toString()}
          unit="High Priority"
          trend={{ value: "24/7 condition telemetry", isPositive: true, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Operational Equipments"
          value={assets.filter((a) => a.status === "Operational").length.toString()}
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
                <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name.split(" ")[0]}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredAssets.length}</strong> of {assets.length} Machines
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
                  const lineObj = lines.find((l) => l.lineId === asset.lineId);
                  return (
                    <tr
                      key={asset.assetId}
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
                          {lineObj ? lineObj.name : "Bottling Line 1"}
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
                            onClick={() => {
                              toggleAssetStatus(asset.assetId);
                              addToast(`Asset ${asset.assetId} status toggled!`, "info");
                            }}
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
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Asset Type</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Packaging / Filling">Packaging / Filling</option>
                    <option value="Thermal Processing">Thermal Processing</option>
                    <option value="Packaging / Capping">Packaging / Capping</option>
                    <option value="Forming / Molding">Forming / Molding</option>
                    <option value="Inspection / QA">Inspection / QA</option>
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
                    {lines.map((l) => (
                      <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Criticality Rating</label>
                  <select
                    value={newAsset.criticality}
                    onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Critical (Class A)">Critical (Class A)</option>
                    <option value="High (Class B)">High (Class B)</option>
                    <option value="Medium (Class C)">Medium (Class C)</option>
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
    </div>
  );
}

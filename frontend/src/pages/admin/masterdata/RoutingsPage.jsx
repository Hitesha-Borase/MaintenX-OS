import React, { useState, useMemo } from "react";
import {
  GitCommit,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ArrowRight,
  Layers,
  Workflow,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Boxes
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function RoutingsPage() {
  const { routings = [], addRouting, updateRouting, deleteRouting, skus = [], lines = [], operations = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouting, setEditingRouting] = useState(null);

  const finishedSkus = useMemo(() => skus.filter((s) => s.category === "Finished Goods"), [skus]);

  const [newRouting, setNewRouting] = useState({
    routingCode: "",
    skuId: finishedSkus[0]?.skuId || "SKU-001",
    lineId: lines[0]?.lineId || "LIN-01",
    stdRunRateBPH: 35000,
    setupDurationMin: 30,
    expectedYieldPct: 99.0,
    revision: "R1"
  });

  const filteredRoutings = useMemo(() => {
    return routings.filter((r) => {
      const matchesLine = lineFilter === "ALL" || r.lineId === lineFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.routingCode || r.id || "").toLowerCase().includes(q) ||
        (r.skuName || r.name || "").toLowerCase().includes(q) ||
        (r.skuCode || "").toLowerCase().includes(q) ||
        (r.lineName || r.line || "").toLowerCase().includes(q);

      return matchesLine && matchesSearch;
    });
  }, [routings, lineFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const selSku = skus.find((s) => s.skuId === newRouting.skuId);
    const selLine = lines.find((l) => l.lineId === newRouting.lineId);

    if (!selSku || !selLine) {
      addToast("Please select valid SKU and Line.", "warning");
      return;
    }

    const created = addRouting({
      ...newRouting,
      routingCode: newRouting.routingCode || `RTG-${selSku.skuCode || "5000"}-${selLine.lineCode || "L1"}`,
      skuCode: selSku.skuCode,
      skuName: selSku.name,
      lineCode: selLine.lineCode,
      lineName: selLine.name,
      stdRunRateBPH: Number(newRouting.stdRunRateBPH) || 35000,
      setupDurationMin: Number(newRouting.setupDurationMin) || 30,
      expectedYieldPct: Number(newRouting.expectedYieldPct) || 99.0
    });

    addToast(`Routing sequence "${created.routingCode}" created!`, "success");
    setIsModalOpen(false);
    setNewRouting({
      routingCode: "",
      skuId: finishedSkus[0]?.skuId || "SKU-001",
      lineId: lines[0]?.lineId || "LIN-01",
      stdRunRateBPH: 35000,
      setupDurationMin: 30,
      expectedYieldPct: 99.0,
      revision: "R1"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const selSku = skus.find((s) => s.skuId === editingRouting.skuId);
    const selLine = lines.find((l) => l.lineId === editingRouting.lineId);

    updateRouting(editingRouting.routingId, {
      ...editingRouting,
      skuCode: selSku ? selSku.skuCode : editingRouting.skuCode,
      skuName: selSku ? selSku.name : editingRouting.skuName,
      lineCode: selLine ? selLine.lineCode : editingRouting.lineCode,
      lineName: selLine ? selLine.name : editingRouting.lineName,
      stdRunRateBPH: Number(editingRouting.stdRunRateBPH) || 35000,
      setupDurationMin: Number(editingRouting.setupDurationMin) || 30,
      expectedYieldPct: Number(editingRouting.expectedYieldPct) || 99.0
    });

    addToast(`Routing sequence "${editingRouting.routingCode || editingRouting.id}" updated!`, "success");
    setEditingRouting(null);
  };

  const handleDelete = (routingId, code) => {
    if (window.confirm(`Are you sure you want to delete Routing "${code}"?`)) {
      deleteRouting(routingId);
      addToast(`Routing "${code}" deleted.`, "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Standard Manufacturing Routings
            </h1>
            <Badge variant="cyan">{routings.length} ROUTING SEQUENCES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Routing Sequence
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
          title="Active Routings"
          value={routings.length.toString()}
          unit="Sequences"
          icon={Workflow}
          colorVariant="emerald"
        />
        <StatCard
          title="Mapped Finished SKUs"
          value={new Set(routings.map((r) => r.skuId)).size.toString()}
          unit="Formulations"
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Avg Standard Speed"
          value="38,500 BPH"
          unit="Rated Pace"
          icon={Cpu}
          colorVariant="amber"
        />
        <StatCard
          title="Expected Yield Standard"
          value="99.3%"
          unit="Average"
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
              placeholder="Search routing by SKU, code or target line..."
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
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Work Center Lines</option>
              {lines.map((l) => (
                <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Routing Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Associated Master SKU</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Standard Speed</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Setup Time</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Expected Yield</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No routings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRoutings.map((r) => {
                  const code = r.routingCode || r.id;
                  const skuTitle = r.skuName || r.name;
                  const lineTitle = r.lineName || r.line;
                  return (
                    <tr key={r.routingId || r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {code}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{skuTitle}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.skuCode}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)" }}>
                        <div style={{ fontWeight: 700 }}>{lineTitle}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{r.lineCode}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#D97706" }}>
                        {(Number(r.stdRunRateBPH) || 35000).toLocaleString()} BPH
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                        {r.setupDurationMin || 30} mins
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                        {r.expectedYieldPct || 99.0}%
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="emerald">{r.status || "Active"}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setEditingRouting({ ...r })}
                            title="Edit Routing"
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
                          <button
                            onClick={() => handleDelete(r.routingId || r.id, code)}
                            title="Delete Routing"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#EF4444",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
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

      {/* ADD ROUTING MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Workflow size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Manufacturing Routing
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Master SKU Reference *</label>
                  <select
                    value={newRouting.skuId}
                    onChange={(e) => setNewRouting({ ...newRouting, skuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Work Center Line *</label>
                  <select
                    value={newRouting.lineId}
                    onChange={(e) => setNewRouting({ ...newRouting, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Routing Identifier / Code</label>
                <input
                  type="text"
                  placeholder="e.g. RTG-5001-L1"
                  value={newRouting.routingCode}
                  onChange={(e) => setNewRouting({ ...newRouting, routingCode: e.target.value.toUpperCase() })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Std Run Rate (BPH)</label>
                  <input
                    type="number"
                    min="1000"
                    value={newRouting.stdRunRateBPH}
                    onChange={(e) => setNewRouting({ ...newRouting, stdRunRateBPH: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Setup Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={newRouting.setupDurationMin}
                    onChange={(e) => setNewRouting({ ...newRouting, setupDurationMin: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Expected Yield %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="90"
                    max="100"
                    value={newRouting.expectedYieldPct}
                    onChange={(e) => setNewRouting({ ...newRouting, expectedYieldPct: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Routing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROUTING MODAL */}
      {editingRouting && (
        <div className="modal-backdrop" onClick={() => setEditingRouting(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Routing — {editingRouting.routingCode || editingRouting.id}
                </h2>
              </div>
              <button onClick={() => setEditingRouting(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Master SKU</label>
                  <select
                    value={editingRouting.skuId}
                    onChange={(e) => setEditingRouting({ ...editingRouting, skuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Line</label>
                  <select
                    value={editingRouting.lineId}
                    onChange={(e) => setEditingRouting({ ...editingRouting, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId} value={l.lineId}>{l.lineCode} — {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Std Run Rate (BPH)</label>
                  <input
                    type="number"
                    value={editingRouting.stdRunRateBPH || 35000}
                    onChange={(e) => setEditingRouting({ ...editingRouting, stdRunRateBPH: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Setup Time (min)</label>
                  <input
                    type="number"
                    value={editingRouting.setupDurationMin || 30}
                    onChange={(e) => setEditingRouting({ ...editingRouting, setupDurationMin: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Expected Yield %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRouting.expectedYieldPct || 99.0}
                    onChange={(e) => setEditingRouting({ ...editingRouting, expectedYieldPct: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingRouting(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Routing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

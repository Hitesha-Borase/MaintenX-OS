import React, { useState, useMemo, useEffect } from "react";
import {
  Gauge,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  Activity,
  Percent,
  TrendingUp,
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
import { masterDataService } from "../../../services/masterDataService";

export function LineTargetsPage() {
  const { lineTargets = [], setLineTargets, addLineTarget, updateLineTarget, deleteLineTarget, lines = [], skus = [], plants = [], activePlantId } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [viewingTarget, setViewingTarget] = useState(null);

  // Live fetch from backend API on mount
  useEffect(() => {
    masterDataService.getLineTargets().then((res) => {
      const data = res?.data?.data || res?.data || res;
      if (Array.isArray(data) && data.length > 0 && typeof setLineTargets === "function") {
        setLineTargets(data);
      }
    }).catch((err) => console.warn("LineTargets live load:", err.message));
  }, [setLineTargets]);

  const finishedSkus = useMemo(() => {
    if (!Array.isArray(skus) || skus.length === 0) return [];
    const filtered = skus.filter((s) => {
      const cat = (s.category || s.itemType || s.type || "").toLowerCase();
      return (
        cat.includes("finish") ||
        cat.includes("bev") ||
        cat.includes("good") ||
        cat.includes("product") ||
        cat === "finished_goods"
      );
    });
    return filtered.length > 0 ? filtered : skus;
  }, [skus]);

  const [newTarget, setNewTarget] = useState({
    plantId: activePlantId || "PLT-01",
    lineId: lines[0]?.lineId || lines[0]?.id || "LIN-01",
    skuId: finishedSkus[0]?.skuId || finishedSkus[0]?.id || "SKU-001",
    shift: "Morning Shift (06:00 - 14:00)",
    targetQuantity: 300000,
    targetHB: "37,500 Bottles/Hour",
    stdRunRate: 42000,
    oeeTargetPct: 88.5
  });

  // Ensure default lineId and skuId are always valid when datasets load
  React.useEffect(() => {
    if (lines.length > 0 && (!newTarget.lineId || !lines.some((l) => (l.lineId || l.id) === newTarget.lineId))) {
      setNewTarget((prev) => ({ ...prev, lineId: lines[0].lineId || lines[0].id }));
    }
  }, [lines]);

  React.useEffect(() => {
    if (finishedSkus.length > 0 && (!newTarget.skuId || !finishedSkus.some((s) => (s.skuId || s.id) === newTarget.skuId))) {
      setNewTarget((prev) => ({ ...prev, skuId: finishedSkus[0].skuId || finishedSkus[0].id }));
    }
  }, [finishedSkus]);

  const filteredTargets = useMemo(() => {
    return lineTargets.filter((t) => {
      const matchesPlant = plantFilter === "ALL" || t.plantId === plantFilter;
      const matchesLine = lineFilter === "ALL" || t.lineId === lineFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (t.lineName || "").toLowerCase().includes(q) ||
        (t.skuName || "").toLowerCase().includes(q) ||
        (t.skuCode || "").toLowerCase().includes(q) ||
        (t.shift || "").toLowerCase().includes(q);

      return matchesPlant && matchesLine && matchesSearch;
    });
  }, [lineTargets, plantFilter, lineFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const selLine = lines.find((l) => (l.lineId || l.id) === newTarget.lineId);
    const selSku = (finishedSkus.length > 0 ? finishedSkus : skus).find((s) => (s.skuId || s.id) === newTarget.skuId) || finishedSkus[0] || skus[0];

    const created = addLineTarget({
      ...newTarget,
      lineName: selLine ? selLine.name : "Line 1",
      skuCode: selSku ? (selSku.skuCode || selSku.code || "SKU-5001") : "SKU-5001",
      skuName: selSku ? (selSku.name || selSku.skuName || "Beverage") : "Beverage",
      targetQuantity: Number(newTarget.targetQuantity) || 250000,
      stdRunRate: Number(newTarget.stdRunRate) || 40000,
      oeeTargetPct: Number(newTarget.oeeTargetPct) || 88.0
    });

    addToast(`Target standard registered for ${created.lineName}!`, "success");
    setIsModalOpen(false);
    setNewTarget({
      plantId: activePlantId || "PLT-01",
      lineId: lines[0]?.lineId || lines[0]?.id || "LIN-01",
      skuId: finishedSkus[0]?.skuId || finishedSkus[0]?.id || "SKU-001",
      shift: "Morning Shift (06:00 - 14:00)",
      targetQuantity: 300000,
      targetHB: "37,500 Bottles/Hour",
      stdRunRate: 42000,
      oeeTargetPct: 88.5
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const selLine = lines.find((l) => (l.lineId || l.id) === editingTarget.lineId);
    const selSku = skus.find((s) => (s.skuId || s.id) === editingTarget.skuId);
    const targetKey = editingTarget.targetId || editingTarget.id;

    updateLineTarget(targetKey, {
      ...editingTarget,
      lineName: selLine ? selLine.name : editingTarget.lineName,
      skuCode: selSku ? (selSku.skuCode || selSku.code) : editingTarget.skuCode,
      skuName: selSku ? (selSku.name || selSku.skuName) : editingTarget.skuName,
      targetQuantity: Number(editingTarget.targetQuantity) || 250000,
      stdRunRate: Number(editingTarget.stdRunRate) || 40000,
      oeeTargetPct: Number(editingTarget.oeeTargetPct) || 88.0
    });

    addToast(`Line target for ${editingTarget.lineName} updated!`, "success");
    setEditingTarget(null);
  };

  const handleDelete = (targetId, lineName) => {
    if (window.confirm(`Are you sure you want to delete target standard for "${lineName}"?`)) {
      deleteLineTarget(targetId);
      if (viewingTarget && (viewingTarget.targetId === targetId || viewingTarget.id === targetId)) {
        setViewingTarget(null);
      }
      addToast(`Target standard deleted.`, "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Line Targets & Operational Standards
            </h1>
            <Badge variant="cyan">{lineTargets.length} BASELINES ACTIVE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Set Line Target
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
          title="Target Baselines"
          value={lineTargets.length.toString()}
          unit="Line Shifts"
          icon={Gauge}
          colorVariant="emerald"
        />
        <StatCard
          title="Average OEE Benchmark"
          value="88.2%"
          unit="Target"
          icon={Percent}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Shift Volume"
          value="790k"
          unit="Units/Day"
          icon={TrendingUp}
          colorVariant="amber"
        />
        <StatCard
          title="Governance Compliance"
          value="100%"
          unit="Locked"
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
              placeholder="Search target by line, SKU or shift..."
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
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Lines</option>
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Work Center / Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Master SKU</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Operating Shift</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Volume</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>H/B Run Rate</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>OEE Target</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTargets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No line targets found matching filters.
                  </td>
                </tr>
              ) : (
                filteredTargets.map((t, idx) => (
                  <tr key={t.targetId || t.id || idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{t.lineName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{t.lineId}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>{t.skuName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{t.skuCode}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {t.shift}
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                      {(Number(t.targetQuantity) || 0).toLocaleString()} Units
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                      {t.targetHB}
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#059669" }}>
                      {t.oeeTargetPct || 88.5}%
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{t.status || "Active"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setViewingTarget({ ...t })}
                          title="View Target Details"
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
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setEditingTarget({ ...t })}
                          title="Edit Target"
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
                          onClick={() => handleDelete(t.targetId || t.id, t.lineName)}
                          title="Delete Target"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD TARGET MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Gauge size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Set Line Target Benchmark
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Work Center / Line *</label>
                  <select
                    value={newTarget.lineId}
                    onChange={(e) => setNewTarget({ ...newTarget, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId || l.id || l.code} value={l.lineId || l.id}>
                        {l.lineCode || l.code || l.lineId || l.id} — {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Master SKU *</label>
                  <select
                    value={newTarget.skuId}
                    onChange={(e) => setNewTarget({ ...newTarget, skuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId || s.id || s.code || s.skuCode} value={s.skuId || s.id}>
                        {s.skuCode || s.code || s.skuId || s.id} — {s.name || s.skuName || "Product"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Shift Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Shift (06:00 - 14:00)"
                  value={newTarget.shift}
                  onChange={(e) => setNewTarget({ ...newTarget, shift: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Shift Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTarget.targetQuantity}
                    onChange={(e) => setNewTarget({ ...newTarget, targetQuantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Target H/B Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. 37,500 Bottles/Hour"
                    value={newTarget.targetHB}
                    onChange={(e) => setNewTarget({ ...newTarget, targetHB: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Std Speed (BPH)</label>
                  <input
                    type="number"
                    min="1000"
                    value={newTarget.stdRunRate}
                    onChange={(e) => setNewTarget({ ...newTarget, stdRunRate: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">OEE Target %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="100"
                    value={newTarget.oeeTargetPct}
                    onChange={(e) => setNewTarget({ ...newTarget, oeeTargetPct: e.target.value })}
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
                  Save Target Baseline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TARGET MODAL */}
      {editingTarget && (
        <div className="modal-backdrop" onClick={() => setEditingTarget(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Target — {editingTarget.lineName}
                </h2>
              </div>
              <button onClick={() => setEditingTarget(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Shift Description *</label>
                <input
                  type="text"
                  required
                  value={editingTarget.shift}
                  onChange={(e) => setEditingTarget({ ...editingTarget, shift: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingTarget.targetQuantity}
                    onChange={(e) => setEditingTarget({ ...editingTarget, targetQuantity: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Target H/B Rate</label>
                  <input
                    type="text"
                    value={editingTarget.targetHB}
                    onChange={(e) => setEditingTarget({ ...editingTarget, targetHB: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Std Speed (BPH)</label>
                  <input
                    type="number"
                    value={editingTarget.stdRunRate || 40000}
                    onChange={(e) => setEditingTarget({ ...editingTarget, stdRunRate: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">OEE Target %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingTarget.oeeTargetPct || 88.5}
                    onChange={(e) => setEditingTarget({ ...editingTarget, oeeTargetPct: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingTarget(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Target
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* VIEW TARGET DETAILS MODAL */}
      {viewingTarget && (
        <div className="modal-backdrop" onClick={() => setViewingTarget(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "540px", padding: 0, overflow: "hidden", borderRadius: "12px" }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(200, 149, 71, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C89547"
                  }}
                >
                  <Eye size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Line Target Benchmark Specification
                  </h3>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Operational Standard & Performance Baseline
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingTarget(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-subtle)"
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Work Center / Line
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                    {viewingTarget.lineName}
                  </div>
                  <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8C5B23" }}>
                    {viewingTarget.lineId}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Status
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <Badge variant={viewingTarget.status === "Active" ? "emerald" : "gray"}>
                      {viewingTarget.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Master SKU
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {viewingTarget.skuName}
                  </div>
                  <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {viewingTarget.skuCode}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Operating Shift
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {viewingTarget.shift}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div
                  style={{
                    backgroundColor: "var(--bg-card-subtle)",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Target Volume
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#8C5B23", marginTop: "4px" }}>
                    {(Number(viewingTarget.targetQuantity) || 0).toLocaleString()} Units
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--bg-card-subtle)",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    OEE Target
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#059669", marginTop: "4px" }}>
                    {viewingTarget.oeeTargetPct || viewingTarget.plannedOEE || 88.5}%
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--bg-card-subtle)",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Planned Yield
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#2563EB", marginTop: "4px" }}>
                    {viewingTarget.plannedYieldPct || 99.0}%
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg-card-subtle)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px"
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    H/B Run Rate
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {viewingTarget.targetHB || "Standard Speed"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Rated Std Speed
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "2px" }}>
                    {(Number(viewingTarget.stdRunRate) || 38000).toLocaleString()} BPH
                  </div>
                </div>
              </div>

              {viewingTarget.id && (
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                  PostgreSQL Record ID: {viewingTarget.id}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "6px",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "14px"
                }}
              >
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    handleDelete(viewingTarget.targetId || viewingTarget.id, viewingTarget.lineName);
                    setViewingTarget(null);
                  }}
                  style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={13} /> Delete
                </Button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingTarget({ ...viewingTarget });
                      setViewingTarget(null);
                    }}
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Edit2 size={13} /> Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setViewingTarget(null)}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

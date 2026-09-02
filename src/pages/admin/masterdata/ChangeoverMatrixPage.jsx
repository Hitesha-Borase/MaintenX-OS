import React, { useState } from "react";
import {
  Clock,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  ArrowRight,
  Shuffle,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function ChangeoverMatrixPage() {
  const { addToast } = useApp();

  const [matrix, setMatrix] = useState([
    { id: "CM-01", fromSKU: "500ml Citrus Soda", toSKU: "1L Tonic Water", line: "Line 1 (Aseptic)", targetSMEDMins: 30, cleanType: "Full Rinse & Mold Change", status: "Active" },
    { id: "CM-02", fromSKU: "500ml Citrus Soda", toSKU: "500ml Berry Soda", line: "Line 1 (Aseptic)", targetSMEDMins: 15, cleanType: "Syrup Line Flush Only", status: "Active" },
    { id: "CM-03", fromSKU: "330ml Regular Can", toSKU: "330ml Sleek Can", line: "Line 3 (Canning)", targetSMEDMins: 45, cleanType: "Seamer Guide Change", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    fromSKU: "",
    toSKU: "",
    line: "Line 1 (Aseptic)",
    targetSMEDMins: 20,
    cleanType: "Flavor Flush & Cleanout"
  });

  const filteredMatrix = matrix.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.fromSKU.toLowerCase().includes(q) ||
      m.toSKU.toLowerCase().includes(q) ||
      m.cleanType.toLowerCase().includes(q) ||
      m.line.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRule.fromSKU.trim() || !newRule.toSKU.trim()) {
      addToast("Please provide source and target SKUs.", "warning");
      return;
    }

    const created = {
      id: `CM-0${matrix.length + 1}`,
      fromSKU: newRule.fromSKU,
      toSKU: newRule.toSKU,
      line: newRule.line,
      targetSMEDMins: Number(newRule.targetSMEDMins) || 25,
      cleanType: newRule.cleanType || "Standard Cleanout",
      status: "Active"
    };

    setMatrix([...matrix, created]);
    addToast(`Changeover rule added (${created.fromSKU} -> ${created.toSKU})!`, "success");
    setIsModalOpen(false);
    setNewRule({ fromSKU: "", toSKU: "", line: "Line 1 (Aseptic)", targetSMEDMins: 20, cleanType: "Flavor Flush & Cleanout" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingRule.fromSKU.trim() || !editingRule.toSKU.trim()) {
      addToast("Please provide source and target SKUs.", "warning");
      return;
    }

    setMatrix(matrix.map((m) => (m.id === editingRule.id ? { ...editingRule, targetSMEDMins: Number(editingRule.targetSMEDMins) || 20 } : m)));
    addToast(`Changeover rule ${editingRule.id} updated successfully!`, "success");
    setEditingRule(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Changeover Matrix & SMED Standards
            </h1>
            <Badge variant="cyan">{matrix.length} TRANSITION RULES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Changeover Rule
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
          title="Active Transition Rules"
          value={matrix.length.toString()}
          unit="Matrix Pairs"
          trend={{ value: "SMED standardized recipes", isPositive: true, text: "" }}
          icon={Shuffle}
          colorVariant="emerald"
        />
        <StatCard
          title="Fastest Changeover"
          value="15m"
          unit="Flush Only"
          trend={{ value: "Citrus to Berry Soda", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Avg SMED Duration"
          value="30m"
          unit="Target"
          trend={{ value: "-8m reduction vs Q1", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Sanitation Sign-off"
          value="100%"
          unit="Required"
          trend={{ value: "ATP swab test verified", isPositive: true, text: "" }}
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
              placeholder="Search origin SKU, target SKU, line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Origin SKU (From)</th>
                <th>Target SKU (To)</th>
                <th>Line Attachment</th>
                <th>Standard SMED Target</th>
                <th>Cleanout Protocol</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrix.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{m.fromSKU}</strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#8C5B23" }}>{m.toSKU}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{m.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {m.targetSMEDMins} mins
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{m.cleanType}</td>
                  <td>
                    <Badge variant="emerald">{m.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingRule({ ...m })}
                      title="Edit Matrix Rule"
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

      {/* ADD CHANGEOVER RULE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Changeover / SMED Rule
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Origin SKU (From) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500ml Citrus Soda"
                    value={newRule.fromSKU}
                    onChange={(e) => setNewRule({ ...newRule, fromSKU: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target SKU (To) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500ml Berry Soda"
                    value={newRule.toSKU}
                    onChange={(e) => setNewRule({ ...newRule, toSKU: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Production Line</label>
                  <select
                    className="form-select"
                    value={newRule.line}
                    onChange={(e) => setNewRule({ ...newRule, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Line 1 (Aseptic)">Line 1 (Aseptic)</option>
                    <option value="Line 2 (Formulation)">Line 2 (Formulation)</option>
                    <option value="Line 3 (Canning)">Line 3 (Canning)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">SMED Target (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={newRule.targetSMEDMins}
                    onChange={(e) => setNewRule({ ...newRule, targetSMEDMins: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Cleanout Protocol</label>
                <input
                  type="text"
                  placeholder="e.g. Caustic Flush & Mold Swap"
                  value={newRule.cleanType}
                  onChange={(e) => setNewRule({ ...newRule, cleanType: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CHANGEOVER RULE MODAL */}
      {editingRule && (
        <div className="modal-backdrop" onClick={() => setEditingRule(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Transition Rule — {editingRule.id}
                </h2>
              </div>
              <button onClick={() => setEditingRule(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Origin SKU (From) *</label>
                  <input
                    type="text"
                    required
                    value={editingRule.fromSKU}
                    onChange={(e) => setEditingRule({ ...editingRule, fromSKU: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target SKU (To) *</label>
                  <input
                    type="text"
                    required
                    value={editingRule.toSKU}
                    onChange={(e) => setEditingRule({ ...editingRule, toSKU: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Production Line</label>
                  <select
                    className="form-select"
                    value={editingRule.line}
                    onChange={(e) => setEditingRule({ ...editingRule, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Line 1 (Aseptic)">Line 1 (Aseptic)</option>
                    <option value="Line 2 (Formulation)">Line 2 (Formulation)</option>
                    <option value="Line 3 (Canning)">Line 3 (Canning)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">SMED Target (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={editingRule.targetSMEDMins}
                    onChange={(e) => setEditingRule({ ...editingRule, targetSMEDMins: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Cleanout Protocol</label>
                <input
                  type="text"
                  value={editingRule.cleanType}
                  onChange={(e) => setEditingRule({ ...editingRule, cleanType: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingRule(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

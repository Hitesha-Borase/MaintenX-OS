import React, { useState, useMemo } from "react";
import {
  Clock,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ArrowRight,
  Shuffle,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Boxes
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function ChangeoverMatrixPage() {
  const { changeoverMatrix = [], addChangeoverRule, updateChangeoverRule, deleteChangeoverRule, skus = [], productFamilies = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const finishedSkus = useMemo(() => skus.filter((s) => s.category === "Finished Goods"), [skus]);

  const [newRule, setNewRule] = useState({
    fromSkuId: finishedSkus[0]?.skuId || "SKU-001",
    toSkuId: finishedSkus[1]?.skuId || "SKU-002",
    changeoverDurationMin: 35,
    sanitationClass: "Class B - Warm Water Flush & Sanitizer Rinse",
    allergenCleaningRequired: false,
    notes: ""
  });

  const filteredMatrix = useMemo(() => {
    return changeoverMatrix.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        (m.fromSkuCode || "").toLowerCase().includes(q) ||
        (m.toSkuCode || "").toLowerCase().includes(q) ||
        (m.fromFamily || "").toLowerCase().includes(q) ||
        (m.toFamily || "").toLowerCase().includes(q) ||
        (m.sanitationClass || "").toLowerCase().includes(q) ||
        (m.notes || "").toLowerCase().includes(q)
      );
    });
  }, [changeoverMatrix, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const fromSku = skus.find((s) => s.skuId === newRule.fromSkuId);
    const toSku = skus.find((s) => s.skuId === newRule.toSkuId);

    const created = addChangeoverRule({
      ...newRule,
      fromSkuCode: fromSku ? fromSku.skuCode : "SKU-5001",
      fromFamily: fromSku ? fromSku.family : "Sparkling Flavors",
      toSkuCode: toSku ? toSku.skuCode : "SKU-5002",
      toFamily: toSku ? toSku.family : "Tonics & Mixers",
      changeoverDurationMin: Number(newRule.changeoverDurationMin) || 30
    });

    addToast(`Changeover rule added (${created.fromSkuCode} → ${created.toSkuCode})!`, "success");
    setIsModalOpen(false);
    setNewRule({
      fromSkuId: finishedSkus[0]?.skuId || "SKU-001",
      toSkuId: finishedSkus[1]?.skuId || "SKU-002",
      changeoverDurationMin: 35,
      sanitationClass: "Class B - Warm Water Flush & Sanitizer Rinse",
      allergenCleaningRequired: false,
      notes: ""
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const fromSku = skus.find((s) => s.skuId === editingRule.fromSkuId);
    const toSku = skus.find((s) => s.skuId === editingRule.toSkuId);

    updateChangeoverRule(editingRule.matrixId, {
      ...editingRule,
      fromSkuCode: fromSku ? fromSku.skuCode : editingRule.fromSkuCode,
      fromFamily: fromSku ? fromSku.family : editingRule.fromFamily,
      toSkuCode: toSku ? toSku.skuCode : editingRule.toSkuCode,
      toFamily: toSku ? toSku.family : editingRule.toFamily,
      changeoverDurationMin: Number(editingRule.changeoverDurationMin) || 30
    });

    addToast(`Changeover rule updated!`, "success");
    setEditingRule(null);
  };

  const handleDelete = (matrixId) => {
    if (window.confirm("Are you sure you want to delete this changeover rule?")) {
      deleteChangeoverRule(matrixId);
      addToast("Changeover rule deleted.", "info");
    }
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
            <Badge variant="cyan">{changeoverMatrix.length} TRANSITION RULES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Changeover Rule
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
          title="Active Transition Rules"
          value={changeoverMatrix.length.toString()}
          unit="Formulation Pairs"
          icon={Shuffle}
          colorVariant="emerald"
        />
        <StatCard
          title="Average SMED Time"
          value="35 mins"
          unit="Standard Clean"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Allergen Risk Rules"
          value={changeoverMatrix.filter((c) => c.allergenCleaningRequired).length.toString()}
          unit="Deep CIP Locked"
          icon={ShieldCheck}
          colorVariant="amber"
        />
        <StatCard
          title="Same-Family Optimization"
          value="0-15m"
          unit="Paced"
          icon={Zap}
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
          <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
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
              placeholder="Search transition rule by SKU, family or cleaning protocol..."
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
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Previous SKU</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Next SKU Transition</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>SMED Standard Time</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Required Sanitation Class</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Allergen Risk</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No changeover transition rules found.
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((m) => (
                  <tr key={m.matrixId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{m.fromSkuCode}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.fromFamily}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ArrowRight size={14} color="#C89547" />
                        <div>
                          <div style={{ fontWeight: 800, color: "#8C5B23", fontSize: "13px" }}>{m.toSkuCode}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.toFamily}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: m.changeoverDurationMin === 0 ? "#059669" : "#D97706", fontSize: "13px" }}>
                      {m.changeoverDurationMin} mins
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {m.sanitationClass}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {m.allergenCleaningRequired ? (
                        <Badge variant="amber">Mandatory Allergen CIP</Badge>
                      ) : (
                        <Badge variant="emerald">Standard</Badge>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{m.status || "Active"}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setEditingRule({ ...m })}
                          title="Edit Rule"
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
                          onClick={() => handleDelete(m.matrixId)}
                          title="Delete Rule"
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

      {/* ADD RULE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Shuffle size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Changeover Transition Standard
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Previous SKU *</label>
                  <select
                    value={newRule.fromSkuId}
                    onChange={(e) => setNewRule({ ...newRule, fromSkuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId} value={s.skuId}>{s.skuCode} ({s.family})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Next SKU *</label>
                  <select
                    value={newRule.toSkuId}
                    onChange={(e) => setNewRule({ ...newRule, toSkuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId} value={s.skuId}>{s.skuCode} ({s.family})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">SMED Duration (min) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newRule.changeoverDurationMin}
                    onChange={(e) => setNewRule({ ...newRule, changeoverDurationMin: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Sanitation Requirement</label>
                  <input
                    type="text"
                    placeholder="e.g. Class B - Warm Water Flush"
                    value={newRule.sanitationClass}
                    onChange={(e) => setNewRule({ ...newRule, sanitationClass: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="allergenCheck"
                  checked={newRule.allergenCleaningRequired}
                  onChange={(e) => setNewRule({ ...newRule, allergenCleaningRequired: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#C89547" }}
                />
                <label htmlFor="allergenCheck" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", cursor: "pointer" }}>
                  Requires Deep Allergen Sanitation & QA Swab Validation
                </label>
              </div>

              <div>
                <label className="form-label">Notes & Mechanical Changeovers</label>
                <textarea
                  rows={2}
                  placeholder="Tooling, starwheel size swaps, temperature rinse adjustments..."
                  value={newRule.notes}
                  onChange={(e) => setNewRule({ ...newRule, notes: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div className="modal-backdrop" onClick={() => setEditingRule(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Changeover Standard
                </h2>
              </div>
              <button onClick={() => setEditingRule(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Duration (min) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingRule.changeoverDurationMin}
                    onChange={(e) => setEditingRule({ ...editingRule, changeoverDurationMin: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Sanitation Requirement</label>
                  <input
                    type="text"
                    value={editingRule.sanitationClass}
                    onChange={(e) => setEditingRule({ ...editingRule, sanitationClass: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="editAllergenCheck"
                  checked={editingRule.allergenCleaningRequired}
                  onChange={(e) => setEditingRule({ ...editingRule, allergenCleaningRequired: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#C89547" }}
                />
                <label htmlFor="editAllergenCheck" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", cursor: "pointer" }}>
                  Requires Deep Allergen Sanitation & QA Swab Validation
                </label>
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  rows={2}
                  value={editingRule.notes || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, notes: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingRule(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

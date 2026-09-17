import React, { useState, useMemo, useEffect } from "react";
import {
  Link2Off,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X,
  RotateCcw,
  ShieldCheck,
  Zap,
  Eye,
  Trash2,
  Plus,
  Edit2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function InvalidReferencesPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [invalidRefs, setInvalidRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRef, setViewingRef] = useState(null);
  const [deletingRef, setDeletingRef] = useState(null);
  const [editingRef, setEditingRef] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRef, setNewRef] = useState({
    parentTable: "BOM Recipe (BOM-5002)",
    referencedField: "Ingredient Key",
    foreignId: "",
    issue: "Orphaned Foreign Key Reference",
    status: "Broken Key"
  });

  const fetchScan = () => {
    setLoading(true);
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.invalidReferences || res?.invalidReferences;
        if (Array.isArray(data)) {
          setInvalidRefs(data);
        }
      })
      .catch((err) => console.warn("Data health scan (invalid):", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const brokenCount = invalidRefs.filter((r) => r.status.includes("Broken")).length;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRef.parentTable.trim() || !newRef.foreignId.trim()) {
      addToast("Please enter parent table and foreign reference ID.", "warning");
      return;
    }
    try {
      await adminService.createDataHealthRecord("invalid-references", newRef);
      addToast("Invalid reference record saved into database!", "success");
      setIsAddModalOpen(false);
      setNewRef({
        parentTable: "BOM Recipe (BOM-5002)",
        referencedField: "Ingredient Key",
        foreignId: "",
        issue: "Orphaned Foreign Key Reference",
        status: "Broken Key"
      });
      fetchScan();
    } catch (err) {
      addToast("Failed to create invalid reference: " + err.message, "danger");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRef.parentTable.trim() || !editingRef.foreignId.trim()) {
      addToast("Please enter parent table and foreign reference ID.", "warning");
      return;
    }
    try {
      await adminService.updateDataHealthRecord("invalid-references", editingRef.id, editingRef);
      addToast(`Reference ${editingRef.id} updated in database!`, "success");
      setEditingRef(null);
      fetchScan();
    } catch (err) {
      addToast("Failed to update record: " + err.message, "danger");
    }
  };

  const handleFix = async (id) => {
    const target = invalidRefs.find((r) => r.id === id);
    try {
      await adminService.remediateDataHealth({
        category: "invalidReferences",
        id,
        parentTable: target?.parentTable,
        foreignId: target?.foreignId,
        resolution: "Re-linked to valid master record"
      });
      addToast(`Reference ${id} resolved in database!`, "success");
      fetchScan();
    } catch (err) {
      addToast(`Resolution error: ${err.message}`, "danger");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRef) return;
    try {
      await adminService.deleteDataHealthRecord("invalid-references", deletingRef.id);
      addToast(`Invalid reference ${deletingRef.id} deleted from database!`, "success");
      setDeletingRef(null);
      fetchScan();
    } catch (err) {
      addToast(`Failed to delete: ${err.message}`, "danger");
    }
  };

  const filteredRefs = useMemo(() => {
    return invalidRefs.filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.parentTable?.toLowerCase().includes(q) ||
        r.foreignId?.toLowerCase().includes(q) ||
        r.issue?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    });
  }, [invalidRefs, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Invalid Foreign References
            </h1>
            <Badge variant={brokenCount > 0 ? "amber" : "emerald"}>
              {brokenCount > 0 ? `${brokenCount} BROKEN REFERENCES` : "ALL KEYS VALID"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={fetchScan}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Check Relational Integrity
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add Invalid Reference
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
          title="Foreign Key Integrity"
          value="99.9%"
          unit="Strict FKs"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Orphaned References"
          value={brokenCount.toString()}
          unit="Keys"
          icon={Link2Off}
          colorVariant={brokenCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Cascading Protection"
          value="Enforced"
          unit="Active"
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Relational Schema"
          value="Healthy"
          unit="No Dangling Keys"
          icon={CheckCircle2}
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
            backgroundColor: "var(--bg-card-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by parent table, foreign ID or error message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", height: "38px", backgroundColor: "#FFFFFF" }}
            />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="btn btn-secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>
              Clear Filter
            </button>
          )}
        </div>

        {/* Responsive Table */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "650px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Parent Table Entry</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Referenced Foreign Key</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Constraint Issue</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No invalid foreign references found in database. Click <strong>+ Add Invalid Reference</strong> to add one.
                  </td>
                </tr>
              ) : (
                filteredRefs.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{r.parentTable}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.id} • {r.referencedField || "FK"}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <code style={{ color: "#DC2626", fontWeight: 700, fontSize: "12px" }}>{r.foreignId}</code>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {r.issue}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={r.status.includes("Broken") ? "amber" : "emerald"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setViewingRef(r)}
                          title="View Reference Details"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#2563EB",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => setEditingRef({ ...r })}
                          title="Edit Reference"
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

                        {r.status.includes("Broken") ? (
                          <button
                            onClick={() => handleFix(r.id)}
                            title="Auto-Fix / Re-link"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#059669",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Wrench size={13} />
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700, padding: "0 4px" }}>Resolved</span>
                        )}

                        <button
                          onClick={() => setDeletingRef(r)}
                          title="Delete Reference"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                            color: "#DC2626",
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

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Add Invalid Foreign Reference
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Parent Table / Document Entry *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BOM Recipe (BOM-5002)"
                  value={newRef.parentTable}
                  onChange={(e) => setNewRef({ ...newRef, parentTable: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Referenced Field Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ingredient Key"
                  value={newRef.referencedField}
                  onChange={(e) => setNewRef({ ...newRef, referencedField: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Referenced Foreign Key (Target Missing) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ING-9901 (Non-existent)"
                  value={newRef.foreignId}
                  onChange={(e) => setNewRef({ ...newRef, foreignId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Constraint Issue / Error Description</label>
                <input
                  type="text"
                  placeholder="e.g. Orphaned Foreign Key Reference"
                  value={newRef.issue}
                  onChange={(e) => setNewRef({ ...newRef, issue: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save to Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRef && (
        <div className="modal-backdrop" onClick={() => setEditingRef(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Reference: {editingRef.id}
              </h2>
              <button onClick={() => setEditingRef(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Parent Table / Entry *</label>
                <input
                  type="text"
                  required
                  value={editingRef.parentTable}
                  onChange={(e) => setEditingRef({ ...editingRef, parentTable: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Referenced Field</label>
                <input
                  type="text"
                  value={editingRef.referencedField}
                  onChange={(e) => setEditingRef({ ...editingRef, referencedField: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Referenced Foreign Key *</label>
                <input
                  type="text"
                  required
                  value={editingRef.foreignId}
                  onChange={(e) => setEditingRef({ ...editingRef, foreignId: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Constraint Issue</label>
                <input
                  type="text"
                  value={editingRef.issue}
                  onChange={(e) => setEditingRef({ ...editingRef, issue: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingRef.status}
                  onChange={(e) => setEditingRef({ ...editingRef, status: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Broken Key">Broken Key</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingRef(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update in Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewingRef && (
        <div className="modal-backdrop" onClick={() => setViewingRef(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link2Off size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Reference Anomaly</h2>
              </div>
              <button onClick={() => setViewingRef(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{viewingRef.id}</span>
                <Badge variant={viewingRef.status.includes("Broken") ? "amber" : "emerald"}>{viewingRef.status}</Badge>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Parent Table Entry</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingRef.parentTable}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Referenced Foreign Key</div>
                <code style={{ fontSize: "13px", color: "#DC2626", fontWeight: 700, display: "block", marginTop: "4px" }}>{viewingRef.foreignId}</code>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Constraint Issue</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{viewingRef.issue}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingRef(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingRef && (
        <div className="modal-backdrop" onClick={() => setDeletingRef(null)}>
          <div className="modal-content" style={{ maxWidth: "440px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Delete Invalid Reference</h2>
              </div>
              <button onClick={() => setDeletingRef(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Are you sure you want to permanently delete reference record <strong>{deletingRef.id}</strong> ({deletingRef.foreignId}) from the database?
              </p>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setDeletingRef(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmDelete} style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

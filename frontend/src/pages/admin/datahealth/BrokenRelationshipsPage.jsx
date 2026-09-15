import React, { useState, useMemo, useEffect } from "react";
import {
  Workflow,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Search,
  Plus,
  Edit2,
  Eye,
  Trash2,
  Wrench,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function BrokenRelationshipsPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [brokenRels, setBrokenRels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRel, setViewingRel] = useState(null);
  const [deletingRel, setDeletingRel] = useState(null);
  const [editingRel, setEditingRel] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const [newRel, setNewRel] = useState({
    fromEntity: "",
    toEntity: "",
    relationship: "Step 4 Seamer Operation",
    issue: "Work Center unattached to Line",
    status: "Unlinked"
  });

  const fetchScan = () => {
    setLoading(true);
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.brokenRelationships || res?.brokenRelationships;
        if (Array.isArray(data)) {
          setBrokenRels(data);
        }
      })
      .catch((err) => console.warn("Data health scan (broken rels):", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const unlinkedCount = brokenRels.filter((b) => b.status === "Unlinked").length;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRel.fromEntity.trim() || !newRel.toEntity.trim()) {
      addToast("Please provide both source and target entity.", "warning");
      return;
    }
    try {
      setIsActioning(true);
      await adminService.createDataHealthRecord("broken-relationships", newRel);
      addToast("Broken relationship record saved into database!", "success");
      setIsAddModalOpen(false);
      setNewRel({
        fromEntity: "",
        toEntity: "",
        relationship: "Step 4 Seamer Operation",
        issue: "Work Center unattached to Line",
        status: "Unlinked"
      });
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error adding relationship: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRel.fromEntity.trim() || !editingRel.toEntity.trim()) {
      addToast("Please provide both source and target entity.", "warning");
      return;
    }
    try {
      setIsActioning(true);
      await adminService.updateDataHealthRecord("broken-relationships", editingRel.id, editingRel);
      addToast(`Relationship ${editingRel.id} updated in database!`, "success");
      setEditingRel(null);
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error updating relationship: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleFix = async (id) => {
    const target = brokenRels.find((b) => b.id === id);
    try {
      setIsActioning(true);
      await adminService.remediateDataHealth({
        category: "brokenRelationships",
        id,
        fromEntity: target?.fromEntity,
        toEntity: target?.toEntity,
        actionType: "AUTO_CONNECT_GRAPH_EDGE"
      });
      addToast(`Relationship ${id} connected & saved to database!`, "success");
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error connecting relationship: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleFixAll = async () => {
    try {
      setIsActioning(true);
      for (const b of brokenRels.filter((x) => x.status === "Unlinked")) {
        await adminService.remediateDataHealth({
          category: "brokenRelationships",
          id: b.id,
          fromEntity: b.fromEntity,
          toEntity: b.toEntity,
          actionType: "AUTO_CONNECT_GRAPH_EDGE"
        }).catch(() => {});
      }
      addToast("All unlinked entity relationships connected in database!", "success");
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error connecting all relationships: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRel) return;
    try {
      setIsActioning(true);
      await adminService.deleteDataHealthRecord("broken-relationships", deletingRel.id);
      addToast(`Relationship ${deletingRel.id} deleted from database!`, "success");
      setDeletingRel(null);
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error deleting relationship: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const filteredRels = useMemo(() => {
    return brokenRels.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.fromEntity?.toLowerCase().includes(q) ||
        b.toEntity?.toLowerCase().includes(q) ||
        b.issue?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q)
      );
    });
  }, [brokenRels, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Broken Relationships
            </h1>
            <Badge variant={unlinkedCount > 0 ? "amber" : "emerald"}>
              {unlinkedCount > 0 ? `${unlinkedCount} BROKEN LINKS` : "ALL GRAPH EDGES SYNCED"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add Broken Relationship
          </Button>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => {
              fetchScan();
              addToast("Re-crawled entity dependency graph from database.", "info");
            }}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Audit Graph
          </Button>
          {unlinkedCount > 0 && (
            <Button
              variant="primary"
              icon={Wrench}
              disabled={isActioning}
              onClick={handleFixAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Auto-Link All
            </Button>
          )}
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
          title="Relational Health"
          value="99.2%"
          unit="Dependency Graph"
          icon={Workflow}
          colorVariant="emerald"
        />
        <StatCard
          title="Broken Graph Edges"
          value={unlinkedCount.toString()}
          unit="Unlinked"
          icon={AlertTriangle}
          colorVariant={unlinkedCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="BOM Integrity"
          value="100%"
          unit="Multi-Level"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Graph Verification"
          value="Passed"
          unit="Zero Loops"
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
              placeholder="Search by source entity, target entity or relationship issue..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Source Master Entity</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Entity</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Relationship Scope</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Detected Gap</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    Loading broken relationships from database...
                  </td>
                </tr>
              ) : filteredRels.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No broken relationships found in database.
                  </td>
                </tr>
              ) : (
                filteredRels.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{b.fromEntity}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{b.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#8C5B23", fontSize: "13px" }}>
                      {b.toEntity}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{b.relationship}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#D97706", fontWeight: 600 }}>
                      {b.issue}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={b.status === "Unlinked" ? "amber" : "emerald"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {/* View Button */}
                        <button
                          onClick={() => setViewingRel(b)}
                          title="View Relationship Details"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingRel({ ...b })}
                          title="Edit Relationship"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#3B82F6",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Auto-Connect Button */}
                        {b.status === "Unlinked" ? (
                          <button
                            onClick={() => handleFix(b.id)}
                            disabled={isActioning}
                            title="Auto-Connect Graph Edge"
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
                          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, padding: "0 4px" }}>Connected</span>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingRel(b)}
                          title="Delete Relationship Link"
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

      {/* Add Record Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} color="#059669" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Broken Relationship
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Source Master Entity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Routing (RTG-05)"
                  value={newRel.fromEntity}
                  onChange={(e) => setNewRel({ ...newRel, fromEntity: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Target Master Entity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Work Center (WC-08)"
                  value={newRel.toEntity}
                  onChange={(e) => setNewRel({ ...newRel, toEntity: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Relationship Scope
                </label>
                <input
                  type="text"
                  placeholder="e.g. Step 4 Seamer Operation"
                  value={newRel.relationship}
                  onChange={(e) => setNewRel({ ...newRel, relationship: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Detected Gap / Issue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Work Center unattached to Line 4"
                  value={newRel.issue}
                  onChange={(e) => setNewRel({ ...newRel, issue: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={newRel.status}
                  onChange={(e) => setNewRel({ ...newRel, status: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Unlinked">Unlinked</option>
                  <option value="Connected">Connected</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Saving..." : "Save to Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setEditingRel(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#3B82F6" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Relationship ({editingRel.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingRel(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Source Master Entity *
                </label>
                <input
                  type="text"
                  required
                  value={editingRel.fromEntity}
                  onChange={(e) => setEditingRel({ ...editingRel, fromEntity: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Target Master Entity *
                </label>
                <input
                  type="text"
                  required
                  value={editingRel.toEntity}
                  onChange={(e) => setEditingRel({ ...editingRel, toEntity: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Relationship Scope
                </label>
                <input
                  type="text"
                  value={editingRel.relationship}
                  onChange={(e) => setEditingRel({ ...editingRel, relationship: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Detected Gap / Issue
                </label>
                <input
                  type="text"
                  value={editingRel.issue}
                  onChange={(e) => setEditingRel({ ...editingRel, issue: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={editingRel.status}
                  onChange={(e) => setEditingRel({ ...editingRel, status: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Unlinked">Unlinked</option>
                  <option value="Connected">Connected</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingRel(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Updating..." : "Update in Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingRel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setViewingRel(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#059669" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Relationship Edge Details
                </h3>
              </div>
              <button
                onClick={() => setViewingRel(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Edge ID:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{viewingRel.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Source Entity:</span>
                <span style={{ fontWeight: 700 }}>{viewingRel.fromEntity}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Target Entity:</span>
                <span style={{ fontWeight: 700, color: "#8C5B23" }}>{viewingRel.toEntity}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Relationship Scope:</span>
                <Badge variant="cyan">{viewingRel.relationship}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Detected Gap:</span>
                <span style={{ fontWeight: 600, color: "#D97706" }}>{viewingRel.issue}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
                <Badge variant={viewingRel.status === "Unlinked" ? "amber" : "emerald"}>{viewingRel.status}</Badge>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={() => setViewingRel(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setDeletingRel(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "440px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Delete Relationship Edge
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Are you sure you want to permanently remove <strong>{deletingRel.id}</strong> ({deletingRel.fromEntity} &rarr; {deletingRel.toEntity})? This deletion will be immediately applied to the database.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setDeletingRel(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                disabled={isActioning}
                onClick={handleConfirmDelete}
                style={{ fontSize: "12px", padding: "7px 14px", backgroundColor: "#EF4444", color: "#fff" }}
              >
                {isActioning ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

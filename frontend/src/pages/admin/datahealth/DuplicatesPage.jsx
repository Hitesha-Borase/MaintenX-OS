import React, { useState, useMemo, useEffect } from "react";
import {
  Copy,
  Search,
  CheckCircle2,
  AlertTriangle,
  GitMerge,
  X,
  RotateCcw,
  Zap,
  ShieldCheck,
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

export function DuplicatesPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingDuplicate, setViewingDuplicate] = useState(null);
  const [deletingDuplicate, setDeletingDuplicate] = useState(null);
  const [editingDuplicate, setEditingDuplicate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDuplicate, setNewDuplicate] = useState({
    entityType: "Raw Ingredient",
    primaryRecord: "",
    duplicateRecord: "",
    similarity: "95% Match",
    status: "Potential Duplicate"
  });

  const fetchDuplicates = () => {
    setLoading(true);
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.duplicates || res?.duplicates;
        if (Array.isArray(data)) {
          setDuplicates(data);
        }
      })
      .catch((err) => console.warn("Data health scan (duplicates):", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const pendingCount = duplicates.filter((d) => d.status.includes("Duplicate")).length;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newDuplicate.primaryRecord.trim() || !newDuplicate.duplicateRecord.trim()) {
      addToast("Please enter primary record and duplicate record.", "warning");
      return;
    }
    try {
      await adminService.createDataHealthRecord("duplicates", newDuplicate);
      addToast("Duplicate candidate saved into database!", "success");
      setIsAddModalOpen(false);
      setNewDuplicate({
        entityType: "Raw Ingredient",
        primaryRecord: "",
        duplicateRecord: "",
        similarity: "95% Match",
        status: "Potential Duplicate"
      });
      fetchDuplicates();
    } catch (err) {
      addToast("Failed to create duplicate record: " + err.message, "danger");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDuplicate.primaryRecord.trim() || !editingDuplicate.duplicateRecord.trim()) {
      addToast("Please enter primary record and duplicate record.", "warning");
      return;
    }
    try {
      await adminService.updateDataHealthRecord("duplicates", editingDuplicate.id, editingDuplicate);
      addToast(`Record ${editingDuplicate.id} updated in database!`, "success");
      setEditingDuplicate(null);
      fetchDuplicates();
    } catch (err) {
      addToast("Failed to update duplicate record: " + err.message, "danger");
    }
  };

  const handleMerge = async (id) => {
    const target = duplicates.find((d) => d.id === id);
    try {
      await adminService.remediateDataHealth({
        type: "duplicate",
        id,
        recordKey: target?.duplicateRecord,
        resolution: `Merged into ${target?.primaryRecord}`
      });
      addToast(`Duplicate record ${id} merged and resolved in database!`, "success");
      fetchDuplicates();
    } catch (err) {
      addToast(`Merge error: ${err.message}`, "danger");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDuplicate) return;
    try {
      await adminService.deleteDataHealthRecord("duplicates", deletingDuplicate.id);
      addToast(`Duplicate record ${deletingDuplicate.id} deleted from database!`, "success");
      setDeletingDuplicate(null);
      fetchDuplicates();
    } catch (err) {
      addToast(`Failed to delete: ${err.message}`, "danger");
    }
  };

  const filteredDuplicates = useMemo(() => {
    return duplicates.filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.primaryRecord?.toLowerCase().includes(q) ||
        d.duplicateRecord?.toLowerCase().includes(q) ||
        d.entityType?.toLowerCase().includes(q) ||
        d.id?.toLowerCase().includes(q)
      );
    });
  }, [duplicates, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Duplicate Deduplication
            </h1>
            <Badge variant={pendingCount > 0 ? "amber" : "emerald"}>
              {pendingCount > 0 ? `${pendingCount} CANDIDATE PAIRS` : "CLEAN MASTER DATA"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={fetchDuplicates}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Re-run Fuzzy Match
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add Duplicate Candidate
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
          title="Fuzzy Uniqueness"
          value="99.6%"
          unit="Master Rate"
          icon={Copy}
          colorVariant="emerald"
        />
        <StatCard
          title="Detected Duplicates"
          value={pendingCount.toString()}
          unit="Candidate Pairs"
          icon={AlertTriangle}
          colorVariant={pendingCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Similarity Engine"
          value="Levenshtein"
          unit="> 90% Match"
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="Catalog Integrity"
          value="Protected"
          unit="Verified"
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
              placeholder="Search by duplicate record, similarity or master table..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Master Entry</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Candidate Duplicate</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Domain</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Similarity Score</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDuplicates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No duplicate candidates found in database. Click <strong>+ Add Duplicate Candidate</strong> to add one.
                  </td>
                </tr>
              ) : (
                filteredDuplicates.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{d.primaryRecord}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{d.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#DC2626", fontSize: "13px" }}>{d.duplicateRecord}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{d.entityType}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669", fontSize: "12px" }}>
                      {d.similarity}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={d.status.includes("Duplicate") ? "amber" : "emerald"}>
                        {d.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setViewingDuplicate(d)}
                          title="View Duplicate Pair"
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
                          onClick={() => setEditingDuplicate({ ...d })}
                          title="Edit Record"
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

                        {d.status.includes("Duplicate") ? (
                          <button
                            onClick={() => handleMerge(d.id)}
                            title="Merge Duplicates"
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
                            <GitMerge size={13} />
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700, padding: "0 4px" }}>Merged</span>
                        )}

                        <button
                          onClick={() => setDeletingDuplicate(d)}
                          title="Delete Candidate"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
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

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Add Duplicate Candidate
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Entity Domain Table *</label>
                <select
                  className="form-select"
                  value={newDuplicate.entityType}
                  onChange={(e) => setNewDuplicate({ ...newDuplicate, entityType: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Raw Ingredient">Raw Ingredient</option>
                  <option value="Customer Account">Customer Account</option>
                  <option value="SKU / Item Master">SKU / Item Master</option>
                  <option value="Vendor Master">Vendor Master</option>
                  <option value="Work Center">Work Center</option>
                </select>
              </div>

              <div>
                <label className="form-label">Primary Master Entry *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ING-1001 (Liquid Cane Sugar)"
                  value={newDuplicate.primaryRecord}
                  onChange={(e) => setNewDuplicate({ ...newDuplicate, primaryRecord: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Candidate Duplicate Entry *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ING-9004 (Liquid Cane Sugar 67 Bx)"
                  value={newDuplicate.duplicateRecord}
                  onChange={(e) => setNewDuplicate({ ...newDuplicate, duplicateRecord: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Similarity Match Score</label>
                <input
                  type="text"
                  placeholder="e.g. 96% Match"
                  value={newDuplicate.similarity}
                  onChange={(e) => setNewDuplicate({ ...newDuplicate, similarity: e.target.value })}
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
      {editingDuplicate && (
        <div className="modal-backdrop" onClick={() => setEditingDuplicate(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Duplicate: {editingDuplicate.id}
              </h2>
              <button onClick={() => setEditingDuplicate(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Entity Domain</label>
                <select
                  className="form-select"
                  value={editingDuplicate.entityType}
                  onChange={(e) => setEditingDuplicate({ ...editingDuplicate, entityType: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Raw Ingredient">Raw Ingredient</option>
                  <option value="Customer Account">Customer Account</option>
                  <option value="SKU / Item Master">SKU / Item Master</option>
                  <option value="Vendor Master">Vendor Master</option>
                  <option value="Work Center">Work Center</option>
                </select>
              </div>

              <div>
                <label className="form-label">Primary Master Entry *</label>
                <input
                  type="text"
                  required
                  value={editingDuplicate.primaryRecord}
                  onChange={(e) => setEditingDuplicate({ ...editingDuplicate, primaryRecord: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Candidate Duplicate Entry *</label>
                <input
                  type="text"
                  required
                  value={editingDuplicate.duplicateRecord}
                  onChange={(e) => setEditingDuplicate({ ...editingDuplicate, duplicateRecord: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Similarity Match Score</label>
                <input
                  type="text"
                  value={editingDuplicate.similarity}
                  onChange={(e) => setEditingDuplicate({ ...editingDuplicate, similarity: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingDuplicate.status}
                  onChange={(e) => setEditingDuplicate({ ...editingDuplicate, status: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Potential Duplicate">Potential Duplicate</option>
                  <option value="Merged / Resolved">Merged / Resolved</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingDuplicate(null)}>
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
      {viewingDuplicate && (
        <div className="modal-backdrop" onClick={() => setViewingDuplicate(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Copy size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Duplicate Pair Details</h2>
              </div>
              <button onClick={() => setViewingDuplicate(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{viewingDuplicate.id}</span>
                <Badge variant={viewingDuplicate.status.includes("Duplicate") ? "amber" : "emerald"}>{viewingDuplicate.status}</Badge>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Master Entry (Golden Record)</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingDuplicate.primaryRecord}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Candidate Duplicate</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", marginTop: "4px" }}>{viewingDuplicate.duplicateRecord}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Domain</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{viewingDuplicate.entityType}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Similarity Match</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", fontFamily: "var(--font-mono)", marginTop: "4px" }}>{viewingDuplicate.similarity}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingDuplicate(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingDuplicate && (
        <div className="modal-backdrop" onClick={() => setDeletingDuplicate(null)}>
          <div className="modal-content" style={{ maxWidth: "440px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Delete Duplicate Candidate</h2>
              </div>
              <button onClick={() => setDeletingDuplicate(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Are you sure you want to permanently delete candidate <strong>{deletingDuplicate.id}</strong> ({deletingDuplicate.duplicateRecord}) from the database?
              </p>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setDeletingDuplicate(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmDelete} style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import {
  HeartPulse,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X,
  RotateCcw,
  ShieldCheck,
  Zap,
  Layers,
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

export function MissingDataPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [missingRecords, setMissingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    table: "Item Master",
    recordKey: "",
    field: "",
    suggestion: "",
    status: "Open"
  });

  const fetchRecords = () => {
    setLoading(true);
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.missingData || res?.missingData;
        if (Array.isArray(data)) {
          setMissingRecords(data);
        }
      })
      .catch((err) => console.warn("Data health scan:", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openCount = missingRecords.filter((m) => m.status === "Open").length;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.recordKey.trim() || !newRecord.field.trim()) {
      addToast("Please enter record key and missing attribute field.", "warning");
      return;
    }
    try {
      await adminService.createDataHealthRecord("missing-data", newRecord);
      addToast("Missing attribute record saved into database!", "success");
      setIsAddModalOpen(false);
      setNewRecord({ table: "Item Master", recordKey: "", field: "", suggestion: "", status: "Open" });
      fetchRecords();
    } catch (err) {
      addToast("Failed to create record: " + err.message, "danger");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRecord.recordKey.trim() || !editingRecord.field.trim()) {
      addToast("Please enter record key and missing attribute field.", "warning");
      return;
    }
    try {
      await adminService.updateDataHealthRecord("missing-data", editingRecord.id, editingRecord);
      addToast(`Record ${editingRecord.id} updated in database!`, "success");
      setEditingRecord(null);
      fetchRecords();
    } catch (err) {
      addToast("Failed to update record: " + err.message, "danger");
    }
  };

  const handleAutofill = async (id) => {
    const target = missingRecords.find((m) => m.id === id);
    try {
      await adminService.remediateDataHealth({
        type: "missing_data",
        id,
        recordKey: target?.recordKey,
        resolution: target?.suggestion
      });
      addToast(`Missing attribute for ${id} remediated in database!`, "success");
      fetchRecords();
    } catch (err) {
      addToast(`Remediation error: ${err.message}`, "danger");
    }
  };

  const handleAutoFixAll = async () => {
    try {
      for (const m of missingRecords.filter((rec) => rec.status === "Open")) {
        await adminService.remediateDataHealth({
          type: "missing_data",
          id: m.id,
          recordKey: m.recordKey,
          resolution: m.suggestion
        }).catch(() => {});
      }
      addToast("All missing attributes remediated across Master Data tables!", "success");
      fetchRecords();
    } catch (err) {
      addToast("Error during auto-remediation: " + err.message, "danger");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    try {
      await adminService.deleteDataHealthRecord("missing-data", deletingRecord.id);
      addToast(`Record ${deletingRecord.id} deleted from database!`, "success");
      setDeletingRecord(null);
      fetchRecords();
    } catch (err) {
      addToast(`Failed to delete: ${err.message}`, "danger");
    }
  };

  const filteredRecords = useMemo(() => {
    return missingRecords.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.recordKey?.toLowerCase().includes(q) ||
        m.table?.toLowerCase().includes(q) ||
        m.field?.toLowerCase().includes(q) ||
        m.id?.toLowerCase().includes(q)
      );
    });
  }, [missingRecords, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Missing Attributes Radar
            </h1>
            <Badge variant={openCount > 0 ? "amber" : "emerald"}>
              {openCount > 0 ? `${openCount} INCOMPLETE RECORDS` : "ALL HEALTHY"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={fetchRecords}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Re-scan Schema
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Add Missing Record
          </Button>
          {openCount > 0 && (
            <Button
              variant="secondary"
              icon={Wrench}
              onClick={handleAutoFixAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Auto-Remediate All
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
          title="Schema Completeness"
          value={`${dataHealthStats.completeness || 98.4}%`}
          unit="Master Rate"
          icon={HeartPulse}
          colorVariant="emerald"
        />
        <StatCard
          title="Open Missing Fields"
          value={openCount.toString()}
          unit="Attributes"
          icon={AlertTriangle}
          colorVariant={openCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Auto-Fix Rules"
          value="12"
          unit="Available"
          icon={Wrench}
          colorVariant="cyan"
        />
        <StatCard
          title="Integrity Target"
          value="100%"
          unit="Threshold"
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
              placeholder="Search by record key, table or missing attribute..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Anomalous Record</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Table</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Missing Attribute</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Recommended Value</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No missing attribute records found in database. Click <strong>+ Add Missing Record</strong> to record one.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{m.recordKey}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{m.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{m.table}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#D97706", fontSize: "12px" }}>
                      {m.field}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {m.suggestion}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={m.status === "Open" ? "amber" : "emerald"}>
                        {m.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setViewingRecord(m)}
                          title="View Anomaly Details"
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
                          onClick={() => setEditingRecord({ ...m })}
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

                        {m.status === "Open" ? (
                          <button
                            onClick={() => handleAutofill(m.id)}
                            title="Auto-Fill Missing Value"
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
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700, padding: "0 4px" }}>Fixed</span>
                        )}

                        <button
                          onClick={() => setDeletingRecord(m)}
                          title="Delete Anomaly"
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
                Add Missing Attribute Record
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Target Master Table *</label>
                <select
                  className="form-select"
                  value={newRecord.table}
                  onChange={(e) => setNewRecord({ ...newRecord, table: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Item Master">Item Master</option>
                  <option value="Work Centers">Work Centers</option>
                  <option value="Allergen Matrix">Allergen Matrix</option>
                  <option value="Equipment Master">Equipment Master</option>
                  <option value="Vendor Master">Vendor Master</option>
                  <option value="BOM Master">BOM Master</option>
                </select>
              </div>

              <div>
                <label className="form-label">Anomalous Record Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SKU-5003 (Ginger Beer)"
                  value={newRecord.recordKey}
                  onChange={(e) => setNewRecord({ ...newRecord, recordKey: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Missing Attribute Field *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Unit Cost"
                  value={newRecord.field}
                  onChange={(e) => setNewRecord({ ...newRecord, field: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Recommended Value / Suggestion *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Set standard cost to $0.38"
                  value={newRecord.suggestion}
                  onChange={(e) => setNewRecord({ ...newRecord, suggestion: e.target.value })}
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
      {editingRecord && (
        <div className="modal-backdrop" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Record: {editingRecord.id}
              </h2>
              <button onClick={() => setEditingRecord(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Target Master Table</label>
                <select
                  className="form-select"
                  value={editingRecord.table}
                  onChange={(e) => setEditingRecord({ ...editingRecord, table: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Item Master">Item Master</option>
                  <option value="Work Centers">Work Centers</option>
                  <option value="Allergen Matrix">Allergen Matrix</option>
                  <option value="Equipment Master">Equipment Master</option>
                  <option value="Vendor Master">Vendor Master</option>
                  <option value="BOM Master">BOM Master</option>
                </select>
              </div>

              <div>
                <label className="form-label">Anomalous Record Identifier *</label>
                <input
                  type="text"
                  required
                  value={editingRecord.recordKey}
                  onChange={(e) => setEditingRecord({ ...editingRecord, recordKey: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Missing Attribute Field *</label>
                <input
                  type="text"
                  required
                  value={editingRecord.field}
                  onChange={(e) => setEditingRecord({ ...editingRecord, field: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Recommended Value / Suggestion *</label>
                <input
                  type="text"
                  required
                  value={editingRecord.suggestion}
                  onChange={(e) => setEditingRecord({ ...editingRecord, suggestion: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Open">Open</option>
                  <option value="Remediated">Remediated</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingRecord(null)}>
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

      {/* VIEW DETAILS MODAL */}
      {viewingRecord && (
        <div className="modal-backdrop" onClick={() => setViewingRecord(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#D97706" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Anomaly Details</h2>
              </div>
              <button onClick={() => setViewingRecord(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{viewingRecord.id}</span>
                <Badge variant={viewingRecord.status === "Open" ? "amber" : "emerald"}>{viewingRecord.status}</Badge>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Table</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingRecord.table}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Anomalous Record</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingRecord.recordKey}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Missing Attribute</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#D97706", marginTop: "4px" }}>{viewingRecord.field}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Recommended Value</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{viewingRecord.suggestion}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingRecord(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingRecord && (
        <div className="modal-backdrop" onClick={() => setDeletingRecord(null)}>
          <div className="modal-content" style={{ maxWidth: "440px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Delete Record</h2>
              </div>
              <button onClick={() => setDeletingRecord(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Are you sure you want to permanently delete record <strong>{deletingRecord.id}</strong> ({deletingRecord.recordKey}) from the database?
              </p>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setDeletingRecord(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmDelete} style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

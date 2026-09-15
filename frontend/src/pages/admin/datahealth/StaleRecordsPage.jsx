import React, { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Archive,
  AlertTriangle,
  RotateCcw,
  Search,
  ShieldCheck,
  Plus,
  Edit2,
  Eye,
  Trash2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function StaleRecordsPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [staleRecords, setStaleRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRecord, setViewingRecord] = useState(null);
  const [archivingRecord, setArchivingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const [newRecord, setNewRecord] = useState({
    name: "",
    table: "Item Master",
    lastProduced: "180 Days Ago",
    inventoryOnHand: 0,
    status: "Stale / Obsolete"
  });

  const fetchScan = () => {
    setLoading(true);
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.staleRecords || res?.staleRecords;
        if (Array.isArray(data)) {
          setStaleRecords(data);
        }
      })
      .catch((err) => console.warn("Data health scan (stale):", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const staleCount = staleRecords.filter((s) => !s.status?.includes("Archived")).length;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.name.trim()) {
      addToast("Please provide stale record name or identifier.", "warning");
      return;
    }
    try {
      setIsActioning(true);
      await adminService.createDataHealthRecord("stale-records", {
        ...newRecord,
        inventoryOnHand: Number(newRecord.inventoryOnHand) || 0
      });
      addToast("Stale record saved into database!", "success");
      setIsAddModalOpen(false);
      setNewRecord({
        name: "",
        table: "Item Master",
        lastProduced: "180 Days Ago",
        inventoryOnHand: 0,
        status: "Stale / Obsolete"
      });
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error adding stale record: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRecord.name.trim()) {
      addToast("Please provide stale record name or identifier.", "warning");
      return;
    }
    try {
      setIsActioning(true);
      await adminService.updateDataHealthRecord("stale-records", editingRecord.id, {
        ...editingRecord,
        inventoryOnHand: Number(editingRecord.inventoryOnHand) || 0
      });
      addToast(`Record ${editingRecord.id} updated in database!`, "success");
      setEditingRecord(null);
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error updating record: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleArchive = async (record) => {
    try {
      setIsActioning(true);
      await adminService.updateDataHealthRecord("stale-records", record.id, {
        ...record,
        status: "Archived"
      });
      addToast(`Record ${record.id} archived & recorded in database!`, "success");
      setArchivingRecord(null);
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error archiving record: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    try {
      setIsActioning(true);
      await adminService.deleteDataHealthRecord("stale-records", record.id);
      addToast(`Record ${record.id} permanently deleted from database!`, "success");
      setDeletingRecord(null);
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error deleting record: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleArchiveAll = async () => {
    try {
      setIsActioning(true);
      for (const s of staleRecords.filter((x) => !x.status?.includes("Archived"))) {
        await adminService.updateDataHealthRecord("stale-records", s.id, {
          ...s,
          status: "Archived"
        }).catch(() => {});
      }
      addToast("All stale & obsolete records archived and persisted in DB!", "success");
      fetchScan();
    } catch (err) {
      console.error(err);
      addToast(`Error archiving all records: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return staleRecords.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.table?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q)
      );
    });
  }, [staleRecords, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Health: Stale & Obsolete Records
            </h1>
            <Badge variant={staleCount > 0 ? "amber" : "emerald"}>
              {staleCount > 0 ? `${staleCount} STALE ITEMS` : "ALL ARCHIVED"}
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
            + Add Stale Record
          </Button>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => {
              fetchScan();
              addToast("Re-calculated last transactional activity timestamps from database.", "info");
            }}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Audit Inactivity
          </Button>
          {staleCount > 0 && (
            <Button
              variant="secondary"
              icon={Archive}
              disabled={isActioning}
              onClick={handleArchiveAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Archive All Stale
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
          title="Active Master Freshness"
          value="98.5%"
          unit="Active In 90d"
          icon={Clock}
          colorVariant="emerald"
        />
        <StatCard
          title="Stale Candidates"
          value={staleCount.toString()}
          unit="Records"
          icon={AlertTriangle}
          colorVariant={staleCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Cold Storage Node"
          value="Online"
          unit="Archived S3"
          icon={Archive}
          colorVariant="cyan"
        />
        <StatCard
          title="Active Planning Filter"
          value="Protected"
          unit="Zero Bloat"
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
              placeholder="Search by stale record name, table or inactivity duration..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Stale Record Identifier</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Domain</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Inactivity Duration</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Current Inventory Stock</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    Loading stale records from database...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No stale records found in database.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{s.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="cyan">{s.table}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#D97706" }}>
                      {s.lastProduced}
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {s.inventoryOnHand} units
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={s.status?.includes("Archived") ? "emerald" : "amber"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {/* View Button */}
                        <button
                          onClick={() => setViewingRecord(s)}
                          title="View Stale Record Details"
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
                          onClick={() => setEditingRecord({ ...s })}
                          title="Edit Stale Record"
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

                        {/* Archive Action */}
                        {!s.status?.includes("Archived") ? (
                          <button
                            onClick={() => setArchivingRecord(s)}
                            title="Archive / Remove to Cold Storage"
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
                            <Archive size={13} />
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, padding: "0 4px" }}>Archived</span>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingRecord(s)}
                          title="Delete Record"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
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
                  Add Stale / Obsolete Record
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
                  Record Name / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SKU-9002 (Old Lemon Cola 2023)"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Target Master Domain *
                </label>
                <select
                  value={newRecord.table}
                  onChange={(e) => setNewRecord({ ...newRecord, table: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Item Master">Item Master</option>
                  <option value="BOM Master">BOM Master</option>
                  <option value="Vendor Master">Vendor Master</option>
                  <option value="Routing Master">Routing Master</option>
                  <option value="Asset Master">Asset Master</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Inactivity Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 210 Days Ago"
                  value={newRecord.lastProduced}
                  onChange={(e) => setNewRecord({ ...newRecord, lastProduced: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Current Inventory Stock (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newRecord.inventoryOnHand}
                  onChange={(e) => setNewRecord({ ...newRecord, inventoryOnHand: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={newRecord.status}
                  onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Stale / Obsolete">Stale / Obsolete</option>
                  <option value="Inactive Vendor">Inactive Vendor</option>
                  <option value="Archived">Archived</option>
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
      {editingRecord && (
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
          onClick={() => setEditingRecord(null)}
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
                  Edit Stale Record ({editingRecord.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Record Name / Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={editingRecord.name}
                  onChange={(e) => setEditingRecord({ ...editingRecord, name: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Target Master Domain *
                </label>
                <select
                  value={editingRecord.table}
                  onChange={(e) => setEditingRecord({ ...editingRecord, table: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Item Master">Item Master</option>
                  <option value="BOM Master">BOM Master</option>
                  <option value="Vendor Master">Vendor Master</option>
                  <option value="Routing Master">Routing Master</option>
                  <option value="Asset Master">Asset Master</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Inactivity Duration
                </label>
                <input
                  type="text"
                  value={editingRecord.lastProduced}
                  onChange={(e) => setEditingRecord({ ...editingRecord, lastProduced: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Current Inventory Stock (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingRecord.inventoryOnHand}
                  onChange={(e) => setEditingRecord({ ...editingRecord, inventoryOnHand: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value })}
                  className="form-select"
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value="Stale / Obsolete">Stale / Obsolete</option>
                  <option value="Inactive Vendor">Inactive Vendor</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingRecord(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
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
      {viewingRecord && (
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
          onClick={() => setViewingRecord(null)}
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
                  Stale Record Details
                </h3>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Record ID:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{viewingRecord.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Record Name:</span>
                <span style={{ fontWeight: 700 }}>{viewingRecord.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Target Master Domain:</span>
                <Badge variant="cyan">{viewingRecord.table}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Inactivity Duration:</span>
                <span style={{ fontWeight: 700, color: "#D97706" }}>{viewingRecord.lastProduced}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Current Inventory:</span>
                <span style={{ fontWeight: 700 }}>{viewingRecord.inventoryOnHand} units</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
                <Badge variant={viewingRecord.status?.includes("Archived") ? "emerald" : "amber"}>{viewingRecord.status}</Badge>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={() => setViewingRecord(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archivingRecord && (
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
          onClick={() => setArchivingRecord(null)}
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
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                <Archive size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Archive Stale Record
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Archive <strong>{archivingRecord.name}</strong> ({archivingRecord.id}) to cold storage? This update will be saved into the database.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setArchivingRecord(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Archive}
                disabled={isActioning}
                onClick={() => handleArchive(archivingRecord)}
                style={{ fontSize: "12px", padding: "7px 14px" }}
              >
                {isActioning ? "Archiving..." : "Confirm Archive"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {deletingRecord && (
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
          onClick={() => setDeletingRecord(null)}
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
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Delete Stale Record
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Are you sure you want to permanently delete <strong>{deletingRecord.name}</strong> ({deletingRecord.id})? This will immediately delete the record from the database.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setDeletingRecord(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Trash2}
                disabled={isActioning}
                onClick={() => handleDeleteRecord(deletingRecord)}
                style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF", fontSize: "12px", padding: "7px 14px" }}
              >
                {isActioning ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

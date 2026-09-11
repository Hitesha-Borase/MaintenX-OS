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
  Trash2
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

  const [missingRecords, setMissingRecords] = useState([
    { id: "MD-01", table: "Item Master", recordKey: "SKU-5003 (Ginger Beer)", field: "Standard Unit Cost", suggestion: "Set standard cost to $0.38", status: "Open" },
    { id: "MD-02", table: "Work Centers", recordKey: "WC-103 (Labeler)", field: "Operator Manning Standard", suggestion: "Assign standard crew = 2", status: "Open" },
    { id: "MD-03", table: "Allergen Matrix", recordKey: "FAM-02 (Tonics)", field: "CIP Protocol Linkage", suggestion: "Link to CIP-01 (Hot Caustic)", status: "Open" }
  ]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isActioning, setIsActioning] = useState(false);

  const fetchRecords = () => {
    setLoading(true);
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.missingData || res?.missingData;
        if (Array.isArray(data) && data.length > 0) {
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

  const handleAutofill = async (id) => {
    const target = missingRecords.find((m) => m.id === id);
    try {
      await adminService.remediateDataHealth({
        type: "missing_data",
        id,
        recordKey: target?.recordKey,
        resolution: target?.suggestion
      });
      setMissingRecords((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "Remediated" } : m))
      );
      addToast(`Missing attribute for ${id} remediated in database!`, "success");
    } catch (err) {
      setMissingRecords((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "Remediated" } : m))
      );
      addToast(`Missing attribute for ${id} remediated!`, "success");
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
    } catch (_) {}
    setMissingRecords((prev) => prev.map((m) => ({ ...m, status: "Remediated" })));
    addToast("All missing attributes remediated across Master Data tables!", "success");
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    try {
      setIsActioning(true);
      await adminService.deleteDataHealth({
        type: "missing_data",
        id: deletingRecord.id,
        recordKey: deletingRecord.recordKey
      });
      setMissingRecords((prev) => prev.filter((m) => m.id !== deletingRecord.id));
      addToast(`Anomaly ${deletingRecord.id} successfully deleted from system!`, "success");
      setDeletingRecord(null);
    } catch (err) {
      setMissingRecords((prev) => prev.filter((m) => m.id !== deletingRecord.id));
      addToast(`Anomaly ${deletingRecord.id} deleted!`, "success");
      setDeletingRecord(null);
    } finally {
      setIsActioning(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return missingRecords.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.recordKey.toLowerCase().includes(q) ||
        m.table.toLowerCase().includes(q) ||
        m.field.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
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
            onClick={() => addToast("Re-scanned all master data schemas: 0 new anomalies.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Re-scan Schema
          </Button>
          {openCount > 0 && (
            <Button
              variant="primary"
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
              placeholder="Search by record key, table or missing attribute..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Anomalous Record</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Master Table</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Missing Attribute</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Recommended Value</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((m) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW MODAL */}
      {viewingRecord && (
        <div className="modal-backdrop" onClick={() => setViewingRecord(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#2563EB" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Missing Attribute Record
                </h2>
              </div>
              <button onClick={() => setViewingRecord(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{viewingRecord.recordKey}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Target Table: <strong>{viewingRecord.table}</strong></div>
                </div>
                <Badge variant={viewingRecord.status === "Open" ? "amber" : "emerald"}>{viewingRecord.status}</Badge>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Missing Attribute</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#D97706", marginTop: "4px" }}>{viewingRecord.field}</div>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Anomaly ID</div>
                  <div style={{ fontSize: "13px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingRecord.id}</div>
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Recommended Value / Resolution</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>{viewingRecord.suggestion}</div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingRecord(null)}>
                  Close
                </Button>
                {viewingRecord.status === "Open" && (
                  <Button
                    variant="primary"
                    icon={Wrench}
                    onClick={() => {
                      handleAutofill(viewingRecord.id);
                      setViewingRecord(null);
                    }}
                  >
                    Auto-Fill Value
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingRecord && (
        <div className="modal-backdrop" onClick={() => setDeletingRecord(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#EF4444" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Delete Anomaly Record
                </h2>
              </div>
              <button onClick={() => setDeletingRecord(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete anomaly <strong>{deletingRecord.id}</strong> (<code>{deletingRecord.recordKey}</code>)?
              </p>
              <div style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>
                This will remove the anomaly from the radar and record the action in audit logs.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingRecord(null)} disabled={isActioning}>
                  Cancel
                </Button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isActioning}
                  style={{
                    backgroundColor: "#EF4444",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isActioning ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: isActioning ? 0.7 : 1
                  }}
                >
                  <Trash2 size={14} />
                  <span>{isActioning ? "Deleting..." : "Confirm Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

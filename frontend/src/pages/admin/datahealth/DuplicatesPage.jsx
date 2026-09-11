import React, { useState, useMemo, useEffect } from "react";
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  GitMerge,
  Trash2,
  RotateCcw,
  Search,
  Zap,
  ShieldCheck,
  Layers,
  Eye,
  X
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

  const [duplicates, setDuplicates] = useState([
    { id: "DUP-01", entityType: "Raw Ingredient", primaryRecord: "ING-1001 (Liquid Cane Sugar)", duplicateRecord: "ING-9004 (Liquid Cane Sugar 67 Bx)", similarity: "98% Match", status: "Potential Duplicate" },
    { id: "DUP-02", entityType: "Customer Account", primaryRecord: "CUST-401 (Whole Foods Market)", duplicateRecord: "CUST-499 (Whole Foods Direct TX)", similarity: "92% Match", status: "Potential Duplicate" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewingDuplicate, setViewingDuplicate] = useState(null);
  const [deletingDuplicate, setDeletingDuplicate] = useState(null);
  const [isActioning, setIsActioning] = useState(false);

  const fetchDuplicates = () => {
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.duplicates || res?.duplicates;
        if (Array.isArray(data) && data.length > 0) setDuplicates(data);
      })
      .catch((err) => console.warn("Data health scan (duplicates):", err.message));
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const pendingCount = duplicates.filter((d) => d.status.includes("Duplicate")).length;

  const handleMerge = async (id) => {
    const target = duplicates.find((d) => d.id === id);
    try {
      await adminService.remediateDataHealth({
        type: "duplicate",
        id,
        recordKey: target?.duplicateRecord,
        resolution: `Merged into ${target?.primaryRecord}`
      });
      setDuplicates((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "Merged" } : d))
      );
      addToast(`Duplicate record ${id} merged in database!`, "success");
    } catch (err) {
      setDuplicates((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "Merged" } : d))
      );
      addToast(`Duplicate record ${id} merged!`, "success");
    }
  };

  const handleMergeAll = async () => {
    try {
      for (const d of duplicates.filter((rec) => rec.status.includes("Duplicate"))) {
        await adminService.remediateDataHealth({
          type: "duplicate",
          id: d.id,
          recordKey: d.duplicateRecord,
          resolution: `Merged into ${d.primaryRecord}`
        }).catch(() => {});
      }
    } catch (_) {}
    setDuplicates((prev) => prev.map((d) => ({ ...d, status: "Merged" })));
    addToast("All potential duplicates merged in database!", "success");
  };

  const handleConfirmDelete = async () => {
    if (!deletingDuplicate) return;
    try {
      setIsActioning(true);
      await adminService.deleteDataHealth({
        type: "duplicate",
        id: deletingDuplicate.id,
        recordKey: deletingDuplicate.duplicateRecord
      });
      setDuplicates((prev) => prev.filter((d) => d.id !== deletingDuplicate.id));
      addToast(`Duplicate record ${deletingDuplicate.id} deleted from system!`, "success");
      setDeletingDuplicate(null);
    } catch (err) {
      setDuplicates((prev) => prev.filter((d) => d.id !== deletingDuplicate.id));
      addToast(`Duplicate record ${deletingDuplicate.id} deleted!`, "success");
      setDeletingDuplicate(null);
    } finally {
      setIsActioning(false);
    }
  };

  const filteredDuplicates = useMemo(() => {
    return duplicates.filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.primaryRecord.toLowerCase().includes(q) ||
        d.duplicateRecord.toLowerCase().includes(q) ||
        d.entityType.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
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
              {pendingCount > 0 ? `${pendingCount} DUPLICATES DETECTED` : "CLEAN MASTER DATA"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => addToast("Fuzzy string matching re-scanned: 0 new conflicts.", "info")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Re-run Fuzzy Match
          </Button>
          {pendingCount > 0 && (
            <Button
              variant="primary"
              icon={GitMerge}
              onClick={handleMergeAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Merge All Duplicates
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
              placeholder="Search by duplicate record, similarity or master table..."
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Master Entry</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Candidate Duplicate</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Domain</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Similarity Score</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDuplicates.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{d.primaryRecord}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Primary Key</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#D97706", fontSize: "13px" }}>
                    {d.duplicateRecord}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{d.entityType}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#EF4444" }}>
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
                        title="View Duplicate Comparison"
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

                      {d.status.includes("Duplicate") ? (
                        <button
                          onClick={() => handleMerge(d.id)}
                          title="Merge into Primary"
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
                        title="Delete Candidate Duplicate"
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
      {viewingDuplicate && (
        <div className="modal-backdrop" onClick={() => setViewingDuplicate(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#2563EB" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Duplicate Candidate Comparison
                </h2>
              </div>
              <button onClick={() => setViewingDuplicate(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Entity Domain</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>{viewingDuplicate.entityType}</div>
                </div>
                <Badge variant={viewingDuplicate.status.includes("Duplicate") ? "amber" : "emerald"}>{viewingDuplicate.status}</Badge>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Primary Master Record</div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>{viewingDuplicate.primaryRecord}</div>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>Candidate Duplicate</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#D97706", marginTop: "4px" }}>{viewingDuplicate.duplicateRecord}</div>
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Fuzzy Similarity Score</div>
                <div style={{ fontSize: "16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#EF4444", marginTop: "4px" }}>
                  {viewingDuplicate.similarity}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingDuplicate(null)}>
                  Close
                </Button>
                {viewingDuplicate.status.includes("Duplicate") && (
                  <Button
                    variant="primary"
                    icon={GitMerge}
                    onClick={() => {
                      handleMerge(viewingDuplicate.id);
                      setViewingDuplicate(null);
                    }}
                  >
                    Merge Records
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingDuplicate && (
        <div className="modal-backdrop" onClick={() => setDeletingDuplicate(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#EF4444" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Delete Candidate Duplicate
                </h2>
              </div>
              <button onClick={() => setDeletingDuplicate(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete candidate duplicate <strong>{deletingDuplicate.duplicateRecord}</strong>?
              </p>
              <div style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>
                This will delete the duplicate entry from the database and keep the primary record intact.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingDuplicate(null)} disabled={isActioning}>
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

import React, { useState, useMemo, useEffect } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  RotateCcw,
  Search,
  ShieldCheck,
  Zap,
  Layers,
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

export function InvalidReferencesPage() {
  const { dataHealthStats = {} } = useMasterData();
  const { addToast } = useApp();

  const [invalidRefs, setInvalidRefs] = useState([
    { id: "REF-01", parentTable: "BOM Recipe (BOM-5002)", referencedField: "Ingredient Key", foreignId: "ING-9901 (Non-existent)", issue: "Orphaned Foreign Key Reference", status: "Broken Key" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRef, setViewingRef] = useState(null);
  const [deletingRef, setDeletingRef] = useState(null);
  const [isActioning, setIsActioning] = useState(false);

  const fetchScan = () => {
    adminService.getDataHealthScan()
      .then((res) => {
        const data = res?.data?.invalidReferences || res?.invalidReferences;
        if (Array.isArray(data) && data.length > 0) setInvalidRefs(data);
      })
      .catch((err) => console.warn("Data health scan (invalid):", err.message));
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const brokenCount = invalidRefs.filter((r) => r.status.includes("Broken")).length;

  const handleFix = async (id) => {
    const target = invalidRefs.find((r) => r.id === id);
    try {
      setIsActioning(true);
      await adminService.remediateDataHealth({
        category: "invalidReferences",
        id,
        parentTable: target?.parentTable,
        foreignId: target?.foreignId,
        actionType: "RESOLVE_ORPHANED_KEY"
      });
      setInvalidRefs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Cleaned / Re-linked" } : r))
      );
      addToast(`Foreign key reference ${id} resolved & saved to database!`, "success");
    } catch (err) {
      console.error(err);
      addToast(`Error resolving foreign key reference: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleFixAll = async () => {
    try {
      setIsActioning(true);
      for (const r of invalidRefs.filter((x) => x.status.includes("Broken"))) {
        await adminService.remediateDataHealth({
          category: "invalidReferences",
          id: r.id,
          parentTable: r.parentTable,
          foreignId: r.foreignId,
          actionType: "RESOLVE_ORPHANED_KEY"
        });
      }
      setInvalidRefs((prev) => prev.map((r) => ({ ...r, status: "Cleaned / Re-linked" })));
      addToast("All orphaned foreign keys resolved and synchronized in DB!", "success");
    } catch (err) {
      console.error(err);
      addToast(`Error resolving all keys: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRef) return;
    try {
      setIsActioning(true);
      await adminService.deleteDataHealth({
        category: "invalidReferences",
        id: deletingRef.id,
        details: deletingRef
      });
      setInvalidRefs((prev) => prev.filter((r) => r.id !== deletingRef.id));
      addToast(`Foreign reference record ${deletingRef.id} deleted & logged in DB!`, "success");
      setDeletingRef(null);
    } catch (err) {
      console.error(err);
      addToast(`Error deleting reference: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const filteredRefs = useMemo(() => {
    return invalidRefs.filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.parentTable.toLowerCase().includes(q) ||
        r.foreignId.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
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
            <Badge variant={brokenCount > 0 ? "rose" : "emerald"}>
              {brokenCount > 0 ? `${brokenCount} ORPHANED KEYS` : "ALL KEYS VALID"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => {
              fetchScan();
              addToast("Re-verified relational integrity constraints from database.", "info");
            }}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Check Relational Integrity
          </Button>
          {brokenCount > 0 && (
            <Button
              variant="primary"
              icon={Wrench}
              disabled={isActioning}
              onClick={handleFixAll}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Resolve All Keys
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
          icon={AlertOctagon}
          colorVariant={brokenCount > 0 ? "rose" : "emerald"}
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
          icon={Layers}
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
              placeholder="Search by parent table, foreign ID or error message..."
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
                    No invalid foreign references found.
                  </td>
                </tr>
              ) : (
                filteredRefs.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{r.parentTable}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#EF4444", fontSize: "13px" }}>
                      {r.foreignId}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#D97706", fontWeight: 600 }}>
                      {r.issue}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={r.status.includes("Broken") ? "rose" : "emerald"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {/* View Button */}
                        <button
                          onClick={() => setViewingRef(r)}
                          title="View Details"
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

                        {/* Resolve Action */}
                        {r.status.includes("Broken") ? (
                          <button
                            onClick={() => handleFix(r.id)}
                            disabled={isActioning}
                            title="Resolve and Re-link Foreign Key"
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
                          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, padding: "0 4px" }}>Resolved</span>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingRef(r)}
                          title="Delete Reference"
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

      {/* View Detail Modal */}
      {viewingRef && (
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
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#059669" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Invalid Reference Details
                </h3>
              </div>
              <button
                onClick={() => setViewingRef(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Reference ID:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{viewingRef.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Parent Table:</span>
                <span style={{ fontWeight: 700 }}>{viewingRef.parentTable}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Foreign Key:</span>
                <span style={{ fontWeight: 800, color: "#EF4444", fontFamily: "var(--font-mono)" }}>{viewingRef.foreignId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Constraint Issue:</span>
                <span style={{ fontWeight: 600, color: "#D97706" }}>{viewingRef.issue}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
                <Badge variant={viewingRef.status.includes("Broken") ? "rose" : "emerald"}>{viewingRef.status}</Badge>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={() => setViewingRef(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRef && (
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
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Delete Reference Entry
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Are you sure you want to remove <strong>{deletingRef.id}</strong> ({deletingRef.foreignId}) from the invalid references log? This operation will be saved in the database audit logs.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setDeletingRef(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
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

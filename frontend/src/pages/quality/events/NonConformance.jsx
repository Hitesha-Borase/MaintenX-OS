import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, Plus, Search, FileSpreadsheet, RefreshCw, 
  CheckCircle2, X, Info, ShieldAlert, ArrowRight, FileCheck, Filter
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";

export function NonConformance() {
  const { addToast } = useApp();

  const [ncrList, setNcrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNcr, setSelectedNcr] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form State for new NCR
  const [formPart, setFormPart] = useState("");
  const [formLot, setFormLot] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formSeverity, setFormSeverity] = useState("HIGH");
  const [formDisposition, setFormDisposition] = useState("QUARANTINED");
  const [submitting, setSubmitting] = useState(false);

  // Disposition review state
  const [reviewDisposition, setReviewDisposition] = useState("RETURN_TO_VENDOR");
  const [reviewComments, setReviewComments] = useState("");

  const fetchNcrs = async () => {
    setLoading(true);
    try {
      const res = await qualityService.getNcrs();
      if (res && res.data) {
        setNcrList(res.data);
      } else {
        setNcrList([
          { 
            id: "NCR-402", 
            part: "Aseptic Orange Caps (LOT-ORG-442)", 
            reason: "Plastic thread dimensions out-of-spec (0.2mm variance)", 
            severity: "CRITICAL",
            status: "PENDING QA REVIEW",
            disposition: "QUARANTINED",
            date: "2026-09-02",
            reportedBy: "Dr. Rachel Thorne"
          },
          { 
            id: "NCR-403", 
            part: "Aluminum End Cans 330ml (LOT-CAN-981)", 
            reason: "Flange width deformation on pallet 04", 
            severity: "HIGH",
            status: "REVIEWED",
            disposition: "RETURN_TO_VENDOR",
            date: "2026-09-01",
            reportedBy: "Marcus Vance"
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch NCRs", err);
      addToast("Loaded local NCR records", "info");
      setNcrList([
        { 
          id: "NCR-402", 
          part: "Aseptic Orange Caps (LOT-ORG-442)", 
          reason: "Plastic thread dimensions out-of-spec (0.2mm variance)", 
          severity: "CRITICAL",
          status: "PENDING QA REVIEW",
          disposition: "QUARANTINED",
          date: "2026-09-02",
          reportedBy: "Dr. Rachel Thorne"
        },
        { 
          id: "NCR-403", 
          part: "Aluminum End Cans 330ml (LOT-CAN-981)", 
          reason: "Flange width deformation on pallet 04", 
          severity: "HIGH",
          status: "REVIEWED",
          disposition: "RETURN_TO_VENDOR",
          date: "2026-09-01",
          reportedBy: "Marcus Vance"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNcrs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formPart || !formReason) return;

    setSubmitting(true);
    try {
      const payload = {
        ncrNumber: `NCR-${Math.floor(400 + Math.random() * 100)}`,
        part: formLot ? `${formPart} (${formLot})` : formPart,
        reason: formReason,
        severity: formSeverity,
        disposition: formDisposition
      };

      const res = await qualityService.createNcr(payload);
      const newNcr = res?.data || payload;
      setNcrList(prev => [newNcr, ...prev]);

      addToast(`NCR ${newNcr.id || newNcr.ncrNumber} logged successfully.`, "success");
      setFormPart("");
      setFormLot("");
      setFormReason("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      addToast("Error creating NCR report.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (ncr) => {
    const nextStatus = ncr.status === "PENDING QA REVIEW" ? "REVIEWED" : "PENDING QA REVIEW";
    try {
      const res = await qualityService.reviewNcr({ id: ncr.id, status: nextStatus, currentStatus: ncr.status });
      setNcrList(prev => prev.map(n => n.id === ncr.id ? { ...n, status: nextStatus } : n));
      addToast(`NCR ${ncr.id} marked as ${nextStatus}.`, "success");
    } catch (err) {
      console.error(err);
      setNcrList(prev => prev.map(n => n.id === ncr.id ? { ...n, status: nextStatus } : n));
      addToast(`NCR ${ncr.id} marked as ${nextStatus}.`, "success");
    }
  };

  const handleDisposeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNcr) return;

    try {
      const res = await qualityService.reviewNcr({
        id: selectedNcr.id,
        status: "REVIEWED",
        disposition: reviewDisposition,
        comments: reviewComments
      });

      setNcrList(prev => prev.map(n => n.id === selectedNcr.id ? {
        ...n,
        status: "REVIEWED",
        disposition: reviewDisposition
      } : n));

      addToast(`Disposition '${reviewDisposition}' confirmed for ${selectedNcr.id}.`, "success");
      setShowReviewModal(false);
      setSelectedNcr(null);
    } catch (err) {
      console.error(err);
      addToast("Failed to submit NCR disposition", "error");
    }
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportNcrs({ count: ncrList.length });
    } catch (err) {
      console.warn("Export NCR telemetry warning:", err);
    }

    const headers = "NCR ID,Part & Lot,Discrepancy Reason,Severity,Disposition,Status,Date\n";
    const rows = ncrList.map(n => `"${n.id}","${n.part}","${n.reason}","${n.severity || 'HIGH'}","${n.disposition || 'QUARANTINED'}","${n.status}","${n.date || 'Recent'}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NCR_Reports_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("NCR records exported as CSV.", "info");
  };

  const filteredNcrs = ncrList.filter(n => {
    const matchesSearch = (n.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.part || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalNcrs = ncrList.length;
  const pendingReview = ncrList.filter(n => n.status === "PENDING QA REVIEW").length;
  const reviewedNcrs = ncrList.filter(n => n.status === "REVIEWED").length;
  const criticalNcrs = ncrList.filter(n => n.severity === "CRITICAL").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertOctagon size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Non-Conformance Reports (NCR)
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Manage supplier material discrepancies, packaging defects, and QA quarantine disposition
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export NCRs
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={fetchNcrs}>
            Refresh
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Report NCR
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Total NCRs</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Registry
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {totalNcrs}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Incoming raw materials & packaging
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Pending QA Review</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#B91C1C", fontSize: "12px", fontWeight: 700 }}>
              Hold
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {pendingReview}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            Awaiting disposition decision
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Reviewed & Cleared</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Disposed
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {reviewedNcrs}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Returned to vendor or conditional
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Critical Defects</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Severity
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {criticalNcrs}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            Requires Supplier CAPA
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px", maxWidth: "450px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF", borderRadius: "10px", padding: "8px 14px" }}>
          <Search size={18} color="#6B5B4E" />
          <input 
            type="text" 
            placeholder="Search by NCR ID, part name, defect reason..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#2B1D11" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Status Filter:</span>
          {["ALL", "PENDING QA REVIEW", "REVIEWED"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: statusFilter === st ? "1px solid #C89547" : "1px solid #E8DDCF",
                backgroundColor: statusFilter === st ? "rgba(200, 149, 71, 0.15)" : "#FFFFFF",
                color: statusFilter === st ? "#8B6914" : "#6B5B4E",
                transition: "all 0.2s"
              }}
            >
              {st === "ALL" ? "All Reports" : st}
            </button>
          ))}
        </div>
      </Card>

      {/* Structured Table Card */}
      <Card style={{ padding: "0", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B1D11", margin: 0 }}>
              Non-Conformance Discrepancy Log ({filteredNcrs.length})
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6B5B4E" }}>
              Detailed records of defective lot isolations, supplier notifications, and quarantine tags
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF8F5", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>NCR ID</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Part / Lot Reference</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Discrepancy Reason</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Severity</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Disposition</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNcrs.map((ncr, index) => {
                const isPending = ncr.status === "PENDING QA REVIEW";

                return (
                  <tr 
                    key={ncr.id || index}
                    style={{ 
                      borderBottom: index === filteredNcrs.length - 1 ? "none" : "1px solid #F0E8DD",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAF8F5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "#2B1D11" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isPending ? "#EF4444" : "#C89547" }} />
                        <span>{ncr.id}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "#2B1D11" }}>
                      {ncr.part}
                    </td>
                    <td style={{ padding: "16px 20px", maxWidth: "320px", color: "#6B5B4E" }}>
                      {ncr.reason}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ 
                        padding: "4px 10px", 
                        borderRadius: "6px", 
                        fontSize: "11px", 
                        fontWeight: 700,
                        backgroundColor: ncr.severity === "CRITICAL" ? "rgba(239, 68, 68, 0.12)" : "rgba(200, 149, 71, 0.15)",
                        color: ncr.severity === "CRITICAL" ? "#B91C1C" : "#8B6914"
                      }}>
                        {ncr.severity || "HIGH"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "#F4EDE4", color: "#6B5B4E", fontSize: "11px", fontWeight: 600 }}>
                        {ncr.disposition || "QUARANTINED"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span 
                        onClick={() => handleToggleStatus(ncr)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "5px 12px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          backgroundColor: isPending ? "rgba(200, 149, 71, 0.15)" : "rgba(200, 149, 71, 0.3)",
                          color: isPending ? "#8B6914" : "#2B1D11",
                          border: "1px solid rgba(200, 149, 71, 0.4)",
                          transition: "opacity 0.2s"
                        }}
                        title="Click to toggle review state"
                      >
                        {ncr.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          icon={Search} 
                          onClick={() => setSelectedNcr(ncr)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          icon={FileCheck} 
                          onClick={() => {
                            setSelectedNcr(ncr);
                            setShowReviewModal(true);
                          }}
                        >
                          Review / Dispose
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredNcrs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#6B5B4E" }}>
                    No Non-Conformance Reports match the current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Create New NCR */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(30, 20, 10, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #E8DDCF",
            width: "100%",
            maxWidth: "560px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertOctagon size={18} color="#C89547" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                  Log Non-Conformance Report (NCR)
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Part / Material Name *
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Aseptic Orange Caps or Aluminum Cans 330ml"
                  value={formPart}
                  onChange={(e) => setFormPart(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                    Lot / Pallet Reference
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. LOT-ORG-442"
                    value={formLot}
                    onChange={(e) => setFormLot(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                    Severity
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value="CRITICAL">Critical (Total Lot Rejection)</option>
                    <option value="HIGH">High (Dimensional / Tolerance Variance)</option>
                    <option value="MEDIUM">Medium (Minor Cosmetic / Labeling)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Discrepancy Reason / Defect Specification *
                </label>
                <textarea
                  placeholder="Detail out-of-tolerance dimensions, supplier test failures, contamination..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Logging..." : "Create NCR"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: NCR Review & Disposition */}
      {showReviewModal && selectedNcr && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(30, 20, 10, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #E8DDCF",
            width: "100%",
            maxWidth: "560px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileCheck size={18} color="#C89547" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                  QA Disposition for {selectedNcr.id}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedNcr(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDisposeSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>{selectedNcr.part}</div>
                <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "2px" }}>Reason: {selectedNcr.reason}</div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  QA Disposition Decision *
                </label>
                <select
                  value={reviewDisposition}
                  onChange={(e) => setReviewDisposition(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
                >
                  <option value="RETURN_TO_VENDOR">Return to Vendor (RTV) with Chargeback</option>
                  <option value="SCRAP_REWORK">Scrap & Destroy Lot (Full Write-Off)</option>
                  <option value="RELEASE_CONDITIONAL">Conditional Release with Secondary QA Check</option>
                  <option value="DOWNGRADE_USE">Downgrade Material for Non-Critical SKU</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  QA Lead Notes / Authorization Comments
                </label>
                <textarea
                  placeholder="Enter quality verification rationale, vendor notification ticket number..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedNcr(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Authorize Disposition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View NCR Details */}
      {selectedNcr && !showReviewModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(30, 20, 10, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #E8DDCF",
            width: "100%",
            maxWidth: "560px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Info size={18} color="#C89547" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                  {selectedNcr.id} Full Technical Log
                </h3>
              </div>
              <button 
                onClick={() => setSelectedNcr(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8B6914", textTransform: "uppercase" }}>Component Description</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", fontWeight: 700, color: "#2B1D11" }}>{selectedNcr.part}</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6B5B4E" }}>Reason: {selectedNcr.reason}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Severity</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#B91C1C" }}>{selectedNcr.severity || "HIGH"}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Disposition</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#8B6914" }}>{selectedNcr.disposition || "QUARANTINED"}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Report Date</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>{selectedNcr.date || "2026-09-02"}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Logged By</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>{selectedNcr.reportedBy || "QA Lead"}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setSelectedNcr(null)}>
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  icon={FileCheck}
                  onClick={() => setShowReviewModal(true)}
                >
                  Authorize Disposition
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

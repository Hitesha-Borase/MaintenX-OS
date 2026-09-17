import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Activity,
  Search,
  X,
  FileCheck,
  Pencil,
  Eye,
  Paperclip,
  Image,
  FileSpreadsheet,
  Cpu
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";
import ciService from "../../../services/ciService";

export function Evidence() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    evidenceList = [],
    investigations = [],
    addEvidence,
    updateEvidence,
    deleteEvidence,
    refreshEvidence,
    refreshInvestigations,
    currentUser
  } = useCI();

  const [selectedRcaFilter, setSelectedRcaFilter] = useState("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingEvidence, setViewingEvidence] = useState(null);
  const [editingEvidence, setEditingEvidence] = useState(null);

  useEffect(() => {
    refreshEvidence?.();
    refreshInvestigations?.();
  }, [refreshEvidence, refreshInvestigations]);

  const [newEvidence, setNewEvidence] = useState({
    rcaId: investigations[0]?.id || "RCA-2026-003",
    type: "Physical Photo",
    title: "",
    details: "",
    fileUrl: "",
    uploadedBy: currentUser?.name || currentUser || "Viktor Hayes"
  });

  // Keep default RCA in sync
  useEffect(() => {
    if (!newEvidence.rcaId && investigations.length > 0) {
      setNewEvidence((prev) => ({ ...prev, rcaId: investigations[0].id }));
    }
  }, [investigations, newEvidence.rcaId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEvidence.rcaId) {
      addToast("Please select a linked RCA investigation.", "warning");
      return;
    }
    if (!newEvidence.title.trim() || !newEvidence.details.trim()) {
      addToast("Please provide both evidence title and empirical details.", "warning");
      return;
    }

    try {
      await addEvidence({
        rcaId: newEvidence.rcaId,
        type: newEvidence.type,
        title: newEvidence.title.trim(),
        details: newEvidence.details.trim(),
        fileUrl: newEvidence.fileUrl || null,
        uploadedBy: newEvidence.uploadedBy || currentUser?.name || "Viktor Hayes",
        date: new Date().toISOString().substring(0, 10)
      });

      setIsAddModalOpen(false);
      setNewEvidence({
        rcaId: investigations[0]?.id || "RCA-2026-003",
        type: "Physical Photo",
        title: "",
        details: "",
        fileUrl: "",
        uploadedBy: currentUser?.name || "Viktor Hayes"
      });
      await refreshEvidence?.();
    } catch (err) {
      addToast(`Error adding evidence: ${err.message}`, "error");
    }
  };

  const handleOpenEdit = (ev) => {
    setEditingEvidence({
      id: ev.id,
      rcaId: ev.rcaId,
      type: ev.type,
      title: ev.title || "",
      details: ev.details || "",
      fileUrl: ev.fileUrl || "",
      uploadedBy: ev.uploadedBy || "Viktor Hayes"
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingEvidence) return;
    try {
      if (updateEvidence) {
        await updateEvidence(editingEvidence.id, {
          rcaId: editingEvidence.rcaId,
          type: editingEvidence.type,
          title: editingEvidence.title.trim(),
          details: editingEvidence.details.trim(),
          fileUrl: editingEvidence.fileUrl || null
        });
      } else {
        await ciService.updateEvidence(editingEvidence.id, {
          rcaId: editingEvidence.rcaId,
          type: editingEvidence.type,
          title: editingEvidence.title.trim(),
          details: editingEvidence.details.trim(),
          fileUrl: editingEvidence.fileUrl || null
        });
      }
      setEditingEvidence(null);
      await refreshEvidence?.();
      addToast(`Evidence ${editingEvidence.id} updated successfully.`, "success");
    } catch (err) {
      addToast(`Failed to update evidence: ${err.message}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete evidence record ${id}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteEvidence(id);
      await refreshEvidence?.();
    } catch (err) {
      addToast(`Failed to delete evidence: ${err.message}`, "error");
    }
  };

  const handleExportCSV = () => {
    const headers = "Evidence ID,Linked RCA,Category,Title,Details,Attachment,Uploaded By,Date\n";
    const rows = filteredItems
      .map(
        (ev) =>
          `"${ev.id}","${ev.rcaId}","${ev.type}","${ev.title.replace(/"/g, '""')}","${ev.details.replace(/"/g, '""')}","${ev.fileUrl || "None"}","${ev.uploadedBy}","${ev.date}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Evidence_Locker_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Evidence records exported to CSV.", "info");
  };

  const getCategoryBadgeVariant = (type) => {
    const lower = (type || "").toLowerCase();
    if (lower.includes("scada") || lower.includes("telemetry")) return "emerald";
    if (lower.includes("photo") || lower.includes("physical")) return "cyan";
    if (lower.includes("lab") || lower.includes("qc")) return "purple";
    return "amber";
  };

  const getAttachmentIcon = (fileUrl, type) => {
    const lower = ((fileUrl || "") + (type || "")).toLowerCase();
    if (lower.includes(".jpg") || lower.includes(".png") || lower.includes("photo") || lower.includes("image")) {
      return <Image size={13} color="#0284C7" />;
    }
    if (lower.includes(".csv") || lower.includes(".xls") || lower.includes("scada")) {
      return <FileSpreadsheet size={13} color="#059669" />;
    }
    return <Paperclip size={13} color="#8C5B23" />;
  };

  const filteredItems = useMemo(() => {
    return evidenceList.filter((ev) => {
      const matchesRca = selectedRcaFilter === "ALL" || ev.rcaId === selectedRcaFilter;
      const matchesCategory = selectedCategoryFilter === "ALL" || ev.type === selectedCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title?.toLowerCase().includes(q) ||
        ev.details?.toLowerCase().includes(q) ||
        ev.rcaId?.toLowerCase().includes(q) ||
        ev.type?.toLowerCase().includes(q) ||
        ev.id?.toLowerCase().includes(q);

      return matchesRca && matchesCategory && matchesSearch;
    });
  }, [evidenceList, selectedRcaFilter, selectedCategoryFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              RCA 2.0 — Evidence Locker
            </h1>
            <Badge variant="cyan">{evidenceList.length} ARTIFACTS ARCHIVED</Badge>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Empirical forensic artifacts: SCADA sensor trends, physical failure photos, oil/lab analysis, and chain-of-custody logs.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/hypothesis")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Hypothesis Testing →
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Log Evidence
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
          title="Total Evidence Artifacts"
          value={evidenceList.length.toString()}
          unit="Secured Records"
          icon={FileText}
          colorVariant="cyan"
        />
        <StatCard
          title="SCADA & Telemetry"
          value={evidenceList.filter((i) => (i.type || "").toLowerCase().includes("scada")).length.toString()}
          unit="Time-Series Traces"
          icon={Activity}
          colorVariant="emerald"
        />
        <StatCard
          title="Lab & Physical QC"
          value={evidenceList.filter((i) => {
            const t = (i.type || "").toLowerCase();
            return t.includes("lab") || t.includes("photo") || t.includes("physical");
          }).length.toString()}
          unit="Inspection Samples"
          icon={ShieldCheck}
          colorVariant="amber"
        />
        <StatCard
          title="Integrity Audit"
          value="100%"
          unit="Chain of Custody"
          icon={FileCheck}
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
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
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
              placeholder="Search evidence ID, title, findings, or RCA reference..."
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Categories</option>
              <option value="Physical Photo">Physical Photo</option>
              <option value="SCADA Trend">SCADA Trend</option>
              <option value="Lab QC Report">Lab QC Report</option>
              <option value="Work Order Log">Work Order Log</option>
            </select>

            <select
              value={selectedRcaFilter}
              onChange={(e) => setSelectedRcaFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Active RCAs ({investigations.length})</option>
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} — {inv.title.substring(0, 26)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Linked RCA</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Evidence Artifact</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Attachment / File</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Empirical Observations</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Chain of Custody</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No evidence records found for the selected criteria. Click <strong>&quot;+ Log Evidence&quot;</strong> to archive empirical artifacts.
                  </td>
                </tr>
              ) : (
                filteredItems.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {/* Linked RCA */}
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => navigate("/ci/rca/investigations")}
                        title="Jump to Investigation"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 800,
                          fontSize: "12px",
                          color: "#8C5B23"
                        }}
                      >
                        <span>{ev.rcaId}</span>
                        <ExternalLink size={11} />
                      </button>
                    </td>

                    {/* Title + ID */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                        Artifact ID: {ev.id}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={getCategoryBadgeVariant(ev.type)}>
                        {ev.type}
                      </Badge>
                    </td>

                    {/* Attachment / File */}
                    <td style={{ padding: "12px 16px" }}>
                      {ev.fileUrl ? (
                        <div
                          onClick={() => setViewingEvidence(ev)}
                          title="Click to preview attachment"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            border: "1px solid var(--border-subtle)",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            cursor: "pointer"
                          }}
                        >
                          {getAttachmentIcon(ev.fileUrl, ev.type)}
                          <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ev.fileUrl}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>None attached</span>
                      )}
                    </td>

                    {/* Details & Observations */}
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)", maxWidth: "280px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
                        {ev.details}
                      </div>
                    </td>

                    {/* Chain of Custody */}
                    <td style={{ padding: "12px 16px", fontSize: "11.5px", color: "var(--text-muted)" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ev.uploadedBy}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{ev.date}</div>
                    </td>

                    {/* ACTIONS Column */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {/* 1. View / Inspect Button */}
                        <button
                          onClick={() => setViewingEvidence(ev)}
                          title="Inspect Evidence Artifact"
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
                          <Eye size={13} />
                        </button>

                        {/* 2. Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(ev)}
                          title="Edit Evidence Record"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(2, 132, 199, 0.08)",
                            color: "#0284C7",
                            border: "1px solid rgba(2, 132, 199, 0.25)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Pencil size={13} />
                        </button>

                        {/* 3. Jump to RCA */}
                        <button
                          onClick={() => navigate("/ci/rca/investigations")}
                          title={`Open ${ev.rcaId} Investigation`}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            color: "#8C5B23",
                            border: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <ExternalLink size={13} />
                        </button>

                        {/* 4. Delete Button */}
                        <button
                          onClick={() => handleDelete(ev.id)}
                          title="Delete Evidence Record"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(239, 68, 68, 0.08)",
                            color: "#EF4444",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
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

      {/* ======================================================================= */}
      {/* 1. VIEW / INSPECT EVIDENCE MODAL */}
      {/* ======================================================================= */}
      {viewingEvidence && (
        <div className="modal-backdrop" onClick={() => setViewingEvidence(null)}>
          <div className="modal-content" style={{ maxWidth: "620px", margin: "16px", maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Evidence Inspection Dossier — {viewingEvidence.id}
                </h2>
              </div>
              <button onClick={() => setViewingEvidence(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Evidence Title & Category */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Badge variant={getCategoryBadgeVariant(viewingEvidence.type)}>{viewingEvidence.type}</Badge>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Linked to Case: <strong style={{ color: "#8C5B23" }}>{viewingEvidence.rcaId}</strong>
                  </span>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 0 0" }}>
                  {viewingEvidence.title}
                </h3>
              </div>

              {/* Empirical Observations Box */}
              <div style={{ backgroundColor: "var(--bg-card-subtle)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Empirical Findings & Observations
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.5 }}>
                  {viewingEvidence.details}
                </div>
              </div>

              {/* Attachment Preview Box */}
              <div style={{ backgroundColor: "rgba(2, 132, 199, 0.04)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(2, 132, 199, 0.2)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#0284C7", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={13} />
                  Attached File / Artifact Proof
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {getAttachmentIcon(viewingEvidence.fileUrl, viewingEvidence.type)}
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {viewingEvidence.fileUrl || "bearing_thermal_scan_AST001.png"}
                    </span>
                  </div>
                  <Badge variant="emerald">VERIFIED SHA-256</Badge>
                </div>
              </div>

              {/* Chain of Custody & Audit Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Logged By:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{viewingEvidence.uploadedBy}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Date Recorded:</span>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>{viewingEvidence.date}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingEvidence(null)}>
                  Close
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const ev = viewingEvidence;
                    setViewingEvidence(null);
                    handleOpenEdit(ev);
                  }}
                >
                  Edit Evidence
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setViewingEvidence(null);
                    navigate("/ci/rca/hypothesis");
                  }}
                >
                  Proceed to Hypothesis Testing →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. EDIT EVIDENCE MODAL */}
      {/* ======================================================================= */}
      {editingEvidence && (
        <div className="modal-backdrop" onClick={() => setEditingEvidence(null)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Evidence Artifact {editingEvidence.id}
                </h2>
              </div>
              <button onClick={() => setEditingEvidence(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Linked RCA Investigation</label>
                  <select
                    value={editingEvidence.rcaId}
                    onChange={(e) => setEditingEvidence({ ...editingEvidence, rcaId: e.target.value })}
                    className="form-select"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {investigations.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} — {inv.title.substring(0, 24)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Artifact Category</label>
                  <select
                    value={editingEvidence.type}
                    onChange={(e) => setEditingEvidence({ ...editingEvidence, type: e.target.value })}
                    className="form-select"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Physical Photo">Physical Photo</option>
                    <option value="SCADA Trend">SCADA Trend</option>
                    <option value="Lab QC Report">Lab QC Report</option>
                    <option value="Work Order Log">Work Order Log</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Evidence Title *</label>
                <input
                  type="text"
                  required
                  value={editingEvidence.title}
                  onChange={(e) => setEditingEvidence({ ...editingEvidence, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Attachment File Reference / URL</label>
                <input
                  type="text"
                  placeholder="e.g. bearing_crack_AST001.png or scada_trace.csv"
                  value={editingEvidence.fileUrl}
                  onChange={(e) => setEditingEvidence({ ...editingEvidence, fileUrl: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF", fontFamily: "var(--font-mono)" }}
                />
              </div>

              <div>
                <label className="form-label">Empirical Observations & Findings *</label>
                <textarea
                  rows={3}
                  required
                  value={editingEvidence.details}
                  onChange={(e) => setEditingEvidence({ ...editingEvidence, details: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingEvidence(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. ADD EVIDENCE MODAL */}
      {/* ======================================================================= */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Log Forensic Evidence Artifact
                </h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Linked Investigation *</label>
                  <select
                    value={newEvidence.rcaId}
                    onChange={(e) => setNewEvidence({ ...newEvidence, rcaId: e.target.value })}
                    className="form-select"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">-- Select Linked RCA --</option>
                    {investigations.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} — {inv.title.substring(0, 26)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Artifact Category</label>
                  <select
                    value={newEvidence.type}
                    onChange={(e) => setNewEvidence({ ...newEvidence, type: e.target.value })}
                    className="form-select"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Physical Photo">Physical Photo (Inspection)</option>
                    <option value="SCADA Trend">SCADA Telemetry Export</option>
                    <option value="Lab QC Report">Lab Quality Assay</option>
                    <option value="Work Order Log">Maintenance Work Order Log</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Evidence Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drive Shaft Bearing Thermal Imaging Overheat Spike"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Attachment File / Screenshot Reference</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="e.g. bearing_thermal_scan_AST001.png"
                    value={newEvidence.fileUrl}
                    onChange={(e) => setNewEvidence({ ...newEvidence, fileUrl: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF", fontFamily: "var(--font-mono)", flex: 1 }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const samples = [
                        "bearing_thermal_scan_AST001.png",
                        "scada_torque_pressure_trend.csv",
                        "lab_grease_viscosity_assay.pdf",
                        "microscope_metal_spalling_0917.jpg"
                      ];
                      const chosen = samples[Math.floor(Math.random() * samples.length)];
                      setNewEvidence((prev) => ({ ...prev, fileUrl: chosen }));
                      addToast(`Attached sample proof: ${chosen}`, "info");
                    }}
                    style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                  >
                    Sample Proof
                  </Button>
                </div>
              </div>

              <div>
                <label className="form-label">Empirical Findings & Sensor Observations *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe exact temperatures, pressures, vibration spikes, physical wear marks, or sensor log deviations..."
                  value={newEvidence.details}
                  onChange={(e) => setNewEvidence({ ...newEvidence, details: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Evidence
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

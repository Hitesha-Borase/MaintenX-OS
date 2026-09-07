import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Save,
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
  FileCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { StatCard } from "../../../components/common/StatCard";
import { useCI } from "../../../context/CIContext";
import { useApp } from "../../../context/AppContext";

export function Evidence() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { evidenceList = [], investigations = [] } = useCI();

  const [items, setItems] = useState(evidenceList);
  const [selectedRcaFilter, setSelectedRcaFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newEvidence, setNewEvidence] = useState({
    rcaId: investigations[0]?.id || "RCA-2026-001",
    type: "SCADA Trend",
    title: "",
    details: "",
    uploadedBy: "David Kim"
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newEvidence.title.trim() || !newEvidence.details.trim()) {
      addToast("Please provide both title and details.", "warning");
      return;
    }

    const created = {
      id: `EVD-${Math.floor(100 + Math.random() * 900)}`,
      rcaId: newEvidence.rcaId,
      type: newEvidence.type,
      title: newEvidence.title.trim(),
      details: newEvidence.details.trim(),
      uploadedBy: newEvidence.uploadedBy,
      date: new Date().toISOString().substring(0, 10)
    };

    setItems([created, ...items]);
    addToast(`Evidence artifact ${created.id} logged for ${created.rcaId}!`, "success");
    setIsModalOpen(false);
    setNewEvidence({
      rcaId: investigations[0]?.id || "RCA-2026-001",
      type: "SCADA Trend",
      title: "",
      details: "",
      uploadedBy: "David Kim"
    });
  };

  const handleDelete = (id) => {
    setItems(items.filter((i) => i.id !== id));
    addToast(`Evidence ${id} removed.`, "info");
  };

  const handleExportCSV = () => {
    const headers = "Evidence ID,RCA ID,Artifact Type,Title,Details,Uploaded By,Date\n";
    const rows = filteredItems
      .map((ev) => `"${ev.id}","${ev.rcaId}","${ev.type}","${ev.title}","${ev.details}","${ev.uploadedBy}","${ev.date}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RCA_Evidence_Locker_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Evidence records exported to CSV.", "info");
  };

  const filteredItems = useMemo(() => {
    return items.filter((ev) => {
      const matchesRca = selectedRcaFilter === "ALL" || ev.rcaId === selectedRcaFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title?.toLowerCase().includes(q) ||
        ev.details?.toLowerCase().includes(q) ||
        ev.rcaId?.toLowerCase().includes(q) ||
        ev.type?.toLowerCase().includes(q);

      return matchesRca && matchesSearch;
    });
  }, [items, selectedRcaFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              RCA 2.0 — Evidence Locker
            </h1>
            <Badge variant="cyan">{items.length} ARTIFACTS ARCHIVED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/rca/hypothesis")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Hypothesis Testing
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Log Evidence
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
          value={items.length.toString()}
          unit="Records"
          icon={FileText}
          colorVariant="cyan"
        />
        <StatCard
          title="SCADA & Telemetry"
          value={items.filter((i) => i.type.includes("SCADA")).length.toString()}
          unit="Traces"
          icon={Activity}
          colorVariant="emerald"
        />
        <StatCard
          title="Lab & Physical QC"
          value={items.filter((i) => i.type.includes("Lab") || i.type.includes("Photo")).length.toString()}
          unit="Inspections"
          icon={ShieldCheck}
          colorVariant="amber"
        />
        <StatCard
          title="Integrity"
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
              placeholder="Search evidence artifact, title, details or RCA ID..."
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
              value={selectedRcaFilter}
              onChange={(e) => setSelectedRcaFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Active RCAs</option>
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 28)}...</option>
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
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Evidence Artifact Title</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Details & Observations</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Logged By</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                    {ev.rcaId}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                    {ev.title}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="cyan">{ev.type}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {ev.details}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                    {ev.uploadedBy} • {ev.date}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      title="Archive Evidence"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD EVIDENCE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Upload Investigation Evidence
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Linked Investigation</label>
                  <select
                    value={newEvidence.rcaId}
                    onChange={(e) => setNewEvidence({ ...newEvidence, rcaId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {investigations.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.id} — {inv.title.substring(0, 24)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Artifact Category</label>
                  <select
                    value={newEvidence.type}
                    onChange={(e) => setNewEvidence({ ...newEvidence, type: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="SCADA Trend">SCADA Telemetry Export</option>
                    <option value="Physical Inspection Photo">Physical Inspection Photo</option>
                    <option value="Lab QC Report">Lab Quality Report</option>
                    <option value="Work Order Log">Maintenance Work Order Log</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Evidence Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SCADA Pressure Drop Trend & Valve Response"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Findings & Data Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe empirical observations, readings, deviations and source sensor tags..."
                  value={newEvidence.details}
                  onChange={(e) => setNewEvidence({ ...newEvidence, details: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
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

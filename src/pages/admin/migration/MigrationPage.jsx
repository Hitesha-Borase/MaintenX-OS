import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Search,
  X,
  Plus,
  ShieldCheck,
  Zap,
  Layers,
  FileText
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function MigrationPage() {
  const { addToast } = useApp();

  const [migrationJobs, setMigrationJobs] = useState([
    { id: "MIG-01", targetTable: "Item & SKU Master", recordsCount: 1420, format: "CSV", importedBy: "Alexander Vance", date: "2026-08-28", status: "Completed" },
    { id: "MIG-02", targetTable: "BOM & Recipe Formulas", recordsCount: 48, format: "Excel (.xlsx)", importedBy: "Alexander Vance", date: "2026-08-29", status: "Completed" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newJob, setNewJob] = useState({
    targetTable: "Storage Locations & Bins",
    format: "CSV",
    recordsCount: 250
  });

  const totalMigrated = migrationJobs.reduce((sum, j) => sum + (j.recordsCount || 0), 0);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      const created = {
        id: `MIG-0${migrationJobs.length + 1}`,
        targetTable: newJob.targetTable,
        recordsCount: Number(newJob.recordsCount) || 100,
        format: newJob.format,
        importedBy: "Alexander Vance",
        date: new Date().toISOString().substring(0, 10),
        status: "Completed"
      };
      setMigrationJobs([...migrationJobs, created]);
      setIsUploading(false);
      setIsModalOpen(false);
      addToast(`Batch migration "${created.id}" processed ${created.recordsCount} rows cleanly!`, "success");
    }, 700);
  };

  const filteredJobs = migrationJobs.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.targetTable.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.format.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Migration & Bulk Import Engine
            </h1>
            <Badge variant="emerald">{totalMigrated.toLocaleString()} ROWS MIGRATED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={UploadCloud}
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Upload & Validate Batch
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          title="Migrated Records"
          value={totalMigrated.toLocaleString()}
          unit="Total Rows"
          trend={{ value: "Item, BOM, Storage Master", isPositive: true, text: "" }}
          icon={FileSpreadsheet}
          colorVariant="emerald"
        />
        <StatCard
          title="Batch Pass Rate"
          value="100%"
          unit="Clean Schema"
          trend={{ value: "Zero parse or format errors", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="File Ingestion"
          value="CSV / XLSX"
          unit="Parsers"
          trend={{ value: "Strict column mapping active", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="Rollback Protection"
          value="Transactional"
          unit="ACID Safe"
          trend={{ value: "Instant rollback on fail", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Migration Jobs Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search migration job, target table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "700px" }}>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Target Master Table</th>
                <th>Records Migrated</th>
                <th>File Format</th>
                <th>Operator</th>
                <th>Date Executed</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{m.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{m.targetTable}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {m.recordsCount.toLocaleString()} Rows
                  </td>
                  <td>
                    <Badge variant="cyan">{m.format}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{m.importedBy}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{m.date}</td>
                  <td>
                    <Badge variant="emerald">{m.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Downloaded schema verification log for ${m.id}`, "info")}
                      title="Download Migration Log"
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
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Upload & Validate Batch Migration
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Target Master Schema *</label>
                <select
                  className="form-select"
                  value={newJob.targetTable}
                  onChange={(e) => setNewJob({ ...newJob, targetTable: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Item & SKU Master">Item & SKU Master</option>
                  <option value="BOM & Recipe Formulas">BOM & Recipe Formulas</option>
                  <option value="Storage Locations & Bins">Storage Locations & Bins</option>
                  <option value="Machine Capabilities">Machine Capabilities</option>
                  <option value="Quality Specs & Limits">Quality Specs & Limits</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">File Type</label>
                  <select
                    className="form-select"
                    value={newJob.format}
                    onChange={(e) => setNewJob({ ...newJob, format: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="CSV">CSV (.csv)</option>
                    <option value="Excel (.xlsx)">Excel (.xlsx)</option>
                    <option value="JSON Lines">JSON Lines (.jsonl)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Estimated Row Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newJob.recordsCount}
                    onChange={(e) => setNewJob({ ...newJob, recordsCount: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isUploading}>
                  {isUploading ? "Validating..." : "Execute Migration"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import {
  FileCode,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  X,
  HelpCircle,
  ExternalLink,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function FailureCodesPage() {
  const { failureCodes = [], addFailureCode } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    category: "Mechanical",
    description: "",
    severity: "High",
    standardRepair: ""
  });

  const filteredCodes = (failureCodes || []).filter((fc) => {
    const q = searchQuery.toLowerCase();
    const code = (fc.code || "").toLowerCase();
    const desc = (fc.description || "").toLowerCase();
    const cat = (fc.category || "").toLowerCase();

    const matchesSearch = code.includes(q) || desc.includes(q) || cat.includes(q);
    const matchesCat = categoryFilter === "ALL" || (fc.category || "") === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      addToast("Please provide a failure code tag", "warning");
      return;
    }
    if (addFailureCode) {
      addFailureCode(formData);
    }
    addToast(`Failure code ${formData.code} added to Standard Taxonomy!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      code: "",
      category: "Mechanical",
      description: "",
      severity: "High",
      standardRepair: ""
    });
  };

  const handleExportCSV = () => {
    const headers = "Code,Category,Description,Severity,Standard Repair\n";
    const rows = filteredCodes
      .map((fc) => `"${fc.code}","${fc.category}","${fc.description}","${fc.severity}","${fc.standardRepair || ''}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Failure_Codes_Catalog_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Failure codes catalog exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Standardized Failure Codes Catalog
            </h1>
            <Badge variant="cyan">ISO 14224 & VDI TAXONOMY</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Catalog
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Failure Code
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
          title="Catalog Codes"
          value={failureCodes.length.toString()}
          unit="Standard Codes"
          trend={{ value: "100% classification coverage", isPositive: true, text: "" }}
          icon={FileCode}
          colorVariant="cyan"
        />
        <StatCard
          title="Most Frequent Code"
          value="HYD-002"
          unit="Gasket Failure"
          trend={{ value: "42% of total downtime", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Diagnostic SOPs"
          value="100%"
          unit="Linked"
          trend={{ value: "Verified troubleshooting guides", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Taxonomy Status"
          value="Standardized"
          unit="ISO 14224"
          trend={{ value: "Audited & compliant", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
      </div>

      {/* Filter and Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search code (e.g. MEC-004), description, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Category:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Hydraulic">Hydraulic</option>
              <option value="Electrical">Electrical</option>
              <option value="Pneumatics">Pneumatics</option>
              <option value="Software">Software</option>
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Failure Code</th>
                <th>Category</th>
                <th>Description / Failure Mode</th>
                <th>Standard Repair Action</th>
                <th>Severity</th>
                <th>Troubleshoot</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No failure codes match your search query.
                  </td>
                </tr>
              ) : (
                filteredCodes.map((fc) => (
                  <tr key={fc.code}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                        {fc.code}
                      </span>
                    </td>
                    <td>
                      <Badge variant="cyan">{fc.category}</Badge>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fc.description}</div>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "260px" }}>
                      {fc.standardRepair || "Inspect and replace affected component assembly."}
                    </td>
                    <td>
                      <Badge variant={fc.severity === "Critical" ? "rose" : fc.severity === "High" ? "amber" : "cyan"}>
                        {fc.severity || "Medium"}
                      </Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/troubleshooting?search=${fc.code}`)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <span>Wizard</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD CODE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Failure Code to Taxonomy
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Failure Code Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEC-012"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Discipline Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Mechanical">Mechanical</option>
                    <option value="Hydraulic">Hydraulic</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Pneumatics">Pneumatics</option>
                    <option value="Software">Software</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Failure Mode Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drive Belt Slippage & Tensioner Arm Fracture"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Severity Level</label>
                <select
                  className="form-select"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Critical">Critical (P1 Outage)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="form-label">Standard Repair Procedure</label>
                <textarea
                  rows={3}
                  placeholder="Standard corrective maintenance protocol steps..."
                  value={formData.standardRepair}
                  onChange={(e) => setFormData({ ...formData, standardRepair: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Failure Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

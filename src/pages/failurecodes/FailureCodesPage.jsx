import React, { useState } from "react";
import {
  FileCode,
  Search,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  X,
  Layers,
  Wrench,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function FailureCodesPage() {
  const { failureCodes, addFailureCode } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Add Code Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    category: "Mechanical",
    description: "",
    standardRepair: "",
    severity: "Medium"
  });

  const filteredCodes = failureCodes.filter((fc) => {
    const matchesSearch =
      fc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fc.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || fc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.description) {
      addToast("Please enter a code and description.", "warning");
      return;
    }

    addFailureCode({
      ...formData,
      frequencyCount: 1,
      standardRepair: formData.standardRepair || "Standard diagnostic & replacement procedure."
    });

    addToast(`Failure Code ${formData.code} created!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      code: "",
      category: "Mechanical",
      description: "",
      standardRepair: "",
      severity: "Medium"
    });
  };

  const handleExportCSV = () => {
    const headers = "Failure Code,Category,Description,Severity,Standard Repair\n";
    const rows = filteredCodes
      .map((fc) => `"${fc.code}","${fc.category}","${fc.description}","${fc.severity}","${fc.standardRepair || ""}"`)
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Standardized Failure Codes Catalog
            </h1>
            <Badge variant="cyan">ISO 14224 & VDI Taxonomy</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Standard taxonomy for equipment breakdown classification, root cause tracking, and diagnostic wizards.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Catalog
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Failure Code
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
          title="Standard Diagnostic SOPs"
          value="100%"
          unit="Linked"
          trend={{ value: "Verified troubleshooting guides", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Filter and Table Card */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search code (e.g. MEC-004), description, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Category:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "150px", fontSize: "12px" }}
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

          {(searchQuery || categoryFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>

        <div className="data-table-container">
          <table className="data-table">
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
              {filteredCodes.map((fc) => (
                <tr key={fc.code}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      {fc.code}
                    </span>
                  </td>
                  <td>
                    <Badge variant="cyan">{fc.category}</Badge>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fc.description}</div>
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
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/troubleshooting?search=${fc.code}`)}
                    >
                      Wizard
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD CODE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Failure Code to Taxonomy
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Failure Code Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEC-012"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Discipline Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                />
              </div>

              <div>
                <label className="form-label">Severity Level</label>
                <select
                  className="form-select"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
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
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

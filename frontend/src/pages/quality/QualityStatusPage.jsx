import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  X,
  Gauge,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useQuality } from "../../context/QualityContext";
import { useApp } from "../../context/AppContext";

export function QualityStatusPage() {
  const { qualityChecks = [], addQualityCheck } = useQuality();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    parameter: "Brix Sugar Level",
    line: "Line 1 (Aseptic Bottling)",
    readingValue: "11.9 °Bx",
    specRange: "11.8 ± 0.3 °Bx",
    status: "PASS",
    inspector: "QA Lead Sarah Jenkins"
  });

  const getParamSummary = (q) => {
    if (q.parameters && q.parameters.length > 0) {
      return q.parameters.map((p) => p.name).join(", ");
    }
    return q.parameter || q.checkType || "In-Line Inspection";
  };

  const getReadingSummary = (q) => {
    if (q.parameters && q.parameters.length > 0) {
      return q.parameters[0].actual;
    }
    return q.readingValue || "11.9 °Bx";
  };

  const getSpecSummary = (q) => {
    if (q.parameters && q.parameters.length > 0) {
      return q.parameters[0].target;
    }
    return q.specRange || "Within Spec";
  };

  const getLine = (q) => {
    return q.samplePoint || q.line || "Line 1 (Aseptic)";
  };

  const filteredChecks = (qualityChecks || []).filter((c) => {
    const q = searchQuery.toLowerCase();
    const id = (c.id || "").toLowerCase();
    const param = getParamSummary(c).toLowerCase();
    const line = getLine(c).toLowerCase();
    const prod = (c.productName || "").toLowerCase();

    const matchesSearch = id.includes(q) || param.includes(q) || line.includes(q) || prod.includes(q);
    const status = (c.status || "").toUpperCase();
    const matchesStatus =
      statusFilter === "ALL" ||
      status === statusFilter ||
      (statusFilter === "PASS" && status.includes("PASS")) ||
      (statusFilter === "HOLD" && status.includes("HOLD")) ||
      (statusFilter === "RELEASED" && status.includes("REL"));

    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `QC-2026-${Math.floor(1190 + Math.random() * 90)}`;
    const newCheck = {
      id: newId,
      orderId: "PO-2026-904",
      batchId: "BAT-2026-0892",
      productName: "Organic Cold-Pressed Orange Juice 500ml",
      checkType: formData.parameter,
      samplePoint: formData.line,
      status: formData.status,
      inspector: formData.inspector,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      parameters: [
        {
          name: formData.parameter,
          target: formData.specRange,
          actual: formData.readingValue,
          status: formData.status
        }
      ],
      notes: "Routine in-line sample audit logged."
    };

    if (addQualityCheck) {
      addQualityCheck(newCheck);
    }
    addToast(`Quality check ${newId} recorded!`, "success");
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Test ID,Product,Parameter,Sample Point,Measured Value,Spec Range,Inspector,Status\n";
    const rows = filteredChecks
      .map((q) => `"${q.id}","${q.productName || ''}","${getParamSummary(q)}","${getLine(q)}","${getReadingSummary(q)}","${getSpecSummary(q)}","${q.inspector || ''}","${q.status || ''}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quality_Checks_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Quality inspections exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              In-Line Quality Status & CCP Inspection Log
            </h1>
            <Badge variant="emerald">FIRST-PASS YIELD: 99.2%</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Log Inspection
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
          title="First-Pass Quality Yield"
          value="99.2%"
          unit="Pass Rate"
          trend={{ value: "Target: 99.0%", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Active In-Line CCPs"
          value="8 / 8"
          unit="Within Limits"
          trend={{ value: "Pasteurization & seal tests 100% pass", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Defect Scrap Rate"
          value="0.8%"
          unit="Total"
          trend={{ value: "0.2% below shift ceiling", isPositive: true, text: "" }}
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="QA Hold Queue"
          value="1 Lot"
          unit="Investigating"
          trend={{ value: "Thermal excursion quarantine", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
      </div>

      {/* Quality Checks Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "120px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Checks</option>
              <option value="PASS">Pass</option>
              <option value="HOLD">Hold</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Inspected Parameter / Product</th>
                <th>Sample Location</th>
                <th>Measured Value</th>
                <th>Spec Range</th>
                <th>Inspector</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No quality checks match your search.
                  </td>
                </tr>
              ) : (
                filteredChecks.map((q) => {
                  const status = (q.status || "").toUpperCase();
                  const isPass = status === "PASS" || status === "RELEASED";
                  const isHold = status === "HOLD";

                  return (
                    <tr key={q.id}>
                      <td>
                        <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{q.id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{getParamSummary(q)}</div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{q.productName || "In-Line Inspection"}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{getLine(q)}</span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isPass ? "#059669" : "#DC2626" }}>
                        {getReadingSummary(q)}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                        {getSpecSummary(q)}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {q.inspector || "QA Tech"}
                      </td>
                      <td>
                        <Badge variant={isPass ? "emerald" : isHold ? "amber" : "rose"}>
                          {q.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD QUALITY CHECK MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log In-Line Quality Inspection
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Quality Parameter *</label>
                  <select
                    className="form-select"
                    value={formData.parameter}
                    onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Brix Sugar Level">Brix Sugar Level (°Bx)</option>
                    <option value="Cap Seal Torque">Cap Seal Torque (in-lbs)</option>
                    <option value="pH Value">pH Acidity Level</option>
                    <option value="Fill Volume">Fill Volume Net (ml)</option>
                    <option value="Pasteurizer Hold Temp">Pasteurizer Hold Temp (°C)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Sample Location *</label>
                  <select
                    className="form-select"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Fill Head #6 Discharge">Fill Head #6 Discharge Conveyor</option>
                    <option value="Pasteurizer Sample Port">Pasteurizer Outlet Sample Port</option>
                    <option value="Capping Outfeed">Capping Outfeed Conveyor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Measured Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11.9 °Bx"
                    value={formData.readingValue}
                    onChange={(e) => setFormData({ ...formData, readingValue: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Spec Range</label>
                  <input
                    type="text"
                    value={formData.specRange}
                    onChange={(e) => setFormData({ ...formData, specRange: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Inspection Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="PASS">PASS (Within Limits)</option>
                    <option value="HOLD">HOLD (Quarantine)</option>
                    <option value="FAIL">FAIL (Out of Spec)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Inspector Name</label>
                  <input
                    type="text"
                    value={formData.inspector}
                    onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Inspection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

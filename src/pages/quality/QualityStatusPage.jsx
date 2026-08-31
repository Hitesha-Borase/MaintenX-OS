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
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useQuality } from "../../context/QualityContext";
import { useApp } from "../../context/AppContext";

export function QualityStatusPage() {
  const { qualityChecks, addQualityCheck } = useQuality();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    parameter: "Brix Sugar Level",
    line: "Line 1 - Aseptic",
    readingValue: "10.4",
    specRange: "10.2 - 10.6 °Bx",
    status: "Pass"
  });

  const filteredChecks = (qualityChecks || []).filter((c) => {
    return (
      c.parameter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.line?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (addQualityCheck) {
      addQualityCheck({
        ...formData,
        inspector: "Sarah Jenkins (QA Lead)",
        timestamp: new Date().toLocaleTimeString()
      });
    }
    addToast("In-line Quality Check logged successfully!", "success");
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              In-Line Quality Status & CCP Inspection Log
            </h1>
            <Badge variant="emerald">First-Pass Yield: 99.2%</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time Critical Control Points (CCPs), Brix refractometry, seal integrity pressure tests, and pH monitoring.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Log Quality Inspection
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
          colorVariant="emerald"
        />
      </div>

      {/* Quality Checks Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search quality check parameter, line, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Inspected Parameter</th>
                <th>Production Line</th>
                <th>Measured Value</th>
                <th>Spec Range</th>
                <th>Inspector</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((q) => (
                <tr key={q.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{q.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{q.parameter}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{q.line}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#FFFFFF" }}>
                    {q.readingValue}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                    {q.specRange}
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {q.inspector || "QA Tech"}
                  </td>
                  <td>
                    <Badge variant={q.status === "Pass" ? "emerald" : "rose"}>
                      {q.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD QUALITY CHECK MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Log In-Line Quality Inspection
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Quality Parameter *</label>
                  <select
                    className="form-select"
                    value={formData.parameter}
                    onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
                  >
                    <option value="Brix Sugar Level">Brix Sugar Level (°Bx)</option>
                    <option value="Cap Seal Torque">Cap Seal Torque (in-lbs)</option>
                    <option value="pH Level">pH Acidity Level</option>
                    <option value="Fill Volume">Fill Volume Net (ml)</option>
                    <option value="Pasteurizer Hold Temp">Pasteurizer Hold Temp (°C)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Line</label>
                  <select
                    className="form-select"
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                  >
                    <option value="Line 1 - Aseptic">Line 1 - Aseptic Bottling</option>
                    <option value="Line 2 - Pasteurizer">Line 2 - Formulation</option>
                    <option value="Line 3 - Canning">Line 3 - Canning</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Measured Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.4 °Bx"
                    value={formData.readingValue}
                    onChange={(e) => setFormData({ ...formData, readingValue: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Spec Range</label>
                  <input
                    type="text"
                    value={formData.specRange}
                    onChange={(e) => setFormData({ ...formData, specRange: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Inspection Verdict</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pass">Pass (Within Limits)</option>
                  <option value="Fail">Fail (Out of Specification)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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

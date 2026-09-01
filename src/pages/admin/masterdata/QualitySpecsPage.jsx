import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Activity,
  Percent,
  Sliders,
  FlaskConical
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function QualitySpecsPage() {
  const { addToast } = useApp();

  const [specs, setSpecs] = useState([
    { id: "QSP-01", param: "Brix Sugar Refractometry", product: "Citrus Soda", target: "10.4 °Bx", lcl: "10.2 °Bx", ucl: "10.6 °Bx", testFrequency: "Every 30 Mins", status: "Active" },
    { id: "QSP-02", param: "pH Acidity Level", product: "All Sodas", target: "3.20 pH", lcl: "3.00 pH", ucl: "3.40 pH", testFrequency: "Hourly", status: "Active" },
    { id: "QSP-03", param: "Induction Cap Seal Torque", product: "PET Bottles", target: "15.0 in-lbs", lcl: "12.0 in-lbs", ucl: "18.0 in-lbs", testFrequency: "Every 60 Mins", status: "Active" },
    { id: "QSP-04", param: "Fill Volume Net", product: "500ml Bottling", target: "500.0 ml", lcl: "495.0 ml", ucl: "505.0 ml", testFrequency: "Continuous Checkweigher", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSpec, setNewSpec] = useState({
    param: "",
    product: "All Sodas",
    target: "10.0",
    lcl: "9.8",
    ucl: "10.2",
    testFrequency: "Every 30 Mins"
  });

  const filteredSpecs = specs.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.param.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.product.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSpec.param.trim()) {
      addToast("Please provide quality parameter name.", "warning");
      return;
    }

    const created = {
      id: `QSP-0${specs.length + 1}`,
      param: newSpec.param,
      product: newSpec.product,
      target: newSpec.target,
      lcl: newSpec.lcl,
      ucl: newSpec.ucl,
      testFrequency: newSpec.testFrequency || "Hourly",
      status: "Active"
    };

    setSpecs([...specs, created]);
    addToast(`Quality spec "${created.id}" registered!`, "success");
    setIsModalOpen(false);
    setNewSpec({ param: "", product: "All Sodas", target: "10.0", lcl: "9.8", ucl: "10.2", testFrequency: "Every 30 Mins" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Quality Specifications & Limits
            </h1>
            <Badge variant="emerald">{specs.length} ACTIVE CONTROL SPECS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Quality Spec
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
          title="Active Parameters"
          value={specs.length.toString()}
          unit="SPC Tracks"
          trend={{ value: "Statistical process control", isPositive: true, text: "" }}
          icon={FlaskConical}
          colorVariant="emerald"
        />
        <StatCard
          title="First Pass Yield"
          value="99.4%"
          unit="Quality"
          trend={{ value: "< 0.6% out-of-spec batches", isPositive: true, text: "" }}
          icon={Percent}
          colorVariant="cyan"
        />
        <StatCard
          title="Cpk Capability"
          value="1.67"
          unit="Index"
          trend={{ value: "Six Sigma capable band", isPositive: true, text: "" }}
          icon={Sliders}
          colorVariant="amber"
        />
        <StatCard
          title="Automated Checks"
          value="100%"
          unit="Real-Time"
          trend={{ value: "In-line refractometer & scale", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search parameter, product, frequency..."
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
                <th>Spec Ref</th>
                <th>Quality Parameter</th>
                <th>Target SKU</th>
                <th>Nominal Target</th>
                <th>Lower Limit (LCL)</th>
                <th>Upper Limit (UCL)</th>
                <th>Testing Frequency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{s.param}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{s.product}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{s.target}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#D97706", fontWeight: 600 }}>{s.lcl}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#DC2626", fontWeight: 600 }}>{s.ucl}</td>
                  <td>
                    <Badge variant="cyan">{s.testFrequency}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened SPC control chart for ${s.param}`, "info")}
                      title="Edit Spec"
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
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD SPEC MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Quality Parameter Spec
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Quality Parameter *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CO2 Carbonation Level"
                  value={newSpec.param}
                  onChange={(e) => setNewSpec({ ...newSpec, param: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Product / SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. Sparkling Citrus Soda"
                    value={newSpec.product}
                    onChange={(e) => setNewSpec({ ...newSpec, product: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Testing Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Every 30 Mins"
                    value={newSpec.testFrequency}
                    onChange={(e) => setNewSpec({ ...newSpec, testFrequency: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px" }}>
                <div>
                  <label className="form-label">Target</label>
                  <input
                    type="text"
                    placeholder="3.8 vol"
                    value={newSpec.target}
                    onChange={(e) => setNewSpec({ ...newSpec, target: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Lower (LCL)</label>
                  <input
                    type="text"
                    placeholder="3.6 vol"
                    value={newSpec.lcl}
                    onChange={(e) => setNewSpec({ ...newSpec, lcl: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Upper (UCL)</label>
                  <input
                    type="text"
                    placeholder="4.0 vol"
                    value={newSpec.ucl}
                    onChange={(e) => setNewSpec({ ...newSpec, ucl: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Spec
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

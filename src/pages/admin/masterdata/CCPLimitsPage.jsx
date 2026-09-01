import React, { useState } from "react";
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function CCPLimitsPage() {
  const { addToast } = useApp();

  const [ccps, setCcps] = useState([
    { ccpNumber: "CCP-1", processStep: "Thermal Pasteurization Hold", hazard: "Pathogen Survival (Microbial)", criticalLimit: "≥ 72.0°C for ≥ 15.0 seconds", autoDivertAction: "Automatic Flow Divert Valve to Balance Tank", status: "Critical Mandatory" },
    { ccpNumber: "CCP-2", processStep: "Aseptic Cleanroom Positive Pressure", hazard: "Airborne Contamination", criticalLimit: "≥ 25 Pa Differential", autoDivertAction: "Line Immediate Stop & Alarm", status: "Critical Mandatory" },
    { ccpNumber: "CCP-3", processStep: "In-Line X-Ray / Metal Detection", hazard: "Physical Metal/Glass Shards", criticalLimit: "Ferrous 1.0mm / SS 1.5mm", autoDivertAction: "Automatic Pneumatic Reject Chute", status: "Critical Mandatory" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCCP, setNewCCP] = useState({
    processStep: "",
    hazard: "",
    criticalLimit: "",
    autoDivertAction: "Line Immediate Stop & Lockout"
  });

  const filteredCCPs = ccps.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.processStep.toLowerCase().includes(q) ||
      c.ccpNumber.toLowerCase().includes(q) ||
      c.hazard.toLowerCase().includes(q) ||
      c.criticalLimit.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCCP.processStep.trim() || !newCCP.criticalLimit.trim()) {
      addToast("Please provide process step and critical limit specification.", "warning");
      return;
    }

    const created = {
      ccpNumber: `CCP-${ccps.length + 1}`,
      processStep: newCCP.processStep,
      hazard: newCCP.hazard || "Cross-contamination risk",
      criticalLimit: newCCP.criticalLimit,
      autoDivertAction: newCCP.autoDivertAction || "Automated Divert",
      status: "Critical Mandatory"
    };

    setCcps([...ccps, created]);
    addToast(`Critical Control Point "${created.ccpNumber}" registered!`, "success");
    setIsModalOpen(false);
    setNewCCP({ processStep: "", hazard: "", criticalLimit: "", autoDivertAction: "Line Immediate Stop & Lockout" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              HACCP Critical Control Point (CCP) Limits
            </h1>
            <Badge variant="rose">{ccps.length} MANDATORY CCPS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add CCP Limit
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
          title="Mandatory CCPs"
          value={ccps.length.toString()}
          unit="Active Gates"
          trend={{ value: "Pasteurizer, Cleanroom & X-Ray", isPositive: true, text: "" }}
          icon={ShieldAlert}
          colorVariant="amber"
        />
        <StatCard
          title="Pasteurizer Hold"
          value="≥ 72.0°C"
          unit="15s Minimum"
          trend={{ value: "Zero thermal breach", isPositive: true, text: "" }}
          icon={Flame}
          colorVariant="emerald"
        />
        <StatCard
          title="Auto-Divert Valves"
          value="100%"
          unit="Hardware Interlock"
          trend={{ value: "Sub-second PLC reaction", isPositive: true, text: "" }}
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="FDA 21 CFR Part 117"
          value="100%"
          unit="Validated"
          trend={{ value: "Full tamper-evident audit log", isPositive: true, text: "" }}
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
              placeholder="Search process step, hazard, limit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "720px" }}>
            <thead>
              <tr>
                <th>CCP Tag</th>
                <th>Process Step</th>
                <th>Addressed Hazard</th>
                <th>Critical Limit Specification</th>
                <th>Automated Divert Action</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCCPs.map((c) => (
                <tr key={c.ccpNumber}>
                  <td>
                    <Badge variant="rose">{c.ccpNumber}</Badge>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{c.processStep}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#D97706", fontWeight: 600 }}>{c.hazard}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{c.criticalLimit}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{c.autoDivertAction}</td>
                  <td>
                    <Badge variant="emerald">{c.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened CCP limit thresholds for ${c.ccpNumber}`, "info")}
                      title="Edit CCP"
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

      {/* ADD CCP MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Critical Control Point (CCP)
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Process Step Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UV Sterilization Water Line"
                  value={newCCP.processStep}
                  onChange={(e) => setNewCCP({ ...newCCP, processStep: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Addressed Hazard *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microbiological Contamination"
                  value={newCCP.hazard}
                  onChange={(e) => setNewCCP({ ...newCCP, hazard: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Critical Limit Specification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ≥ 40 mJ/cm² UV dosage"
                  value={newCCP.criticalLimit}
                  onChange={(e) => setNewCCP({ ...newCCP, criticalLimit: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Automated Divert / Failsafe Action</label>
                <input
                  type="text"
                  placeholder="e.g. Automatic Valve Close & Audible Alarm"
                  value={newCCP.autoDivertAction}
                  onChange={(e) => setNewCCP({ ...newCCP, autoDivertAction: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save CCP
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

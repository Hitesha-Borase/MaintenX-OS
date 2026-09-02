import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function CCPLimitsPage() {
  const { qualitySpecs = [], operations = [], plants = [], activePlantId } = useMasterData();
  const { addToast } = useApp();

  const [ccps, setCcps] = useState([
    { ccpNumber: "CCP-1", processStep: "Thermal Pasteurization Hold", hazard: "Pathogen Survival (Microbial)", criticalLimit: "≥ 72.0°C for ≥ 15.0 seconds", autoDivertAction: "Automatic Flow Divert Valve to Balance Tank", status: "Critical Mandatory" },
    { ccpNumber: "CCP-2", processStep: "Aseptic Cleanroom Positive Pressure", hazard: "Airborne Contamination", criticalLimit: "≥ 25 Pa Differential", autoDivertAction: "Line Immediate Stop & Alarm", status: "Critical Mandatory" },
    { ccpNumber: "CCP-3", processStep: "In-Line X-Ray / Metal Detection", hazard: "Physical Metal/Glass Shards", criticalLimit: "Ferrous 1.0mm / SS 1.5mm", autoDivertAction: "Automatic Pneumatic Reject Chute", status: "Critical Mandatory" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCCP, setEditingCCP] = useState(null);
  const [newCCP, setNewCCP] = useState({
    processStep: "Thermal Pasteurization Hold",
    hazard: "Pathogen Survival (Microbial)",
    criticalLimit: "≥ 72.0°C for ≥ 15.0 seconds",
    autoDivertAction: "Automatic Flow Divert Valve to Balance Tank"
  });

  const filteredCCPs = useMemo(() => {
    return ccps.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        c.processStep.toLowerCase().includes(q) ||
        c.ccpNumber.toLowerCase().includes(q) ||
        c.hazard.toLowerCase().includes(q) ||
        c.criticalLimit.toLowerCase().includes(q) ||
        c.autoDivertAction.toLowerCase().includes(q)
      );
    });
  }, [ccps, searchQuery]);

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
    setNewCCP({
      processStep: "Thermal Pasteurization Hold",
      hazard: "Pathogen Survival (Microbial)",
      criticalLimit: "≥ 72.0°C for ≥ 15.0 seconds",
      autoDivertAction: "Automatic Flow Divert Valve to Balance Tank"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCCP.processStep.trim() || !editingCCP.criticalLimit.trim()) {
      addToast("Please provide process step and critical limit specification.", "warning");
      return;
    }

    setCcps(ccps.map((c) => (c.ccpNumber === editingCCP.ccpNumber ? editingCCP : c)));
    addToast(`Critical Control Point ${editingCCP.ccpNumber} updated successfully!`, "success");
    setEditingCCP(null);
  };

  const handleDelete = (ccpNumber) => {
    if (window.confirm(`Are you sure you want to delete ${ccpNumber}?`)) {
      setCcps(ccps.filter((c) => c.ccpNumber !== ccpNumber));
      addToast(`${ccpNumber} removed.`, "info");
    }
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
          title="Mandatory CCP Limits"
          value={ccps.length.toString()}
          unit="Hard Interlocks"
          icon={Flame}
          colorVariant="rose"
        />
        <StatCard
          title="Automated Diverts"
          value="100%"
          unit="PLC Interlocked"
          icon={Zap}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Quality Specs"
          value={qualitySpecs.length.toString()}
          unit="Parameters"
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Compliance"
          value="100%"
          unit="FSMA / GFSI"
          icon={CheckCircle2}
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
          <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
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
              placeholder="Search critical control point, hazard or action..."
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
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CCP Number</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Process Step</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Hazard</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Critical Limit Specification</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Automated PLC Divert Action</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCCPs.map((c) => (
                <tr key={c.ccpNumber} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#EF4444" }}>
                    {c.ccpNumber}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                    {c.processStep}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {c.hazard}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23", fontSize: "12px" }}>
                    {c.criticalLimit}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#1E293B", fontWeight: 600 }}>
                    {c.autoDivertAction}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="rose">{c.status}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setEditingCCP({ ...c })}
                        title="Edit CCP"
                        style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.ccpNumber)}
                        title="Delete CCP"
                        style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={18} color="#EF4444" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Register Critical Control Point (CCP)
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Process Step *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Pasteurization Hold Loop"
                  value={newCCP.processStep}
                  onChange={(e) => setNewCCP({ ...newCCP, processStep: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Target Biological / Physical Hazard</label>
                <input
                  type="text"
                  placeholder="e.g. Pathogen Survival (Microbial)"
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
                  placeholder="e.g. ≥ 72.0°C for ≥ 15.0 seconds"
                  value={newCCP.criticalLimit}
                  onChange={(e) => setNewCCP({ ...newCCP, criticalLimit: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Automated PLC Divert / Fail-safe Action</label>
                <input
                  type="text"
                  placeholder="e.g. Automatic Flow Divert Valve to Balance Tank"
                  value={newCCP.autoDivertAction}
                  onChange={(e) => setNewCCP({ ...newCCP, autoDivertAction: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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

      {/* EDIT CCP MODAL */}
      {editingCCP && (
        <div className="modal-backdrop" onClick={() => setEditingCCP(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#EF4444" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit {editingCCP.ccpNumber}
                </h2>
              </div>
              <button onClick={() => setEditingCCP(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Process Step *</label>
                <input
                  type="text"
                  required
                  value={editingCCP.processStep}
                  onChange={(e) => setEditingCCP({ ...editingCCP, processStep: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Target Hazard</label>
                <input
                  type="text"
                  value={editingCCP.hazard}
                  onChange={(e) => setEditingCCP({ ...editingCCP, hazard: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Critical Limit Specification *</label>
                <input
                  type="text"
                  required
                  value={editingCCP.criticalLimit}
                  onChange={(e) => setEditingCCP({ ...editingCCP, criticalLimit: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Automated PLC Divert Action</label>
                <input
                  type="text"
                  value={editingCCP.autoDivertAction}
                  onChange={(e) => setEditingCCP({ ...editingCCP, autoDivertAction: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingCCP(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update CCP
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

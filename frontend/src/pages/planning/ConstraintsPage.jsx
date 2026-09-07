import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  ShieldCheck,
  Download,
  X,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function ConstraintsPage() {
  const { addToast } = useApp();

  const [constraints, setConstraints] = useState([
    { id: "CST-01", type: "Sanitation / CIP", title: "Thermal CIP Flush Window on Pasteurizer", line: "Line 2", impact: "45 mins lockout", status: "Active", risk: "High" },
    { id: "CST-02", type: "Allergen Matrix", title: "Citrus-to-Berry Flavor Allergen Rinse Sequence", line: "Line 1", impact: "Mandatory 30m rinse", status: "Active", risk: "Medium" },
    { id: "CST-03", type: "Material Inbound", title: "Aluminum Can Lids Batch Delivery Expected 14:00", line: "Line 3", impact: "Buffer 2.5 hours remaining", status: "Monitored", risk: "Low" },
    { id: "CST-04", type: "Tooling / Mold", title: "Bottle Neck Finish 28mm to 38mm Tooling Change", line: "Line 1", impact: "Scheduled at Shift change", status: "Queued", risk: "Low" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConstraint, setNewConstraint] = useState({
    type: "Sanitation / CIP",
    title: "",
    line: "Line 1",
    impact: "",
    risk: "Medium"
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newConstraint.title) {
      addToast("Please provide constraint description", "warning");
      return;
    }

    const cst = {
      id: `CST-0${constraints.length + 1}`,
      ...newConstraint,
      status: "Active"
    };
    setConstraints([...constraints, cst]);
    addToast(`Constraint ${cst.id} registered in finite scheduler!`, "success");
    setIsModalOpen(false);
    setNewConstraint({ type: "Sanitation / CIP", title: "", line: "Line 1", impact: "", risk: "Medium" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Operational Constraints & Scheduling Locks
            </h1>
            <Badge variant="amber">{constraints.length} Active Rules</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Hard and soft finite planning constraints: CIP wash cycles, allergen matrix sequencing, raw material arrival gates, and mold changes.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Add Planning Constraint
          </Button>
        </div>
      </div>

      {/* Constraints Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Active Planning Constraints Matrix
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Constraint ID</th>
                <th>Category</th>
                <th>Rule Description</th>
                <th>Affected Line</th>
                <th>Schedule Impact</th>
                <th>Risk Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {constraints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{c.id}</span>
                  </td>
                  <td>
                    <Badge variant="cyan">{c.type}</Badge>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.line}</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 600 }}>
                    {c.impact}
                  </td>
                  <td>
                    <Badge variant={c.risk === "High" ? "rose" : c.risk === "Medium" ? "amber" : "emerald"}>
                      {c.risk}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant="emerald" dot>
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD CONSTRAINT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Planning Constraint Lock
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Constraint Category</label>
                <select
                  className="form-select"
                  value={newConstraint.type}
                  onChange={(e) => setNewConstraint({ ...newConstraint, type: e.target.value })}
                >
                  <option value="Sanitation / CIP">Sanitation / CIP Wash</option>
                  <option value="Allergen Matrix">Allergen Cleaning Sequence</option>
                  <option value="Material Inbound">Material Inbound Arrival</option>
                  <option value="Tooling / Mold">Tooling / Mold Change</option>
                  <option value="Maintenance Lockout">Maintenance Window</option>
                </select>
              </div>

              <div>
                <label className="form-label">Rule Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hold Tank 04 requires chemical wash before batch 45"
                  value={newConstraint.title}
                  onChange={(e) => setNewConstraint({ ...newConstraint, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Affected Line</label>
                  <select
                    className="form-select"
                    value={newConstraint.line}
                    onChange={(e) => setNewConstraint({ ...newConstraint, line: e.target.value })}
                  >
                    <option value="Line 1">Line 1 (Aseptic)</option>
                    <option value="Line 2">Line 2 (Pasteurizer)</option>
                    <option value="Line 3">Line 3 (Canning)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Risk Level</label>
                  <select
                    className="form-select"
                    value={newConstraint.risk}
                    onChange={(e) => setNewConstraint({ ...newConstraint, risk: e.target.value })}
                  >
                    <option value="High">High (Hard Stop)</option>
                    <option value="Medium">Medium (Sequence Rule)</option>
                    <option value="Low">Low (Buffer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Estimated Schedule Impact</label>
                <input
                  type="text"
                  placeholder="e.g. 45 mins downtime / speed reduction to 80%"
                  value={newConstraint.impact}
                  onChange={(e) => setNewConstraint({ ...newConstraint, impact: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Constraint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

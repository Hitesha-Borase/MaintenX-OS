import React, { useState } from "react";
import { Clock, Plus, Save, AlertTriangle, CheckCircle2, FileSpreadsheet, Edit2, X, Send, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function HBManagement() {
  const { addToast } = useApp();

  const [hbLogs, setHbLogs] = useState([
    { hour: "06:00 - 07:00", target: 3000, actual: 3100, variance: 100, lossDriver: "None", status: "PASSED", notes: "Smooth run, zero downtime." },
    { hour: "07:00 - 08:00", target: 3000, actual: 2850, variance: -150, lossDriver: "Micro-Stop / Jam", status: "FAILED", notes: "Bottling star-wheel jam cleared in 4 mins." },
    { hour: "08:00 - 09:00", target: 3000, actual: 3050, variance: 50, lossDriver: "None", status: "PASSED", notes: "Speed adjusted to optimal pace." },
    { hour: "09:00 - 10:00", target: 3000, actual: 1200, variance: -1800, lossDriver: "Mechanical Failure", status: "FAILED", notes: "Capper motor overheating breakdown." },
    { hour: "10:00 - 11:00", target: 3000, actual: 2900, variance: -100, lossDriver: "Changeover", status: "FAILED", notes: "Labeler roll replacement." }
  ]);

  // State for Add New Hour Form
  const [selectedHour, setSelectedHour] = useState("11:00 - 12:00");
  const [target, setTarget] = useState(3000);
  const [actual, setActual] = useState(2950);
  const [lossDriver, setLossDriver] = useState("None");

  // State for Edit Modal Form
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    hour: "",
    target: 3000,
    actual: 0,
    lossDriver: "None",
    notes: ""
  });

  const handleOpenEditModal = (log, index) => {
    setEditingIndex(index);
    setEditForm({
      hour: log.hour,
      target: log.target,
      actual: log.actual,
      lossDriver: log.lossDriver,
      notes: log.notes || ""
    });
    setIsEditModalOpen(true);
  };

  const handleSaveNewRecord = (e) => {
    e.preventDefault();
    const variance = Number(actual) - Number(target);
    const newLog = {
      hour: selectedHour,
      target: Number(target),
      actual: Number(actual),
      variance,
      lossDriver: variance < 0 ? lossDriver : "None",
      status: variance >= 0 ? "PASSED" : "FAILED",
      notes: ""
    };

    setHbLogs(prev => [...prev, newLog]);
    addToast(`Hour log for ${selectedHour} recorded successfully.`, "success");
    setSelectedHour("12:00 - 13:00");
  };

  const handleUpdateRecordSubmit = (e) => {
    e.preventDefault();
    if (editingIndex === null) return;

    const variance = Number(editForm.actual) - Number(editForm.target);
    const updatedLog = {
      hour: editForm.hour,
      target: Number(editForm.target),
      actual: Number(editForm.actual),
      variance,
      lossDriver: variance < 0 ? editForm.lossDriver : "None",
      status: variance >= 0 ? "PASSED" : "FAILED",
      notes: editForm.notes
    };

    setHbLogs(prev => {
      const updated = [...prev];
      updated[editingIndex] = updatedLog;
      return updated;
    });

    addToast(`Hour record ${editForm.hour} updated successfully.`, "success");
    setIsEditModalOpen(false);
    setEditingIndex(null);
  };

  const editVariance = Number(editForm.actual) - Number(editForm.target);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Hour-by-Hour (H/B) Management
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Log hourly production actuals, categorize loss drivers, and submit shift reconciliation
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="warning"
            icon={RefreshCw}
            onClick={() => {
              setTarget(3150);
              addToast("Catch-up schedule calculated: Target re-baselined to 3,150 bottles/hr.", "info");
            }}
          >
            Recalculate Catch-Up
          </Button>

          <Button
            variant="success"
            icon={Send}
            onClick={() => addToast("All shift H/B hour records reconciled and submitted to Supervisor queue.", "success")}
          >
            Bulk Reconcile Shift Hours
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* 1. Record New Hour Form */}
        <form onSubmit={handleSaveNewRecord}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Record Hour Logs
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Hour Interval
                </label>
                <input
                  type="text"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Target Count
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Actual Produced
                </label>
                <input
                  type="number"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {actual < target && (
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 800, color: "#D97706", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Select Loss Driver
                  </label>
                  <select
                    value={lossDriver}
                    onChange={(e) => setLossDriver(e.target.value)}
                    className="input-field"
                  >
                    <option value="Mechanical Failure">Mechanical Failure</option>
                    <option value="Allergen Clean / Sanitation">Allergen Clean / Sanitation</option>
                    <option value="Tool Changeover">Tool Changeover</option>
                    <option value="Raw Material Shortage">Raw Material Shortage</option>
                    <option value="Micro-Stop / Jam">Micro-Stop / Jam</option>
                    <option value="Speed Loss">Speed Loss</option>
                  </select>
                </div>
              )}

              <div>
                <Button type="submit" variant="primary" icon={Save} style={{ width: "100%", height: "40px" }}>
                  Save Hour Record
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* 2. H/B Table */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Shift Hour-by-Hour Sheet
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "10px 8px" }}>Hour Interval</th>
                  <th style={{ padding: "10px 8px" }}>Target</th>
                  <th style={{ padding: "10px 8px" }}>Actual</th>
                  <th style={{ padding: "10px 8px" }}>Variance</th>
                  <th style={{ padding: "10px 8px" }}>Loss Driver</th>
                  <th style={{ padding: "10px 8px" }}>Cost Impact ($)</th>
                  <th style={{ padding: "10px 8px" }}>Status</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hbLogs.map((log, idx) => {
                  const costImpact = log.variance < 0 ? Math.abs(log.variance) * 0.85 : 0;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--text-primary)" }}>{log.hour}</td>
                      <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)" }}>{log.target.toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)" }}>{log.actual.toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 800, fontFamily: "var(--font-mono)", color: log.variance >= 0 ? "#059669" : "#DC2626" }}>
                        {log.variance >= 0 ? `+${log.variance}` : log.variance}
                      </td>
                      <td style={{ padding: "10px 8px", color: log.lossDriver !== "None" ? "#D97706" : "var(--text-secondary)", fontWeight: 600 }}>
                        {log.lossDriver}
                      </td>
                      <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", fontWeight: 700, color: costImpact > 0 ? "#DC2626" : "var(--text-muted)" }}>
                        {costImpact > 0 ? `-$${costImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <Badge variant={log.status === "PASSED" ? "emerald" : "danger"}>
                          {log.status}
                        </Badge>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Edit2}
                          onClick={() => handleOpenEditModal(log, idx)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Hour Record Form Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Hour Record: ${editForm.hour}`}
        subtitle="Modify target count, actual production, or loss driver classification."
        maxWidth="580px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Save} onClick={handleUpdateRecordSubmit}>
              Update Hour Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateRecordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Hour Interval
            </label>
            <input
              type="text"
              value={editForm.hour}
              onChange={(e) => setEditForm({ ...editForm, hour: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Target Count
              </label>
              <input
                type="number"
                value={editForm.target}
                onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Actual Produced
              </label>
              <input
                type="number"
                value={editForm.actual}
                onChange={(e) => setEditForm({ ...editForm, actual: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Computed Variance Live Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
              Calculated Variance & Status:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "14px", color: editVariance >= 0 ? "#059669" : "#DC2626" }}>
                {editVariance >= 0 ? `+${editVariance}` : editVariance}
              </span>
              <Badge variant={editVariance >= 0 ? "emerald" : "danger"}>
                {editVariance >= 0 ? "PASSED" : "FAILED"}
              </Badge>
            </div>
          </div>

          {/* Loss Driver selection when actual < target */}
          {editForm.actual < editForm.target && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#D97706", marginBottom: "6px" }}>
                Loss Driver Categorization
              </label>
              <select
                value={editForm.lossDriver}
                onChange={(e) => setEditForm({ ...editForm, lossDriver: e.target.value })}
                className="input-field"
              >
                <option value="Micro-Stop / Jam">Micro-Stop / Jam</option>
                <option value="Mechanical Failure">Mechanical Failure</option>
                <option value="Changeover">Changeover</option>
                <option value="Allergen Clean / Sanitation">Allergen Clean / Sanitation</option>
                <option value="Raw Material Shortage">Raw Material Shortage</option>
                <option value="Speed Loss">Speed Loss</option>
                <option value="None">None</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Operator / Shift Notes & Reason
            </label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
              placeholder="Enter reason for variance, corrective actions taken, or maintenance log..."
              className="input-field"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

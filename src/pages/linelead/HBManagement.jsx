import React, { useState } from "react";
import { Clock, Plus, Save, AlertTriangle, CheckCircle2, FileSpreadsheet, Edit2 } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function HBManagement() {
  const { addToast } = useApp();

  const [hbLogs, setHbLogs] = useState([
    { hour: "06:00 - 07:00", target: 3000, actual: 3100, variance: 100, lossDriver: "None", status: "PASSED" },
    { hour: "07:00 - 08:00", target: 3000, actual: 2850, variance: -150, lossDriver: "Micro-Stop / Jam", status: "FAILED" },
    { hour: "08:00 - 09:00", target: 3000, actual: 3050, variance: 50, lossDriver: "None", status: "PASSED" },
    { hour: "09:00 - 10:00", target: 3000, actual: 1200, variance: -1800, lossDriver: "Mechanical Failure", status: "FAILED" },
    { hour: "10:00 - 11:00", target: 3000, actual: 2900, variance: -100, lossDriver: "Changeover", status: "FAILED" }
  ]);

  const [selectedHour, setSelectedHour] = useState("11:00 - 12:00");
  const [target, setTarget] = useState(3000);
  const [actual, setActual] = useState(2950);
  const [lossDriver, setLossDriver] = useState("None");
  const [comments, setComments] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleEdit = (log, index) => {
    setSelectedHour(log.hour);
    setTarget(log.target);
    setActual(log.actual);
    setLossDriver(log.lossDriver !== "None" ? log.lossDriver : "None");
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const variance = actual - target;
    const newLog = {
      hour: selectedHour,
      target: Number(target),
      actual: Number(actual),
      variance,
      lossDriver: variance < 0 ? lossDriver : "None",
      status: variance >= 0 ? "PASSED" : "FAILED"
    };

    if (editingIndex !== null) {
      setHbLogs(prev => {
        const updated = [...prev];
        updated[editingIndex] = newLog;
        return updated;
      });
      addToast(`Hour ${selectedHour} updated successfully.`, "success");
      setEditingIndex(null);
    } else {
      setHbLogs(prev => [...prev, newLog]);
      addToast(`Hour ${selectedHour} recorded successfully.`, "success");
    }
    setComments("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Hour-by-Hour (H/B) Management
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* 1. Record Hour Form (Placed on Top) */}
        <form onSubmit={handleSave}>
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
                  {editingIndex !== null ? "Update Hour Record" : "Save Hour Record"}
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* 2. H/B Table (Placed Below) */}
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
                  <th style={{ padding: "10px 8px" }}>Status</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hbLogs.map((log, idx) => (
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
                    <td style={{ padding: "10px 8px" }}>
                      <Badge variant={log.status === "PASSED" ? "emerald" : "danger"}>
                        {log.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right" }}>
                      <Button variant="secondary" size="xs" icon={Edit2} onClick={() => handleEdit(log, idx)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

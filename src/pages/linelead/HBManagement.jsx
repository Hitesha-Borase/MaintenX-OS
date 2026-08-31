import React, { useState } from "react";
import { Clock, Plus, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
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

    setHbLogs(prev => [...prev, newLog]);
    addToast(`Hour ${selectedHour} recorded successfully.`, "success");
    setComments("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Hour-by-Hour (H/B) Management
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log and reconcile hourly line output and explain variances
        </p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* H/B Table */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Shift Hour-by-Hour Sheet
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "8px" }}>Hour Interval</th>
                  <th style={{ padding: "8px" }}>Target</th>
                  <th style={{ padding: "8px" }}>Actual</th>
                  <th style={{ padding: "8px" }}>Variance</th>
                  <th style={{ padding: "8px" }}>Loss Driver</th>
                  <th style={{ padding: "8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {hbLogs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "8px", fontWeight: 600 }}>{log.hour}</td>
                    <td style={{ padding: "8px" }}>{log.target.toLocaleString()}</td>
                    <td style={{ padding: "8px" }}>{log.actual.toLocaleString()}</td>
                    <td style={{ padding: "8px", fontWeight: 700, color: log.variance >= 0 ? "#10B981" : "#EF4444" }}>
                      {log.variance >= 0 ? `+${log.variance}` : log.variance}
                    </td>
                    <td style={{ padding: "8px", color: log.lossDriver !== "None" ? "#F59E0B" : "var(--text-secondary)" }}>
                      {log.lossDriver}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Badge variant={log.status === "PASSED" ? "emerald" : "danger"}>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Record Hour Form */}
        <form onSubmit={handleSave}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Record Hour Logs
            </h3>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Hour Interval
              </label>
              <input
                type="text"
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Target Count
              </label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Actual Produced
              </label>
              <input
                type="number"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            {actual < target && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#F59E0B", display: "block", marginBottom: "4px" }}>
                  Select Loss Driver
                </label>
                <select
                  value={lossDriver}
                  onChange={(e) => setLossDriver(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
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

            <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "6px" }}>
              Save Hour Record
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { CheckSquare, ShieldCheck, AlertTriangle, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function QualityChecks() {
  const { addToast } = useApp();

  const [brix, setBrix] = useState("11.8");
  const [ph, setPh] = useState("3.72");
  const [torque, setTorque] = useState("15");
  const [sealPassed, setSealPassed] = useState(true);

  const [checkHistory, setCheckHistory] = useState([
    { time: "14:00", brix: "11.7 °Bx", ph: "3.71 pH", torque: "14 in-lbs", seal: "PASS" },
    { time: "13:30", brix: "11.8 °Bx", ph: "3.75 pH", torque: "15 in-lbs", seal: "PASS" },
    { time: "13:00", brix: "11.9 °Bx", ph: "3.72 pH", torque: "16 in-lbs", seal: "PASS" }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const isBrixValid = parseFloat(brix) >= 11.5 && parseFloat(brix) <= 12.1;
    const isPhValid = parseFloat(ph) >= 3.6 && parseFloat(ph) <= 3.8;
    const isTorqueValid = parseFloat(torque) >= 12 && parseFloat(torque) <= 18;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newCheck = {
      time: timeString,
      brix: `${brix} °Bx`,
      ph: `${ph} pH`,
      torque: `${torque} in-lbs`,
      seal: sealPassed && isBrixValid && isPhValid && isTorqueValid ? "PASS" : "FAIL"
    };

    setCheckHistory(prev => [newCheck, ...prev]);

    if (!isBrixValid || !isPhValid || !isTorqueValid || !sealPassed) {
      addToast("Quality check failed limits! CCP Deviation Incident logged.", "danger");
    } else {
      addToast("Hourly quality parameter checklist logged successfully.", "success");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Hourly Operator Quality Checks
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Record Critical Control Point (CCP) and package specifications
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} color="#10B981" /> Parameter Checklist
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            {/* Brix Check */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>Brix Concentration</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: 11.5 - 12.1</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={brix}
                onChange={(e) => setBrix(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            {/* pH Check */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>pH Acidity</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: 3.60 - 3.80</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            {/* Cap Torque */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>Cap Torque (in-lbs)</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: 12 - 18</span>
              </div>
              <input
                type="number"
                value={torque}
                onChange={(e) => setTorque(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            {/* Visual Check */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                Visual Induction Seal Inspection
              </label>
              <div style={{ display: "flex", gap: "10px", height: "38px" }}>
                <button
                  type="button"
                  onClick={() => setSealPassed(true)}
                  style={{
                    flex: 1,
                    borderRadius: "6px",
                    border: sealPassed ? "1px solid #10B981" : "1px solid var(--border-subtle)",
                    backgroundColor: sealPassed ? "rgba(16, 185, 129, 0.15)" : "transparent",
                    color: sealPassed ? "#34D399" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "12px"
                  }}
                >
                  PASS
                </button>
                <button
                  type="button"
                  onClick={() => setSealPassed(false)}
                  style={{
                    flex: 1,
                    borderRadius: "6px",
                    border: !sealPassed ? "1px solid #EF4444" : "1px solid var(--border-subtle)",
                    backgroundColor: !sealPassed ? "rgba(239, 68, 68, 0.15)" : "transparent",
                    color: !sealPassed ? "#F87171" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "12px"
                  }}
                >
                  FAIL
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={Send}>
          Submit Quality Logs
        </Button>
      </form>

      {/* History Log */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
          Shift Log History
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {checkHistory.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                alignItems: "center"
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>{item.time}</span>
              <span style={{ fontWeight: 600 }}>{item.brix}</span>
              <span style={{ fontWeight: 600 }}>{item.ph}</span>
              <span style={{ fontWeight: 600 }}>{item.torque}</span>
              <Badge variant={item.seal === "PASS" ? "emerald" : "danger"}>
                {item.seal}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

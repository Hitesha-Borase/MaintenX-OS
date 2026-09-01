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
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "24px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Hourly Parameter Checklist
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Audited against USDA / FDA Bottling Quality Parameters
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {/* Brix Check */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Brix Sugar (°Bx)</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>11.5 - 12.1</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={brix}
                onChange={(e) => setBrix(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* pH Check */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>pH Acidity</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>3.60 - 3.80</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Cap Torque */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Torque (in-lbs)</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>12 - 18</span>
              </div>
              <input
                type="number"
                value={torque}
                onChange={(e) => setTorque(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Visual Check */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Induction Seal Inspection
              </label>
              <div style={{ display: "flex", gap: "8px", height: "42px" }}>
                <button
                  type="button"
                  onClick={() => setSealPassed(true)}
                  style={{
                    flex: 1,
                    borderRadius: "8px",
                    border: sealPassed ? "2px solid #10B981" : "1px solid var(--border-subtle)",
                    backgroundColor: sealPassed ? "rgba(16, 185, 129, 0.15)" : "#FFFFFF",
                    color: sealPassed ? "#059669" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: "12px",
                    transition: "all 0.15s ease"
                  }}
                >
                  PASS
                </button>
                <button
                  type="button"
                  onClick={() => setSealPassed(false)}
                  style={{
                    flex: 1,
                    borderRadius: "8px",
                    border: !sealPassed ? "2px solid #EF4444" : "1px solid var(--border-subtle)",
                    backgroundColor: !sealPassed ? "rgba(239, 68, 68, 0.15)" : "#FFFFFF",
                    color: !sealPassed ? "#DC2626" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: "12px",
                    transition: "all 0.15s ease"
                  }}
                >
                  FAIL
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={Send} style={{ width: "fit-content", padding: "10px 28px", alignSelf: "center" }}>
          Submit Quality Checklist
        </Button>
      </form>

      {/* History Log - Single Row Strips matching reference image */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px", margin: "0 0 12px 0" }}>
          Shift Quality Log History
        </h3>
        
        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "340px" }}>
            {checkHistory.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 1fr 1fr auto",
                  fontSize: "12px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{item.time}</span>
                <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{item.brix}</span>
                <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{item.ph}</span>
                <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{item.torque}</span>
                <Badge variant={item.seal === "PASS" ? "emerald" : "danger"}>
                  {item.seal}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

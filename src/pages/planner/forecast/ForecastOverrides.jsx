import React, { useState } from "react";
import { Edit2, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ForecastOverrides() {
  const { addToast } = useApp();

  const [overrides, setOverrides] = useState([
    { period: "September 2026", baseline: 162000, adjusted: 175000, reason: "Whole Foods bulk request" }
  ]);

  const [period, setPeriod] = useState("October 2026");
  const [baseline, setBaseline] = useState(174000);
  const [adjusted, setAdjusted] = useState(185000);
  const [reason, setReason] = useState("");

  const handleSave = (e) => {
    e.preventDefault();

    const newOverride = {
      period,
      baseline: Number(baseline),
      adjusted: Number(adjusted),
      reason
    };

    setOverrides(prev => [...prev, newOverride]);
    addToast("Forecast override applied successfully.", "success");
    setReason("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Forecast Demand Overrides
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Manually override forecast demand values with local buyer intel
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Active Overrides */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Adjusted Demand Values
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {overrides.map((ov, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px"
                }}
              >
                <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>{ov.period}</div>
                <div style={{ color: "var(--text-secondary)" }}>
                  Baseline: {ov.baseline.toLocaleString()} ➔ Adjusted: <strong style={{ color: "#38BDF8" }}>{ov.adjusted.toLocaleString()}</strong>
                </div>
                <div style={{ color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>"{ov.reason}"</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Override Form */}
        <form onSubmit={handleSave}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Apply Demand Override
            </h3>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Planning Period
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Baseline Forecast
              </label>
              <input
                type="number"
                value={baseline}
                onChange={(e) => setBaseline(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Manual Target (Adjusted Cases)
              </label>
              <input
                type="number"
                value={adjusted}
                onChange={(e) => setAdjusted(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Adjustment Reason / Note
              </label>
              <input
                type="text"
                placeholder="Market promo or customer alert..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "6px" }}>
              Apply Override
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

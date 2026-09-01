import React, { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function CycleCounts() {
  const { addToast } = useApp();

  const [part, setPart] = useState("Orange Cap SKU-CAP-ORG-01");
  const [sysCount, setSysCount] = useState(2500);
  const [actCount, setActCount] = useState(2500);

  const handleCycleCount = (e) => {
    e.preventDefault();

    addToast(`Cycle count for ${part} logged. Variance: ${actCount - sysCount}.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Inventory Cycle Counting
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Perform weekly stock audit checks to reconcile system records
        </p>
      </div>

      <form onSubmit={handleCycleCount}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Perform Cycle Count
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Target Material
              </label>
              <input
                type="text"
                value={part}
                onChange={(e) => setPart(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                System Stock Count
              </label>
              <input
                type="number"
                value={sysCount}
                onChange={(e) => setSysCount(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Physical Actual Count
              </label>
              <input
                type="number"
                value={actCount}
                onChange={(e) => setActCount(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "6px" }}>
            Confirm Cycle Count
          </Button>
        </Card>
      </form>
    </div>
  );
}

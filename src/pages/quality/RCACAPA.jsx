import React, { useState } from "react";
import { SearchCode, Save } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";

export function RCACAPA() {
  const { addToast } = useApp();

  const [rootCause, setRootCause] = useState("");
  const [corrective, setCorrective] = useState("");
  const [preventive, setPreventive] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    addToast("RCA/CAPA record saved and linked to investigation INV-802.", "success");
    setRootCause("");
    setCorrective("");
    setPreventive("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Root Cause Analysis & CAPA
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Document root cause investigations and corrective/preventive actions for process deviations
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            RCA / CAPA — INV-802 (BAT-2026-0890 Pasteurizer Excursion)
          </h3>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Root Cause (Why did the deviation occur?)
            </label>
            <textarea
              placeholder="E.g. Temperature sensor recalibration drift..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "80px" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Corrective Action (What was done immediately?)
            </label>
            <textarea
              placeholder="E.g. Replaced defective temperature probe..."
              value={corrective}
              onChange={(e) => setCorrective(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "80px" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Preventive Action (What system change prevents recurrence?)
            </label>
            <textarea
              placeholder="E.g. Implement monthly sensor calibration schedule..."
              value={preventive}
              onChange={(e) => setPreventive(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "80px" }}
              required
            />
          </div>

          <Button type="submit" variant="primary" icon={Save}>
            Save RCA / CAPA Record
          </Button>
        </Card>
      </form>
    </div>
  );
}

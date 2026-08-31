import React, { useState } from "react";
import { AlertTriangle, Clock, Play, HelpCircle, Save } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function DowntimeLoss() {
  const { assets, breakdowns, setBreakdowns, updateAssetStatus } = useCMMS();
  const { addToast } = useApp();

  const [assetId, setAssetId] = useState("FM-001");
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState("Mechanical Failure");
  const [symptom, setSymptom] = useState("");

  const activeBreakdowns = breakdowns.filter((b) => !b.endTime);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedAsset = assets.find((a) => a.id === assetId) || assets[0];

    const newBD = {
      id: `BD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      assetId,
      assetName: selectedAsset.name,
      plant: selectedAsset.plant || "Plant 1",
      department: selectedAsset.department || "Bottling",
      line: selectedAsset.line || "Line 1",
      startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      endTime: null,
      durationMinutes: Number(duration),
      failureCategory: category,
      symptom: symptom || "Operator reported downtime via terminal console",
      status: "Investigating",
      impact: {
        productionLossUnits: 0,
        downtimeCostUSD: 0
      }
    };

    // Update global context breakdowns
    setBreakdowns((prev) => [newBD, ...prev]);

    // Update asset status to Out of Service
    updateAssetStatus(assetId, "Out of Service", -10);

    addToast(`Successfully reported downtime for ${selectedAsset.name}. Asset marked as Out of Service.`, "warning");
    setSymptom("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Downtime & Loss Logger
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Report asset stops, mechanical faults, and line bottlenecks
        </p>
      </div>

      {activeBreakdowns.length > 0 && (
        <Card style={{ borderLeft: "4px solid #EF4444", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#F87171", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={15} /> Active Line Downtime Events ({activeBreakdowns.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            {activeBreakdowns.map((b) => (
              <div key={b.id} style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{b.assetName} ({b.assetId})</span>
                <span style={{ color: "#F87171" }}>{b.failureCategory} • {b.startTime}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Select Asset */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Select Faulty Asset / Station
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id}) - Health {a.health}%
                </option>
              ))}
            </select>
          </div>

          {/* Downtime Category */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Failure Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option value="Mechanical Failure">Mechanical Failure</option>
              <option value="Electrical Failure">Electrical Failure</option>
              <option value="Cleaning/Sanitation">Cleaning / Sanitation</option>
              <option value="Tool Changeover">Tool Changeover</option>
              <option value="Raw Material Shortage">Raw Material Shortage</option>
              <option value="Quality Deviation Hold">Quality Deviation Hold</option>
              <option value="Micro-Stop / Jam">Micro-Stop / Bottle Jam</option>
            </select>
          </div>

          {/* Estimated Duration */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Estimated Duration (Minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
              className="input-field"
              style={{ width: "100%" }}
              required
            />
          </div>

          {/* Symptom / Description */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Downtime Details & Fault Symptom
            </label>
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "80px" }}
              placeholder="E.g. Scrap belt jamming under nozzles, eject cylinders stuck open..."
              required
            />
          </div>
        </Card>

        <Button type="submit" variant="danger" icon={Save}>
          Log Downtime Event
        </Button>
      </form>
    </div>
  );
}

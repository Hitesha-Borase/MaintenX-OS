import React, { useState } from "react";
import { AlertTriangle, Clock, Wrench, FileText, Send, AlertOctagon, Plus } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function DowntimeLoss() {
  const { assets, breakdowns, setBreakdowns, updateAssetStatus } = useCMMS();
  const { addToast } = useApp();

  const [assetId, setAssetId] = useState("FM-001");
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState("Mechanical Failure");
  const [symptom, setSymptom] = useState("");

  const [isMicroModalOpen, setIsMicroModalOpen] = useState(false);
  const [microMins, setMicroMins] = useState(2);
  const [microReason, setMicroReason] = useState("Bottle Conveyor Jam at Star-Wheel");

  const activeBreakdowns = breakdowns.filter((b) => !b.endTime);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedAsset = (assets && assets.find((a) => a.id === assetId)) || (assets && assets[0]) || { name: "Machinery Station", plant: "Plant 1", department: "Bottling", line: "Line 1" };

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

    if (setBreakdowns) {
      setBreakdowns((prev) => [newBD, ...(prev || [])]);
    }

    if (updateAssetStatus) {
      updateAssetStatus(assetId, "Out of Service", -10);
    }

    addToast(`Successfully reported downtime for ${selectedAsset.name}. Asset marked as Out of Service.`, "warning");
    setSymptom("");
  };

  const handleMicroStopSubmit = (e) => {
    e.preventDefault();
    addToast(`Micro-stop (${microMins} mins) logged: "${microReason}". Added to shift loss logs.`, "warning");
    setIsMicroModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Downtime & Loss Logger
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Record unscheduled machine breakdowns, micro-stop jams, and dispatch corrective maintenance
          </p>
        </div>

        <Button variant="warning" icon={Plus} onClick={() => setIsMicroModalOpen(true)}>
          Log Micro-Stop (&lt;5 Min)
        </Button>
      </div>

      {/* Active Downtime Alarms Banner */}
      {activeBreakdowns.length > 0 && (
        <Card style={{ borderLeft: "4px solid #EF4444", backgroundColor: "#FFF8F8", border: "1px solid #FED7D7", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#DC2626", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={16} /> Active Line Downtime Events ({activeBreakdowns.length})
            </h3>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#DC2626", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "2px 8px", borderRadius: "12px" }}>
              Action Required
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {activeBreakdowns.map((b) => (
              <div
                key={b.id}
                style={{
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  backgroundColor: "#FFFFFF",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #FEE2E2"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-primary)", fontWeight: 700, display: "block" }}>
                    {b.assetName} <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>({b.assetId})</span>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="danger">{b.failureCategory}</Badge>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>{b.startTime}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Log Downtime Event Card Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "24px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Wrench size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Record Unplanned Stop or Defect
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Specify affected machine station and estimated stop impact
              </span>
            </div>
          </div>

          {/* Grid for selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {/* Select Asset */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Faulty Machine / Station
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="input-field"
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
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Failure Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
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

            {/* Estimated Duration with Quick Pills */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Estimated Stop Duration (Min)
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                  className="input-field"
                  style={{ width: "90px", flexShrink: 0, textAlign: "center", fontWeight: 800, fontFamily: "var(--font-mono)" }}
                  required
                />
                <div style={{ display: "flex", gap: "4px", flex: 1 }}>
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        backgroundColor: duration === mins ? "rgba(200, 149, 71, 0.18)" : "var(--bg-card-subtle)",
                        border: duration === mins ? "1px solid #C89547" : "1px solid var(--border-subtle)",
                        color: duration === mins ? "#8C5B23" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Symptom / Description */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Observed Symptom & Root Anomaly
            </label>
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="input-field"
              style={{ minHeight: "80px" }}
              placeholder="Describe what occurred (e.g. Scrap belt jammed under filler discharge nozzles, pneumatic valve stuck)..."
              required
            />
          </div>
        </Card>

        <Button type="submit" variant="danger" icon={AlertOctagon} style={{ width: "fit-content", padding: "10px 28px", alignSelf: "center" }}>
          Log Downtime Event
        </Button>
      </form>

      {/* Log Micro-Stop Modal */}
      <Modal
        isOpen={isMicroModalOpen}
        onClose={() => setIsMicroModalOpen(false)}
        title="Log Micro-Stop Reason (< 5 Min)"
        subtitle="Quick Entry for Minor Jams & Bottle Stoppages"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsMicroModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="warning" icon={Send} onClick={handleMicroStopSubmit}>
              Save Micro-Stop Log
            </Button>
          </>
        }
      >
        <form onSubmit={handleMicroStopSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Stoppage Duration (Minutes)
            </label>
            <input
              type="number"
              value={microMins}
              onChange={(e) => setMicroMins(Number(e.target.value))}
              className="input-field"
              min={1}
              max={5}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Micro-Stop Reason Code
            </label>
            <select
              value={microReason}
              onChange={(e) => setMicroReason(e.target.value)}
              className="input-field"
            >
              <option value="Bottle Conveyor Jam at Star-Wheel">Bottle Conveyor Jam at Star-Wheel</option>
              <option value="Filler Nozzle Drip Sensor Fault">Filler Nozzle Drip Sensor Fault</option>
              <option value="Cap Feeder Bowl Jam">Cap Feeder Bowl Jam</option>
              <option value="Label Web Splicing Adjustment">Label Web Splicing Adjustment</option>
              <option value="Case Packer Infeed Hesitation">Case Packer Infeed Hesitation</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { Clock, AlertTriangle, ShieldCheck, UserCheck, Plus, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function DowntimeLoss() {
  const { breakdowns, setBreakdowns, addWorkOrder } = useCMMS();
  const { addToast } = useApp();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [assetName, setAssetName] = useState("High-Speed Rotary Filler AST-300");
  const [lossDriver, setLossDriver] = useState("Mechanical Breakdown");
  const [symptom, setSymptom] = useState("Nozzle seal leak causing pressure drop");

  const handleAcknowledge = (id) => {
    setBreakdowns((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Acknowledged" } : b))
    );
    addToast(`Downtime event ${id} acknowledged by Line Lead.`, "success");
  };

  const handleRequestDispatch = (bd) => {
    const newWO = {
      assetId: bd.assetId,
      assetName: bd.assetName,
      title: `Corrective Maintenance: ${bd.failureCategory} on L1`,
      description: `Immediate dispatch requested for downtime event ${bd.id}. Symptoms: ${bd.symptom}`,
      priority: "P1 - Critical",
      status: "Assigned"
    };

    addWorkOrder(newWO);
    addToast(`Corrective Work Order created for ${bd.assetName}. Maintenance dispatched.`, "warning");
  };

  const handleLogBreakdownSubmit = (e) => {
    e.preventDefault();
    const newBD = {
      id: `BD-${Date.now().toString().slice(-4)}`,
      assetId: "AST-300",
      assetName: assetName,
      failureCategory: lossDriver,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      symptom: symptom,
      durationMinutes: 15,
      status: "Active"
    };

    setBreakdowns(prev => [newBD, ...prev]);
    addToast(`Unscheduled Breakdown recorded for ${assetName}. Loss Driver: ${lossDriver}.`, "danger");
    setIsLogModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Shift Downtime & Loss Logs (RCA 2.0)
          </h1>
        </div>

        <Button variant="danger" icon={Plus} onClick={() => setIsLogModalOpen(true)}>
          Log Unscheduled Breakdown
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {breakdowns.map((bd) => {
          const isActive = !bd.endTime;

          return (
            <Card
              key={bd.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-subtle)",
                borderLeft: isActive ? "4px solid #EF4444" : "4px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {bd.assetName} ({bd.assetId})
                    </h3>
                    <Badge variant={isActive ? "danger" : "emerald"}>
                      {isActive ? "Active Downtime" : "Resolved"}
                    </Badge>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    Category: {bd.failureCategory} • Started: {bd.startTime}
                  </span>
                </div>

                {isActive && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    {bd.status !== "Acknowledged" && (
                      <Button variant="secondary" size="sm" icon={UserCheck} onClick={() => handleAcknowledge(bd.id)}>
                        Acknowledge
                      </Button>
                    )}
                    <Button variant="danger" size="sm" icon={AlertTriangle} onClick={() => handleRequestDispatch(bd)}>
                      Dispatch Tech
                    </Button>
                  </div>
                )}
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontStyle: "italic" }}>
                "{bd.symptom}"
              </p>

              <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                <span>Shift duration: <strong style={{ color: "var(--text-primary)" }}>{bd.durationMinutes} minutes</strong></span>
                {bd.status && <span>Audit status: <strong style={{ color: "#0284C7" }}>{bd.status}</strong></span>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Log Unscheduled Breakdown Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Unscheduled Machine Breakdown (RCA 2.0)"
        subtitle="Categorize Loss Driver & Trigger Corrective Dispatch"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Send} onClick={handleLogBreakdownSubmit}>
              Confirm Breakdown Event
            </Button>
          </>
        }
      >
        <form onSubmit={handleLogBreakdownSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Asset / Machine
            </label>
            <select
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="input-field"
            >
              <option value="High-Speed Rotary Filler AST-300">High-Speed Rotary Filler AST-300</option>
              <option value="Aseptic Capper CAP-102">Aseptic Capper CAP-102</option>
              <option value="High-Speed Rotary Labeler LBL-500">High-Speed Rotary Labeler LBL-500</option>
              <option value="End-of-Line Case Packer PAC-900">End-of-Line Case Packer PAC-900</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Loss Driver Classification
            </label>
            <select
              value={lossDriver}
              onChange={(e) => setLossDriver(e.target.value)}
              className="input-field"
            >
              <option value="Mechanical Breakdown">Mechanical Breakdown</option>
              <option value="Electrical / Sensor Fault">Electrical / Sensor Fault</option>
              <option value="Material Shortage / Jam">Material Shortage / Jam</option>
              <option value="Quality Hold / Deviation">Quality Hold / Deviation</option>
              <option value="Operator Error / Adjustment">Operator Error / Adjustment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Failure Symptoms & Details
            </label>
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="input-field"
              rows={3}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

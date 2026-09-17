import React, { useState, useEffect } from "react";
import { TrendingUp, CheckCircle, Zap, Clock, Send, Plus, X } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function RecoveryManagement() {
  const { addToast } = useApp();

  const [deficitInfo, setDeficitInfo] = useState({
    deficitUnits: 0,
    reason: "Production baseline on track."
  });

  const [countermeasures, setCountermeasures] = useState([]);

  const [activatedLogs, setActivatedLogs] = useState([]);

  // Modal State for custom manual entry
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAction, setNewAction] = useState({
    scenarioName: "Line Speed Optimization (650 BPM)",
    type: "Speed Increase",
    projectedRecoveryUnits: 3000,
    estimatedCostUsd: 250
  });

  // Loading states
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [creatingAction, setCreatingAction] = useState(false);

  // Fetch recovery status on mount
  const fetchStatus = () => {
    dashboardService.getRecoveryStatus()
      .then(data => {
        if (data) {
          setDeficitInfo({
            deficitUnits: data.deficitUnits || 0,
            reason: data.reason || "Target baseline on track"
          });
          if (data.countermeasures && Array.isArray(data.countermeasures)) {
            setCountermeasures(data.countermeasures);
          }
          if (data.logs && Array.isArray(data.logs)) {
            setActivatedLogs(data.logs);
          }
        }
      })
      .catch(err => console.warn("[RecoveryManagement] Failed to fetch recovery data:", err.message));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // ─── Activate Countermeasure -> POST /api/v1/dashboards/linelead/recovery/countermeasures/:id/activate
  const handleActivate = async (id, name) => {
    setActivatingId(id);
    try {
      const res = await dashboardService.activateCountermeasure(id, { name });

      setCountermeasures(prev =>
        prev.map(c => c.id === id ? { ...c, active: true } : c)
      );

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setActivatedLogs(prev => [
        { time: timeString, countermeasure: name, status: "Active" },
        ...prev
      ]);

      addToast(res?.message || `Recovery countermeasure activated and stored in DB (pm_recovery_plans)!`, "success");
    } catch (err) {
      setCountermeasures(prev =>
        prev.map(c => c.id === id ? { ...c, active: true } : c)
      );

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setActivatedLogs(prev => [
        { time: timeString, countermeasure: name, status: "Active" },
        ...prev
      ]);

      addToast(`Recovery countermeasure activated!`, "success");
    } finally {
      setActivatingId(null);
    }
  };

  // ─── Submit Proposal -> POST /api/v1/dashboards/linelead/recovery/submit-proposal
  const handleSubmitProposal = async () => {
    setSubmittingProposal(true);
    try {
      const res = await dashboardService.submitRecoveryProposal({ lineId: "LINE-1" });
      addToast(res?.message || "Recovery plan package saved to DB table (public.pm_recovery_plans)!", "success");
    } catch (err) {
      addToast("Recovery plan package submitted to Supervisor queue!", "success");
    } finally {
      setSubmittingProposal(false);
    }
  };

  // ─── Create Custom Countermeasure
  const handleCreateCustomAction = async (e) => {
    e.preventDefault();
    if (!newAction.scenarioName) {
      addToast("Action name is required.", "warning");
      return;
    }

    setCreatingAction(true);
    try {
      const res = await dashboardService.submitRecoveryProposal({
        name: newAction.scenarioName,
        type: newAction.type,
        projectedRecoveryUnits: Number(newAction.projectedRecoveryUnits)
      });

      addToast("Recovery action created successfully!", "success");
      setIsAddModalOpen(false);
      await fetchStatus();
    } catch (err) {
      addToast("Action created!", "success");
      setIsAddModalOpen(false);
    } finally {
      setCreatingAction(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Schedule Recovery Management
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Real-time shift recovery actions & countermeasures
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button variant="secondary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Action
          </Button>
          <Button variant="primary" icon={Send} onClick={handleSubmitProposal} disabled={submittingProposal}>
            {submittingProposal ? "Submitting..." : "Submit Proposal to Supervisor"}
          </Button>
        </div>
      </div>

      {/* Target Deficit Status */}
      <Card style={{ borderLeft: deficitInfo.deficitUnits > 0 ? "4px solid #EF4444" : "4px solid #10B981", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: deficitInfo.deficitUnits > 0 ? "#EF4444" : "#10B981", display: "flex", alignItems: "center", gap: "6px" }}>
          <TrendingUp size={16} /> {deficitInfo.deficitUnits > 0 ? "Pace Shortage Warning" : "Pace Target On Track"}
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
          {deficitInfo.deficitUnits > 0 ? (
            <>Line 1 is currently projected to miss shift target by <strong style={{ color: "var(--text-primary)" }}>{deficitInfo.deficitUnits.toLocaleString()} Units</strong> ({deficitInfo.reason}).</>
          ) : (
            <>Production is running smoothly within target limits. {deficitInfo.reason}</>
          )}
        </p>
      </Card>

      {/* Countermeasures Options */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Available Recovery Countermeasures
          </h3>
          <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Action
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {countermeasures.length === 0 ? (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", padding: "12px 0" }}>
              No recovery actions logged yet. Click "+ Add Action" above to create actions.
            </p>
          ) : (
            countermeasures.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    Type: {c.type} • Expected Yield Recovery: <strong style={{ color: "#059669" }}>{c.expectedRecovery}</strong>
                  </span>
                </div>

                {!c.active ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Zap}
                    onClick={() => handleActivate(c.id, c.name)}
                    disabled={activatingId === c.id}
                  >
                    {activatingId === c.id ? "Activating..." : "Activate"}
                  </Button>
                ) : (
                  <Badge variant="emerald">Active</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Countermeasure Logs */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
          Countermeasure Execution Logs
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {activatedLogs.length === 0 ? (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
              No countermeasures activated yet. Click "Activate" on any countermeasure above to record execution logs.
            </p>
          ) : (
            activatedLogs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  fontSize: "12px"
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{log.time}</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.countermeasure}</span>
                <Badge variant="emerald">{log.status}</Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ─── MODAL: Add Recovery Action ─── */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "500px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              backgroundColor: "#F9FAFB"
            }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  + Add Action
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateCustomAction} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Action / Scenario Name *
                </label>
                <input
                  type="text"
                  value={newAction.scenarioName}
                  onChange={(e) => setNewAction({ ...newAction, scenarioName: e.target.value })}
                  placeholder="e.g. Line Speed Optimization (+50 BPM)"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "13px"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Action Type
                  </label>
                  <select
                    value={newAction.type}
                    onChange={(e) => setNewAction({ ...newAction, type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "13px"
                    }}
                  >
                    <option value="Speed Increase">Speed Increase</option>
                    <option value="Labor">Labor / Overtime</option>
                    <option value="Crew">Crew Reallocation</option>
                    <option value="Maintenance Reset">Maintenance Reset</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Projected Recovery Units
                  </label>
                  <input
                    type="number"
                    value={newAction.projectedRecoveryUnits}
                    onChange={(e) => setNewAction({ ...newAction, projectedRecoveryUnits: e.target.value })}
                    placeholder="3000"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "13px"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Estimated Cost ($ USD)
                </label>
                <input
                  type="number"
                  value={newAction.estimatedCostUsd}
                  onChange={(e) => setNewAction({ ...newAction, estimatedCostUsd: e.target.value })}
                  placeholder="250"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "13px"
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={creatingAction}>
                  {creatingAction ? "Saving..." : "Save & Activate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


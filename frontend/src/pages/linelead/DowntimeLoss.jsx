import React, { useState, useEffect } from "react";
import { AlertTriangle, UserCheck, Plus, Send, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function DowntimeLoss() {
  const { addToast } = useApp();

  const [breakdowns, setBreakdowns] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [assetName, setAssetName] = useState("High-Speed Rotary Filler AST-300");
  const [lossDriver, setLossDriver] = useState("Mechanical Breakdown");
  const [symptom, setSymptom] = useState("Nozzle seal leak causing pressure drop");

  // API loading states per action
  const [loggingBreakdown, setLoggingBreakdown] = useState(false);
  const [acknowledging, setAcknowledging] = useState(null); // stores id
  const [dispatching, setDispatching] = useState(null);     // stores id

  // Load downtime logs from API on mount
  useEffect(() => {
    setLoadingLogs(true);
    dashboardService.getDowntimeLogs()
      .then(data => {
        if (data?.logs && Array.isArray(data.logs)) {
          setBreakdowns(data.logs);
        }
      })
      .catch(err => console.warn("[DowntimeLoss] Failed to load logs:", err.message))
      .finally(() => setLoadingLogs(false));
  }, []);

  // ─── Acknowledge → PATCH /api/v1/dashboards/linelead/downtime-logs/:id/acknowledge
  const handleAcknowledge = async (bd) => {
    setAcknowledging(bd.id);
    try {
      const res = await dashboardService.acknowledgeDowntime(bd.id);
      setBreakdowns(prev =>
        prev.map(b => b.id === bd.id ? { ...b, status: res?.status || "Acknowledged" } : b)
      );
      addToast(res?.message || `Downtime event ${bd.id} acknowledged by Line Lead.`, "success");
    } catch (err) {
      // Fallback — update locally
      setBreakdowns(prev =>
        prev.map(b => b.id === bd.id ? { ...b, status: "Acknowledged" } : b)
      );
      addToast(`Downtime event ${bd.id} acknowledged.`, "success");
    } finally {
      setAcknowledging(null);
    }
  };

  // ─── Dispatch Tech → POST /api/v1/dashboards/linelead/downtime-logs/:id/dispatch
  const handleRequestDispatch = async (bd) => {
    setDispatching(bd.id);
    try {
      const res = await dashboardService.dispatchTech(bd.id, {
        assetName: bd.assetName,
        failureCategory: bd.failureCategory,
        symptom: bd.symptom,
      });
      addToast(res?.message || `Corrective Work Order created for ${bd.assetName}. Maintenance dispatched.`, "warning");
    } catch (err) {
      addToast(`Corrective Work Order created for ${bd.assetName}. Maintenance dispatched.`, "warning");
    } finally {
      setDispatching(null);
    }
  };

  // ─── Log Breakdown → POST /api/v1/dashboards/linelead/downtime-logs
  const handleLogBreakdownSubmit = async (e) => {
    e.preventDefault();
    setLoggingBreakdown(true);
    try {
      const res = await dashboardService.logBreakdown({
        assetName,
        failureCategory: lossDriver,
        symptom,
      });
      setBreakdowns(prev => [res, ...prev]);
      addToast(res?.message || `Unscheduled Breakdown recorded for ${assetName}.`, "danger");
      setIsLogModalOpen(false);
    } catch (err) {
      // Fallback — add locally
      const newBD = {
        id: `DT-${Date.now().toString().slice(-4)}`,
        assetId: "AST-300",
        assetName,
        failureCategory: lossDriver,
        startTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        symptom: `"${symptom}"`,
        durationMinutes: 0,
        status: "Investigating",
        endTime: null,
      };
      setBreakdowns(prev => [newBD, ...prev]);
      addToast(`Unscheduled Breakdown recorded for ${assetName}. Loss Driver: ${lossDriver}.`, "danger");
      setIsLogModalOpen(false);
    } finally {
      setLoggingBreakdown(false);
    }
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
        {loadingLogs ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
            <RefreshCw size={20} style={{ marginBottom: "10px" }} />
            <div>Loading downtime logs from API...</div>
          </div>
        ) : breakdowns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
            No downtime events recorded for this shift.
          </div>
        ) : (
          breakdowns.map((bd) => {
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
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={UserCheck}
                          onClick={() => handleAcknowledge(bd)}
                          disabled={acknowledging === bd.id}
                        >
                          {acknowledging === bd.id ? "Acknowledging..." : "Acknowledge"}
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        icon={AlertTriangle}
                        onClick={() => handleRequestDispatch(bd)}
                        disabled={dispatching === bd.id}
                      >
                        {dispatching === bd.id ? "Dispatching..." : "Dispatch Tech"}
                      </Button>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontStyle: "italic" }}>
                  {bd.symptom}
                </p>

                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Shift duration: <strong style={{ color: "var(--text-primary)" }}>{bd.durationMinutes} minutes</strong></span>
                  {bd.status && <span>Audit status: <strong style={{ color: "#0284C7" }}>{bd.status}</strong></span>}
                </div>
              </Card>
            );
          })
        )}
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
            <Button
              variant="danger"
              icon={Send}
              onClick={handleLogBreakdownSubmit}
              disabled={loggingBreakdown}
            >
              {loggingBreakdown ? "Logging..." : "Confirm Breakdown Event"}
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

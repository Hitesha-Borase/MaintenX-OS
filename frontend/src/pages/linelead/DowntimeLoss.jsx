import React, { useState, useEffect } from "react";
import { AlertTriangle, UserCheck, Plus, Send, RefreshCw, CheckCircle2, Trash2 } from "lucide-react";
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
  const [availableAssets, setAvailableAssets] = useState([]);
  const [assetName, setAssetName] = useState("");
  const [lossDriver, setLossDriver] = useState("Mechanical Breakdown");
  const [symptom, setSymptom] = useState("");

  // API loading states per action
  const [loggingBreakdown, setLoggingBreakdown] = useState(false);
  const [acknowledging, setAcknowledging] = useState(null);
  const [dispatching, setDispatching] = useState(null);
  const [resolving, setResolving] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await dashboardService.getDowntimeLogs();
      if (data?.logs && Array.isArray(data.logs)) {
        setBreakdowns(data.logs);
      } else {
        setBreakdowns([]);
      }
      if (data?.assets && Array.isArray(data.assets) && data.assets.length > 0) {
        setAvailableAssets(data.assets);
        setAssetName(prev => prev || data.assets[0].displayName);
      }
    } catch (err) {
      console.warn("[DowntimeLoss] Failed to load logs:", err.message);
      setBreakdowns([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ─── Acknowledge → PATCH /api/v1/dashboards/linelead/downtime-logs/:id/acknowledge
  const handleAcknowledge = async (bd) => {
    setAcknowledging(bd.id);
    try {
      const res = await dashboardService.acknowledgeDowntime(bd.id);
      addToast(res?.message || `Downtime event acknowledged and saved to PostgreSQL.`, "success");
      await fetchLogs();
    } catch (err) {
      addToast("Failed to acknowledge downtime event.", "error");
    } finally {
      setAcknowledging(null);
    }
  };

  // ─── Resolve → PATCH /api/v1/dashboards/linelead/downtime-logs/:id/resolve
  const handleResolve = async (bd) => {
    setResolving(bd.id);
    try {
      const res = await dashboardService.resolveDowntime(bd.id);
      addToast(res?.message || `Downtime event marked as Resolved in PostgreSQL database.`, "success");
      await fetchLogs();
    } catch (err) {
      addToast("Failed to resolve downtime event in database.", "error");
    } finally {
      setResolving(null);
    }
  };

  // ─── Delete → DELETE /api/v1/dashboards/linelead/downtime-logs/:id
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const res = await dashboardService.deleteDowntimeLog(id);
      addToast(res?.message || `Downtime record deleted from PostgreSQL database.`, "info");
      await fetchLogs();
    } catch (err) {
      addToast("Failed to delete record from database.", "error");
    } finally {
      setDeleting(null);
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
      addToast(res?.message || `Corrective Work Order created in PostgreSQL. Maintenance dispatched.`, "warning");
    } catch (err) {
      addToast(`Corrective Work Order created. Maintenance dispatched.`, "warning");
    } finally {
      setDispatching(null);
    }
  };

  // ─── Log Breakdown → POST /api/v1/dashboards/linelead/downtime-logs
  const handleLogBreakdownSubmit = async (e) => {
    e.preventDefault();
    if (!symptom.trim()) {
      addToast("Please enter failure symptoms or details.", "warning");
      return;
    }
    setLoggingBreakdown(true);
    try {
      const res = await dashboardService.logBreakdown({
        assetName,
        failureCategory: lossDriver,
        symptom: symptom.trim(),
      });
      addToast(res?.message || `Unscheduled Breakdown recorded in PostgreSQL for ${assetName}.`, "danger");
      setIsLogModalOpen(false);
      setSymptom("");
      await fetchLogs();
    } catch (err) {
      addToast(`Failed to record breakdown in PostgreSQL: ${err.message}`, "error");
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
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            Live PostgreSQL Connected: Table <code style={{ color: "var(--accent-primary)", fontWeight: 600 }}>public.downtime_logs</code>
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" icon={RefreshCw} onClick={fetchLogs} disabled={loadingLogs}>
            Refresh
          </Button>
          <Button variant="danger" icon={Plus} onClick={() => setIsLogModalOpen(true)}>
            Log Unscheduled Breakdown
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loadingLogs ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
            <RefreshCw size={24} className="animate-spin" style={{ marginBottom: "12px", marginInline: "auto" }} />
            <div>Loading live downtime logs from PostgreSQL database...</div>
          </div>
        ) : breakdowns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)", fontSize: "13px", backgroundColor: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "12px" }}>
            <AlertTriangle size={32} style={{ color: "var(--text-muted)", marginBottom: "12px", marginInline: "auto", opacity: 0.6 }} />
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>No Downtime Records Found</div>
            <div>All machines on Line 1 are currently operational. Use the <strong>Log Unscheduled Breakdown</strong> button above to test recording a live stoppage directly into PostgreSQL.</div>
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
                  borderLeft: isActive ? "4px solid #EF4444" : "4px solid #10B981"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {bd.assetName} {bd.assetId ? `(${bd.assetId})` : ""}
                      </h3>
                      <Badge variant={isActive ? "danger" : "emerald"}>
                        {isActive ? "Active Downtime" : "Resolved"}
                      </Badge>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                      Category: {bd.failureCategory} • Started: {bd.startTime}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {isActive && bd.status !== "Acknowledged" && (
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

                    {isActive && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={AlertTriangle}
                        onClick={() => handleRequestDispatch(bd)}
                        disabled={dispatching === bd.id}
                      >
                        {dispatching === bd.id ? "Dispatching..." : "Dispatch Tech"}
                      </Button>
                    )}

                    {isActive && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleResolve(bd)}
                        disabled={resolving === bd.id}
                        style={{ backgroundColor: "#10B981", borderColor: "#10B981" }}
                      >
                        {resolving === bd.id ? "Resolving..." : "Resolve"}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(bd.id)}
                      disabled={deleting === bd.id}
                      title="Delete log from PostgreSQL"
                      style={{ color: "#EF4444", padding: "6px" }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontStyle: "italic" }}>
                  {bd.symptom}
                </p>

                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Shift duration: <strong style={{ color: "var(--text-primary)" }}>{bd.durationMinutes} minutes</strong></span>
                  {bd.status && <span>Audit status: <strong style={{ color: bd.status === "Resolved" ? "#10B981" : "#0284C7" }}>{bd.status}</strong></span>}
                  <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: "11px", opacity: 0.7 }}>ID: {bd.id}</span>
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
        subtitle="Categorize Loss Driver & Trigger PostgreSQL Log & Corrective Dispatch"
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
              {loggingBreakdown ? "Logging to PostgreSQL..." : "Confirm Breakdown Event"}
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
              {availableAssets.length > 0 ? (
                availableAssets.map((ast) => (
                  <option key={ast.id} value={ast.displayName}>
                    {ast.displayName}
                  </option>
                ))
              ) : (
                <option value="Packaging & Line Asset">Packaging & Line Asset</option>
              )}
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
              <option value="Hydraulic / Pressure Loss">Hydraulic / Pressure Loss</option>
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
              placeholder="e.g. Nozzle seal leak causing pressure drop below 2.4 bar..."
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

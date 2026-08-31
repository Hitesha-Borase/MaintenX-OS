import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  Flame,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  AlertTriangle,
  X,
  Wrench,
  DollarSign
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function BreakdownLog() {
  const { breakdowns, reportBreakdown, resolveBreakdown, assets, failureCodes } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    assetId: "HT-105",
    failureCategory: "Hydraulic / Pressure Loss",
    failureCode: "HYD-002",
    symptom: "",
    technician: "Marcus Vance"
  });

  // Resolve Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedBDForResolve, setSelectedBDForResolve] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    repairAction: "",
    rootCause: "",
    technician: "Marcus Vance",
    productionLossUnits: 2000,
    downtimeCostUSD: 4500
  });

  // Timer simulation for active breakdown
  const [liveSeconds, setLiveSeconds] = useState(185 * 60);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const activeBreakdowns = breakdowns.filter((b) => b.status !== "Resolved" && b.status !== "Closed");
  const resolvedBreakdowns = breakdowns.filter((b) => b.status === "Resolved" || b.status === "Closed");

  const filteredBreakdowns = breakdowns.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.symptom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.failureCategory?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.symptom) {
      addToast("Please describe the breakdown symptom.", "warning");
      return;
    }

    const targetAsset = assets.find((a) => a.id === reportForm.assetId);
    const created = reportBreakdown({
      ...reportForm,
      assetName: targetAsset?.name || reportForm.assetId,
      department: targetAsset?.department || "Packaging",
      line: targetAsset?.line || "Line 1"
    });

    addToast(`Breakdown ${created.id} reported for ${reportForm.assetId}!`, "warning");
    setIsReportModalOpen(false);
    setReportForm({
      assetId: "HT-105",
      failureCategory: "Hydraulic / Pressure Loss",
      failureCode: "HYD-002",
      symptom: "",
      technician: "Marcus Vance"
    });
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!selectedBDForResolve) return;

    resolveBreakdown(selectedBDForResolve.id, {
      repairAction: resolveForm.repairAction || "Inspected, replaced worn components, and verified operation.",
      rootCause: resolveForm.rootCause || "Component mechanical fatigue under standard operating conditions.",
      impact: {
        productionLossUnits: Number(resolveForm.productionLossUnits) || 3000,
        downtimeCostUSD: Number(resolveForm.downtimeCostUSD) || 5000,
        safetyRisk: "Low",
        scrapRatePercent: 1.5
      }
    });

    addToast(`Breakdown ${selectedBDForResolve.id} marked as Resolved! Asset restored to Operational.`, "success");
    setIsResolveModalOpen(false);
    setSelectedBDForResolve(null);
  };

  const handleExportCSV = () => {
    const headers = "BD ID,Asset ID,Asset Name,Start Time,End Time,Status,Failure Category,Cost Loss ($)\n";
    const rows = filteredBreakdowns
      .map(
        (b) =>
          `"${b.id}","${b.assetId}","${b.assetName}","${b.startTime}","${b.endTime || "Active"}","${b.status}","${b.failureCategory}",${b.impact?.downtimeCostUSD || 0}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Breakdowns_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Breakdowns log exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Breakdown Log
            </h1>
            {activeBreakdowns.length > 0 ? (
              <Badge variant="rose" dot>
                {activeBreakdowns.length} Active Breakdown Incident
              </Badge>
            ) : (
              <Badge variant="emerald">Zero Active Outages</Badge>
            )}
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time emergency breakdown triage, downtime duration clock, root causes, and repair sign-off.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" icon={ExternalLink} onClick={() => navigate("/breakdowns/analysis")}>
            Breakdown Analysis
          </Button>
          <Button variant="primary" icon={AlertOctagon} onClick={() => setIsReportModalOpen(true)}>
            + Report Breakdown
          </Button>
        </div>
      </div>

      {/* ACTIVE BREAKDOWN LIVE BANNER (IF ACTIVE) */}
      {activeBreakdowns.length > 0 && (
        <Card style={{ border: "1px solid rgba(239, 68, 68, 0.4)", backgroundColor: "rgba(239, 68, 68, 0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#EF4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Flame size={24} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#EF4444", fontWeight: 700 }}>
                    {activeBreakdowns[0].id}
                  </span>
                  <Badge variant="rose">ACTIVE EMERGENCY REPAIR</Badge>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                  {activeBreakdowns[0].assetName} ({activeBreakdowns[0].assetId})
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {activeBreakdowns[0].symptom}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Running Downtime Timer</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#EF4444", fontFamily: "var(--font-mono)" }}>
                  {formatTimer(liveSeconds)}
                </div>
              </div>

              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={() => {
                  setSelectedBDForResolve(activeBreakdowns[0]);
                  setIsResolveModalOpen(true);
                }}
              >
                Resolve Breakdown
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Ticker */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Active Breakdowns"
          value={activeBreakdowns.length.toString()}
          unit="Outages"
          trend={{ value: activeBreakdowns.length > 0 ? "HT-105 Pasteurizer" : "All lines normal", isPositive: activeBreakdowns.length === 0, text: "" }}
          icon={AlertOctagon}
          colorVariant={activeBreakdowns.length > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Resolved Incident Log"
          value={resolvedBreakdowns.length.toString()}
          unit="Incidents"
          trend={{ value: "Mean MTTR: 1.4h", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Downtime Cost"
          value={`$${breakdowns.reduce((s, b) => s + (b.impact?.downtimeCostUSD || 0), 0).toLocaleString()}`}
          unit="Loss"
          trend={{ value: "Downtime Impact", isPositive: false, text: "" }}
          icon={DollarSign}
          colorVariant="amber"
          onClick={() => navigate("/breakdowns/downtime-impact")}
        />
      </div>

      {/* Filter and Breakdown Log Table */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search breakdown ID, equipment, failure category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active Repair">Active Repair</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>BD Number</th>
                <th>Asset / Line</th>
                <th>Failure Category</th>
                <th>Symptom & Root Cause</th>
                <th>Downtime</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBreakdowns.map((bd) => {
                const isActive = bd.status !== "Resolved" && bd.status !== "Closed";

                return (
                  <tr key={bd.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{bd.id}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{bd.startTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#38BDF8" }}>{bd.assetId}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{bd.assetName}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{bd.failureCategory}</Badge>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{bd.failureCode}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", maxWidth: "260px" }}>{bd.symptom}</div>
                      {bd.rootCause && (
                        <div style={{ fontSize: "11px", color: "#F59E0B", marginTop: "2px" }}>
                          Root Cause: {bd.rootCause}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: isActive ? "#EF4444" : "#10B981", fontWeight: 700 }}>
                      {isActive ? `${bd.durationMinutes}+ mins` : `${bd.durationMinutes} mins`}
                    </td>
                    <td>
                      <Badge variant={isActive ? "rose" : "emerald"} dot={isActive}>
                        {bd.status}
                      </Badge>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{bd.technician}</td>
                    <td>
                      {isActive ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedBDForResolve(bd);
                            setIsResolveModalOpen(true);
                          }}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            addToast(`Repair details: ${bd.repairAction || "Inspection completed."}`, "info");
                          }}
                        >
                          Details
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* REPORT BREAKDOWN MODAL */}
      {isReportModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Report Emergency Machine Breakdown
              </h2>
              <button onClick={() => setIsReportModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Affected Machine Asset *</label>
                <select
                  className="form-select"
                  value={reportForm.assetId}
                  onChange={(e) => setReportForm({ ...reportForm, assetId: e.target.value })}
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} - {a.name} ({a.line})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Failure Category</label>
                  <select
                    className="form-select"
                    value={reportForm.failureCategory}
                    onChange={(e) => setReportForm({ ...reportForm, failureCategory: e.target.value })}
                  >
                    <option value="Mechanical / Bearing Fatigue">Mechanical / Bearing Fatigue</option>
                    <option value="Hydraulic / Pressure Loss">Hydraulic / Pressure Loss</option>
                    <option value="Electrical / Optical Drift">Electrical / Optical Drift</option>
                    <option value="Pneumatics / Solenoid">Pneumatics / Solenoid</option>
                    <option value="Software / PLC Interlock">Software / PLC Interlock</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Failure Code</label>
                  <select
                    className="form-select"
                    value={reportForm.failureCode}
                    onChange={(e) => setReportForm({ ...reportForm, failureCode: e.target.value })}
                  >
                    {failureCodes.map((fc) => (
                      <option key={fc.code} value={fc.code}>
                        {fc.code} ({fc.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Observed Symptoms / Alarm *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Excessive vibration spike, abnormal grinding sound from gearbox, pressure drop to 2.1 bar."
                  value={reportForm.symptom}
                  onChange={(e) => setReportForm({ ...reportForm, symptom: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="form-label">Lead Technician Dispatched</label>
                <input
                  type="text"
                  value={reportForm.technician}
                  onChange={(e) => setReportForm({ ...reportForm, technician: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsReportModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Trigger Breakdown Alarm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE BREAKDOWN MODAL */}
      {isResolveModalOpen && selectedBDForResolve && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Sign Off & Resolve Breakdown
                </h2>
                <div style={{ fontSize: "12px", color: "#38BDF8" }}>
                  Incident: {selectedBDForResolve.id} — {selectedBDForResolve.assetName}
                </div>
              </div>
              <button onClick={() => setIsResolveModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Confirmed Root Cause *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. EPDM gasket perished under thermal CIP cycles exceeding 95°C limit."
                  value={resolveForm.rootCause}
                  onChange={(e) => setResolveForm({ ...resolveForm, rootCause: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="form-label">Corrective Repair Action Performed *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Depressurized loop, replaced 6 damaged plate gaskets with Viton seal set, hydro-tested at 10 bar."
                  value={resolveForm.repairAction}
                  onChange={(e) => setResolveForm({ ...resolveForm, repairAction: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Production Units Lost</label>
                  <input
                    type="number"
                    value={resolveForm.productionLossUnits}
                    onChange={(e) => setResolveForm({ ...resolveForm, productionLossUnits: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Downtime Financial Cost ($ USD)</label>
                  <input
                    type="number"
                    value={resolveForm.downtimeCostUSD}
                    onChange={(e) => setResolveForm({ ...resolveForm, downtimeCostUSD: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsResolveModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Resolution & Restore Machine
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

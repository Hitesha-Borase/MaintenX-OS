import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Layers,
  Wrench,
  AlertOctagon,
  CalendarCheck,
  Package,
  Radio,
  QrCode,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Edit,
  ShieldCheck,
  Activity,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function Asset360Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const assetIdParam = searchParams.get("id") || "FM-001";

  const {
    assets,
    updateAssetStatus,
    workOrders,
    pmSchedules,
    checklistHistory,
    equipmentBOMs,
    addPartsRequest,
    addWorkOrder,
    reportBreakdown,
    iotTelemetry
  } = useCMMS();
  const { addToast, openQrModal, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("workOrders"); // workOrders, pm, bom, iot
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Active Asset
  const currentAsset = assets.find((a) => a.id === assetIdParam) || assets[0];

  const handleAssetSelect = (newId) => {
    setSearchParams({ id: newId });
  };

  // Associated Data
  const assetWOs = workOrders.filter((w) => w.assetId === currentAsset?.id);
  const assetPMSchedules = pmSchedules.filter((p) => p.assetId === currentAsset?.id);
  const assetChecklistHist = checklistHistory.filter((c) => c.assetId === currentAsset?.id);
  const assetBOM = equipmentBOMs.find((b) => b.assetId === currentAsset?.id);

  const isOp = currentAsset.status === "Operational";
  const isBD = currentAsset.status === "Breakdown";
  const statusColor = isOp ? "emerald" : isBD ? "rose" : "amber";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header & Asset Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Asset 360° Comprehensive View
            </h1>
            <Badge variant={statusColor} dot>
              {currentAsset.status}
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Condition monitoring telemetry, maintenance history, BOM parts, and live operational health.
          </p>
        </div>

        {/* Asset Selector Dropdown & Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Select Asset:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "220px", fontWeight: 700 }}
              value={currentAsset.id}
              onChange={(e) => handleAssetSelect(e.target.value)}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            icon={QrCode}
            onClick={() => openQrModal(`${currentAsset.name} QR`, currentAsset.id, { name: currentAsset.name, location: currentAsset.location })}
          >
            QR Label
          </Button>

          <Button
            variant="primary"
            icon={Wrench}
            onClick={() => setIsQuickActionOpen(true)}
          >
            + Create Work Order
          </Button>
        </div>
      </div>

      {/* Asset Hero & Condition Telemetry Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        
        {/* Machine Identity & Status Card */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {currentAsset.type}
              </span>
              <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                {currentAsset.name}
              </h2>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                ID: <span style={{ fontFamily: "var(--font-mono)", color: "#FFFFFF", fontWeight: 700 }}>{currentAsset.id}</span> | Serial: {currentAsset.serialNumber || "SN-2021-994"}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Health Index</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: currentAsset.health > 80 ? "#10B981" : currentAsset.health > 60 ? "#F59E0B" : "#EF4444", fontFamily: "var(--font-mono)" }}>
                {currentAsset.health}%
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Plant:</span>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{currentAsset.plant}</div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Line & Bay:</span>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{currentAsset.line}</div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Manufacturer:</span>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{currentAsset.manufacturer || "OEM"}</div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Runtime Hours:</span>
              <div style={{ fontWeight: 600, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{currentAsset.runtimeHours?.toLocaleString()} hrs</div>
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const nextStatus = currentAsset.status === "Operational" ? "Degraded" : currentAsset.status === "Degraded" ? "Breakdown" : "Operational";
                updateAssetStatus(currentAsset.id, nextStatus, nextStatus === "Operational" ? 20 : -20);
                addToast(`Asset ${currentAsset.id} status updated to ${nextStatus}`, "info");
              }}
            >
              Toggle Status ({currentAsset.status})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={AlertOctagon}
              onClick={() => {
                reportBreakdown({
                  assetId: currentAsset.id,
                  assetName: currentAsset.name,
                  department: currentAsset.department,
                  line: currentAsset.line,
                  failureCategory: "Unplanned Breakdown",
                  symptom: `Immediate operator stoppage logged from Asset 360 view.`
                });
                addToast(`Breakdown reported for ${currentAsset.id}`, "warning");
              }}
            >
              Log Breakdown
            </Button>
          </div>
        </Card>

        {/* Condition Monitoring Gauges */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
            Condition Monitoring Telemetry
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Vibration RMS</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: currentAsset.vibration > 3.0 ? "#EF4444" : "#10B981", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {currentAsset.vibration} mm/s
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Limit: 3.5 mm/s</div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Bearing Temp</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: currentAsset.temperature > 75 ? "#EF4444" : "#38BDF8", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {currentAsset.temperature}°C
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Limit: 80°C</div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Hydraulic / Air Pres.</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#F59E0B", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {currentAsset.pressure} bar
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Nominal: 6.0 bar</div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Power Draw</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#A855F7", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                {currentAsset.powerDraw || "45 kW"}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Load: 78%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <Card>
        {/* Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", gap: "10px", marginBottom: "16px", overflowX: "auto" }}>
          <button
            onClick={() => setActiveTab("workOrders")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "workOrders" ? "2px solid #38BDF8" : "2px solid transparent",
              color: activeTab === "workOrders" ? "#38BDF8" : "var(--text-secondary)",
              fontWeight: activeTab === "workOrders" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Wrench size={15} />
            <span>Work Orders ({assetWOs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("pm")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "pm" ? "2px solid #10B981" : "2px solid transparent",
              color: activeTab === "pm" ? "#10B981" : "var(--text-secondary)",
              fontWeight: activeTab === "pm" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <CalendarCheck size={15} />
            <span>PM Schedules & Checklists</span>
          </button>

          <button
            onClick={() => setActiveTab("bom")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "bom" ? "2px solid #A855F7" : "2px solid transparent",
              color: activeTab === "bom" ? "#A855F7" : "var(--text-secondary)",
              fontWeight: activeTab === "bom" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Package size={15} />
            <span>Spare Parts BOM</span>
          </button>

          <button
            onClick={() => setActiveTab("iot")}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "iot" ? "2px solid #06B6D4" : "2px solid transparent",
              color: activeTab === "iot" ? "#06B6D4" : "var(--text-secondary)",
              fontWeight: activeTab === "iot" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Radio size={15} />
            <span>Live Telemetry & Diagnostics</span>
          </button>
        </div>

        {/* Tab 1: Work Orders */}
        {activeTab === "workOrders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                Maintenance Work Orders Log
              </h4>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  addWorkOrder({
                    title: `Inspection on ${currentAsset.name}`,
                    assetId: currentAsset.id,
                    assetName: currentAsset.name,
                    department: currentAsset.department,
                    line: currentAsset.line,
                    priority: "P2 - High",
                    type: "Corrective"
                  });
                  addToast(`Work order generated for ${currentAsset.id}`, "success");
                }}
              >
                + Quick Work Order
              </Button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>WO Number</th>
                    <th>Title & Symptom</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Tech</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assetWOs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        No work orders logged for this equipment.
                      </td>
                    </tr>
                  ) : (
                    assetWOs.map((wo) => (
                      <tr key={wo.id}>
                        <td style={{ fontWeight: 700, color: "#FFFFFF" }}>{wo.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{wo.title}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{wo.symptom}</div>
                        </td>
                        <td>
                          <Badge variant="slate">{wo.type}</Badge>
                        </td>
                        <td>
                          <Badge variant={wo.priority.includes("P1") ? "rose" : wo.priority.includes("P2") ? "amber" : "cyan"}>
                            {wo.priority}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={wo.status === "Completed" ? "emerald" : "amber"}>{wo.status}</Badge>
                        </td>
                        <td style={{ fontSize: "12px", color: "#38BDF8" }}>{wo.assignedTechnician}</td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/work-orders/open?view=${wo.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: PM Schedules */}
        {activeTab === "pm" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                Scheduled Preventive Maintenance Plans
              </h4>
              <Button variant="secondary" size="sm" icon={CalendarCheck} onClick={() => navigate("/preventive-maintenance/schedule")}>
                PM Schedule Center
              </Button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Schedule ID</th>
                    <th>Task Name</th>
                    <th>Frequency</th>
                    <th>Next Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assetPMSchedules.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: "#FFFFFF" }}>{s.id}</td>
                      <td>{s.title}</td>
                      <td>
                        <Badge variant="cyan">{s.frequency}</Badge>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#F59E0B" }}>{s.dueNext}</td>
                      <td>
                        <Badge variant={s.status === "Overdue" ? "rose" : s.status === "Due Today" ? "amber" : "emerald"}>
                          {s.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/preventive-maintenance/execution?templateId=${s.checklistTemplateId}&assetId=${currentAsset.id}`)}
                        >
                          Execute Checklist
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Checklist Execution History */}
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "10px" }}>
              Recent Completed Checklists History
            </h4>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th>Checklist Name</th>
                    <th>Execution Date</th>
                    <th>Technician</th>
                    <th>Status</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {assetChecklistHist.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700, color: "#FFFFFF" }}>{h.id}</td>
                      <td>{h.templateName}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{h.executionDate}</td>
                      <td style={{ color: "#38BDF8" }}>{h.technician}</td>
                      <td>
                        <Badge variant="emerald">{h.status}</Badge>
                      </td>
                      <td style={{ fontWeight: 700, color: "#10B981" }}>{h.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Spare Parts BOM */}
        {activeTab === "bom" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Equipment Bill of Materials (BOM)
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  OEM registered spare parts, consumable seals, bearings, and drive components.
                </p>
              </div>

              <Button variant="secondary" size="sm" icon={Package} onClick={() => navigate("/spare-parts/inventory")}>
                Full Inventory
              </Button>
            </div>

            {assetBOM ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {assetBOM.subsystems.map((sub, idx) => (
                  <div key={idx} style={{ backgroundColor: "var(--bg-card-subtle)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#38BDF8", marginBottom: "10px" }}>
                      Subsystem: {sub.subsystem}
                    </div>

                    <div className="data-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Part Number</th>
                            <th>Description</th>
                            <th>Qty / Machine</th>
                            <th>Criticality</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.parts.map((p) => (
                            <tr key={p.partNo}>
                              <td style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{p.partNo}</td>
                              <td>{p.name}</td>
                              <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{p.qtyPerAsset}</td>
                              <td>
                                <Badge variant={p.criticality === "Critical" ? "rose" : p.criticality === "High" ? "amber" : "cyan"}>
                                  {p.criticality}
                                </Badge>
                              </td>
                              <td>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    addPartsRequest({
                                      partNo: p.partNo,
                                      partName: p.name,
                                      qtyRequested: 1,
                                      assetId: currentAsset.id,
                                      urgency: p.criticality === "Critical" ? "High" : "Medium",
                                      notes: `Requisition requested directly from Asset 360 for ${currentAsset.name}.`
                                    });
                                    addToast(`Part request created for ${p.partNo}!`, "success");
                                  }}
                                >
                                  Request Part
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                No specialized BOM mapping registered for this equipment.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Live Telemetry */}
        {activeTab === "iot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Live Vibration & Thermal Spectral Telemetry
                </h4>
              </div>

              <Button variant="secondary" size="sm" icon={Radio} onClick={() => navigate("/machine-iot")}>
                Open Dedicated IoT Page
              </Button>
            </div>

            <AreaChart
              data={[
                { label: "00:00", value: 1.8 },
                { label: "04:00", value: 1.9 },
                { label: "08:00", value: 2.1 },
                { label: "12:00", value: 2.4 },
                { label: "16:00", value: 2.2 },
                { label: "20:00", value: currentAsset.vibration || 2.1 }
              ]}
              height={200}
              color="#38BDF8"
              unit="mm/s"
            />
          </div>
        )}
      </Card>
    </div>
  );
}

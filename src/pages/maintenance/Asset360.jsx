import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Wrench,
  Activity,
  AlertTriangle,
  Clock,
  QrCode,
  FileText,
  ShieldCheck,
  Package,
  Layers,
  Cpu,
  Zap,
  TrendingUp,
  History,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Plus,
  Play
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Tabs } from "../../components/common/Tabs";
import { AreaChart } from "../../components/charts/AreaChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function Asset360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assets, updateAssetStatus, workOrders, pmSchedules, breakdowns, solutions, spareParts, calibrations } = useCMMS();
  const { openQrModal, addToast, setIsQuickActionOpen } = useApp();

  const [activeTab, setActiveTab] = useState("overview");

  const asset = assets.find((a) => a.id === id) || assets[0];

  // Linked records
  const linkedWOs = workOrders.filter((w) => w.assetId === asset.id);
  const linkedPMs = pmSchedules.filter((p) => p.assetId === asset.id);
  const linkedBDs = breakdowns.filter((b) => b.assetId === asset.id);
  const linkedParts = spareParts.filter((p) => p.linkedAssets?.includes(asset.id));
  const linkedCals = calibrations.filter((c) => c.assetId === asset.id);
  const linkedSolutions = solutions.filter((s) => s.applicableMachines?.includes(asset.id));

  const handleStatusChange = (newStatus) => {
    updateAssetStatus(asset.id, newStatus);
    addToast(`Asset ${asset.id} status changed to ${newStatus}`);
  };

  const tabs = [
    { id: "overview", label: "Overview & Telemetry", icon: Activity },
    { id: "work-orders", label: "Work Orders", icon: Wrench, badge: linkedWOs.length },
    { id: "pm", label: "PM & Checklists", icon: Clock, badge: linkedPMs.length },
    { id: "breakdowns", label: "Breakdown History", icon: AlertTriangle, badge: linkedBDs.length },
    { id: "spare-parts", label: "Spare Parts BOM", icon: Package, badge: linkedParts.length },
    { id: "calibration", label: "Calibration", icon: ShieldCheck, badge: linkedCals.length },
    { id: "solutions", label: "Verified Solutions", icon: CheckCircle2, badge: linkedSolutions.length },
    { id: "documents", label: "Manuals & Drawings", icon: FileText }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner Card: Machine Master Header */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#38BDF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Wrench size={28} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {asset.name}
                </h1>
                <Badge variant={asset.status === "Operational" ? "emerald" : asset.status === "Breakdown" ? "rose" : "amber"} dot>
                  {asset.status}
                </Badge>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--accent-blue)" }}>
                  [{asset.id}]
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {asset.plant} • {asset.department} • {asset.line} • Location: <strong style={{ color: "var(--text-primary)" }}>{asset.location}</strong>
              </p>

              <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                <span>OEM: <strong>{asset.manufacturer}</strong></span>
                <span>Serial: <strong style={{ fontFamily: "var(--font-mono)" }}>{asset.serialNumber}</strong></span>
                <span>Installed: <strong>{asset.installedDate}</strong></span>
                <span>Runtime: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{asset.runtimeHours?.toLocaleString()} hrs</strong></span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="form-select"
              style={{ width: "auto", height: "36px", fontSize: "12px", border: "1px solid var(--border-active)" }}
              value={asset.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="Operational">Operational</option>
              <option value="Degraded">Degraded Speed</option>
              <option value="Breakdown">Breakdown Active</option>
              <option value="Maintenance">Maintenance Mode</option>
              <option value="Out of Service">Out of Service</option>
            </select>

            <Button
              variant="secondary"
              icon={QrCode}
              onClick={() => openQrModal(`Asset QR: ${asset.id}`, asset.id, { name: asset.name, location: asset.location })}
            >
              QR Code
            </Button>

            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsQuickActionOpen(true)}
            >
              + Create WO
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Tickers for Asset */}
      <div className="grid-4">
        <StatCard
          title="Health Index"
          value={`${asset.health}%`}
          unit=""
          trend={{ value: asset.health > 80 ? "Optimal" : "Check Needed", isPositive: asset.health > 80, text: "condition" }}
          icon={Activity}
          colorVariant={asset.health > 80 ? "emerald" : asset.health > 60 ? "amber" : "rose"}
        />
        <StatCard
          title="Mean Time Between Failures"
          value={`${asset.mtbf}`}
          unit="hrs"
          trend={{ value: "342h MTBF", isPositive: true, text: "reliability score" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Mean Time to Repair"
          value={`${asset.mttr}`}
          unit="hrs"
          trend={{ value: "1.4h MTTR", isPositive: true, text: "avg fix time" }}
          icon={Wrench}
          colorVariant="blue"
        />
        <StatCard
          title="Repeat Failures"
          value={`${asset.recentFailuresCount}`}
          unit="events"
          trend={{ value: asset.recentFailuresCount > 2 ? "High Alert" : "Normal", isPositive: asset.recentFailuresCount <= 2, text: "spindle fatigue" }}
          icon={AlertTriangle}
          colorVariant={asset.recentFailuresCount > 2 ? "rose" : "emerald"}
          onClick={() => navigate("/maintenance/repeat-failures")}
        />
      </div>

      {/* Navigation Tabs */}
      <Card style={{ padding: "0 16px" }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </Card>

      {/* TAB CONTENT: Overview & Telemetry */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Live Telemetry Sensors Grid */}
          <div className="grid-4">
            <Card style={{ borderLeft: "3px solid #38BDF8" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Spindle Vibration
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value" style={{ color: asset.vibration > 3.0 ? "#EF4444" : "var(--text-primary)" }}>
                  {asset.vibration}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>mm/s RMS</span>
              </div>
              <div style={{ fontSize: "11px", color: asset.vibration > 3.0 ? "#F87171" : "#34D399" }}>
                {asset.vibration > 3.0 ? "Threshold Exceeded (>3.0)" : "Within ISO 10816 Limit"}
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #F59E0B" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Drive Temperature
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value">{asset.temperature}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>°C</span>
              </div>
              <div style={{ fontSize: "11px", color: "#34D399" }}>
                Normal thermal band (&lt; 75°C)
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #10B981" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Oil Lubrication Level
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value">{asset.oilLevel}%</span>
              </div>
              <div style={{ fontSize: "11px", color: "#34D399" }}>
                Mobil Polyrex 462 Auto-Lube OK
              </div>
            </Card>

            <Card style={{ borderLeft: "3px solid #6366F1" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Header Pressure
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "8px 0" }}>
                <span className="stat-value">{asset.pressure}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>bar</span>
              </div>
              <div style={{ fontSize: "11px", color: "#34D399" }}>
                Target: 6.0 ± 0.3 bar
              </div>
            </Card>
          </div>

          {/* Telemetry Trend Chart */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  24-Hour Continuous Vibration Spectral Trend
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Peak FFT accelerometer stream recording velocity RMS
                </p>
              </div>
              <Badge variant="rose">Anomaly Alert Triggered at 08:15</Badge>
            </div>

            <AreaChart
              data={[
                { label: "00:00", value: 1.2 },
                { label: "03:00", value: 1.4 },
                { label: "06:00", value: 2.1 },
                { label: "08:00", value: 4.8 }, // Spike
                { label: "09:00", value: 4.6 },
                { label: "10:00", value: 2.4 },
                { label: "12:00", value: 2.1 },
                { label: "14:00", value: 1.8 }
              ]}
              height={200}
              color="#EF4444"
              unit=" mm/s"
            />
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Work Orders */}
      {activeTab === "work-orders" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Work Orders Linked to {asset.id}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Corrective, preventive, and emergency work history
              </p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsQuickActionOpen(true)}>
              New Work Order
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {linkedWOs.map((wo) => (
              <div
                key={wo.id}
                onClick={() => navigate(`/maintenance/work-orders/${wo.id}`)}
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--accent-blue)" }}>
                      {wo.id}
                    </span>
                    <Badge variant={wo.priority.includes("P1") ? "rose" : "amber"}>{wo.priority}</Badge>
                    <Badge variant="slate">{wo.status}</Badge>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {wo.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Tech: {wo.assignedTechnician} • Created: {wo.createdDate}
                  </div>
                </div>

                <Button variant="ghost" size="sm" icon={ExternalLink}>
                  Details
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: PM & Checklists */}
      {activeTab === "pm" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Preventive Maintenance Schedules for {asset.id}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Daily, weekly, monthly, and runtime-triggered checklists
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {linkedPMs.map((pm) => (
              <div
                key={pm.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant="cyan">{pm.frequency}</Badge>
                    <Badge variant={pm.status === "Due Today" ? "amber" : "emerald"}>{pm.status}</Badge>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                    {pm.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Due Next: {pm.dueNext} • Assigned: {pm.assignedTechnician}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={() => navigate(`/maintenance/checklists/${pm.checklistTemplateId}`)}
                >
                  Execute Checklist
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: Spare Parts BOM */}
      {activeTab === "spare-parts" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Spare Parts Bill of Materials (BOM)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Consumables, bearings, seals, and replacement assemblies linked to {asset.id}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/spare-parts")}>
              Spare Parts Inventory
            </Button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Part Name</th>
                  <th>Category</th>
                  <th>In Stock</th>
                  <th>Unit Cost</th>
                  <th>Warehouse Bin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {linkedParts.map((p) => (
                  <tr key={p.partNo}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>{p.partNo}</td>
                    <td style={{ fontWeight: 600, color: "#FFFFFF" }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{p.stock} units</td>
                    <td>${p.unitCost.toFixed(2)}</td>
                    <td>{p.location}</td>
                    <td><Badge variant={p.status === "In Stock" ? "emerald" : "rose"}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: Verified Solutions */}
      {activeTab === "solutions" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Verified Solutions Library for {asset.name}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Proven engineering diagnostic and repair procedures
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/maintenance/verified-solutions")}>
              View All Solutions
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {linkedSolutions.map((sol) => (
              <div
                key={sol.id}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant="emerald">Verified Solution</Badge>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{sol.id}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#34D399", fontWeight: 600 }}>
                    {sol.successfulUsesCount} Successful Uses
                  </span>
                </div>

                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
                  {sol.problemSymptom}
                </h4>

                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  <strong>Root Cause:</strong> {sol.rootCause}
                </p>

                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                  <span>Verified by: <strong style={{ color: "var(--text-primary)" }}>{sol.verifiedBy}</strong></span>
                  <span>Date: {sol.verificationDate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: Documents & Manuals */}
      {activeTab === "documents" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                OEM Manuals, Schematics & SOPs
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Official manufacturer documentation and electrical drawings
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/documents")}>
              Document Center
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    Krones Synchrobloc Technical Manual & Wiring Diagrams (PDF)
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>v1.0 OEM • 28.5 MB • Updated 2021</div>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => addToast("Downloading Krones Technical Schematics (PDF)...")}>
                Download PDF
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

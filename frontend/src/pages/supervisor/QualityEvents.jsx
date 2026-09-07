import React, { useState } from "react";
import { useQuality } from "../../context/QualityContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import {
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  Layers,
  User,
  Clock,
  Plus,
  Activity,
  CheckCircle2,
  AlertOctagon
} from "lucide-react";

export function QualityEvents() {
  const { qualityChecks, addQualityCheck, deviations } = useQuality();
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState("logs"); // "logs" | "holds" | "log-new"
  
  // Form State
  const [batchId, setBatchId] = useState("BAT-2026-0892");
  const [checkType, setCheckType] = useState("In-Process CCP Inspection");
  const [samplePoint, setSamplePoint] = useState("Fill Head #6 Discharge Conveyor");
  const [status, setStatus] = useState("PASS");
  const [brix, setBrix] = useState("11.9");
  const [pH, setPh] = useState("3.72");
  const [temp, setTemp] = useState("90.5");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const check = {
      orderId: "PO-2026-904",
      batchId,
      productName: "Organic Cold-Pressed Orange Juice 500ml",
      checkType,
      samplePoint,
      status,
      inspector: "Supervisor Elena Rostova",
      parameters: [
        { name: "Brix Sugar Content", target: "11.8 ± 0.3 °Bx", actual: `${brix} °Bx`, status: status === "PASS" ? "PASS" : "FAIL" },
        { name: "pH Value", target: "3.65 - 3.85 pH", actual: `${pH} pH`, status: status === "PASS" ? "PASS" : "FAIL" },
        { name: "Pasteurization Temp", target: "88.0°C - 92.0°C", actual: `${temp}°C`, status: status === "PASS" ? "PASS" : "FAIL" }
      ],
      notes: notes || "Standard operator logged quality metrics via supervisor console."
    };

    addQualityCheck(check);
    addToast(`Successfully logged Quality Event ${checkType} for batch ${batchId}.`, "success");
    
    // Reset form
    setNotes("");
    setActiveTab("logs");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Departmental Quality Logs
          </h1>

        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant={activeTab === "logs" ? "primary" : "secondary"}
            icon={ClipboardList}
            onClick={() => setActiveTab("logs")}
          >
            CCP Quality Logs ({qualityChecks.length})
          </Button>
          <Button
            variant={activeTab === "holds" ? "primary" : "secondary"}
            icon={AlertTriangle}
            onClick={() => setActiveTab("holds")}
          >
            Holds & Deviations ({deviations.length})
          </Button>
          <Button
            variant={activeTab === "log-new" ? "primary" : "secondary"}
            icon={Plus}
            onClick={() => setActiveTab("log-new")}
          >
            Log Quality Event
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {qualityChecks.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px" }}>
              <ShieldCheck size={48} color="var(--text-muted)" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ color: "#FFFFFF", fontWeight: 700 }}>No Quality Event Logs Found</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Use the Log Quality Event tab to record CCP audits.</p>
            </Card>
          ) : (
            qualityChecks.map((check) => (
              <Card key={check.id} style={{ display: "flex", flexDirection: "column", gap: "14px", borderLeft: check.status === "PASS" || check.status === "RELEASED" ? "4px solid #10B981" : "4px solid #EF4444" }}>
                {/* Check Summary Line */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>{check.id}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>•</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#38BDF8" }}>{check.checkType}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Product: <strong>{check.productName}</strong> | Batch ID: <code>{check.batchId}</code>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant={check.status === "PASS" || check.status === "RELEASED" ? "emerald" : check.status === "HOLD" ? "amber" : "danger"}>
                      {check.status}
                    </Badge>
                  </div>
                </div>

                {/* Parameters List */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  {check.parameters.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>{p.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: p.status === "PASS" ? "#34D399" : "#F87171" }}>{p.actual}</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Target: {p.target}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Details */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <User size={13} />
                    <span>Auditor: <strong>{check.inspector}</strong></span>
                    <span style={{ margin: "0 4px" }}>|</span>
                    <span>Sample Point: <strong>{check.samplePoint}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={13} />
                    <span>{check.timestamp}</span>
                  </div>
                </div>
                {check.notes && (
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "2px" }}>
                    Notes: "{check.notes}"
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "holds" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {deviations.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px" }}>
              <CheckCircle2 size={48} color="#10B981" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ color: "#FFFFFF", fontWeight: 700 }}>No Quality Holds Registered</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>All product lines and buffering tanks are fully released and cleared.</p>
            </Card>
          ) : (
            deviations.map((dev) => (
              <Card key={dev.id} style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "4px solid #F59E0B" }}>
                {/* Hold Title and severity */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>{dev.id}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>•</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>{dev.severity}</span>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>{dev.title}</h3>
                  </div>
                  <Badge variant="amber">{dev.status}</Badge>
                </div>

                {/* Grid Details */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div style={{ fontSize: "13px" }}>
                    <span style={{ color: "var(--text-secondary)", display: "block" }}>Quarantined Quantity:</span>
                    <strong style={{ color: "#F59E0B", fontSize: "15px" }}>{dev.holdQuantity}</strong>
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <span style={{ color: "var(--text-secondary)", display: "block" }}>Storage Tank / Pallets:</span>
                    <strong style={{ color: "#FFFFFF" }}>{dev.tankOrPallet}</strong>
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <span style={{ color: "var(--text-secondary)", display: "block" }}>Active Lead Investigator:</span>
                    <strong style={{ color: "#FFFFFF" }}>{dev.investigator}</strong>
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <span style={{ color: "var(--text-secondary)", display: "block" }}>Disposition Due:</span>
                    <strong style={{ color: "#38BDF8" }}>{dev.dispositionDueDate}</strong>
                  </div>
                </div>

                {/* Root Cause Analyses */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    <strong style={{ color: "#FFFFFF" }}>Occurrence Cause:</strong> {dev.occurrenceCause}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    <strong style={{ color: "#FFFFFF" }}>Escape Cause:</strong> {dev.escapeCause}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    <strong style={{ color: "#10B981" }}>Authorized Corrective Action Plan:</strong> {dev.correctiveActionSummary}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "log-new" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
              Record New CCP Audit Checklist
            </h3>

            {/* Selection Grid */}
            <div className="grid-2-responsive">
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                  Checklist Type
                </label>
                <select
                  value={checkType}
                  onChange={(e) => setCheckType(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="In-Process CCP Inspection">In-Process CCP Inspection</option>
                  <option value="Incoming Raw Material Check">Incoming Raw Material Check</option>
                  <option value="Pre-Op Sanitation Release">Pre-Op Sanitation Release</option>
                  <option value="Finished Good QA Release">Finished Good QA Release</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                  Formulation Batch Code
                </label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="BAT-2026-0892">BAT-2026-0892 (Orange Juice)</option>
                  <option value="BAT-2026-0890">BAT-2026-0890 (Ginger Lime)</option>
                  <option value="BAT-2026-0885">BAT-2026-0885 (Yuzu Tea)</option>
                </select>
              </div>
            </div>

            <div className="grid-2-responsive">
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                  Sample Point / Location
                </label>
                <input
                  type="text"
                  value={samplePoint}
                  onChange={(e) => setSamplePoint(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                  Status Result
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="PASS">PASS (Operational Release)</option>
                  <option value="HOLD">HOLD (Quarantined Tag)</option>
                </select>
              </div>
            </div>

            {/* Target Parameters */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#38BDF8" }}>Logged Telemetry Parameters</h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Brix Sugar (°Bx)
                  </label>
                  <input
                    type="text"
                    value={brix}
                    onChange={(e) => setBrix(e.target.value)}
                    className="input-field"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    pH Value (pH)
                  </label>
                  <input
                    type="text"
                    value={pH}
                    onChange={(e) => setPh(e.target.value)}
                    className="input-field"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Pasteurizer Temperature (°C)
                  </label>
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="input-field"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                Inspector Remarks & Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                style={{ width: "100%", height: "80px", resize: "none" }}
                placeholder="Log double-seam overlap checks, sanitation swab results, or deviations..."
              />
            </div>

            <Button type="submit" variant="primary" style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}>
              Submit Audit Logs & Clear Release
            </Button>
          </Card>
        </form>
      )}
    </div>
  );
}

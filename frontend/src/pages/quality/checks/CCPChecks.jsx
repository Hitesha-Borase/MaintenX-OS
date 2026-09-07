import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { ShieldCheck, Plus, Search, X, Clock, Thermometer, User, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function CCPChecks() {
  const { addToast } = useApp();

  const [ccps, setCcps] = useState([
    { 
      id: 1, 
      name: "Pasteurizer HTST Critical Limit temperature", 
      target: ">83.1°C", 
      actual: "83.5°C", 
      status: "PASS", 
      time: "14:00",
      date: "2026-09-02",
      operator: "Rajesh Kumar",
      equipment: "Pasteurizer Unit #3 (HTST-03)",
      location: "Line 1 — Processing Area",
      method: "Inline RTD Sensor (Auto-logged)",
      criticalLimit: "≥ 83.1°C for minimum 15 seconds",
      corrective: "N/A — Within limits",
      notes: "Routine hourly CCP verification. Sensor calibration valid until 2026-12-15.",
      batchId: "BAT-2026-0891"
    },
    { 
      id: 2, 
      name: "Metal Detector Check - End of Line", 
      target: "Zero detect", 
      actual: "Pass", 
      status: "PASS", 
      time: "12:30",
      date: "2026-09-02",
      operator: "Amit Sharma",
      equipment: "Metal Detector MD-07 (Safeline)",
      location: "Line 1 — End of Line Packaging",
      method: "Test wand Fe 2.0mm / Non-Fe 2.5mm / SS 3.0mm",
      criticalLimit: "Zero metal contamination above threshold",
      corrective: "N/A — No detection",
      notes: "All 3 test wands passed. Reject mechanism verified operational.",
      batchId: "BAT-2026-0891"
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const handleRecord = (e) => {
    e.preventDefault();
    if (!newVal) return;
    
    const isPass = parseFloat(newVal) > 83.1;
    const now = new Date();
    
    setCcps([
      { 
        id: Date.now(), 
        name: "Pasteurizer HTST Critical Limit temperature", 
        target: ">83.1°C", 
        actual: `${newVal}°C`, 
        status: isPass ? "PASS" : "FAIL",
        time: now.toLocaleTimeString().slice(0, 5),
        date: now.toISOString().split('T')[0],
        operator: "Current User",
        equipment: "Pasteurizer Unit #3 (HTST-03)",
        location: "Line 1 — Processing Area",
        method: "Manual Reading",
        criticalLimit: "≥ 83.1°C for minimum 15 seconds",
        corrective: isPass ? "N/A — Within limits" : "Production halted. Batch held for QA review.",
        notes: isPass ? "Manual CCP verification recorded." : "CRITICAL: Temperature below safety threshold. Immediate corrective action required.",
        batchId: "BAT-2026-0891"
      },
      ...ccps
    ]);
    
    setShowForm(false);
    setNewVal("");
    
    if (isPass) {
      addToast("CCP recorded successfully. Within critical limits.", "success");
    } else {
      addToast("CRITICAL CCP FAILURE! Limit breached.", "error");
    }
  };

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const DetailRow = ({ icon: Icon, label, value, highlight }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--border-subtle, rgba(0,0,0,0.06))" }}>
      <div style={{ padding: "6px", backgroundColor: "rgba(200, 149, 71, 0.08)", borderRadius: "8px", flexShrink: 0 }}>
        <Icon size={16} color="#C89547" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: highlight ? 700 : 500, color: highlight || "var(--text-primary)", marginTop: "2px" }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Critical Control Point (CCP) Checks
          </h1>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>
          Record CCP Check
        </Button>
      </div>
      
      {showForm && (
        <Card style={{ padding: "24px", borderRadius: "16px", backgroundColor: "#f9fafb", border: "1px solid var(--border-color)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>New CCP Record: Pasteurizer HTST</h3>
          <form onSubmit={handleRecord} style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Temperature (°C)</label>
              <input 
                type="number" 
                step="0.1"
                placeholder="e.g. 83.5" 
                value={newVal}
                onChange={e => setNewVal(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                autoFocus
              />
            </div>
            <Button variant="primary" type="submit">Save Record</Button>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </form>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ccps.map((c) => (
          <div key={c.id}>
            <Card 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                padding: "20px",
                borderLeft: `4px solid ${c.status === 'PASS' ? '#10B981' : '#EF4444'}`,
                borderRadius: expandedId === c.id ? "16px 16px 0 0" : undefined
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
                <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                  <ShieldCheck size={24} color="#C89547" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{c.name}</span>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Target: {c.target} | Recorded: <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>{c.actual}</strong> @ {c.time}
                  </span>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Badge variant={c.status === "PASS" ? "emerald" : "destructive"}>{c.status}</Badge>
                <Button variant={expandedId === c.id ? "primary" : "secondary"} size="sm" icon={expandedId === c.id ? X : Search} onClick={() => toggleDetails(c.id)}>
                  {expandedId === c.id ? "Close" : "View Details"}
                </Button>
              </div>
            </Card>

            {expandedId === c.id && (
              <div style={{ 
                backgroundColor: "var(--bg-card, #fff)", 
                border: "1px solid var(--border-color)", 
                borderTop: "none",
                borderRadius: "0 0 16px 16px", 
                padding: "24px",
                animation: "fadeIn 0.2s ease"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0 32px" }}>
                  <DetailRow icon={FileText} label="Batch ID" value={c.batchId} />
                  <DetailRow icon={Clock} label="Date & Time" value={`${c.date} @ ${c.time}`} />
                  <DetailRow icon={User} label="Recorded By" value={c.operator} />
                  <DetailRow icon={Thermometer} label="Equipment" value={c.equipment} />
                  <DetailRow icon={ShieldCheck} label="Location" value={c.location} />
                  <DetailRow icon={Search} label="Verification Method" value={c.method} />
                  <DetailRow icon={AlertTriangle} label="Critical Limit" value={c.criticalLimit} highlight={c.status === "FAIL" ? "#EF4444" : undefined} />
                  <DetailRow icon={Thermometer} label="Actual Reading" value={c.actual} highlight={c.status === "PASS" ? "#10B981" : "#EF4444"} />
                  <DetailRow icon={CheckCircle} label="Result" value={c.status === "PASS" ? "WITHIN LIMITS — Safe to proceed" : "OUT OF LIMITS — Corrective action required"} highlight={c.status === "PASS" ? "#10B981" : "#EF4444"} />
                  <DetailRow icon={FileText} label="Corrective Action" value={c.corrective} />
                </div>
                <div style={{ marginTop: "16px", padding: "14px", backgroundColor: "rgba(200, 149, 71, 0.06)", borderRadius: "10px", border: "1px solid rgba(200, 149, 71, 0.15)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#C89547", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Notes</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.notes}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

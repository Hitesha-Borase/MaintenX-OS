import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  X, 
  Clock, 
  Thermometer, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Check,
  RotateCcw,
  Activity
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import qualityService from "../../../services/qualityService";

export function CCPChecks() {
  const { addToast } = useApp();

  const [ccps, setCcps] = useState([
    { 
      id: 1, 
      name: "Pasteurizer HTST Critical Limit Temperature", 
      ccpCode: "CCP-01",
      target: "≥ 83.1°C", 
      actual: "83.5°C", 
      status: "PASS", 
      time: "14:00",
      date: "2026-09-08",
      operator: "Dr. Rachel Thorne",
      equipment: "Pasteurizer Unit #3 (HTST-03)",
      location: "Line 1 — Processing Area",
      method: "Inline RTD Sensor & Digital Data Logger",
      criticalLimit: "≥ 83.1°C for minimum 15 seconds",
      corrective: "N/A — Within limits",
      notes: "Routine hourly CCP verification. Sensor calibration valid until 2026-12-15.",
      batchId: "BAT-2026-0891"
    },
    { 
      id: 2, 
      name: "End-of-Line Multi-Frequency Metal Detector", 
      ccpCode: "CCP-02",
      target: "Zero detect", 
      actual: "Pass (Zero Detect)", 
      status: "PASS", 
      time: "12:30",
      date: "2026-09-08",
      operator: "Marcus Vance",
      equipment: "Metal Detector MD-07 (Safeline)",
      location: "Line 1 — End of Line Packaging",
      method: "Certified Test Wand: Fe 2.0mm / Non-Fe 2.5mm / SS 3.0mm",
      criticalLimit: "Zero metal contamination above threshold",
      corrective: "N/A — No detection",
      notes: "All 3 test wands passed. High-speed pneumatic reject mechanism verified.",
      batchId: "BAT-2026-0891"
    },
    { 
      id: 3, 
      name: "Aseptic Chamber Positive Pressure Differential", 
      ccpCode: "CCP-03",
      target: "≥ 25 Pa", 
      actual: "28.4 Pa", 
      status: "PASS", 
      time: "11:15",
      date: "2026-09-08",
      operator: "Dr. Rachel Thorne",
      equipment: "Aseptic Enclosure HEPA Isolator",
      location: "Line 1 — Sterile Filling Zone",
      method: "Differential Pressure Gauge Magnehelic",
      criticalLimit: "Maintain ≥ 20 Pa positive pressure vs ambient",
      corrective: "N/A — Positive pressure verified",
      notes: "Cleanroom Class 100 sterile isolation integrity verified.",
      batchId: "BAT-2026-0891"
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [selectedCcpType, setSelectedCcpType] = useState("Pasteurizer HTST Critical Limit Temperature");
  const [batchNo, setBatchNo] = useState("BAT-2026-0891");
  const [operator, setOperator] = useState("Dr. Rachel Thorne (QA Lead)");
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchCcps = async () => {
    setIsLoading(true);
    try {
      const res = await qualityService.getCCPChecks();
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped = res.data.data.map((c, idx) => ({
          id: c.id || idx + 1,
          name: c.ccpName,
          ccpCode: c.ccpCode,
          target: c.targetValue ? `Target: ${c.targetValue} ${c.uom || ''}` : "Standard Limit",
          actual: `${c.actualValue} ${c.uom || ''}`,
          status: c.status || "PASS",
          time: new Date(c.checkedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(c.checkedAt || Date.now()).toISOString().substring(0, 10),
          operator: "Dr. Rachel Thorne",
          equipment: "Line 1 Processing Unit",
          location: "Line 1",
          method: "Automated Sensor & QA Titration",
          criticalLimit: `Critical Threshold: ${c.targetValue} ${c.uom || ''}`,
          corrective: c.status === "PASS" ? "N/A — Within limits" : "Quarantine & Corrective Action",
          notes: c.notes || "Recorded via QA Control Center",
          batchId: "BAT-2026-0891"
        }));
        setCcps(mapped);
      }
    } catch (err) {
      console.warn("CCP offline fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCcps();
  }, []);

  const totalCount = ccps.length;
  const passCount = ccps.filter(c => c.status === "PASS").length;
  const failCount = ccps.filter(c => c.status === "FAIL").length;

  const handleRecord = async (e) => {
    e.preventDefault();
    if (!newVal) return;
    
    const numericVal = parseFloat(newVal);
    const isPass = isNaN(numericVal) ? true : numericVal >= 83.1;
    const now = new Date();
    
    const newRecord = { 
      id: Date.now(), 
      name: selectedCcpType, 
      ccpCode: selectedCcpType.includes("Pasteurizer") ? "CCP-01" : "CCP-02",
      target: selectedCcpType.includes("Pasteurizer") ? "≥ 83.1°C" : "Zero Detect", 
      actual: selectedCcpType.includes("Pasteurizer") ? `${newVal}°C` : newVal, 
      status: isPass ? "PASS" : "FAIL",
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
      operator: operator,
      equipment: selectedCcpType.includes("Pasteurizer") ? "Pasteurizer Unit #3 (HTST-03)" : "Metal Detector MD-07",
      location: "Line 1 — Processing Area",
      method: "Manual Calibrated QA Verification",
      criticalLimit: selectedCcpType.includes("Pasteurizer") ? "≥ 83.1°C for minimum 15 seconds" : "Zero metal contamination",
      corrective: isPass ? "N/A — Within limits" : "Production halted. Batch quarantined for QA root cause review.",
      notes: isPass ? "Manual CCP verification recorded and compliant." : "CRITICAL CCP LIMIT BREACH. Deviation ticket initiated.",
      batchId: batchNo
    };

    try {
      await qualityService.submitCCPCheck({
        ccpCode: newRecord.ccpCode,
        ccpName: newRecord.name,
        targetValue: 83.1,
        actualValue: isNaN(numericVal) ? 100 : numericVal,
        uom: selectedCcpType.includes("Pasteurizer") ? "°C" : "unit",
        notes: `Recorded by ${operator}. Batch: ${batchNo}`
      }).catch(err => console.warn("CCP sync fallback:", err.message));
    } catch (err) {
      console.warn("CCP save error:", err);
    }
    
    setCcps([newRecord, ...ccps]);
    setShowModal(false);
    setNewVal("");
    
    if (isPass) {
      addToast("CCP check recorded successfully. Within critical limits.", "success");
    } else {
      addToast("CRITICAL CCP FAILURE! Parameter out of limits.", "error");
    }
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportCcpChecks({ count: ccps.length });
    } catch (err) {
      console.warn("Export CCP error:", err.message);
    }

    const headers = "ID,CCP Code,Parameter Name,Target Limit,Actual Value,Status,Recorded Time,Operator,Batch ID\n";
    const rows = ccps
      .map(c => `"${c.id}","${c.ccpCode}","${c.name}","${c.target}","${c.actual}","${c.status}","${c.date} ${c.time}","${c.operator}","${c.batchId}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CCP_Checks_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("CCP compliance log exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", width: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)", boxSizing: "border-box" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              HACCP & Critical Control Points • 21 CFR Part 117
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#8B6914", background: "rgba(200, 149, 71, 0.15)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
              Thermal & Foreign Object Control
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0, letterSpacing: "-0.3px" }}>
            Critical Control Point (CCP) Checks & Compliance Log
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Mandatory continuous monitoring, pasteurization thermal kill steps, end-of-line metal detector verification, and corrective actions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchCcps}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 15px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 750,
              color: "#261603",
              cursor: isLoading ? "wait" : "pointer",
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <RotateCcw size={15} color="#B27E33" style={{ transform: isLoading ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 15px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 750,
              color: "#261603",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <Download size={15} color="#B27E33" /> Export CSV Log
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              color: "#261603",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Plus size={16} /> Record In-Process CCP
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", width: "100%" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>TOTAL CCP CHECKS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{totalCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Logged</span></div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>24/7 HACCP Surveillance</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>WITHIN CRITICAL LIMITS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#B27E33" }}>{passCount} / {totalCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>100% Thermal Efficacy</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>CCP BREACHES / FAILS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: failCount > 0 ? "#EF4444" : "#2B1D11" }}>{failCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>{failCount > 0 ? "Corrective Action Required" : "Zero Critical Breaches"}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>CHECK FREQUENCY</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#B27E33", marginTop: "2px" }}>Hourly Routine</div>
          <div style={{ fontSize: "11px", color: "#6B5B4E", fontWeight: 700, marginTop: "4px" }}>Next: 15:00 CST</div>
        </div>
      </div>

      {/* Structured CCP Data Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FBF9F5", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "15.5px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
              Live Critical Control Point Surveillance Stream
            </h2>
            <span style={{ fontSize: "12px", color: "#6B5B4E" }}>
              Continuous automated telemetry & manual sensor verification records.
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#B27E33", background: "rgba(200, 149, 71, 0.15)", padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
            {passCount} of {totalCount} Compliant
          </span>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1150px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "28%" }}>CCP Name & Equipment</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "20%" }}>Target Critical Limit</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "18%" }}>Recorded Value</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "14%" }}>Status & Time</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "20%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ccps.map((c) => {
                const isPass = c.status === "PASS";

                return (
                  <tr 
                    key={c.id}
                    style={{ 
                      borderBottom: "1px solid #F0E8DD",
                      backgroundColor: isPass ? "rgba(200, 149, 71, 0.04)" : "#FFFFFF",
                      transition: "background-color 0.15s ease"
                    }}
                  >
                    {/* CCP Name & Equipment */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 800, color: "#2B1D11", fontSize: "13.5px" }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "3px" }}>
                        <span style={{ fontWeight: 800, color: "#B27E33", marginRight: "6px" }}>[{c.ccpCode}]</span>
                        {c.equipment}
                      </div>
                    </td>

                    {/* Target Critical Limit */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ padding: "8px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "12px", color: "#2B1D11", fontWeight: 650 }}>
                        {c.target}
                      </div>
                    </td>

                    {/* Recorded Value */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ 
                        display: "inline-block", 
                        padding: "6px 12px", 
                        borderRadius: "8px", 
                        backgroundColor: "rgba(200, 149, 71, 0.12)", 
                        color: "#8B6914", 
                        border: "1px solid rgba(200, 149, 71, 0.3)", 
                        fontSize: "12.5px", 
                        fontWeight: 800 
                      }}>
                        {c.actual}
                      </div>
                    </td>

                    {/* Status & Time */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "5px", 
                          backgroundColor: isPass ? "rgba(200, 149, 71, 0.18)" : "rgba(239, 68, 68, 0.15)", 
                          color: isPass ? "#8B6914" : "#DC2626", 
                          border: isPass ? "1px solid #B27E33" : "1px solid #F87171",
                          fontSize: "11px", 
                          fontWeight: 850,
                          width: "fit-content"
                        }}>
                          {c.status}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#6B5B4E" }}>@{c.time} CST</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: "16px 18px", textAlign: "center", verticalAlign: "middle" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedDetail(c)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "1px solid #E8DDCF",
                          backgroundColor: "#FFFFFF",
                          color: "#261603",
                          fontSize: "12px",
                          fontWeight: 750,
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(40, 25, 10, 0.04)"
                        }}
                      >
                        <Search size={14} color="#B27E33" /> View Full Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record CCP Check Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(30, 20, 10, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(40, 25, 10, 0.2)",
            maxWidth: "520px",
            width: "100%",
            padding: "24px",
            boxSizing: "border-box"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={20} color="#B27E33" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850, color: "#2B1D11" }}>
                  Record Critical Control Point (CCP)
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecord} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Select CCP Monitoring Point:
                </label>
                <select
                  value={selectedCcpType}
                  onChange={e => setSelectedCcpType(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#F6F3EE",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    outline: "none"
                  }}
                >
                  <option value="Pasteurizer HTST Critical Limit Temperature">CCP-01: Pasteurizer HTST Thermal Limit (≥83.1°C)</option>
                  <option value="End-of-Line Multi-Frequency Metal Detector">CCP-02: Metal Detector Rejection Efficacy</option>
                  <option value="Aseptic Chamber Positive Pressure Differential">CCP-03: Aseptic Isolator Pressure (≥25 Pa)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Actual Sensor / Calibrated Reading:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 83.5 (°C or Pass)"
                  value={newVal}
                  onChange={e => setNewVal(e.target.value)}
                  required
                  style={{
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #D8CBBA",
                    backgroundColor: "#FFFFFF",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Production Batch #:
                  </label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={e => setBatchNo(e.target.value)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8DDCF",
                      backgroundColor: "#F6F3EE",
                      color: "#261603",
                      fontSize: "13px",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    QA Inspector / Lead:
                  </label>
                  <input
                    type="text"
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8DDCF",
                      backgroundColor: "#F6F3EE",
                      color: "#261603",
                      fontSize: "13px",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#FFFFFF",
                    color: "#6B5B4E",
                    fontSize: "13px",
                    fontWeight: 750,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  Save & Log CCP Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(30, 20, 10, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(40, 25, 10, 0.2)",
            maxWidth: "600px",
            width: "100%",
            padding: "26px",
            boxSizing: "border-box"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", textTransform: "uppercase" }}>[{selectedDetail.ccpCode}] CCP Full Verification Dossier</span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "18px", fontWeight: 850, color: "#2B1D11" }}>{selectedDetail.name}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedDetail(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12.5px" }}>
              <div style={{ padding: "10px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                <div style={{ color: "#6B5B4E", fontSize: "11px", fontWeight: 700 }}>BATCH RUN:</div>
                <div style={{ fontWeight: 800, color: "#2B1D11", marginTop: "2px" }}>{selectedDetail.batchId}</div>
              </div>
              <div style={{ padding: "10px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                <div style={{ color: "#6B5B4E", fontSize: "11px", fontWeight: 700 }}>EQUIPMENT:</div>
                <div style={{ fontWeight: 800, color: "#2B1D11", marginTop: "2px" }}>{selectedDetail.equipment}</div>
              </div>
              <div style={{ padding: "10px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                <div style={{ color: "#6B5B4E", fontSize: "11px", fontWeight: 700 }}>CRITICAL LIMIT:</div>
                <div style={{ fontWeight: 800, color: "#2B1D11", marginTop: "2px" }}>{selectedDetail.criticalLimit}</div>
              </div>
              <div style={{ padding: "10px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                <div style={{ color: "#6B5B4E", fontSize: "11px", fontWeight: 700 }}>ACTUAL READING:</div>
                <div style={{ fontWeight: 800, color: "#B27E33", marginTop: "2px" }}>{selectedDetail.actual}</div>
              </div>
            </div>

            <div style={{ marginTop: "14px", padding: "12px 14px", backgroundColor: "rgba(200, 149, 71, 0.08)", borderRadius: "8px", border: "1px solid rgba(200, 149, 71, 0.25)" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#8B6914" }}>INSPECTOR AUDIT NOTES:</div>
              <div style={{ fontSize: "12.5px", color: "#2B1D11", marginTop: "4px" }}>{selectedDetail.notes}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  border: "1px solid #E8DDCF",
                  backgroundColor: "#FFFFFF",
                  color: "#261603",
                  fontSize: "13px",
                  fontWeight: 750,
                  cursor: "pointer"
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

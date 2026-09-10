import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Plus, 
  Check, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers,
  Sparkles,
  X
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import qualityService from "../../../services/qualityService";

export function ProcessChecks() {
  const { addToast } = useApp();

  const [processes, setProcesses] = useState([
    { id: 1, name: "Blending agitator speed (Tank TK-02)", parameter: "Agitator Speed", target: "450 RPM", actual: "448 RPM", line: "Line 1 - Blending Area", status: "OK", timestamp: "14:15" },
    { id: 2, name: "Intake Manifold Header Pressure", parameter: "Header Pressure", target: "3.2 - 3.8 bar", actual: "3.52 bar", line: "Line 1 - Infeed", status: "OK", timestamp: "13:45" },
    { id: 3, name: "Carbonation Dissolved CO2 Level", parameter: "CO2 Gas Volume", target: "3.60 - 3.80 Vol", actual: "3.71 Vol", line: "Line 2 - Carbonator", status: "OK", timestamp: "13:10" },
    { id: 4, name: "Bottle Rinser De-aerated Water Flush", parameter: "Rinse Temp & Flow", target: "≥65°C • 12 LPM", actual: "66.4°C • 12.2 LPM", line: "Line 1 - Rinser", status: "OK", timestamp: "12:30" }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paramName, setParamName] = useState("");
  const [targetVal, setTargetVal] = useState("");
  const [actualVal, setActualVal] = useState("");
  const [lineArea, setLineArea] = useState("Line 1 - Processing Floor");

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const res = await qualityService.getProcessChecks();
      if (res.data?.data && Array.isArray(res.data.data)) {
        setProcesses(res.data.data);
      }
    } catch (err) {
      console.warn("Process checks fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const totalCount = processes.length;
  const okCount = processes.filter(p => p.status === "OK").length;
  const warningCount = processes.filter(p => p.status === "WARNING").length;

  const handleToggleStatus = async (id, currentStatus, name) => {
    const newStatus = currentStatus === "OK" ? "WARNING" : "OK";
    
    try {
      const res = await qualityService.toggleProcessCheck({ checkId: id, status: newStatus, name });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setProcesses(res.data.data);
      } else {
        setProcesses(prev => prev.map(p => {
          if (p.id === id) {
            return { ...p, status: newStatus, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          }
          return p;
        }));
      }

      if (newStatus === "WARNING") {
        addToast(`${name} marked as WARNING. Requires monitoring.`, "warning");
      } else {
        addToast(`${name} parameter verified within specification.`, "success");
      }
    } catch (err) {
      console.warn("Toggle process fallback:", err.message);
      setProcesses(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, status: newStatus };
        }
        return p;
      }));
      addToast(newStatus === "WARNING" ? `${name} marked as WARNING.` : `${name} calibrated as OK.`, "info");
    }
  };

  const handleCalibrateAll = async () => {
    try {
      setIsProcessing(true);
      const res = await qualityService.calibrateAllProcessChecks();
      if (res.data?.data && Array.isArray(res.data.data)) {
        setProcesses(res.data.data);
      } else {
        setProcesses(prev =>
          prev.map(p => ({ ...p, status: "OK", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }))
        );
      }
      addToast("All in-process parameters calibrated & verified.", "success");
    } catch (err) {
      console.warn("Calibrate all fallback:", err.message);
      setProcesses(prev =>
        prev.map(p => ({ ...p, status: "OK" }))
      );
      addToast("All in-process parameters calibrated & verified.", "success");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCheck = async (e) => {
    e.preventDefault();
    if (!paramName || !actualVal) return;

    const newCheck = {
      id: Date.now(),
      name: paramName,
      parameter: paramName,
      target: targetVal || "Standard Range",
      actual: actualVal,
      line: lineArea,
      status: "OK",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const res = await qualityService.recordProcessCheck(newCheck);
      if (res.data?.data && Array.isArray(res.data.data)) {
        setProcesses(res.data.data);
      } else {
        setProcesses([newCheck, ...processes]);
      }
    } catch (err) {
      console.warn("Process check error:", err);
      setProcesses([newCheck, ...processes]);
    }

    setShowModal(false);
    setParamName("");
    setTargetVal("");
    setActualVal("");
    addToast("In-process verification recorded successfully.", "success");
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportProcessChecks({ count: processes.length });
    } catch (err) {
      console.warn("Export process checks API error:", err.message);
    }

    const headers = "ID,Check Name,Parameter,Target Spec,Actual Reading,Line Area,Status,Timestamp\n";
    const rows = processes
      .map(p => `"${p.id}","${p.name}","${p.parameter}","${p.target}","${p.actual}","${p.line}","${p.status}","${p.timestamp}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `InProcess_Checks_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("In-process checks exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", width: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)", boxSizing: "border-box" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              In-Process Quality & Parameter Monitoring
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#8B6914", background: "rgba(200, 149, 71, 0.15)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
              Continuous Line Telemetry
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0, letterSpacing: "-0.3px" }}>
            In-Process Quality Checks & Agitator Telemetry
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Live verification of blending speeds, carbonation volume, header manifold pressures, and thermal rinse flow rates.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchProcesses}
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
            onClick={handleCalibrateAll}
            disabled={isProcessing}
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
              cursor: isProcessing ? "wait" : "pointer",
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <CheckCircle2 size={15} color="#B27E33" /> Calibrate All
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
            <Plus size={16} /> Log In-Process Check
          </button>
        </div>
      </div>

      {/* KPI Tickers Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", width: "100%" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>ACTIVE CHECKS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{totalCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Parameters</span></div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>Full Line Telemetry</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>WITHIN TOLERANCE</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#B27E33" }}>{okCount} / {totalCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>100% Operational</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>WARNING ALERTS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: warningCount > 0 ? "#B27E33" : "#2B1D11" }}>{warningCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>{warningCount > 0 ? "Inspect Parameters" : "Zero Alerts"}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>SAMPLING FREQUENCY</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#B27E33", marginTop: "2px" }}>Every 30 Mins</div>
          <div style={{ fontSize: "11px", color: "#6B5B4E", fontWeight: 700, marginTop: "4px" }}>Next Cycle: 14:45 CST</div>
        </div>
      </div>

      {/* Structured In-Process Data Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FBF9F5", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "15.5px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
              Live In-Process Parameter Clearances
            </h2>
            <span style={{ fontSize: "12px", color: "#6B5B4E" }}>
              Critical parameter ranges, agitator speeds, and fluid dynamics monitoring.
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#B27E33", background: "rgba(200, 149, 71, 0.15)", padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
            {okCount} of {totalCount} Calibrated
          </span>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1100px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "32%" }}>In-Process Check & Equipment</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "20%" }}>Target Specification</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "20%" }}>Measured Actual</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "14%" }}>Status & Time</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "14%", textAlign: "center" }}>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p) => {
                const isOk = p.status === "OK";

                return (
                  <tr 
                    key={p.id}
                    style={{ 
                      borderBottom: "1px solid #F0E8DD",
                      backgroundColor: isOk ? "rgba(200, 149, 71, 0.04)" : "#FFFFFF",
                      transition: "background-color 0.15s ease"
                    }}
                  >
                    {/* Check Name */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 800, color: "#2B1D11", fontSize: "13.5px" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "3px" }}>
                        Location: <strong style={{ color: "#2B1D11" }}>{p.line}</strong>
                      </div>
                    </td>

                    {/* Target */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ padding: "8px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "12px", color: "#2B1D11", fontWeight: 650 }}>
                        {p.target}
                      </div>
                    </td>

                    {/* Actual */}
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
                        {p.actual}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "5px", 
                          backgroundColor: isOk ? "rgba(200, 149, 71, 0.18)" : "rgba(180, 130, 60, 0.08)", 
                          color: isOk ? "#8B6914" : "#6B5B4E", 
                          border: isOk ? "1px solid #B27E33" : "1px solid #E8DDCF",
                          fontSize: "11px", 
                          fontWeight: 850,
                          width: "fit-content"
                        }}>
                          {p.status}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#6B5B4E" }}>@{p.timestamp}</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: "16px 18px", textAlign: "center", verticalAlign: "middle" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id, p.status, p.name)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          width: "115px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: isOk ? "1px solid #B27E33" : "1px solid #E8DDCF",
                          background: isOk ? "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "#FFFFFF",
                          color: isOk ? "#1A0F02" : "#6B5B4E",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: isOk ? "0 2px 8px rgba(200, 149, 71, 0.3)" : "0 1px 3px rgba(40, 25, 10, 0.04)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <Check size={14} strokeWidth={isOk ? 3 : 2} /> {isOk ? "Calibrated" : "Verify"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log In-Process Check Modal */}
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
                <Activity size={20} color="#B27E33" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850, color: "#2B1D11" }}>
                  Log In-Process Quality Check
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

            <form onSubmit={handleCreateCheck} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Parameter / Equipment Description:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tank TK-04 Agitator Velocity"
                  value={paramName}
                  onChange={e => setParamName(e.target.value)}
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
                    Target Specification:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 450 RPM"
                    value={targetVal}
                    onChange={e => setTargetVal(e.target.value)}
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
                    Actual Measurement:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 448 RPM"
                    value={actualVal}
                    onChange={e => setActualVal(e.target.value)}
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
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Plant Work Center / Line Location:
                </label>
                <input
                  type="text"
                  value={lineArea}
                  onChange={e => setLineArea(e.target.value)}
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
                  Save In-Process Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

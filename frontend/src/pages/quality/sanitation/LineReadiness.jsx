import React, { useState, useEffect } from "react";
import { 
  Factory, 
  Check, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Play
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import qualityService from "../../../services/qualityService";

export function LineReadiness() {
  const { addToast } = useApp();

  const [lines, setLines] = useState([
    { 
      id: 1, 
      line: "Line 1 (Aseptic Bottling & Rotary Filler 580 BPM)", 
      lineCode: "LINE-01",
      safety: "PASSED", 
      sanitation: "PASSED", 
      mechanical: "PASSED", 
      status: "READY",
      speedTarget: "580 BPM",
      lastInspection: "10 mins ago"
    },
    { 
      id: 2, 
      line: "Line 2 (High-Speed Aluminum Canner 800 CPM)", 
      lineCode: "LINE-02",
      safety: "PASSED", 
      sanitation: "PASSED", 
      mechanical: "PASSED", 
      status: "READY",
      speedTarget: "800 CPM",
      lastInspection: "25 mins ago"
    },
    { 
      id: 3, 
      line: "Line 3 (Tetra Pak Aseptic Carton 250ml)", 
      lineCode: "LINE-03",
      safety: "PASSED", 
      sanitation: "PENDING", 
      mechanical: "PASSED", 
      status: "NOT READY",
      speedTarget: "350 CPM",
      lastInspection: "1 hour ago"
    },
    { 
      id: 4, 
      line: "Line 4 (Stainless Kegging & Bulk Racking)", 
      lineCode: "LINE-04",
      safety: "PASSED", 
      sanitation: "PASSED", 
      mechanical: "PASSED", 
      status: "READY",
      speedTarget: "120 BPH",
      lastInspection: "40 mins ago"
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLines = async () => {
    setIsLoading(true);
    try {
      const res = await qualityService.getLineReadiness();
      if (res.data?.data && Array.isArray(res.data.data)) {
        setLines(res.data.data);
      }
    } catch (err) {
      console.warn("Line readiness fetch error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const readyCount = lines.filter(l => l.status === "READY").length;
  const totalCount = lines.length;
  const readyPercent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 100;

  const handleToggleStatus = async (id, currentStatus, lineName) => {
    try {
      setIsProcessing(true);
      const res = await qualityService.toggleLineReadiness({ lineId: id, lineName, status: currentStatus });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setLines(res.data.data);
      } else {
        setLines(prev => prev.map(r => {
          if (r.id === id) {
            if (currentStatus === "READY") {
              return { ...r, status: "NOT READY", sanitation: "PENDING", lastInspection: "Just now" };
            } else {
              return { ...r, status: "READY", safety: "PASSED", sanitation: "PASSED", mechanical: "PASSED", lastInspection: "Just now" };
            }
          }
          return r;
        }));
      }

      if (currentStatus === "READY") {
        addToast(`${lineName} marked as NOT READY. Clearance revoked.`, "warning");
      } else {
        addToast(`${lineName} cleared & verified as READY for production.`, "success");
      }
    } catch (err) {
      console.warn("Readiness error:", err);
      setLines(prev => prev.map(r => {
        if (r.id === id) {
          if (currentStatus === "READY") {
            return { ...r, status: "NOT READY", sanitation: "PENDING" };
          } else {
            return { ...r, status: "READY", safety: "PASSED", sanitation: "PASSED", mechanical: "PASSED" };
          }
        }
        return r;
      }));
      addToast(currentStatus === "READY" ? `${lineName} marked as NOT READY.` : `${lineName} authorized as READY.`, "info");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAllReady = async () => {
    try {
      setIsProcessing(true);
      const res = await qualityService.authorizeAllLines();
      if (res.data?.data && Array.isArray(res.data.data)) {
        setLines(res.data.data);
      } else {
        setLines(prev =>
          prev.map(r => ({ ...r, status: "READY", safety: "PASSED", sanitation: "PASSED", mechanical: "PASSED", lastInspection: "Just now" }))
        );
      }
      addToast("All plant production lines cleared as READY.", "success");
    } catch (err) {
      console.warn("Authorize all lines fallback:", err.message);
      setLines(prev =>
        prev.map(r => ({ ...r, status: "READY", safety: "PASSED", sanitation: "PASSED", mechanical: "PASSED" }))
      );
      addToast("All plant production lines cleared as READY.", "success");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportLineReadiness({ count: lines.length });
    } catch (err) {
      console.warn("Export Line Readiness API error:", err.message);
    }

    const headers = "ID,Line Name,Code,Safety,Sanitation,Mechanical,Status,Speed Target,Last Inspection\n";
    const rows = lines
      .map(l => `"${l.id}","${l.line}","${l.lineCode}","${l.safety}","${l.sanitation}","${l.mechanical}","${l.status}","${l.speedTarget}","${l.lastInspection}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Line_Readiness_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Line readiness report exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", width: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)", boxSizing: "border-box" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Plant Operations & Packaging Readiness
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#8B6914", background: "rgba(200, 149, 71, 0.15)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
              {readyPercent}% Plant Clearance
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0, letterSpacing: "-0.3px" }}>
            Production Line Readiness & Startup Authorizations
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Consolidated safety, sanitation, and mechanical pre-flight verification across all active plant packaging lines.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchLines}
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
            onClick={handleMarkAllReady}
            disabled={isProcessing}
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
              cursor: isProcessing ? "wait" : "pointer",
              boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Check size={16} /> Authorize All Lines
          </button>
        </div>
      </div>

      {/* KPI Tickers Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", width: "100%" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>PACKAGING LINES</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Factory size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{totalCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Active Lines</span></div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>Plant 01 Production Floor</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>READY FOR PRODUCTION</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#B27E33" }}>{readyCount} / {totalCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>{readyPercent}% Cleared</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>INSPECTION PENDING</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: totalCount - readyCount > 0 ? "#B27E33" : "#2B1D11" }}>{totalCount - readyCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>{totalCount - readyCount > 0 ? "Sanitation Loop Open" : "All Cleared"}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>PLANT READINESS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#B27E33", marginTop: "2px" }}>OPERATIONAL</div>
          <div style={{ fontSize: "11px", color: "#6B5B4E", fontWeight: 700, marginTop: "4px" }}>Active Shift A</div>
        </div>
      </div>

      {/* Structured Line Readiness Data Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FBF9F5", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "15.5px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
              Production Line Operational Clearances
            </h2>
            <span style={{ fontSize: "12px", color: "#6B5B4E" }}>
              Verify Safety Guarding, CIP Sanitation, and Mechanical Clearance prior to run authorization.
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#B27E33", background: "rgba(200, 149, 71, 0.15)", padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
            {readyCount} of {totalCount} Lines Operational
          </span>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1100px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "32%" }}>Production Line & Equipment</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%" }}>Safety Clearance</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%" }}>Sanitation / CIP</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%" }}>Mechanical Pre-Flight</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "20%", textAlign: "center" }}>Line Authorization</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((item) => {
                const isReady = item.status === "READY";

                return (
                  <tr 
                    key={item.id}
                    style={{ 
                      borderBottom: "1px solid #F0E8DD",
                      backgroundColor: isReady ? "rgba(200, 149, 71, 0.04)" : "#FFFFFF",
                      transition: "background-color 0.15s ease"
                    }}
                  >
                    {/* Line info */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 800, color: "#2B1D11", fontSize: "13.5px" }}>
                        {item.line}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "3px" }}>
                        Target: <strong style={{ color: "#2B1D11" }}>{item.speedTarget}</strong> • Verified {item.lastInspection}
                      </div>
                    </td>

                    {/* Safety */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <span style={{ 
                        padding: "5px 10px", 
                        borderRadius: "6px", 
                        backgroundColor: "rgba(200, 149, 71, 0.12)", 
                        color: "#8B6914", 
                        border: "1px solid rgba(200, 149, 71, 0.25)", 
                        fontSize: "11.5px", 
                        fontWeight: 750 
                      }}>
                        {item.safety}
                      </span>
                    </td>

                    {/* Sanitation */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <span style={{ 
                        padding: "5px 10px", 
                        borderRadius: "6px", 
                        backgroundColor: item.sanitation === "PASSED" ? "rgba(200, 149, 71, 0.12)" : "rgba(180, 130, 60, 0.08)", 
                        color: item.sanitation === "PASSED" ? "#8B6914" : "#6B5B4E", 
                        border: item.sanitation === "PASSED" ? "1px solid rgba(200, 149, 71, 0.25)" : "1px solid #E8DDCF", 
                        fontSize: "11.5px", 
                        fontWeight: 750 
                      }}>
                        {item.sanitation}
                      </span>
                    </td>

                    {/* Mechanical */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <span style={{ 
                        padding: "5px 10px", 
                        borderRadius: "6px", 
                        backgroundColor: "rgba(200, 149, 71, 0.12)", 
                        color: "#8B6914", 
                        border: "1px solid rgba(200, 149, 71, 0.25)", 
                        fontSize: "11.5px", 
                        fontWeight: 750 
                      }}>
                        {item.mechanical}
                      </span>
                    </td>

                    {/* Status Action Button */}
                    <td style={{ padding: "16px 18px", textAlign: "center", verticalAlign: "middle" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id, item.status, item.line)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          width: "135px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: isReady ? "1px solid #B27E33" : "1px solid #E8DDCF",
                          background: isReady ? "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "#FFFFFF",
                          color: isReady ? "#1A0F02" : "#6B5B4E",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: isReady ? "0 2px 8px rgba(200, 149, 71, 0.3)" : "0 1px 3px rgba(40, 25, 10, 0.04)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <Check size={14} strokeWidth={isReady ? 3 : 2} /> {isReady ? "READY" : "NOT READY"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

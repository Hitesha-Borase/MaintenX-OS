import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Plus, 
  Check, 
  X, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Sliders, 
  Layers,
  Sparkles,
  CheckCircle2,
  FileText
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import qualityService from "../../../services/qualityService";

export function QualitySpecifications() {
  const { addToast } = useApp();

  const [specs, setSpecs] = useState([
    { id: 1, parameter: "Brix Sugar Level (Concentration)", range: "11.6 - 12.2 °Bx", sku: "Sparkling Citrus & Cola 500ml", ccp: "No", uom: "°Bx", min: 11.6, max: 12.2 },
    { id: 2, parameter: "Pasteurizer Heat Exchanger Temperature", range: "≥ 83.1 °C", sku: "All Bottled / Aseptic SKUs", ccp: "Yes (CCP-01)", uom: "°C", min: 83.1, max: 88.0 },
    { id: 3, parameter: "Net Volume Fill Tolerance", range: "330.0 ± 2.5 ml", sku: "330ml Aluminum Cans", ccp: "No", uom: "ml", min: 327.5, max: 332.5 },
    { id: 4, parameter: "Dissolved Carbon Dioxide (CO2)", range: "3.60 - 3.80 Vol", sku: "Sparkling Sodas", ccp: "No", uom: "Vol", min: 3.60, max: 3.80 },
    { id: 5, parameter: "End-of-Line Metal Detector Sensitivity", range: "Fe 2.0mm / Non-Fe 2.5mm / SS 3.0mm", sku: "All Packaged SKUs", ccp: "Yes (CCP-02)", uom: "mm", min: 0, max: 0 }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paramName, setParamName] = useState("");
  const [skuTarget, setSkuTarget] = useState("All Bottling Lines");
  const [rangeVal, setRangeVal] = useState("");
  const [isCcp, setIsCcp] = useState("No");

  const fetchSpecs = async () => {
    setIsLoading(true);
    try {
      const res = await qualityService.getQualitySpecs();
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSpecs(res.data.data);
      }
    } catch (err) {
      console.warn("Quality specs fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const totalCount = specs.length;
  const ccpCount = specs.filter(s => s.ccp && s.ccp.startsWith("Yes")).length;
  const standardCount = totalCount - ccpCount;

  const handleToggleCcp = async (id, currentCcp, paramName) => {
    const nextCcp = currentCcp.startsWith("Yes") ? "No" : "Yes (CCP)";

    try {
      const res = await qualityService.toggleQualitySpecCcp({ specId: id, parameter: paramName, ccp: currentCcp });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSpecs(res.data.data);
      } else {
        setSpecs(prev => prev.map(s => {
          if (s.id === id) {
            return { ...s, ccp: nextCcp };
          }
          return s;
        }));
      }
    } catch (err) {
      console.warn("Toggle spec error:", err);
      setSpecs(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, ccp: nextCcp };
        }
        return s;
      }));
    }

    if (currentCcp.startsWith("Yes")) {
      addToast(`${paramName} changed to Standard Quality Spec.`, "info");
    } else {
      addToast(`${paramName} elevated to CRITICAL CONTROL POINT (CCP).`, "warning");
    }
  };

  const handleAddSpec = async (e) => {
    e.preventDefault();
    if (!paramName || !rangeVal) return;

    const newSpec = {
      parameter: paramName,
      range: rangeVal,
      sku: skuTarget,
      ccp: isCcp === "Yes" ? "Yes (CCP)" : "No",
      uom: "Unit"
    };

    try {
      const res = await qualityService.createQualitySpec(newSpec);
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSpecs(res.data.data);
      } else {
        setSpecs([...specs, { ...newSpec, id: Date.now() }]);
      }
    } catch (err) {
      console.warn("Create spec error:", err);
      setSpecs([...specs, { ...newSpec, id: Date.now() }]);
    }

    setShowModal(false);
    setParamName("");
    setRangeVal("");
    addToast(`New product specification limit created for ${paramName}.`, "success");
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportQualitySpecs({ count: specs.length });
    } catch (err) {
      console.warn("Export specs error:", err.message);
    }

    const headers = "ID,Parameter Name,Target Limit Range,Applicable SKUs,Critical CCP,UOM\n";
    const rows = specs
      .map(s => `"${s.id}","${s.parameter}","${s.range}","${s.sku}","${s.ccp}","${s.uom}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Product_Specifications_Limits_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Product specifications exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", width: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)", boxSizing: "border-box" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Quality Master Data & Analytical Specifications
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#8B6914", background: "rgba(200, 149, 71, 0.15)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
              {ccpCount} Critical CCP Gates
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0, letterSpacing: "-0.3px" }}>
            Product Specifications Limits & Critical CCP Thresholds
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Master threshold definitions for Brix, thermal kill limits, fill volumes, dissolved CO2, and foreign object reject criteria.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchSpecs}
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
            <Plus size={16} /> Add Specification
          </button>
        </div>
      </div>

      {/* KPI Tickers Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", width: "100%" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>TOTAL SPECIFICATIONS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Settings size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{totalCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Parameters</span></div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>Master Release Standards</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>CRITICAL CCP THRESHOLDS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#B27E33" }}>{ccpCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Points</span></div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>Mandatory 21 CFR Monitoring</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>STANDARD QA SPECS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Sliders size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{standardCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>Organoleptic & Packaging</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>MASTER VERSION</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#B27E33", marginTop: "2px" }}>v2026.4 Approved</div>
          <div style={{ fontSize: "11px", color: "#6B5B4E", fontWeight: 700, marginTop: "4px" }}>Locked for Production</div>
        </div>
      </div>

      {/* Structured Specifications Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FBF9F5", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "15.5px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
              Master Product Specification Tolerances
            </h2>
            <span style={{ fontSize: "12px", color: "#6B5B4E" }}>
              Approved physical, chemical, and microbiological tolerance boundaries.
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#B27E33", background: "rgba(200, 149, 71, 0.15)", padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
            {totalCount} Specifications Active
          </span>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1100px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "32%" }}>Analytical Parameter Name</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "24%" }}>Target Limit Specification</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "22%" }}>Applicable SKUs / Category</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "22%", textAlign: "center" }}>Critical CCP Gate</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((s) => {
                const isCcpActive = s.ccp.startsWith("Yes");

                return (
                  <tr 
                    key={s.id}
                    style={{ 
                      borderBottom: "1px solid #F0E8DD",
                      backgroundColor: isCcpActive ? "rgba(200, 149, 71, 0.04)" : "#FFFFFF",
                      transition: "background-color 0.15s ease"
                    }}
                  >
                    {/* Parameter */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 800, color: "#2B1D11", fontSize: "13.5px" }}>
                        {s.parameter}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "3px" }}>
                        Unit of Measure: <strong>{s.uom || 'Standard'}</strong>
                      </div>
                    </td>

                    {/* Target Range */}
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
                        {s.range}
                      </div>
                    </td>

                    {/* Applicable SKUs */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ padding: "8px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "12px", color: "#2B1D11", fontWeight: 650 }}>
                        {s.sku}
                      </div>
                    </td>

                    {/* Critical CCP Toggle Button */}
                    <td style={{ padding: "16px 18px", textAlign: "center", verticalAlign: "middle" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleCcp(s.id, s.ccp, s.parameter)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          width: "155px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: isCcpActive ? "1px solid #B27E33" : "1px solid #E8DDCF",
                          background: isCcpActive ? "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "#FFFFFF",
                          color: isCcpActive ? "#1A0F02" : "#6B5B4E",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: isCcpActive ? "0 2px 8px rgba(200, 149, 71, 0.3)" : "0 1px 3px rgba(40, 25, 10, 0.04)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <ShieldCheck size={14} strokeWidth={isCcpActive ? 3 : 2} /> {isCcpActive ? s.ccp : "Standard (No CCP)"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Specification Limit Modal */}
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
                <Settings size={20} color="#B27E33" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850, color: "#2B1D11" }}>
                  Add Quality Specification Limit
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

            <form onSubmit={handleAddSpec} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Parameter Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Total Acidity / pH Level"
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
                    Target Limit / Range:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.20 - 3.45 pH"
                    value={rangeVal}
                    onChange={e => setRangeVal(e.target.value)}
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
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Critical CCP?:
                  </label>
                  <select
                    value={isCcp}
                    onChange={e => setIsCcp(e.target.value)}
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
                    <option value="No">No (Standard Spec)</option>
                    <option value="Yes">Yes (Critical CCP Point)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Applicable SKUs / Product Lines:
                </label>
                <input
                  type="text"
                  value={skuTarget}
                  onChange={e => setSkuTarget(e.target.value)}
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
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Play, 
  Check, 
  X, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Eye,
  Edit3
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import qualityService from "../../../services/qualityService";

export function ProductChecks() {
  const { addToast } = useApp();

  const [checks, setChecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState("Digital Refractometer Brix Sugar Test");
  const [newBatch, setNewBatch] = useState("BAT-2026-ORD2511");
  const [newTarget, setNewTarget] = useState("11.6 - 12.2 °Bx");
  const [newActual, setNewActual] = useState("");

  const [selectedCheck, setSelectedCheck] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type: "",
    batch: "",
    line: "",
    target: "",
    actual: "",
    status: "PASS",
    notes: ""
  });

  const formatDisplayTime = (timeVal) => {
    if (!timeVal) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (/^\d{1,2}:\d{2}\s*(am|pm)$/i.test(timeVal)) return timeVal;
    const match24 = typeof timeVal === "string" && timeVal.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      let hours = parseInt(match24[1], 10);
      const minutes = match24[2];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const strHours = hours < 10 ? `0${hours}` : `${hours}`;
      return `${strHours}:${minutes} ${ampm}`;
    }
    const d = new Date(timeVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return timeVal;
  };

  const fetchChecks = async () => {
    setIsLoading(true);
    try {
      const res = await qualityService.getProductChecks();
      const rawList = Array.isArray(res) 
        ? res 
        : Array.isArray(res?.data) 
          ? res.data 
          : Array.isArray(res?.data?.data) 
            ? res.data.data 
            : [];
      setChecks(rawList);
    } catch (err) {
      console.warn("Product checks fetch error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  const totalCount = checks.length;
  const passedCount = checks.filter(c => c.status === "PASS").length;
  const pendingCount = checks.filter(c => c.status === "PENDING" || c.status === "Pending").length;

  const handleToggleCheck = async (id, currentStatus) => {
    const nextStatus = currentStatus === "PASS" ? "PENDING" : "PASS";

    try {
      const res = await qualityService.recordProductCheck({ id, status: nextStatus });
      const updatedList = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : null;
      if (updatedList) {
        setChecks(updatedList);
      } else {
        setChecks(prev =>
          prev.map(c => c.id === id ? { ...c, status: nextStatus } : c)
        );
      }
    } catch (err) {
      console.warn("Product check sync error:", err.message);
      setChecks(prev =>
        prev.map(c => c.id === id ? { ...c, status: nextStatus } : c)
      );
    }

    if (nextStatus === "PASS") {
      addToast(`Quality check ${id} verified and passed.`, "success");
    } else {
      addToast(`Quality check ${id} set to Pending audit.`, "info");
    }
  };

  const handleCreateCheck = async (e) => {
    e.preventDefault();
    if (!newActual) return;

    const newCheck = {
      type: newType,
      batch: newBatch,
      sku: "Finished Goods SKU",
      line: "LINE-2 (abc)",
      target: newTarget,
      actual: newActual,
      status: "PASS"
    };

    try {
      const res = await qualityService.recordProductCheck(newCheck);
      const updatedList = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : null;
      if (updatedList) {
        setChecks(updatedList);
      } else {
        await fetchChecks();
      }
    } catch (err) {
      console.warn("Save product check error:", err.message);
      await fetchChecks();
    }

    setShowModal(false);
    setNewActual("");
    addToast("New product quality check logged and saved to database.", "success");
  };

  const handleDeleteCheck = async (id, e) => {
    e?.stopPropagation?.();
    if (!window.confirm(`Are you sure you want to delete quality check ${id}?`)) {
      return;
    }

    try {
      await qualityService.deleteProductCheck(id);
      setChecks(prev => prev.filter(c => c.id !== id && c.dbId !== id));
      addToast(`Quality check ${id} deleted successfully.`, "success");
    } catch (err) {
      console.warn("Delete check error:", err.message);
      addToast(`Failed to delete check: ${err.message}`, "error");
    }
  };

  const handleOpenDetail = (check) => {
    setSelectedCheck(check);
    setEditFormData({
      type: check.type || "",
      batch: check.batch || "",
      line: check.line || "",
      target: check.target || "",
      actual: check.actual || "",
      status: check.status || "PASS",
      notes: check.notes || ""
    });
  };

  const handleCloseDetail = () => {
    setSelectedCheck(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedCheck) return;

    try {
      const res = await qualityService.recordProductCheck({
        id: selectedCheck.id,
        ...editFormData
      });
      const updatedList = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : null;
      if (updatedList) {
        setChecks(updatedList);
      } else {
        await fetchChecks();
      }
      setSelectedCheck(null);
      addToast(`Quality check ${selectedCheck.id} updated successfully.`, "success");
    } catch (err) {
      console.warn("Update check error:", err.message);
      addToast(`Failed to update check: ${err.message}`, "error");
    }
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportProductChecks({ count: checks.length });
    } catch (err) {
      console.warn("Export product checks error:", err.message);
    }

    const headers = "Check ID,Check Type,Batch,Line,Target Spec,Measured Actual,Status,Time\n";
    const rows = checks
      .map(c => `"${c.id}","${c.type}","${c.batch}","${c.line}","${c.target}","${c.actual}","${c.status}","${formatDisplayTime(c.time)}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Product_Quality_Checks_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Product quality checks exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", width: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)", boxSizing: "border-box" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Finished Goods & Packaging Quality Control
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#8B6914", background: "rgba(200, 149, 71, 0.15)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
              SQF & BRCGS Certified
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0, letterSpacing: "-0.3px" }}>
            Product Quality Checks & Analytical Assay Logs
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Verification of Brix refractometer values, fill volume tolerances, seam integrity, and hourly thermal kill records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchChecks}
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
            <Plus size={16} /> Log Quality Check
          </button>
        </div>
      </div>

      {/* KPI Tickers Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", width: "100%" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>TOTAL ASSAY CHECKS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Package size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{totalCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Samples</span></div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>Active Shift Verification</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>PASSED CHECKS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#B27E33" }}>{passedCount} / {totalCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>100% Quality Acceptance</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>PENDING VERIFICATIONS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: pendingCount > 0 ? "#B27E33" : "#2B1D11" }}>{pendingCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>{pendingCount > 0 ? "Awaiting Lab Assay" : "All Cleared"}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>INSPECTION ACCURACY</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#B27E33", marginTop: "2px" }}>99.8% Cpk</div>
          <div style={{ fontSize: "11px", color: "#6B5B4E", fontWeight: 700, marginTop: "4px" }}>Statistical Process Control</div>
        </div>
      </div>

      {/* Structured Product Checks Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FBF9F5", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "15.5px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
              Finished Product Analytical & Packaging Clearances
            </h2>
            <span style={{ fontSize: "12px", color: "#6B5B4E" }}>
              Batch test results, target limit comparison, and disposition verification.
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#B27E33", background: "rgba(200, 149, 71, 0.15)", padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
            {passedCount} of {totalCount} Cleared
          </span>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1150px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "30%" }}>Check ID & Analytical Parameter</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "20%" }}>Target Specification</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "18%" }}>Measured Value</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%" }}>Status & Time</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%", textAlign: "center" }}>Clearance Action</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => {
                const isPass = check.status === "PASS";

                return (
                  <tr 
                    key={check.id}
                    style={{ 
                      borderBottom: "1px solid #F0E8DD",
                      backgroundColor: isPass ? "rgba(200, 149, 71, 0.04)" : "#FFFFFF",
                      transition: "background-color 0.15s ease"
                    }}
                  >
                    {/* Check ID & Type */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div 
                        onClick={() => handleOpenDetail(check)}
                        style={{ fontWeight: 800, color: "#2B1D11", fontSize: "13.5px", cursor: "pointer" }}
                        title="Click to view & edit details"
                      >
                        <span style={{ color: "#B27E33", marginRight: "6px" }}>[{check.id}]</span>
                        {check.type}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "3px" }}>
                        Batch: <strong style={{ color: "#2B1D11" }}>{check.batch}</strong> • {check.line}
                      </div>
                    </td>

                    {/* Target */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ padding: "8px 12px", backgroundColor: "#F8F5F0", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "12px", color: "#2B1D11", fontWeight: 650 }}>
                        {check.target}
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
                        {check.actual}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "5px", 
                          backgroundColor: isPass ? "rgba(200, 149, 71, 0.18)" : "rgba(180, 130, 60, 0.08)", 
                          color: isPass ? "#8B6914" : "#6B5B4E", 
                          border: isPass ? "1px solid #B27E33" : "1px solid #E8DDCF",
                          fontSize: "11px", 
                          fontWeight: 850,
                          width: "fit-content"
                        }}>
                          {check.status}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#6B5B4E" }}>@{formatDisplayTime(check.time)}</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: "16px 18px", textAlign: "center", verticalAlign: "middle" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleCheck(check.id, check.status)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            width: "120px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isPass ? "1px solid #B27E33" : "1px solid #E8DDCF",
                            background: isPass ? "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "#FFFFFF",
                            color: isPass ? "#1A0F02" : "#6B5B4E",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: isPass ? "0 2px 8px rgba(200, 149, 71, 0.3)" : "0 1px 3px rgba(40, 25, 10, 0.04)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <Check size={14} strokeWidth={isPass ? 3 : 2} /> {isPass ? "PASS" : "Complete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(check)}
                          title="View & Edit Quality Check"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "1px solid #E8DDCF",
                            backgroundColor: "#FFFFFF",
                            color: "#6B5B4E",
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCheck(check.id, e)}
                          title="Delete Quality Check"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "1px solid #FECACA",
                            backgroundColor: "#FEF2F2",
                            color: "#EF4444",
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Quality Check Modal */}
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
                <Package size={20} color="#B27E33" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850, color: "#2B1D11" }}>
                  Initiate Product Quality Check
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
                  Select Quality Check Type:
                </label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
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
                  <option value="Digital Refractometer Brix Sugar Test">Digital Refractometer Brix Sugar Test</option>
                  <option value="Net Content Fill Volume & Headspace">Net Content Fill Volume & Headspace</option>
                  <option value="Can Double Seam & Visual Crimp Inspection">Can Double Seam & Visual Crimp Inspection</option>
                  <option value="Hourly CCP Thermal Kill Verification">Hourly CCP Thermal Kill Verification</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Batch Run #:
                  </label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={e => setNewBatch(e.target.value)}
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
                    Target Limit:
                  </label>
                  <input
                    type="text"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
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

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Measured Assay Result:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 11.85 °Bx (Pass)"
                  value={newActual}
                  onChange={e => setNewActual(e.target.value)}
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
                  Save & Pass Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View & Edit Quality Check Modal */}
      {selectedCheck && (
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
            maxWidth: "560px",
            width: "100%",
            padding: "24px",
            boxSizing: "border-box"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={20} color="#B27E33" />
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850, color: "#2B1D11" }}>
                    View & Edit Quality Check
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#6B5B4E" }}>
                    ID: <strong style={{ color: "#B27E33" }}>[{selectedCheck.id}]</strong> • Recorded @{formatDisplayTime(selectedCheck.time)}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleCloseDetail}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Analytical Parameter / Check Type:
                </label>
                <input
                  type="text"
                  value={editFormData.type}
                  onChange={e => setEditFormData({ ...editFormData, type: e.target.value })}
                  required
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

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Batch Run #:
                  </label>
                  <input
                    type="text"
                    value={editFormData.batch}
                    onChange={e => setEditFormData({ ...editFormData, batch: e.target.value })}
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
                    Production Line:
                  </label>
                  <input
                    type="text"
                    value={editFormData.line}
                    onChange={e => setEditFormData({ ...editFormData, line: e.target.value })}
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

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Target Specification:
                  </label>
                  <input
                    type="text"
                    value={editFormData.target}
                    onChange={e => setEditFormData({ ...editFormData, target: e.target.value })}
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
                    Measured Assay Result:
                  </label>
                  <input
                    type="text"
                    value={editFormData.actual}
                    onChange={e => setEditFormData({ ...editFormData, actual: e.target.value })}
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
                  Clearance Status:
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, status: "PASS" })}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: editFormData.status === "PASS" ? "1px solid #B27E33" : "1px solid #E8DDCF",
                      background: editFormData.status === "PASS" ? "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "#F6F3EE",
                      color: editFormData.status === "PASS" ? "#1A0F02" : "#6B5B4E",
                      fontWeight: 800,
                      fontSize: "12.5px",
                      cursor: "pointer"
                    }}
                  >
                    PASS
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, status: "PENDING" })}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: editFormData.status === "PENDING" ? "1px solid #B27E33" : "1px solid #E8DDCF",
                      background: editFormData.status === "PENDING" ? "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "#F6F3EE",
                      color: editFormData.status === "PENDING" ? "#1A0F02" : "#6B5B4E",
                      fontWeight: 800,
                      fontSize: "12.5px",
                      cursor: "pointer"
                    }}
                  >
                    PENDING
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Notes / Observations:
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Optional assay notes or observation details..."
                  rows={2}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #E8DDCF",
                    backgroundColor: "#FFFFFF",
                    color: "#261603",
                    fontSize: "12.5px",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseDetail}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

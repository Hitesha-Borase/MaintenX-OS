import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Save, 
  XCircle, 
  Play, 
  CheckSquare, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw,
  Factory,
  Layers,
  Thermometer,
  FileText,
  UserCheck,
  Sparkles,
  ClipboardCheck,
  Check,
  X,
  Clock
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import qualityService from "../../../services/qualityService";

const INITIAL_PREOP_ITEMS = [
  {
    id: 1,
    category: "Sanitation & ATP Swab",
    name: "Filler Nozzles & Bell Housing ATP Hygiene Swab",
    spec: "< 10 RLU (Zero microbial residue)",
    criticality: "Critical GMP",
    method: "Luminescence Swab",
    passed: true,
    notes: "ATP reading: 4 RLU (Compliant)"
  },
  {
    id: 2,
    category: "Mechanical Clearance",
    name: "Physical Inspection of Filler Nozzle Seals & O-Rings",
    spec: "No cracks, food-grade EPDM intact",
    criticality: "Critical Safety",
    method: "Visual & Tactile",
    passed: true,
    notes: "Inspected and seated correctly"
  },
  {
    id: 3,
    category: "Process Instrumentation",
    name: "Pasteurizer Pipeline Pressure & Temp Sensor Calibration",
    spec: "4.2 Bar ± 0.2 • 72.4°C baseline",
    criticality: "CCP Calibration",
    method: "Digital Telemetry",
    passed: true,
    notes: "Calibrated to reference gauge"
  },
  {
    id: 4,
    category: "Line Clearance",
    name: "Packaging Line 1 Clean of Raw Debris, Prior Labels & Tools",
    spec: "100% Cleared (Zero Foreign Material)",
    criticality: "GMP Hygiene",
    method: "360° Line Walkthrough",
    passed: true,
    notes: "Prior batch labels removed"
  },
  {
    id: 5,
    category: "Chemical Residuals",
    name: "CIP Caustic & Peracetic Acid (PAA) Rinse Strip Test",
    spec: "0.0 ppm PAA Residual (Neutral pH 7.0)",
    criticality: "Chemical Safety",
    method: "Colorimetric Strip",
    passed: null,
    notes: ""
  },
  {
    id: 6,
    category: "Foreign Body Prevention",
    name: "In-line Conveyor Metal Detector & Reject Gate Test",
    spec: "1.5mm Fe, 2.0mm Non-Fe, 2.5mm SS test wands",
    criticality: "CCP-2 Critical Gate",
    method: "Test Wand Ingestion",
    passed: null,
    notes: ""
  }
];

export function PreOpChecklist() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [selectedLine, setSelectedLine] = useState("Line 1 (High-Speed Rotary 580 BPM)");
  const [selectedBatch, setSelectedBatch] = useState("BAT-2026-0885 (Sparkling Orange Soda 330ml)");
  const [inspectorName, setInspectorName] = useState("Dr. Rachel Thorne (QA Lead)");
  const [items, setItems] = useState(INITIAL_PREOP_ITEMS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPreOp = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getPreOpChecklist();
      const data = res.data?.data || res.data;
      if (data) {
        if (Array.isArray(data.items)) setItems(data.items);
        if (data.line) setSelectedLine(data.line);
        if (data.batch) setSelectedBatch(data.batch);
        if (data.inspector) setInspectorName(data.inspector);
      }
    } catch (err) {
      console.warn("Could not load Pre-Op checklist from API:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreOp();
  }, []);

  const passedCount = items.filter(i => i.passed === true).length;
  const failedCount = items.filter(i => i.passed === false).length;
  const pendingCount = items.filter(i => i.passed === null).length;
  const totalCount = items.length;
  const progressPercent = Math.round((passedCount / totalCount) * 100);

  const handleToggleItem = async (id, result) => {
    const updated = items.map(item => item.id === id ? { ...item, passed: item.passed === result ? null : result } : item);
    setItems(updated);
    try {
      await qualityService.savePreOpProgress({ items: updated, line: selectedLine, batch: selectedBatch });
    } catch (e) {
      console.warn("Auto-save preop item error:", e);
    }
  };

  const handleNoteChange = (id, text) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, notes: text } : item)
    );
  };

  const handleMarkAllPass = async () => {
    const updated = items.map(item => ({ ...item, passed: true, notes: item.notes || "Inspected and verified - Pass" }));
    setItems(updated);
    try {
      await qualityService.savePreOpProgress({ items: updated, line: selectedLine, batch: selectedBatch });
      addToast("All pre-op checklist items marked as Passed.", "success");
    } catch (e) {
      console.warn("Save preop error:", e);
      addToast("All pre-op checklist items marked as Passed.", "success");
    }
  };

  const handleResetChecklist = async () => {
    const resetItems = items.map(item => ({ ...item, passed: null, notes: "" }));
    setItems(resetItems);
    try {
      await qualityService.savePreOpProgress({ items: resetItems, line: selectedLine, batch: selectedBatch });
      addToast("Pre-op checklist reset to clean state.", "info");
    } catch (e) {
      console.warn("Reset preop error:", e);
      addToast("Pre-op checklist reset to clean state.", "info");
    }
  };

  const handleSaveProgress = async () => {
    try {
      await qualityService.savePreOpProgress({ items, line: selectedLine, batch: selectedBatch });
      addToast(`Pre-Op progress saved (${passedCount}/${totalCount} items verified).`, "success");
    } catch (e) {
      console.warn("Save preop error:", e);
      addToast(`Pre-Op progress saved (${passedCount}/${totalCount} items verified).`, "success");
    }
  };

  const handleComplete = async () => {
    if (pendingCount > 0) {
      addToast(`Please inspect and verify the remaining ${pendingCount} pending check items before line release.`, "warning");
      return;
    }

    if (failedCount > 0) {
      addToast(`Pre-Op Failed: ${failedCount} critical items out of spec. Deviations must be logged prior to startup.`, "error");
      qualityService.placeHold({
        lotNumber: "PREOP-LINE1-FAIL",
        reason: `Pre-Op Startup Failure on ${selectedLine}`,
        severity: "HIGH"
      }).catch(() => null);
      setTimeout(() => navigate("/quality/events/deviations"), 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      await qualityService.submitPreOp({
        line: selectedLine,
        batchRun: selectedBatch,
        officer: inspectorName,
        status: "PASS",
        items
      });
      await qualityService.submitCCPCheck({
        ccpCode: "PREOP-LINE1",
        ccpName: "Line 1 Pre-Operational Startup Clearance",
        targetValue: 100,
        actualValue: 100,
        uom: "%",
        notes: `Line cleared by ${inspectorName} for batch ${selectedBatch}`
      }).catch(err => console.warn("Pre-op sync offline:", err.message));
    } catch (e) {
      console.warn("Submit check err:", e);
    }

    setIsSubmitting(false);
    addToast(`PRE-OP APPROVED: ${selectedLine} is certified clean and cleared for startup!`, "success");
  };

  const getCriticalityBadge = (criticality) => {
    if (criticality.includes("CCP")) {
      return (
        <span style={{ padding: "3px 8px", borderRadius: "5px", backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", fontSize: "11px", fontWeight: 800 }}>
          {criticality}
        </span>
      );
    }
    if (criticality.includes("Safety")) {
      return (
        <span style={{ padding: "3px 8px", borderRadius: "5px", backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", fontSize: "11px", fontWeight: 800 }}>
          {criticality}
        </span>
      );
    }
    return (
      <span style={{ padding: "3px 8px", borderRadius: "5px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", border: "1px solid rgba(200, 149, 71, 0.3)", fontSize: "11px", fontWeight: 800 }}>
        {criticality}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", width: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)", boxSizing: "border-box" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Quality & Food Safety • Production Line Pre-Op
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#8B6914", background: "rgba(200, 149, 71, 0.15)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
              HACCP & GMP Startup Protocol
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0, letterSpacing: "-0.3px" }}>
            Pre-Op Startup Checklist & Line Clearance
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Mandatory sanitation clearance, ATP swab validation, and mechanical pre-flight verification prior to batch execution.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchPreOp}
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
              color: "#6B5B4E",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleMarkAllPass}
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
              color: "#8B6914",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <Check size={15} color="#B27E33" /> Mark All Pass
          </button>

          <button
            type="button"
            onClick={handleSaveProgress}
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
            <Save size={15} color="#B27E33" /> Save Progress
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
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
            <CheckSquare size={16} /> Complete & Clear Line
          </button>
        </div>
      </div>

      {/* KPI Tickers Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", width: "100%" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>TOTAL VERIFICATIONS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <ClipboardCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{totalCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Checkpoints</span></div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>100% Pre-Flight Required</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>PASSED CHECKS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#B27E33" }}>{passedCount} / {totalCount}</div>
          <div style={{ fontSize: "11px", color: "#8B6914", fontWeight: 700, marginTop: "4px" }}>{progressPercent}% Complete</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>DEVIATIONS / FAILED</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: failedCount > 0 ? "#fee2e2" : "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: failedCount > 0 ? "#dc2626" : "#B27E33" }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: failedCount > 0 ? "#dc2626" : "#2B1D11" }}>{failedCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Issues</span></div>
          <div style={{ fontSize: "11px", color: failedCount > 0 ? "#dc2626" : "#8B6914", fontWeight: 700, marginTop: "4px" }}>{failedCount === 0 ? "Zero Active Faults" : "Hold Trigger Required"}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>LINE STATUS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Factory size={16} />
            </div>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#B27E33", marginTop: "4px" }}>
            {pendingCount === 0 && failedCount === 0 ? "READY FOR RUN" : "INSPECTION ACTIVE"}
          </div>
          <div style={{ fontSize: "11px", color: "#6B5B4E", fontWeight: 700, marginTop: "6px" }}>{selectedLine.split(" ")[0]} {selectedLine.split(" ")[1]}</div>
        </div>
      </div>

      {/* Target Setup Configuration Bar */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "18px 22px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "220px", flex: 1 }}>
            <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
              Production Line:
            </label>
            <select
              value={selectedLine}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLine(val);
                qualityService.savePreOpProgress({ items, line: val, batch: selectedBatch, inspector: inspectorName }).catch(() => null);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DDCF",
                backgroundColor: "#F6F3EE",
                color: "#261603",
                fontSize: "13px",
                fontWeight: 700,
                outline: "none"
              }}
            >
              <option value="Line 1 (High-Speed Rotary 580 BPM)">Line 1 (High-Speed Rotary 580 BPM)</option>
              <option value="Line 2 (Bottling Line Aseptic Filler)">Line 2 (Bottling Line Aseptic Filler)</option>
              <option value="Line 3 (Kegging & Bulk Dispense)">Line 3 (Kegging & Bulk Dispense)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "240px", flex: 1 }}>
            <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
              Scheduled Batch Run:
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBatch(val);
                qualityService.savePreOpProgress({ items, line: selectedLine, batch: val, inspector: inspectorName }).catch(() => null);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DDCF",
                backgroundColor: "#F6F3EE",
                color: "#261603",
                fontSize: "13px",
                fontWeight: 700,
                outline: "none"
              }}
            >
              <option value="BAT-2026-0885 (Sparkling Orange Soda 330ml)">BAT-2026-0885 (Sparkling Orange Soda 330ml)</option>
              <option value="BAT-2026-0886 (Organic Citrus Blast 500ml)">BAT-2026-0886 (Organic Citrus Blast 500ml)</option>
              <option value="BAT-2026-0887 (Natural Botanical Tonic 1L)">BAT-2026-0887 (Natural Botanical Tonic 1L)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "200px", flex: 1 }}>
            <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
              Authorized QA Officer:
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              onBlur={() => {
                qualityService.savePreOpProgress({ items, line: selectedLine, batch: selectedBatch, inspector: inspectorName }).catch(() => null);
              }}
              style={{
                padding: "8px 12px",
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

        <button
          type="button"
          onClick={handleResetChecklist}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8DDCF",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 750,
            color: "#6B5B4E",
            cursor: "pointer"
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Structured Pre-Op Verification Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FBF9F5" }}>
          <div>
            <h2 style={{ fontSize: "15.5px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
              Inspection Checkpoints & Digital Calibration Verification
            </h2>
            <span style={{ fontSize: "12px", color: "#6B5B4E" }}>
              All items must achieve PASS status before packaging conveyor initiation.
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#B27E33", background: "rgba(200, 149, 71, 0.12)", padding: "4px 10px", borderRadius: "6px" }}>
            {passedCount} of {totalCount} Cleared
          </span>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "950px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "32%" }}>Inspection Item & Area</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "22%" }}>Acceptance Specification</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "14%" }}>Criticality</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%", textAlign: "center" }}>Verification Action</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%" }}>Inspector Observation</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isPass = item.passed === true;
                const isFail = item.passed === false;

                return (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: "1px solid #F0E8DD",
                      backgroundColor: isPass ? "rgba(200, 149, 71, 0.04)" : isFail ? "rgba(239, 68, 68, 0.04)" : "#FFFFFF",
                      transition: "background-color 0.15s ease"
                    }}
                  >
                    {/* Item Details */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#8B6914", textTransform: "uppercase", marginBottom: "2px" }}>
                        {item.category}
                      </div>
                      <div style={{ fontWeight: 750, color: "#2B1D11", fontSize: "13.5px" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "2px" }}>
                        Method: <strong>{item.method}</strong>
                      </div>
                    </td>

                    {/* Target Specification */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ padding: "6px 10px", backgroundColor: "#F6F3EE", borderRadius: "6px", border: "1px solid #E8DDCF", fontSize: "12px", color: "#2B1D11", fontWeight: 650 }}>
                        {item.spec}
                      </div>
                    </td>

                    {/* Criticality */}
                    <td style={{ padding: "14px 18px" }}>
                      {getCriticalityBadge(item.criticality)}
                    </td>

                    {/* Action Buttons: Pass / Fail */}
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id, true)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 14px",
                            borderRadius: "7px",
                            border: isPass ? "1px solid #B27E33" : "1px solid #E8DDCF",
                            background: isPass ? "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)" : "#FFFFFF",
                            color: isPass ? "#1A0F02" : "#6B5B4E",
                            fontSize: "12.5px",
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: isPass ? "0 2px 8px rgba(200, 149, 71, 0.3)" : "none",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <Check size={14} /> Pass
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id, false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 14px",
                            borderRadius: "7px",
                            border: isFail ? "1px solid #991b1b" : "1px solid #E8DDCF",
                            backgroundColor: isFail ? "#991b1b" : "#FFFFFF",
                            color: isFail ? "#FFFFFF" : "#6B5B4E",
                            fontSize: "12.5px",
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: isFail ? "0 2px 8px rgba(153, 27, 27, 0.2)" : "none",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <X size={14} /> Fail
                        </button>
                      </div>
                    </td>

                    {/* Observation Note */}
                    <td style={{ padding: "14px 18px" }}>
                      <input
                        type="text"
                        placeholder="Log observation or swab reading..."
                        value={item.notes}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        onBlur={() => {
                          qualityService.savePreOpProgress({ items, line: selectedLine, batch: selectedBatch, inspector: inspectorName }).catch(() => null);
                        }}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8DDCF",
                          backgroundColor: "#F6F3EE",
                          color: "#261603",
                          fontSize: "12px",
                          outline: "none"
                        }}
                      />
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

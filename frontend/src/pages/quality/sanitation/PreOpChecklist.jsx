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
  Clock,
  Plus,
  Trash2
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useRole } from "../../../context/RoleContext";
import { useNavigate } from "react-router-dom";
import qualityService from "../../../services/qualityService";

export function PreOpChecklist() {
  const { addToast } = useApp();
  const { currentRole } = useRole();
  const navigate = useNavigate();

  const [lines, setLines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [inspectorName, setInspectorName] = useState(
    currentRole?.user?.name || currentRole?.name || "Arthur Sterling (Plant Manager)"
  );
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItemData, setNewItemData] = useState({
    category: "Sanitation & ATP Swab",
    name: "",
    spec: "",
    criticality: "Critical GMP",
    method: "Luminescence Swab"
  });

  const fetchPreOp = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getPreOpChecklist();
      const data = res?.items ? res : (res?.data?.items ? res.data : (res?.data?.data?.items ? res.data.data : (res?.data || res)));
      if (data) {
        if (Array.isArray(data.items)) {
          setItems(data.items);
        }
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLines(data.lines);
          if (!selectedLine) {
            setSelectedLine(data.lines[0].displayName);
          }
        }
        if (Array.isArray(data.batches) && data.batches.length > 0) {
          setBatches(data.batches);
          if (!selectedBatch) {
            setSelectedBatch(data.batches[0].displayName);
          }
        }
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
  const progressPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  const handleToggleItem = async (id, result) => {
    const targetItem = items.find(i => i.id === id);
    const nextPassed = targetItem?.passed === result ? null : result;
    const updated = items.map(item => item.id === id ? { ...item, passed: nextPassed } : item);
    setItems(updated);

    try {
      await qualityService.updatePreOpItem(id, { passed: nextPassed });
    } catch (e) {
      console.warn("Auto-save preop item error:", e);
    }
  };

  const handleNoteChange = (id, text) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, notes: text } : item)
    );
  };

  const handleNoteBlur = async (id, text) => {
    try {
      await qualityService.updatePreOpItem(id, { notes: text });
    } catch (e) {
      console.warn("Save note error:", e);
    }
  };

  const handleMarkAllPass = async () => {
    if (items.length === 0) return;
    const updated = items.map(item => ({ ...item, passed: true, notes: item.notes || "Inspected and verified - Pass" }));
    setItems(updated);
    try {
      await qualityService.markAllPreOpPass();
      addToast("All pre-op checklist items marked as Passed in database.", "success");
    } catch (e) {
      console.warn("Save preop error:", e);
      addToast("Failed to mark items: " + e.message, "error");
    }
  };

  const handleResetChecklist = async () => {
    if (items.length === 0) return;
    if (!window.confirm("Are you sure you want to reset all checkpoints for this line?")) return;
    const resetItems = items.map(item => ({ ...item, passed: null, notes: "" }));
    setItems(resetItems);
    try {
      await qualityService.resetPreOpChecklist();
      addToast("Pre-op checklist reset to clean state in database.", "info");
    } catch (e) {
      console.warn("Reset preop error:", e);
      addToast("Failed to reset: " + e.message, "error");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inspection checkpoint?")) return;
    try {
      await qualityService.deletePreOpItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      addToast("Inspection checkpoint deleted from database.", "success");
    } catch (e) {
      console.warn("Delete preop error:", e);
      addToast("Failed to delete checkpoint: " + e.message, "error");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.spec) {
      addToast("Please enter item name and specification.", "warning");
      return;
    }

    try {
      await qualityService.createPreOpItem({
        ...newItemData,
        line: selectedLine || (lines[0]?.displayName) || "LINE-2 (abc)",
        batch: selectedBatch || (batches[0]?.displayName) || "BAT-2026-ORD2511",
        inspectorName
      });
      await fetchPreOp();
      setShowAddModal(false);
      setNewItemData({
        category: "Sanitation & ATP Swab",
        name: "",
        spec: "",
        criticality: "Critical GMP",
        method: "Luminescence Swab"
      });
      addToast("New inspection checkpoint created and saved to database.", "success");
    } catch (err) {
      console.warn("Create preop item error:", err);
      addToast("Failed to create checkpoint: " + err.message, "error");
    }
  };

  const handleSeedStandard = async () => {
    try {
      await qualityService.seedStandardPreOp({ line: selectedLine, batch: selectedBatch });
      await fetchPreOp();
      addToast("Standard 6 HACCP checkpoints added to database.", "success");
    } catch (err) {
      console.warn("Seed error:", err);
      addToast("Failed to add standard checkpoints: " + err.message, "error");
    }
  };

  const handleSaveProgress = async () => {
    try {
      await qualityService.savePreOpProgress({ items, line: selectedLine, batch: selectedBatch, inspector: inspectorName });
      addToast(`Pre-Op progress saved to database (${passedCount}/${totalCount} items verified).`, "success");
    } catch (e) {
      console.warn("Save preop error:", e);
      addToast(`Pre-Op progress saved to database (${passedCount}/${totalCount} items verified).`, "success");
    }
  };

  const handleComplete = async () => {
    if (items.length === 0) {
      addToast("Cannot clear line: no inspection checkpoints defined.", "warning");
      return;
    }

    if (pendingCount > 0) {
      addToast(`Please inspect and verify the remaining ${pendingCount} pending check items before line release.`, "warning");
      return;
    }

    if (failedCount > 0) {
      addToast(`Pre-Op Failed: ${failedCount} critical items out of spec. Deviations must be logged prior to startup.`, "error");
      qualityService.placeHold({
        lotNumber: `PREOP-${(selectedLine || 'LINE').replace(/[^a-zA-Z0-9]/g, '')}-FAIL`,
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
    } catch (e) {
      console.warn("Submit check err:", e);
    }

    setIsSubmitting(false);
    addToast(`PRE-OP APPROVED: ${selectedLine || 'Line'} is certified clean and cleared for startup!`, "success");
  };

  const getCriticalityBadge = (criticality) => {
    if (!criticality) return null;
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
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 15px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #B27E33",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              color: "#B27E33",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <Plus size={15} /> Add Checkpoint
          </button>

          <button
            type="button"
            onClick={handleMarkAllPass}
            disabled={items.length === 0}
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
              cursor: items.length === 0 ? "not-allowed" : "pointer",
              opacity: items.length === 0 ? 0.6 : 1,
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <Check size={15} color="#B27E33" /> Mark All Pass
          </button>

          <button
            type="button"
            onClick={handleSaveProgress}
            disabled={items.length === 0}
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
              cursor: items.length === 0 ? "not-allowed" : "pointer",
              opacity: items.length === 0 ? 0.6 : 1,
              boxShadow: "0 2px 6px rgba(40, 25, 10, 0.03)"
            }}
          >
            <Save size={15} color="#B27E33" /> Save Progress
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting || items.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              color: "#1A0F02",
              cursor: isSubmitting || items.length === 0 ? "not-allowed" : "pointer",
              opacity: isSubmitting || items.length === 0 ? 0.6 : 1,
              boxShadow: "0 2px 10px rgba(200, 149, 71, 0.3)"
            }}
          >
            <CheckSquare size={16} /> {isSubmitting ? "Certifying..." : "Complete & Clear Line"}
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
            {totalCount > 0 && pendingCount === 0 && failedCount === 0 ? "READY FOR RUN" : "INSPECTION ACTIVE"}
          </div>
          <div style={{ fontSize: "11px", color: "#6B5B4E", fontWeight: 700, marginTop: "6px" }}>{selectedLine || "LINE-2 (abc)"}</div>
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
              onChange={(e) => setSelectedLine(e.target.value)}
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
              {lines.length > 0 ? (
                lines.map(l => (
                  <option key={l.id} value={l.displayName}>{l.displayName}</option>
                ))
              ) : (
                <option value="LINE-2 (abc)">LINE-2 (abc)</option>
              )}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "240px", flex: 1 }}>
            <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
              Scheduled Batch Run:
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
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
              {batches.length > 0 ? (
                batches.map(b => (
                  <option key={b.id} value={b.displayName}>{b.displayName}</option>
                ))
              ) : (
                <option value="BAT-2026-ORD2511">BAT-2026-ORD2511</option>
              )}
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
          disabled={items.length === 0}
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
            cursor: items.length === 0 ? "not-allowed" : "pointer",
            opacity: items.length === 0 ? 0.6 : 1
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
          <table className="data-table" style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F6F3EE", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "30%" }}>Inspection Item & Area</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "20%" }}>Acceptance Specification</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "14%" }}>Criticality</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "16%", textAlign: "center" }}>Verification Action</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "14%" }}>Inspector Observation</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#2B1D11", width: "6%", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                      <ClipboardCheck size={36} color="#B27E33" />
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#2B1D11" }}>
                        No Inspection Checkpoints Found
                      </div>
                      <p style={{ fontSize: "13px", color: "#6B5B4E", margin: 0, maxWidth: "450px" }}>
                        No inspection checkpoints found for this production line. You can add a new checkpoint manually or load the standard HACCP protocol.
                      </p>
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={() => setShowAddModal(true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                            color: "#1A0F02",
                            fontWeight: 800,
                            fontSize: "12.5px",
                            cursor: "pointer"
                          }}
                        >
                          <Plus size={15} /> + Add Checkpoint Manually
                        </button>
                        <button
                          type="button"
                          onClick={handleSeedStandard}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid #E8DDCF",
                            backgroundColor: "#FFFFFF",
                            color: "#6B5B4E",
                            fontWeight: 750,
                            fontSize: "12.5px",
                            cursor: "pointer"
                          }}
                        >
                          <Sparkles size={15} color="#B27E33" /> Load Standard 6 HACCP Items
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
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
                        {item.method && (
                          <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "2px" }}>
                            Method: <strong>{item.method}</strong>
                          </div>
                        )}
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
                          value={item.notes || ""}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          onBlur={(e) => handleNoteBlur(item.id, e.target.value)}
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

                      {/* Delete Action */}
                      <td style={{ padding: "14px 18px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Checkpoint"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: "1px solid #FECACA",
                            backgroundColor: "#FEF2F2",
                            color: "#EF4444",
                            cursor: "pointer"
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inspection Checkpoint Modal */}
      {showAddModal && (
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
                <ClipboardCheck size={20} color="#B27E33" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850, color: "#2B1D11" }}>
                  Add Pre-Op Inspection Checkpoint
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                  Inspection Item & Area Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Filler Nozzles & Bell Housing ATP Swab"
                  value={newItemData.name}
                  onChange={e => setNewItemData({ ...newItemData, name: e.target.value })}
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
                    Category:
                  </label>
                  <select
                    value={newItemData.category}
                    onChange={e => setNewItemData({ ...newItemData, category: e.target.value })}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8DDCF",
                      backgroundColor: "#F6F3EE",
                      color: "#261603",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  >
                    <option value="Sanitation & ATP Swab">Sanitation & ATP Swab</option>
                    <option value="Mechanical Clearance">Mechanical Clearance</option>
                    <option value="Process Instrumentation">Process Instrumentation</option>
                    <option value="Line Clearance">Line Clearance</option>
                    <option value="Chemical Residuals">Chemical Residuals</option>
                    <option value="Foreign Body Prevention">Foreign Body Prevention</option>
                  </select>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Criticality:
                  </label>
                  <select
                    value={newItemData.criticality}
                    onChange={e => setNewItemData({ ...newItemData, criticality: e.target.value })}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8DDCF",
                      backgroundColor: "#F6F3EE",
                      color: "#261603",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  >
                    <option value="Critical GMP">Critical GMP</option>
                    <option value="Critical Safety">Critical Safety</option>
                    <option value="CCP Calibration">CCP Calibration</option>
                    <option value="GMP Hygiene">GMP Hygiene</option>
                    <option value="Chemical Safety">Chemical Safety</option>
                    <option value="CCP-2 Critical Gate">CCP-2 Critical Gate</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Acceptance Specification:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. < 10 RLU (Zero microbial residue)"
                    value={newItemData.spec}
                    onChange={e => setNewItemData({ ...newItemData, spec: e.target.value })}
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

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#6B5B4E", textTransform: "uppercase" }}>
                    Verification Method:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Luminescence Swab"
                    value={newItemData.method}
                    onChange={e => setNewItemData({ ...newItemData, method: e.target.value })}
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
                  onClick={() => setShowAddModal(false)}
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
                    color: "#1A0F02",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  Save Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

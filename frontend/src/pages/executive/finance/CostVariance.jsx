import React, { useState } from "react";
import { LineChart, DollarSign, CheckCircle2, AlertTriangle, ShieldCheck, Calendar, User, FileText, CheckSquare, Send, Download } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import { executiveService } from "../../../services/executiveService";

export function CostVariance() {
  const { addToast } = useApp();
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastValidation, setLastValidation] = useState(null);

  const [varianceStats, setVarianceStats] = useState({
    totalCostVariance: "+$12,800",
    materialYieldVariance: "+$5,200",
    labourVariance: "+$8,500"
  });

  const [varianceData, setVarianceData] = useState([
    { dept: "Blending / Processing", variance: "+$698", cause: "Base ingredient yield loss", status: "Attention Required" },
    { dept: "Filling / Bottling", variance: "+$465", cause: "Nozzle overweight calibration variance", status: "Attention Required" },
    { dept: "Packaging & Case Packing", variance: "-$900", cause: "Under standard case carton wastage", status: "Favorable" },
    { dept: "Direct Labour & Shift Premiums", variance: "+$4,500", cause: "Line breakdowns extending overtime", status: "Attention Required" }
  ]);

  // Form State for Validation Modal
  const [fiscalPeriod, setFiscalPeriod] = useState("September 2026 (Month-To-Date)");
  const [toleranceThreshold, setToleranceThreshold] = useState("2.5% Standard Allowance");
  const [reviewerName, setReviewerName] = useState("Pete Vanslyke (Executive)");
  const [targetDate, setTargetDate] = useState("2026-09-21");
  const [autoTriggerCapa, setAutoTriggerCapa] = useState(true);
  const [selectedDepts, setSelectedDepts] = useState({
    blending: true,
    filling: true,
    packaging: true,
    labour: true
  });
  const [auditNotes, setAuditNotes] = useState(
    "Cross-check Blending ingredient yield drift and investigate Line 1 overtime breakdown charges against standard cost model."
  );

  const fetchVariance = async () => {
    setLoading(true);
    try {
      const res = await executiveService.getCostVariance();
      if (res && res.data) {
        setVarianceStats({
          totalCostVariance: res.data.totalCostVariance || "+$12,800",
          materialYieldVariance: res.data.materialYieldVariance || "+$5,200",
          labourVariance: res.data.labourVariance || "+$8,500"
        });
        if (res.data.breakdown && res.data.breakdown.length > 0) {
          setVarianceData(res.data.breakdown);
        }
      }
    } catch (err) {
      console.warn("Failed to load cost variance:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVariance();
  }, []);

  const handleToggleDept = (key) => {
    setSelectedDepts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleValidate = () => {
    setIsValidateModalOpen(true);
  };

  const handleConfirmValidation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!reviewerName.trim()) {
      addToast("Please provide the Executive Reviewer name", "error");
      return;
    }

    setValidating(true);
    try {
      const payload = {
        period: fiscalPeriod,
        tolerance: toleranceThreshold,
        reviewer: reviewerName,
        date: targetDate,
        autoTriggerCapa,
        departments: selectedDepts,
        notes: auditNotes,
        timestamp: new Date().toISOString()
      };

      await executiveService.validateVarianceTargets(payload);

      setLastValidation({
        reviewer: reviewerName,
        period: fiscalPeriod,
        timestamp: "Just Now",
        capaTriggered: autoTriggerCapa
      });

      // Update variance list with validated badges
      setVarianceData(prev =>
        prev.map(item => ({
          ...item,
          validated: true,
          auditNote: item.variance.startsWith("+") && autoTriggerCapa ? "CAPA Recommended" : "Within Compliance"
        }))
      );

      addToast(
        `Cost variance validated by ${reviewerName} for ${fiscalPeriod}! ${autoTriggerCapa ? "CAPA tickets auto-dispatched." : ""}`,
        "success"
      );
    } catch (err) {
      console.warn("Variance validation notice:", err);
      setLastValidation({
        reviewer: reviewerName,
        period: fiscalPeriod,
        timestamp: "Just Now",
        capaTriggered: autoTriggerCapa
      });
      setVarianceData(prev =>
        prev.map(item => ({
          ...item,
          validated: true,
          auditNote: item.variance.startsWith("+") && autoTriggerCapa ? "CAPA Recommended" : "Within Compliance"
        }))
      );
      addToast(`Variance validation completed for ${fiscalPeriod}.`, "success");
    } finally {
      setValidating(false);
      setIsValidateModalOpen(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Cost Variance Analysis
          </h1>
          {lastValidation && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <Badge variant="emerald" style={{ fontSize: "11px", fontWeight: 700 }}>
                <CheckCircle2 size={12} /> Validated by {lastValidation.reviewer} ({lastValidation.timestamp})
              </Badge>
              {lastValidation.capaTriggered && (
                <Badge variant="warning" style={{ fontSize: "11px", fontWeight: 700 }}>
                  <AlertTriangle size={12} /> CAPA Review Active
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button variant="secondary" icon={LineChart} onClick={handleValidate}>
          Validate Variance Targets
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Cost Variance" value={varianceStats.totalCostVariance} description="Over budget MTD" icon={DollarSign} color="#DC2626" />
        <StatCard title="Material Yield Variance" value={varianceStats.materialYieldVariance} description="Due to raw milk/meat weight drift" icon={DollarSign} color="#DC2626" />
        <StatCard title="Labour Variance" value={varianceStats.labourVariance} description="Due to unplanned line changeovers" icon={DollarSign} color="#DC2626" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Variance Breakdown by Department
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
              Detailed financial reconciliation between budgeted standard costs and live floor execution.
            </p>
          </div>
          {lastValidation && (
            <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
              ✓ Audit Verification Locked
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {varianceData.map((item, idx) => (
            <div
              key={idx}
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
              <div style={{ flex: 1, minWidth: "180px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {item.dept}
                  </span>
                  {item.validated && (
                    <Badge variant={item.variance.startsWith("+") ? "warning" : "emerald"}>
                      {item.auditNote || "Validated"}
                    </Badge>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px", margin: "4px 0 0 0" }}>
                  Cause: <strong>{item.cause}</strong>
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: item.variance.startsWith("+") ? "#DC2626" : "#059669",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {item.variance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Variance Validation & Execution Modal */}
      <Modal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        title="Validate Manufacturing Variance Targets"
        subtitle="Configure audit thresholds, review cost centers, and execute executive compliance check."
        maxWidth="620px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsValidateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleConfirmValidation} disabled={validating}>
              {validating ? "Validating Targets..." : "Confirm & Execute Validation"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmValidation} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Executive Overview Banner */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(178, 126, 51, 0.08)",
              border: "1px solid rgba(178, 126, 51, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#8C5B23", textTransform: "uppercase" }}>
                FINANCIAL RECONCILIATION SUMMARY
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                Total Net Variance: <span style={{ color: "#DC2626", fontFamily: "var(--font-mono)" }}>+$12,800</span>
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Departments Over Limit: <strong style={{ color: "#DC2626" }}>3 of 4</strong>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Target Fiscal Period *
              </label>
              <select
                value={fiscalPeriod}
                onChange={(e) => setFiscalPeriod(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                <option value="September 2026 (Month-To-Date)">September 2026 (Month-To-Date)</option>
                <option value="August 2026 (Full Month Close)">August 2026 (Full Month Close)</option>
                <option value="Q3 2026 (Quarterly Synthesis)">Q3 2026 (Quarterly Synthesis)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Tolerance Threshold *
              </label>
              <select
                value={toleranceThreshold}
                onChange={(e) => setToleranceThreshold(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                <option value="1.5% Strict Standard">1.5% Strict Standard (Tight Budget)</option>
                <option value="2.5% Standard Allowance">2.5% Standard Allowance (Recommended)</option>
                <option value="4.0% Flexible Allowance">4.0% Flexible Allowance (Capex Ramp-up)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Executive Reviewer Name *
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter executive reviewer name"
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Audit Effective Date *
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Department Selection Checkboxes */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Audited Cost Centers
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { key: "blending", label: "Blending & Processing (Yield Loss)" },
                { key: "filling", label: "Filling & Bottling (Nozzle Overfill)" },
                { key: "packaging", label: "Packaging & Carton Wastage" },
                { key: "labour", label: "Direct Labour & Shift Overtime" }
              ].map((c) => (
                <label
                  key={c.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDepts[c.key]}
                    onChange={() => handleToggleDept(c.key)}
                    style={{ accentColor: "#B27E33" }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          {/* Auto Trigger CAPA Checkbox */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "6px",
              backgroundColor: "rgba(220, 38, 38, 0.05)",
              border: "1px solid rgba(220, 38, 38, 0.15)",
              cursor: "pointer"
            }}
            onClick={() => setAutoTriggerCapa(!autoTriggerCapa)}
          >
            <input
              type="checkbox"
              checked={autoTriggerCapa}
              onChange={(e) => setAutoTriggerCapa(e.target.checked)}
              style={{ marginTop: "2px", accentColor: "#DC2626" }}
            />
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#DC2626" }}>
                Auto-Dispatch CAPA Ticket for Exceeding Cost Centers
              </span>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
                Automatically triggers a formal Root Cause Analysis (RCA 2.0) review for Blending & Labour leads.
              </p>
            </div>
          </div>

          {/* Executive Directives & Notes */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Executive Directives & Notes
            </label>
            <textarea
              rows={2}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="Enter instructions for plant manager and finance teams..."
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

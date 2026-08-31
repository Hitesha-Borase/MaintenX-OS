import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Wrench,
  ShieldCheck,
  RotateCcw,
  Save,
  Send,
  Camera,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PMExecutionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const templateIdParam = searchParams.get("templateId");
  const assetIdParam = searchParams.get("assetId");

  const {
    checklistTemplates,
    assets,
    completeChecklistExecution,
    handleFailedPMCheck,
    checklistHistory
  } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templateIdParam || checklistTemplates[0]?.id || "CHK-FM-DAILY"
  );
  const [selectedAssetId, setSelectedAssetId] = useState(assetIdParam || "FM-001");
  const [technicianName, setTechnicianName] = useState("Marcus Vance");
  const [notes, setNotes] = useState("");

  const activeTemplate =
    checklistTemplates.find((c) => c.id === selectedTemplateId) || checklistTemplates[0];
  const targetAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  // Checklist items state
  const [itemsState, setItemsState] = useState({});

  useEffect(() => {
    if (activeTemplate?.items) {
      const initial = {};
      activeTemplate.items.forEach((item) => {
        initial[item.id] = {
          status: "Pass",
          value: item.defaultValue || "",
          notes: ""
        };
      });
      setItemsState(initial);
    }
  }, [activeTemplate]);

  const handleStatusChange = (itemId, newStatus) => {
    setItemsState((prev) => ({
      ...prev,
      itemId: { ...prev[itemId], status: newStatus }
    }));
  };

  const handleValueChange = (itemId, val, item) => {
    let status = "Pass";
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      if (item.maxLimit && numVal > item.maxLimit) status = "Fail";
      if (item.minLimit && numVal < item.minLimit) status = "Fail";
    }

    setItemsState((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], value: val, status }
    }));
  };

  const calculateScore = () => {
    if (!activeTemplate?.items) return 100;
    const total = activeTemplate.items.length;
    const passed = Object.values(itemsState).filter((i) => i.status === "Pass").length;
    return Math.round((passed / total) * 100);
  };

  const handleCompleteChecklist = (e) => {
    e.preventDefault();

    const failedItems = activeTemplate.items.filter((item) => {
      const state = itemsState[item.id];
      return state && state.status === "Fail";
    });

    // If failed checks exist, automatically create corrective work orders
    if (failedItems.length > 0) {
      failedItems.forEach((failed) => {
        handleFailedPMCheck({
          assetId: targetAsset.id,
          checklistName: activeTemplate.name,
          checkItemLabel: failed.label,
          actualValue: itemsState[failed.id]?.value || "Failed visual check",
          limitText: failed.limitText || "Standard limit",
          severity: "Critical"
        });
      });
      addToast(
        `PM Execution finished with ${failedItems.length} failed check(s). Corrective Work Order(s) generated!`,
        "warning"
      );
    } else {
      addToast("PM Checklist completed with 100% compliance score!", "success");
    }

    completeChecklistExecution({
      templateId: activeTemplate.id,
      templateName: activeTemplate.name,
      assetId: targetAsset.id,
      assetName: targetAsset.name,
      technician: technicianName,
      hasFailures: failedItems.length > 0,
      score: `${calculateScore()}%`,
      findings: notes || (failedItems.length > 0 ? "Corrective action triggered on failed parameters." : "All parameters within OEM tolerance.")
    });

    navigate("/preventive-maintenance/schedule");
  };

  const score = calculateScore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              PM Checklist Digital Execution
            </h1>
            <Badge variant="cyan">Standardized Verification</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Perform guided preventive inspections, record numeric sensor limits, and trigger automated corrective work orders.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => navigate("/preventive-maintenance/schedule")}>
            View PM Schedule
          </Button>
        </div>
      </div>

      {/* Template & Machine Header Bar */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", alignItems: "center" }}>
          <div>
            <label className="form-label">Select PM Checklist Template</label>
            <select
              className="form-select"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              {checklistTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Target Equipment Machine</label>
            <select
              className="form-select"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.line})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Executing Technician</label>
            <input
              type="text"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Compliance Score</div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: score === 100 ? "#10B981" : score > 75 ? "#F59E0B" : "#EF4444",
                fontFamily: "var(--font-mono)"
              }}
            >
              {score}%
            </div>
          </div>
        </div>
      </Card>

      {/* Checklist Inspection Form */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
              {activeTemplate.name}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Template ID: {activeTemplate.id} | Asset: {targetAsset.name} ({targetAsset.id})
            </span>
          </div>

          <Badge variant="cyan">{activeTemplate.frequency || "Routine PM"}</Badge>
        </div>

        <form onSubmit={handleCompleteChecklist} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeTemplate.items?.map((item, idx) => {
              const currentItemState = itemsState[item.id] || { status: "Pass", value: "" };
              const isPass = currentItemState.status === "Pass";

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: isPass ? "var(--bg-card-subtle)" : "rgba(239, 68, 68, 0.1)",
                    border: isPass ? "1px solid var(--border-subtle)" : "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "var(--bg-surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#38BDF8"
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "#FFFFFF" }}>
                          {item.label}
                        </div>
                        {item.limitText && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Spec / Limit: <span style={{ color: "#F59E0B" }}>{item.limitText}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Numeric Input if type is numeric, else Pass/Fail buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {item.type === "numeric" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <input
                            type="number"
                            step="any"
                            placeholder="Enter value"
                            value={currentItemState.value}
                            onChange={(e) => handleValueChange(item.id, e.target.value, item)}
                            className="form-input"
                            style={{
                              width: "120px",
                              height: "34px",
                              fontFamily: "var(--font-mono)",
                              borderColor: isPass ? "var(--border-subtle)" : "#EF4444"
                            }}
                          />
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.unit}</span>
                        </div>
                      ) : null}

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setItemsState((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], status: "Pass" }
                            }));
                          }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            border: isPass ? "1px solid #10B981" : "1px solid var(--border-subtle)",
                            backgroundColor: isPass ? "rgba(16, 185, 129, 0.2)" : "transparent",
                            color: isPass ? "#10B981" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <CheckCircle2 size={14} />
                          PASS
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setItemsState((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], status: "Fail" }
                            }));
                          }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            border: !isPass ? "1px solid #EF4444" : "1px solid var(--border-subtle)",
                            backgroundColor: !isPass ? "rgba(239, 68, 68, 0.2)" : "transparent",
                            color: !isPass ? "#EF4444" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <XCircle size={14} />
                          FAIL
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Failure Alert on item */}
                  {!isPass && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#EF4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        padding: "6px 10px",
                        borderRadius: "4px"
                      }}
                    >
                      <AlertTriangle size={13} />
                      <span>Check Failed: Out of spec. Automatic Corrective Work Order will be generated upon submit.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Technician Observations & Sign-off Notes */}
          <div>
            <label className="form-label">Technician Final Findings / Sign-off Comments</label>
            <textarea
              rows={3}
              placeholder="Record any wear observations, lubricant amounts applied, or required future overhaul items..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <Button variant="secondary" onClick={() => navigate("/preventive-maintenance/schedule")}>
              Cancel Execution
            </Button>

            <Button variant="primary" icon={Save} type="submit">
              Sign Off & Complete PM Verification
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

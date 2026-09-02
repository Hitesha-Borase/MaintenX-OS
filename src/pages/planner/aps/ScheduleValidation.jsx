import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCw,
  Layers,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ScheduleValidation() {
  const { validateActiveSchedule, schedules = [] } = usePlanning();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(false);

  const handleRunValidation = () => {
    setIsValidating(true);
    addToast("Executing multi-point APS feasibility validation engine...", "info");

    setTimeout(() => {
      setIsValidating(false);
      if (validateActiveSchedule.isPublishable) {
        addToast("All critical feasibility gates passed! Schedule is eligible for publication.", "success");
      } else {
        addToast(`Validation completed with ${validateActiveSchedule.errorCount} blocking errors.`, "error");
      }
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            APS Production Schedule Feasibility & Gate Validation
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={RotateCw}
            onClick={handleRunValidation}
            disabled={isValidating}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            {isValidating ? "Validating..." : "Re-run Validator"}
          </Button>

          {validateActiveSchedule.isPublishable && (
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate("/planner/aps/publish")}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Proceed to Publication
            </Button>
          )}
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Validation Status"
          value={validateActiveSchedule.isPublishable ? "READY TO PUBLISH" : "BLOCKING ERRORS"}
          unit="Publication Gateway"
          icon={ShieldCheck}
          colorVariant={validateActiveSchedule.isPublishable ? "emerald" : "rose"}
        />
        <StatCard
          title="Passed Criteria"
          value={`${validateActiveSchedule.passCount} / ${validateActiveSchedule.checks.length}`}
          unit="Gates Verified"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Warnings (Non-Blocking)"
          value={validateActiveSchedule.warningCount.toString()}
          unit="Requires Acknowledgment"
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Blocking Errors"
          value={validateActiveSchedule.errorCount.toString()}
          unit="Must Resolve Before Publish"
          icon={XCircle}
          colorVariant={validateActiveSchedule.errorCount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Validation Checks List Card */}
      <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Master Feasibility Validation Gates ({validateActiveSchedule.checks.length} Rules)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {validateActiveSchedule.checks.map((c, idx) => {
            const isPass = c.status === "PASS";
            const isWarning = c.status === "WARNING";

            return (
              <div
                key={idx}
                style={{
                  padding: "16px 20px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: isPass
                    ? "1px solid rgba(5, 150, 105, 0.2)"
                    : isWarning
                    ? "1px solid rgba(217, 119, 6, 0.3)"
                    : "1px solid rgba(220, 38, 38, 0.3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: "1 1 320px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: isPass
                        ? "rgba(5, 150, 105, 0.12)"
                        : isWarning
                        ? "rgba(217, 119, 6, 0.12)"
                        : "rgba(220, 38, 38, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {isPass ? (
                      <CheckCircle2 size={20} color="#059669" />
                    ) : isWarning ? (
                      <AlertTriangle size={20} color="#D97706" />
                    ) : (
                      <XCircle size={20} color="#DC2626" />
                    )}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{c.rule}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>({c.type})</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                      {c.message}
                    </div>
                  </div>
                </div>

                <Badge variant={isPass ? "emerald" : isWarning ? "amber" : "rose"}>
                  {c.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

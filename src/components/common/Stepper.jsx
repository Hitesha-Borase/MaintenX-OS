import React from "react";
import { Check } from "lucide-react";

export function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", overflowX: "auto", paddingBottom: "8px" }}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <React.Fragment key={step.id || idx}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: onStepClick ? "pointer" : "default",
                opacity: idx > currentStep ? 0.5 : 1,
                flexShrink: 0
              }}
              onClick={() => onStepClick && onStepClick(idx)}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: isCompleted
                    ? "#10B981"
                    : isCurrent
                    ? "#0284C7"
                    : "#1E293B",
                  color: isCompleted || isCurrent ? "#FFFFFF" : "var(--text-secondary)",
                  border: isCurrent ? "2px solid #38BDF8" : "1px solid var(--border-subtle)",
                  boxShadow: isCurrent ? "0 0 10px rgba(56, 189, 248, 0.4)" : "none"
                }}
              >
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "var(--text-primary)" : "var(--text-secondary)"
                  }}
                >
                  {step.title}
                </span>
                {step.subtitle && (
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    {step.subtitle}
                  </span>
                )}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  backgroundColor: idx < currentStep ? "#10B981" : "var(--border-subtle)",
                  margin: "0 12px",
                  minWidth: "24px"
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

import React, { useState } from "react";
import { LineChart, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function CostVariance() {
  const { addToast } = useApp();
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [validating, setValidating] = useState(false);

  const varianceData = [
    { dept: "Blending / Processing", variance: "+$4,800", cause: "Base ingredient yield loss" },
    { dept: "Filling / Bottling", variance: "+$2,200", cause: "Nozzle overweight calibration variance" },
    { dept: "Packaging & Case Packing", variance: "-$900", cause: "Under standard case carton wastage" },
    { dept: "Direct Labour & Shift Premiums", variance: "+$6,700", cause: "Line breakdowns extending overtime" }
  ];

  const handleValidate = () => {
    setIsValidateModalOpen(true);
  };

  const handleConfirmValidation = () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      addToast("Manufacturing target variance checks executed. CAPA recommended for Labour & Blending departments.", "success");
      setIsValidateModalOpen(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Cost Variance Analysis
        </h1>
        <Button variant="secondary" icon={LineChart} onClick={handleValidate}>
          Validate Variance Targets
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Cost Variance" value="+$12,800" description="Over budget MTD" icon={DollarSign} color="#DC2626" />
        <StatCard title="Material Yield Variance" value="+$5,200" description="Due to raw milk weight drift" icon={DollarSign} color="#DC2626" />
        <StatCard title="Labour Variance" value="+$8,500" description="Due to unplanned line changeovers" icon={DollarSign} color="#DC2626" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Variance Breakdown by Department
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {varianceData.map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.dept}</span>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Cause: {item.cause}</p>
              </div>
              <span style={{ fontSize: "15px", fontWeight: 800, color: item.variance.startsWith("+") ? "#DC2626" : "#059669", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                {item.variance}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Variance Validation Modal */}
      <Modal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        title="Validate Manufacturing Variance Targets"
        subtitle="Run a full variance compliance check against all standard cost targets"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsValidateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmValidation}>
              {validating ? "Validating..." : "Run Variance Check"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Total MTD Variance: <strong style={{ color: "#DC2626", fontFamily: "var(--font-mono)" }}>+$12,800</strong></div>
            <div>Departments Over Target: <strong style={{ color: "#DC2626" }}>3 of 4</strong></div>
            <div>Favorable Variance: <strong style={{ color: "#059669" }}>Packaging (-$900)</strong></div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#D97706", fontSize: "12px" }}>
            <AlertTriangle size={14} />
            <span>Labour & Direct Shift variance of <strong>+$6,700</strong> is the primary driver. CAPA recommended.</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            This validation will cross-check all cost centres against standard targets and flag any department exceeding threshold for CAPA review.
          </p>
        </div>
      </Modal>
    </div>
  );
}

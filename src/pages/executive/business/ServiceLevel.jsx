import React, { useState } from "react";
import { CheckCircle, AlertTriangle, ShieldCheck, Send } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ServiceLevel() {
  const { addToast } = useApp();
  const [isSLAModalOpen, setIsSLAModalOpen] = useState(false);
  const [validating, setValidating] = useState(false);

  const slaData = [
    { customer: "Costco Wholesale", SLA: "98.5%", limit: "98.0%", penaltyExposure: "$0", status: "Compliant" },
    { customer: "Walmart Stores", SLA: "97.4%", limit: "98.0%", penaltyExposure: "$1,200", status: "Warning" },
    { customer: "Target Corp", SLA: "99.1%", limit: "98.0%", penaltyExposure: "$0", status: "Compliant" }
  ];

  const handleValidate = () => {
    setIsSLAModalOpen(true);
  };

  const handleConfirmValidation = () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      addToast("Service Level Agreement compliance checks completed. Walmart flagged for corrective action.", "success");
      setIsSLAModalOpen(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Service Level Compliance
        </h1>
        <Button variant="secondary" icon={CheckCircle} onClick={handleValidate}>
          Validate SLAs
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Overall Service Level" value="98.2%" description="Target SLA: 98.0%" icon={CheckCircle} color="#059669" />
        <StatCard title="Line Fill Rate" value="99.4%" description="Product availability score" icon={CheckCircle} color="#0284C7" />
        <StatCard title="Order Cycle Time" value="2.1 Days" description="From order entry to dock dispatch" icon={CheckCircle} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          SLA Scorecard by Partner
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {slaData.map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.customer}</span>
                <div style={{ display: "flex", gap: "14px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span>SLA Minimum: <strong>{item.limit}</strong></span>
                  <span>Penalty Exposure: <strong style={{ color: item.penaltyExposure !== "$0" ? "#DC2626" : "var(--text-secondary)" }}>{item.penaltyExposure}</strong></span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: item.status === "Compliant" ? "#059669" : "#D97706", fontFamily: "var(--font-mono)" }}>{item.SLA}</span>
                <Badge variant={item.status === "Compliant" ? "emerald" : "warning"}>{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SLA Validation Modal */}
      <Modal
        isOpen={isSLAModalOpen}
        onClose={() => setIsSLAModalOpen(false)}
        title="Validate Service Level Agreements"
        subtitle="Run compliance check across all partner SLA contracts"
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSLAModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={ShieldCheck} onClick={handleConfirmValidation}>
              {validating ? "Validating..." : "Run SLA Compliance Check"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Partners to Validate: <strong>3 Customer Contracts</strong></div>
            <div>Current Overall Level: <strong style={{ color: "#059669" }}>98.2%</strong></div>
            <div style={{ display: "flex", gap: "4px", alignItems: "center", color: "#D97706" }}>
              <AlertTriangle size={14} />
              <span>Walmart Stores at <strong>97.4%</strong> — below 98.0% minimum SLA threshold</span>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            Running this validation will check all active SLA contracts and generate corrective action alerts for any partners below threshold.
          </p>
        </div>
      </Modal>
    </div>
  );
}

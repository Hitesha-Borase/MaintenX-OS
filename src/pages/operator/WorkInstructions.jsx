import React, { useState } from "react";
import { FileText, Printer, CheckCircle, Award, ShieldCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { useProduction } from "../../context/ProductionContext";

export function WorkInstructions() {
  const { productionOrders } = useProduction();
  const { addToast } = useApp();
  const [acknowledged, setAcknowledged] = useState(false);

  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];

  const handleAcknowledge = () => {
    setAcknowledged(true);
    addToast("SOP safety, PPE requirements, and CCP operational controls acknowledged.", "success");
  };

  const steps = [
    { title: "1. Pre-Start Sanitation Guard", text: "Verify that sanitation release tag has been signed by Quality QA. Perform visual sanitisation inspection of the aseptic filler nozzles." },
    { title: "2. Equipment Readiness", text: "Validate Nitrogen flush pressure is at 2.4 Bar. Confirm cap chute and raw bottle feed are fully stocked with SKU raw materials." },
    { title: "3. Inline HMI Controls", text: "Initialize speed dials. Line standard speed is 580 BPM. Do not exceed 600 BPM limit without supervisor authorization." },
    { title: "4. Quality CCP Logging", text: "Log Brix sugar levels and pH measurements every 30 minutes in the Quality Checks tab. Burst limit: 200 kPa." },
    { title: "5. Lot Handoff Procedure", text: "Before shift change, complete production quantities, log active downtime reasons, and clean the line conveyor." }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Work Instructions & Digital SOPs
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print Manual
          </Button>

          {!acknowledged ? (
            <Button variant="success" icon={ShieldCheck} onClick={handleAcknowledge}>
              Acknowledge SOP Clearance
            </Button>
          ) : (
            <Badge variant="emerald">SOP Cleared & Acknowledged</Badge>
          )}
        </div>
      </div>

      <Card style={{ borderLeft: "3px solid #A855F7", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <FileText size={24} color="#A855F7" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
              {activeOrder.workInstructions}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Associated with Active Job: <strong style={{ color: "#0284C7" }}>{activeOrder.orderNumber}</strong> ({activeOrder.productName})
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {steps.map((step, idx) => (
          <Card key={idx} style={{ padding: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
              {step.title}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {step.text}
            </p>
          </Card>
        ))}
      </div>

      <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: acknowledged ? "rgba(16, 185, 129, 0.08)" : "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Award size={20} color={acknowledged ? "#10B981" : "var(--text-muted)"} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: acknowledged ? "#059669" : "var(--text-primary)" }}>
            {acknowledged ? "Instructions & Safety Protocols Acknowledged" : "I have read and agree to follow these manufacturing SOPs."}
          </span>
        </div>

        {!acknowledged ? (
          <Button variant="success" icon={CheckCircle} onClick={handleAcknowledge}>
            Acknowledge
          </Button>
        ) : (
          <Badge variant="emerald">Acknowledged</Badge>
        )}
      </Card>
    </div>
  );
}

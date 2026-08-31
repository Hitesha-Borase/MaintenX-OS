import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ServiceLevel() {
  const { addToast } = useApp();

  const handleValidate = () => {
    addToast("Triggered Service Level Agreement compliance checks.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Service Level Compliance
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Customer service level agreements (SLAs), fill rates, and partner OTIF tracking
          </p>
        </div>
        <Button variant="secondary" icon={CheckCircle} onClick={handleValidate}>
          Validate SLAs
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Overall Service Level" value="98.2%" description="Target SLA: 98.0%" icon={CheckCircle} color="#10B981" />
        <StatCard title="Line Fill Rate" value="99.4%" description="Product availability score" icon={CheckCircle} color="#38BDF8" />
        <StatCard title="Order Cycle Time" value="2.1 Days" description="From order entry to dock dispatch" icon={CheckCircle} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>SLA Scorecard by Partner</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { customer: "Costco Wholesale", SLA: "98.5%", limit: "98.0%", penaltyExposure: "$0", status: "Compliant" },
            { customer: "Walmart Stores", SLA: "97.4%", limit: "98.0%", penaltyExposure: "$1,200", status: "Warning" },
            { customer: "Target Corp", SLA: "99.1%", limit: "98.0%", penaltyExposure: "$0", status: "Compliant" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.customer}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>SLA Minimum: {item.limit}</span>
                  <span>Penalty Exposure: <strong style={{ color: item.penaltyExposure !== "$0" ? "#EF4444" : "var(--text-secondary)" }}>{item.penaltyExposure}</strong></span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: item.status === "Compliant" ? "#10B981" : "#F59E0B" }}>{item.SLA}</span>
                <span style={{ fontSize: "12px", color: item.status === "Compliant" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

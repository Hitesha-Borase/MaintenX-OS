import React from "react";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Quality() {
  const { addToast } = useApp();

  const handleAudit = () => {
    addToast("Triggered QA compliance inspection request.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Enterprise Quality & Compliance
          </h1>

        </div>
        <Button variant="secondary" icon={ShieldCheck} onClick={handleAudit}>
          Trigger QA Audit
        </Button>
      </div>

      <div className="grid-4">
        <StatCard title="First Pass Yield" value="97.9%" description="Target: 98.0%" icon={ShieldCheck} color="#10B981" />
        <StatCard title="Active Quality Holds" value="2 Batches" description="Austin (1), Chicago (1)" icon={ShieldCheck} color="#EF4444" />
        <StatCard title="CCP Excursions MTD" value="0 Events" description="Optimal status" icon={ShieldCheck} color="#38BDF8" />
        <StatCard title="Compliance Rate" value="100%" description="FDA/HACCP target met" icon={ShieldCheck} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Plant Quality Metrics</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { plant: "Austin Main Plant", fpy: "98.5%", holds: 1, ccpEvents: 0, compliance: "100%" },
            { plant: "Chicago East Plant", fpy: "96.2%", holds: 1, ccpEvents: 0, compliance: "100%" },
            { plant: "Boston Logistics Hub", fpy: "99.1%", holds: 0, ccpEvents: 0, compliance: "100%" }
          ].map((item, idx) => (
            <div key={idx} className="mobile-flex-col" style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.plant}</span>
              <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                <span>FPY: <strong style={{ color: "#10B981" }}>{item.fpy}</strong></span>
                <span>Holds: <strong style={{ color: item.holds > 0 ? "#EF4444" : "var(--text-secondary)" }}>{item.holds}</strong></span>
                <span>CCP Excursions: <strong>{item.ccpEvents}</strong></span>
                <span style={{ color: "#38BDF8", fontWeight: 700 }}>Compliance: {item.compliance}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

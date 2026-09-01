import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Package } from "lucide-react";

export function ProductChecks() {
  const products = [
    { name: "Organic Orange Juice Brix Level", target: "11.8 - 12.0 °Bx", actual: "11.9 °Bx", status: "PASS" },
    { name: "Cap induction seal torque check", target: "12 - 18 in-lbs", actual: "14 in-lbs", status: "PASS" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Finished Product Checks
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Monitor brix parameters, ph acidity, and seal torque validation tests
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {products.map((p, idx) => (
          <Card 
            key={idx} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Package size={22} color="#A855F7" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                Target: {p.target} | Recorded: {p.actual}
              </span>
            </div>
            <Badge variant="emerald">{p.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

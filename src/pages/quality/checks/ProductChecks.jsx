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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Finished Product Checks
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor brix parameters, ph acidity, and seal torque validation tests
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {products.map((p, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Package size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{p.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Target: {p.target} | Recorded: {p.actual}
                </span>
              </div>
            </div>
            <Badge variant="emerald">{p.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

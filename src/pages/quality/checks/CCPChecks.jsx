import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShieldCheck } from "lucide-react";

export function CCPChecks() {
  const ccps = [
    { name: "Pasteurizer HTST Critical Limit temperature", target: ">83.1°C", actual: "83.5°C", status: "PASS" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Critical Control Point (CCP) Checks
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Monitor Critical Control Point safety readings against regulatory parameters
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ccps.map((c, idx) => (
          <Card 
            key={idx} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                <ShieldCheck size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{c.name}</span>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Target: {c.target} | Recorded: <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>{c.actual}</strong>
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Badge variant="emerald">{c.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

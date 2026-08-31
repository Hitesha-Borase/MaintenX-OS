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
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Critical Control Point (CCP) Checks
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor Critical Control Point safety readings against regulatory parameters
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ccps.map((c, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={18} color="#10B981" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{c.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Target: {c.target} | Recorded: <strong style={{ color: "#FFFFFF" }}>{c.actual}</strong>
                </span>
              </div>
            </div>
            <Badge variant="emerald">{c.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

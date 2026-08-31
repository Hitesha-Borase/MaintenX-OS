import React from "react";
import { Card } from "../../../components/common/Card";
import { Settings } from "lucide-react";

export function QualitySpecifications() {
  const specs = [
    { parameter: "Brix Sugar Level", range: "11.6 - 12.2 °Bx", ccp: "No" },
    { parameter: "Pasteurizer Heat Exchanger Temperature", range: ">83.1 °C", ccp: "Yes (CCP-01)" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Product Specifications Limits
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Regulate Critical Limits and process specifications for aseptic products
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {specs.map((s, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Settings size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{s.parameter}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Target limit: {s.range}</span>
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Critical CCP: {s.ccp}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

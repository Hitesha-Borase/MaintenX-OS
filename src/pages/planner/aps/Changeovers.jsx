import React from "react";
import { Card } from "../../../components/common/Card";
import { Shuffle } from "lucide-react";

export function Changeovers() {
  const transitions = [
    { from: "SKU-AJ-500ML-ORG", to: "SKU-AJ-1L-ORG", duration: "45 Minutes", standardClean: "Standard Clean & Guides swap" },
    { from: "SKU-AJ-1L-ORG", to: "SKU-AJ-250ML-KIDS", duration: "60 Minutes", standardClean: "Allergen flush & Guide swap" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          SKU Changeover Matrix
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor standard mechanical swap durations for scheduling sequences
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {transitions.map((t, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Shuffle size={18} color="#EF4444" />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t.from} ➔ {t.to}
                </h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {t.standardClean}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 750, color: "#38BDF8" }}>{t.duration}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

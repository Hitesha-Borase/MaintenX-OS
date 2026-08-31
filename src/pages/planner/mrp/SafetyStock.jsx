import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Package } from "lucide-react";

export function SafetyStock() {
  const safety = [
    { part: "Aseptic Glass Bottles 1L", safetyMin: 5000, current: 8500, status: "Secure Buffer" },
    { part: "Orange Cap SKU-CAP-ORG-01", safetyMin: 4000, current: 2500, status: "Below Safety Buffer" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Inventory Safety Buffers
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor on-hand raw stocks against minimum safety buffers to prevent stockouts
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {safety.map((s, idx) => {
          const isLow = s.current < s.safetyMin;
          return (
            <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Package size={18} color={isLow ? "#F59E0B" : "#10B981"} />
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{s.part}</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Minimum Safety Limit: {s.safetyMin.toLocaleString()} | Current Stock: {s.current.toLocaleString()}
                  </span>
                </div>
              </div>
              <Badge variant={isLow ? "warning" : "emerald"}>{s.status}</Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

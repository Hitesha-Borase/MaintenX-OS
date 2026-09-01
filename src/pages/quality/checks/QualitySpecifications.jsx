import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Settings } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function QualitySpecifications() {
  const { addToast } = useApp();

  const [specs, setSpecs] = useState([
    { id: 1, parameter: "Brix Sugar Level", range: "11.6 - 12.2 °Bx", ccp: "No" },
    { id: 2, parameter: "Pasteurizer Heat Exchanger Temperature", range: ">83.1 °C", ccp: "Yes (CCP-01)" }
  ]);

  const handleToggleCcp = (id, currentCcp, paramName) => {
    setSpecs(prev => prev.map(s => {
      if (s.id === id) {
        if (currentCcp === "No") {
          addToast(`${paramName} set to Critical CCP: Yes.`, "warning");
          return { ...s, ccp: "Yes" };
        } else {
          addToast(`${paramName} set to Critical CCP: No.`, "success");
          return { ...s, ccp: "No" };
        }
      }
      return s;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Product Specifications Limits
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Regulate Critical Limits and process specifications for aseptic products
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {specs.map((s) => (
          <Card 
            key={s.id} 
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
                <Settings size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{s.parameter}</span>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Target limit: <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>{s.range}</strong>
                </span>
              </div>
            </div>
            <div 
              style={{ display: "flex", alignItems: "center", cursor: "pointer", transition: "opacity 0.2s" }}
              onClick={() => handleToggleCcp(s.id, s.ccp, s.parameter)}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={s.ccp.startsWith("Yes") ? "warning" : "slate"}>
                Critical CCP: {s.ccp}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

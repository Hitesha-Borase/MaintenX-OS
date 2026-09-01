import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Package } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function ProductChecks() {
  const { addToast } = useApp();

  const [products, setProducts] = useState([
    { id: 1, name: "Organic Orange Juice Brix Level", target: "11.8 - 12.0 °Bx", actual: "11.9 °Bx", status: "PASS" },
    { id: 2, name: "Cap induction seal torque check", target: "12 - 18 in-lbs", actual: "14 in-lbs", status: "PASS" }
  ]);

  const handleToggleStatus = (id, currentStatus, name) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        if (currentStatus === "PASS") {
          addToast(`${name} marked as FAIL.`, "error");
          return { ...p, status: "FAIL" };
        } else {
          addToast(`${name} marked as PASS.`, "success");
          return { ...p, status: "PASS" };
        }
      }
      return p;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Finished Product Checks
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Monitor brix parameters, ph acidity, and seal torque validation tests
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {products.map((p) => (
          <Card 
            key={p.id} 
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
            <div 
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onClick={() => handleToggleStatus(p.id, p.status, p.name)}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={p.status === "PASS" ? "emerald" : "destructive"}>{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

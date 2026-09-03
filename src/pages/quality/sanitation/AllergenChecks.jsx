import React, { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

export function AllergenChecks() {
  const { addToast } = useApp();

  const [checks, setChecks] = useState([
    { id: 1, name: "Costco Orange Juice Run (Allergen: Soy free)", status: "Pending Audit" }
  ]);

  const handleAudit = (id, name) => {
    setChecks(prev =>
      prev.map(c => c.id === id ? { ...c, status: "Allergen Clear" } : c)
    );
    addToast(`Allergen clean audit cleared for: ${name}`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Allergen Verification Audits
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {checks.map((c) => {
          const isPending = c.status.toLowerCase().includes("pending");
          return (
            <Card 
              key={c.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                padding: "20px",
                borderLeft: isPending ? "4px solid #C89547" : "4px solid #10b981"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
                <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                  <ShieldCheck size={24} color="#C89547" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{c.name}</span>
                  <div>
                    <Badge variant={isPending ? "slate" : "emerald"}>
                      {c.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "flex-end", flex: "1 1 auto" }}>
                <Button 
                  variant={isPending ? "success" : "secondary"} 
                  icon={Check} 
                  onClick={() => isPending && handleAudit(c.id, c.name)}
                  style={{ opacity: isPending ? 1 : 0.6, cursor: isPending ? "pointer" : "default" }}
                >
                  {isPending ? "Clear Allergen" : "Cleared"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { ShieldCheck, Plus, Check } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Allergen Verification Audits
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify flavor changeover allergen clean cycles to prevent cross-contamination
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {checks.map((c) => (
          <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: c.status.includes("Pending") ? "4px solid #F59E0B" : "4px solid #10B981" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="#10B981" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{c.name}</span>
                <Badge variant={c.status.includes("Pending") ? "warning" : "emerald"}>{c.status}</Badge>
              </div>
            </div>

            {c.status.includes("Pending") && (
              <Button variant="success" size="sm" icon={Check} onClick={() => handleAudit(c.id, c.name)}>
                Clear Allergen
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

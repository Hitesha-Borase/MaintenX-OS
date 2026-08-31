import React, { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function SanitationChecklist() {
  const { addToast } = useApp();

  const [steps, setSteps] = useState([
    { id: 1, name: "CIP sanitation flush cycle 15 mins", completed: true },
    { id: 2, name: "Caustic wash wash verification", completed: true }
  ]);

  const handleToggle = (id) => {
    setSteps(prev =>
      prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    );
  };

  const handleSave = (e) => {
    e.preventDefault();

    addToast("Sanitation check logs updated.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Sanitation Checklists
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log and verify chemical CIP clean levels and caustic wash procedures
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            CIP Sanitation Log
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {steps.map((s) => (
              <div
                key={s.id}
                onClick={() => handleToggle(s.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: s.completed ? "1px solid #10B981" : "1px solid var(--border-subtle)",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: "13px", color: "#FFFFFF" }}>{s.name}</span>
                <CheckCircle2 size={18} color={s.completed ? "#10B981" : "var(--text-muted)"} />
              </div>
            ))}
          </div>

          <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "6px" }}>
            Save Logs
          </Button>
        </Card>
      </form>
    </div>
  );
}

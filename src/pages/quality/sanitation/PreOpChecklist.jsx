import React, { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function PreOpChecklist() {
  const { addToast } = useApp();

  const [items, setItems] = useState([
    { id: 1, name: "Physical inspection of filler nozzle seals", passed: true },
    { id: 2, name: "Pasteurizer pipeline pressure calibration", passed: true },
    { id: 3, name: "Line 1 clean of raw debris and tools", passed: false }
  ]);

  const handleToggle = (id) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, passed: !item.passed } : item)
    );
  };

  const handleSave = (e) => {
    e.preventDefault();

    addToast("Line 1 Pre-Op checklist verified and saved.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Pre-Op Startup Checklist
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Confirm startup criteria verification checks before releasing the line to operator HMI
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Line 1 Pre-Op Checklist
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: item.passed ? "1px solid #10B981" : "1px solid var(--border-subtle)",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: "13px", color: "#FFFFFF" }}>{item.name}</span>
                <CheckCircle2 size={18} color={item.passed ? "#10B981" : "var(--text-muted)"} />
              </div>
            ))}
          </div>

          <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "6px" }}>
            Save Pre-Op Checklist
          </Button>
        </Card>
      </form>
    </div>
  );
}

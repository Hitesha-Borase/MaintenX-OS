import React from "react";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { AlertOctagon, Check } from "lucide-react";

export function Exceptions() {
  const { exceptions, updateExceptionStatus } = useExceptions();
  const { addToast } = useApp();

  const handleResolveException = (id) => {
    updateExceptionStatus(id, "Resolved", "Supervisor signed off resolution.");
    addToast(`Exception ${id} marked as Resolved.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Operations Exceptions
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {exceptions.map((ex) => (
          <Card key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderLeft: ex.status !== "Resolved" ? "4px solid #EF4444" : "4px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertOctagon size={16} color="#EF4444" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{ex.id}</span>
                <Badge variant={ex.status === "Resolved" ? "emerald" : "danger"}>{ex.status}</Badge>
              </div>
              <div style={{ fontWeight: 600, marginTop: "4px" }}>{ex.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Details: {ex.details} • Discovered: {ex.discoveredAt}
              </div>
            </div>

            {ex.status !== "Resolved" && (
              <Button variant="success" size="sm" icon={Check} onClick={() => handleResolveException(ex.id)}>
                Resolve Alarm
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

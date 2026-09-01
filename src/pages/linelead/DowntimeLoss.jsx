import React from "react";
import { Clock, AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function DowntimeLoss() {
  const { breakdowns, setBreakdowns, addWorkOrder } = useCMMS();
  const { addToast } = useApp();

  const handleAcknowledge = (id) => {
    setBreakdowns((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Acknowledged" } : b))
    );
    addToast(`Downtime event ${id} acknowledged by Line Lead.`, "success");
  };

  const handleRequestDispatch = (bd) => {
    // Generate Corrective Work Order
    const newWO = {
      assetId: bd.assetId,
      assetName: bd.assetName,
      title: `Corrective Maintenance: ${bd.failureCategory} on L1`,
      description: `Immediate dispatch requested for downtime event ${bd.id}. Symptoms: ${bd.symptom}`,
      priority: "P1 - Critical",
      status: "Assigned"
    };

    addWorkOrder(newWO);
    addToast(`Corrective Work Order created for ${bd.assetName}. Maintenance dispatched.`, "warning");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Shift Downtime & Loss Logs
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {breakdowns.map((bd) => {
          const isActive = !bd.endTime;

          return (
            <Card
              key={bd.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderLeft: isActive ? "4px solid #EF4444" : "4px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                      {bd.assetName} ({bd.assetId})
                    </h3>
                    <Badge variant={isActive ? "danger" : "emerald"}>
                      {isActive ? "Active Downtime" : "Resolved"}
                    </Badge>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    Category: {bd.failureCategory} • Started: {bd.startTime}
                  </span>
                </div>

                {isActive && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    {bd.status !== "Acknowledged" && (
                      <Button variant="secondary" size="sm" icon={UserCheck} onClick={() => handleAcknowledge(bd.id)}>
                        Acknowledge
                      </Button>
                    )}
                    <Button variant="danger" size="sm" icon={AlertTriangle} onClick={() => handleRequestDispatch(bd)}>
                      Dispatch Tech
                    </Button>
                  </div>
                )}
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontStyle: "italic" }}>
                "{bd.symptom}"
              </p>

              <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                <span>Shift duration: <strong style={{ color: "#FFFFFF" }}>{bd.durationMinutes} minutes</strong></span>
                {bd.status && <span>Audit status: <strong style={{ color: "#38BDF8" }}>{bd.status}</strong></span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

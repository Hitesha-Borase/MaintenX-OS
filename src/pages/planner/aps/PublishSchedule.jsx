import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function PublishSchedule() {
  const { addToast } = useApp();
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    setPublished(true);
    addToast("Publishing validated schedule version to shop floor HMIs...", "info");
    setTimeout(() => {
      addToast("Schedule V4.2 published to all active HMI terminals.", "success");
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Publish Shift Run Schedule
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Dispatch the validated run schedule to active shopfloor operator terminals
          </p>
        </div>

        {!published ? (
          <Button variant="success" icon={Send} onClick={handlePublish}>
            Publish to HMI
          </Button>
        ) : (
          <Badge variant="emerald">Schedule Published</Badge>
        )}
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
          Target Dispatch Lines
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)" }}>Line 1 Aseptic HMI:</span>
            <Badge variant={published ? "emerald" : "warning"}>{published ? "Synced" : "Out of Sync"}</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)" }}>Line 2 Formulation panel:</span>
            <Badge variant={published ? "emerald" : "warning"}>{published ? "Synced" : "Out of Sync"}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

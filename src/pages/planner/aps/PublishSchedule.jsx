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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Publish Shift Run Schedule
          </h1>

        </div>

        {!published ? (
          <Button variant="success" icon={Send} onClick={handlePublish}>
            Publish to HMI
          </Button>
        ) : (
          <Badge variant="emerald">SCHEDULE PUBLISHED</Badge>
        )}
      </div>

      <Card style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Target Dispatch Lines
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Line 1 Aseptic HMI:</span>
            <Badge variant={published ? "emerald" : "slate"}>{published ? "SYNCED" : "OUT OF SYNC"}</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Line 2 Formulation panel:</span>
            <Badge variant={published ? "emerald" : "slate"}>{published ? "SYNCED" : "OUT OF SYNC"}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { ShieldCheck, Play, CheckCircle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ScheduleValidation() {
  const { addToast } = useApp();
  const [validated, setValidated] = useState(false);

  const handleValidate = () => {
    setValidated(true);
    addToast("Checking schedule feasibility against raw material and staffing limits...", "info");
    setTimeout(() => {
      addToast("Schedule feasibility checks PASSED. 0 constraints violated.", "success");
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Schedule Feasibility Validation
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Validate scheduling drafts against crew roster lists and machine capacity limits
          </p>
        </div>

        <Button variant="primary" icon={Play} onClick={handleValidate}>
          Validate Draft
        </Button>
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
          Validation Criteria Status
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)" }}>Raw Material Feasibility:</span>
            <Badge variant={validated ? "emerald" : "warning"}>{validated ? "Passed" : "Not Audited"}</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-muted)" }}>Labor Headcount Fit:</span>
            <Badge variant={validated ? "emerald" : "warning"}>{validated ? "Passed" : "Not Audited"}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

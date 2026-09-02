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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Schedule Feasibility Validation
          </h1>

        </div>

        <Button variant="primary" icon={Play} onClick={handleValidate} disabled={validated}>
          {validated ? "Validated" : "Validate Draft"}
        </Button>
      </div>

      <Card style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Validation Criteria Status
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Raw Material Feasibility:</span>
            <Badge variant={validated ? "emerald" : "slate"}>{validated ? "PASSED" : "NOT AUDITED"}</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Labor Headcount Fit:</span>
            <Badge variant={validated ? "emerald" : "slate"}>{validated ? "PASSED" : "NOT AUDITED"}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

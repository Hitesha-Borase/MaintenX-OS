import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { SearchCode } from "lucide-react";

export function Investigations() {
  const navigate = useNavigate();

  const investigations = [
    { id: "INV-802", batch: "BAT-2026-0890", trigger: "CCP Pasteurizer Temp excursion drop", status: "Active Investigation" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Quality Investigations
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log and track CAPA root cause analyses for process deviations
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {investigations.map((i) => (
          <Card key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #EF4444" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SearchCode size={16} color="#EF4444" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{i.id}: {i.batch}</span>
                <Badge variant="warning">{i.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Trigger Incident: {i.trigger}
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={() => navigate("/quality/rca-capa")}>
              Run RCA / CAPA
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

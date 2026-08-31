import React from "react";
import { useExceptions } from "../../context/ExceptionContext";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { ShieldCheck } from "lucide-react";

export function QualityEvents() {
  const { exceptions } = useExceptions();

  const qualityEvents = exceptions.filter((e) => e.category === "Quality Hold" || e.title.includes("Quality"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental Quality Logs
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Critical Control Point (CCP) audits and line deviations logs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {qualityEvents.map((ev) => (
          <Card key={ev.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="#10B981" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{ev.id}</span>
              </div>
              <Badge variant="danger">{ev.severity}</Badge>
            </div>
            <div style={{ fontWeight: 600 }}>{ev.title}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Details: {ev.details} • Discovered: {ev.discoveredAt}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

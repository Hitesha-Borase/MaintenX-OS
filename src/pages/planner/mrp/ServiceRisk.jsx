import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingDown
} from "lucide-react";

export function ServiceRisk() {
  const { demandOrders = [], mrpCalculations = [] } = usePlanning();
  const { addToast } = useApp();

  const [mitigations, setMitigations] = useState({});

  const shortages = mrpCalculations.filter((m) => m.shortage > 0);

  const serviceRisks = [
    {
      id: "RSK-01",
      customer: "Kroger Mid-Atlantic",
      orderRef: "PO-KR-99321",
      riskTitle: "28mm Tamper-Evident HDPE Cap Shortage Risk",
      potentialPenalty: "$14,500 (OTIF SLA Clause 4.2)",
      severity: "High Risk",
      impact: "Late Delivery on 24,000 Bottles Tonic Water",
      recommendation: "Authorize expedited air-freight shipment from secondary packaging vendor."
    },
    {
      id: "RSK-02",
      customer: "Whole Foods Market",
      orderRef: "PO-WF-88901",
      riskTitle: "Line 1 High-Capacity Scheduling Compression",
      potentialPenalty: "$8,200",
      severity: "Medium Risk",
      impact: "Potential 6-hour delay during Friday changeover window",
      recommendation: "Pre-stage sterile wash CIP fluids 2 hours before run completion."
    }
  ];

  const handleMitigate = (id, title) => {
    setMitigations((prev) => ({ ...prev, [id]: true }));
    addToast(`Service risk "${title}" mitigated. SLA compliance guaranteed.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Commercial Service Risk & OTIF Penalty Exposure
          </h1>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active OTIF Risks"
          value={serviceRisks.filter((r) => !mitigations[r.id]).length.toString()}
          unit="Unresolved Threats"
          icon={ShieldAlert}
          colorVariant="rose"
        />
        <StatCard
          title="Total Financial Exposure"
          value="$22,700"
          unit="Contractual Penalties"
          icon={DollarSign}
          colorVariant="amber"
        />
        <StatCard
          title="Mitigated Risks (YTD)"
          value={Object.keys(mitigations).length.toString()}
          unit="Threats Neutralized"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="OTIF SLA Target"
          value="98.5%"
          unit="Current Projected: 99.1%"
          icon={TrendingDown}
          colorVariant="emerald"
        />
      </div>

      {/* Service Risk Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {serviceRisks.map((r) => {
          const isMitigated = mitigations[r.id];

          return (
            <Card
              key={r.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: isMitigated ? "4px solid #059669" : "4px solid #DC2626",
                padding: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 320px" }}>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: isMitigated ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                    borderRadius: "10px",
                    flexShrink: 0
                  }}
                >
                  <ShieldAlert size={24} color={isMitigated ? "#059669" : "#DC2626"} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{r.riskTitle}</span>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{r.id}</span>
                    <Badge variant="cyan">{r.customer}</Badge>
                    <Badge variant={isMitigated ? "emerald" : r.severity === "High Risk" ? "rose" : "amber"}>
                      {isMitigated ? "MITIGATED" : r.severity}
                    </Badge>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Impact: <strong>{r.impact}</strong> • Financial Exposure: <strong style={{ color: "#DC2626" }}>{r.potentialPenalty}</strong>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Recommended Action: <strong>{r.recommendation}</strong>
                  </div>
                </div>
              </div>

              <Button
                variant={isMitigated ? "secondary" : "primary"}
                size="sm"
                icon={isMitigated ? CheckCircle2 : Zap}
                onClick={() => handleMitigate(r.id, r.riskTitle)}
                disabled={isMitigated}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                {isMitigated ? "Risk Mitigated" : "Authorize Mitigation Protocol"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

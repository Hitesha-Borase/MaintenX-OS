import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function QualitySpecsPage() {
  const [specs] = useState([
    { id: "QSP-01", param: "Brix Sugar Refractometry", product: "Citrus Soda", target: "10.4 °Bx", lcl: "10.2 °Bx", ucl: "10.6 °Bx", testFrequency: "Every 30 Mins" },
    { id: "QSP-02", param: "pH Acidity Level", product: "All Sodas", target: "3.20 pH", lcl: "3.00 pH", ucl: "3.40 pH", testFrequency: "Hourly" },
    { id: "QSP-03", param: "Induction Cap Seal Torque", product: "PET Bottles", target: "15.0 in-lbs", lcl: "12.0 in-lbs", ucl: "18.0 in-lbs", testFrequency: "Every 60 Mins" },
    { id: "QSP-04", param: "Fill Volume Net", product: "500ml Bottling", target: "500.0 ml", lcl: "495.0 ml", ucl: "505.0 ml", testFrequency: "Continuous Checkweigher" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Quality Specifications & Control Limits Master
            </h1>
            <Badge variant="emerald">Statistical Limits (LCL/UCL)</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Product quality control parameters, target values, upper and lower specification limits, and testing frequencies.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Spec Ref</th>
                <th>Quality Parameter</th>
                <th>Target SKU</th>
                <th>Nominal Target</th>
                <th>Lower Limit (LCL)</th>
                <th>Upper Limit (UCL)</th>
                <th>Testing Frequency</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{s.param}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.product}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{s.target}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#F59E0B" }}>{s.lcl}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#EF4444" }}>{s.ucl}</td>
                  <td>
                    <Badge variant="cyan">{s.testFrequency}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

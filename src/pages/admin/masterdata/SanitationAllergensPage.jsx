import React, { useState } from "react";
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function SanitationAllergensPage() {
  const [protocols] = useState([
    { id: "CIP-01", name: "3-Step Hot Caustic Wash", durationMins: 45, chemical: "Sodium Hydroxide 2.0%", tempSpec: "82°C ± 3°C", allergenCleared: "General Organic Residue" },
    { id: "CIP-02", name: "Acid Neutralization Flush", durationMins: 20, chemical: "Phosphoric Acid 1.5%", tempSpec: "65°C ± 2°C", allergenCleared: "Mineral Scale & Tannins" },
    { id: "CIP-03", name: "Allergen Deep Sanitization", durationMins: 60, chemical: "Peracetic Acid (PAA) 0.2%", tempSpec: "Ambient", allergenCleared: "Dairy & Nut Cross-Contact" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Sanitation & Allergen Master Matrix
            </h1>
            <Badge variant="rose">HACCP Allergen Controls</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Clean-in-Place (CIP) sanitization cycles, chemical concentrations, thermal kill parameters, and allergen clearance rules.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Protocol ID</th>
                <th>Sanitation Method</th>
                <th>Chemical Agent</th>
                <th>Temperature Target</th>
                <th>Duration</th>
                <th>Allergen Clearance</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{p.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{p.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{p.chemical}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#F59E0B" }}>{p.tempSpec}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{p.durationMins} mins</td>
                  <td>
                    <Badge variant="cyan">{p.allergenCleared}</Badge>
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

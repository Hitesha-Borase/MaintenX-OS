import React, { useState } from "react";
import {
  Building2,
  Plus,
  CheckCircle2,
  Globe,
  DollarSign,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function CompaniesPage() {
  const { addToast } = useApp();

  const [companies, setCompanies] = useState([
    { id: "COMP-01", legalName: "FlowState Beverages Global Corp", taxId: "US-EIN-94821039", currency: "USD ($)", hq: "Austin, Texas, USA", status: "Primary Legal Entity" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Enterprise Companies & Legal Entities
            </h1>
            <Badge variant="cyan">Multi-Entity Enterprise</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Parent corporation setup, legal subsidiaries, operational currencies, and tax entity structures.
          </p>
        </div>
      </div>

      {/* Companies List */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entity Ref</th>
                <th>Legal Corporate Name</th>
                <th>Tax / EIN Identifier</th>
                <th>Base Currency</th>
                <th>Headquarters</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{c.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{c.legalName}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{c.taxId}</td>
                  <td>
                    <Badge variant="emerald">{c.currency}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.hq}</td>
                  <td>
                    <Badge variant="cyan">{c.status}</Badge>
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

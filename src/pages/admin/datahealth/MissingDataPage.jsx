import React, { useState } from "react";
import {
  HeartPulse,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function MissingDataPage() {
  const { addToast } = useApp();

  const [missingRecords, setMissingRecords] = useState([
    { id: "MD-01", table: "Item Master", recordKey: "SKU-5003 (Ginger Beer)", field: "Standard Unit Cost", suggestion: "Set standard cost to $0.38", status: "Open" },
    { id: "MD-02", table: "Work Centers", recordKey: "WC-103 (Labeler)", field: "Operator Manning Standard", suggestion: "Assign standard crew = 2", status: "Open" },
    { id: "MD-03", table: "Allergen Matrix", recordKey: "FAM-02 (Tonics)", field: "CIP Protocol Linkage", suggestion: "Link to CIP-01 (Hot Caustic)", status: "Open" }
  ]);

  const handleAutofill = (id) => {
    setMissingRecords((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Remediated" } : m))
    );
    addToast(`Missing attribute for ${id} remediated automatically!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Data Health: Missing Attributes Radar
            </h1>
            <Badge variant="amber">{missingRecords.filter((m) => m.status === "Open").length} Incomplete Records</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Automated scanning of master tables for unpopulated required fields, missing standard costs, and unlinked attributes.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Anomaly Ref</th>
                <th>Master Table</th>
                <th>Record Identifier</th>
                <th>Missing Field</th>
                <th>Remediation Suggestion</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {missingRecords.map((m) => {
                const isOpen = m.status === "Open";

                return (
                  <tr key={m.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{m.id}</span>
                    </td>
                    <td>
                      <Badge variant="cyan">{m.table}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: "#FFFFFF" }}>{m.recordKey}</strong>
                    </td>
                    <td style={{ color: "#EF4444", fontWeight: 600 }}>{m.field}</td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{m.suggestion}</td>
                    <td>
                      <Badge variant={isOpen ? "amber" : "emerald"}>{m.status}</Badge>
                    </td>
                    <td>
                      {isOpen ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Wrench}
                          onClick={() => handleAutofill(m.id)}
                        >
                          Auto-Fix
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Fixed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

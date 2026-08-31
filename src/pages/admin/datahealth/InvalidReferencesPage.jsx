import React, { useState } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Trash2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function InvalidReferencesPage() {
  const { addToast } = useApp();

  const [invalidRefs, setInvalidRefs] = useState([
    { id: "REF-01", parentTable: "BOM Recipe (BOM-5002)", referencedField: "Ingredient Key", foreignId: "ING-9901 (Non-existent)", issue: "Orphaned Foreign Key Reference", status: "Broken Key" }
  ]);

  const handleFix = (id) => {
    setInvalidRefs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Cleaned / Re-linked" } : r))
    );
    addToast(`Foreign key reference ${id} resolved!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Data Health: Invalid Foreign Key References
            </h1>
            <Badge variant="rose">{invalidRefs.filter((r) => r.status.includes("Broken")).length} Orphaned Keys</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Referential integrity scanner detecting orphaned foreign keys, deleted supplier IDs, and non-existent SKU links.
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
                <th>Parent Entity</th>
                <th>Referenced Field</th>
                <th>Invalid Foreign Identifier</th>
                <th>Diagnosis</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invalidRefs.map((r) => {
                const isBroken = r.status.includes("Broken");

                return (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "#FFFFFF" }}>{r.parentTable}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.referencedField}</span>
                    </td>
                    <td style={{ color: "#EF4444", fontFamily: "var(--font-mono)" }}>{r.foreignId}</td>
                    <td style={{ fontSize: "12px", color: "#F59E0B" }}>{r.issue}</td>
                    <td>
                      <Badge variant={isBroken ? "rose" : "emerald"}>{r.status}</Badge>
                    </td>
                    <td>
                      {isBroken ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Wrench}
                          onClick={() => handleFix(r.id)}
                        >
                          Resolve Link
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Resolved</span>
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

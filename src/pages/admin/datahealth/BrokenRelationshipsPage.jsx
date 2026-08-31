import React, { useState } from "react";
import {
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function BrokenRelationshipsPage() {
  const { addToast } = useApp();

  const [brokenRels, setBrokenRels] = useState([
    { id: "REL-101", fromEntity: "Production Routing (RTG-02)", toEntity: "Work Center (WC-04)", relationship: "Step 4 Seamer Operation", issue: "Work Center unattached to Line 3", status: "Unlinked" },
    { id: "REL-102", fromEntity: "SKU-5001 (Citrus Soda)", toEntity: "Changeover Matrix", relationship: "SMED Standard Definition", issue: "Missing cleanout transition row to SKU-5003", status: "Unlinked" }
  ]);

  const handleFix = (id) => {
    setBrokenRels((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Connected" } : b))
    );
    addToast(`Relationship ${id} re-established successfully!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Data Health: Broken Entity Relationships
            </h1>
            <Badge variant="amber">{brokenRels.filter((b) => b.status === "Unlinked").length} Broken Links</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Cross-table relational graph auditor detecting missing routings, detached work centers, and unmapped changeovers.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Link ID</th>
                <th>Source Entity</th>
                <th>Target Entity</th>
                <th>Relationship Context</th>
                <th>Structural Anomaly</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {brokenRels.map((b) => {
                const isUnlinked = b.status === "Unlinked";

                return (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "#FFFFFF" }}>{b.fromEntity}</strong>
                    </td>
                    <td>
                      <strong style={{ color: "#38BDF8" }}>{b.toEntity}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{b.relationship}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#F59E0B" }}>{b.issue}</td>
                    <td>
                      <Badge variant={isUnlinked ? "amber" : "emerald"}>{b.status}</Badge>
                    </td>
                    <td>
                      {isUnlinked ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Wrench}
                          onClick={() => handleFix(b.id)}
                        >
                          Auto-Link
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Connected</span>
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

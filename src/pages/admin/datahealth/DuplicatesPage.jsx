import React, { useState } from "react";
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  GitMerge,
  Trash2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function DuplicatesPage() {
  const { addToast } = useApp();

  const [duplicates, setDuplicates] = useState([
    { id: "DUP-01", entityType: "Raw Ingredient", primaryRecord: "ING-1001 (Liquid Cane Sugar)", duplicateRecord: "ING-9004 (Liquid Cane Sugar 67 Bx)", similarity: "98% Match", status: "Potential Duplicate" },
    { id: "DUP-02", entityType: "Customer Account", primaryRecord: "CUST-401 (Whole Foods Market)", duplicateRecord: "CUST-499 (Whole Foods Direct TX)", similarity: "92% Match", status: "Potential Duplicate" }
  ]);

  const handleMerge = (id) => {
    setDuplicates((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Merged" } : d))
    );
    addToast(`Duplicate record ${id} merged into primary master entry!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Data Health: Duplicate Record Deduplication
            </h1>
            <Badge variant="amber">{duplicates.filter((d) => d.status.includes("Duplicate")).length} Duplicates Detected</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Fuzzy matching algorithm detection of duplicate SKUs, redundant vendor accounts, and duplicate parts.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Duplicate ID</th>
                <th>Entity Category</th>
                <th>Primary Master Record</th>
                <th>Redundant Candidate</th>
                <th>Fuzzy Match</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {duplicates.map((d) => {
                const isPending = d.status.includes("Duplicate");

                return (
                  <tr key={d.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{d.id}</span>
                    </td>
                    <td>
                      <Badge variant="cyan">{d.entityType}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: "#FFFFFF" }}>{d.primaryRecord}</strong>
                    </td>
                    <td>
                      <span style={{ color: "#EF4444" }}>{d.duplicateRecord}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#F59E0B" }}>{d.similarity}</td>
                    <td>
                      <Badge variant={isPending ? "amber" : "emerald"}>{d.status}</Badge>
                    </td>
                    <td>
                      {isPending ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={GitMerge}
                          onClick={() => handleMerge(d.id)}
                        >
                          Merge Records
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Merged</span>
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

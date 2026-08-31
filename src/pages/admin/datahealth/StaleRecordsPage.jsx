import React, { useState } from "react";
import {
  Clock,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Download
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function StaleRecordsPage() {
  const { addToast } = useApp();

  const [staleRecords, setStaleRecords] = useState([
    { id: "STL-01", table: "Item Master", name: "SKU-4008 (Seasonal Spiced Soda 2024)", lastProduced: "248 Days Ago", inventoryOnHand: 0, status: "Stale / Obsolete" },
    { id: "STL-02", table: "BOM Master", name: "BOM-4008 (Spiced Formula v1)", lastProduced: "248 Days Ago", inventoryOnHand: 0, status: "Stale / Obsolete" },
    { id: "STL-03", table: "Vendor Master", name: "VEND-88 (Legacy Glass Supplier)", lastProduced: "310 Days Ago", inventoryOnHand: 0, status: "Inactive Vendor" }
  ]);

  const handleArchive = (id) => {
    setStaleRecords((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Archived" } : s))
    );
    addToast(`Record ${id} archived to cold historical storage!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Data Health: Stale & Obsolete Records
            </h1>
            <Badge variant="cyan">{staleRecords.filter((s) => !s.status.includes("Archived")).length} Stale Items</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Identify dormant SKUs, discontinued formulas, and inactive vendors with 0 inventory for archiving.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Ref</th>
                <th>Master Table</th>
                <th>Record Description</th>
                <th>Last Active Time</th>
                <th>On-Hand Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staleRecords.map((s) => {
                const isStale = !s.status.includes("Archived");

                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                    </td>
                    <td>
                      <Badge variant="cyan">{s.table}</Badge>
                    </td>
                    <td>
                      <strong style={{ color: "#FFFFFF" }}>{s.name}</strong>
                    </td>
                    <td style={{ fontSize: "12px", color: "#F59E0B" }}>{s.lastProduced}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{s.inventoryOnHand} units</td>
                    <td>
                      <Badge variant={isStale ? "amber" : "emerald"}>{s.status}</Badge>
                    </td>
                    <td>
                      {isStale ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Archive}
                          onClick={() => handleArchive(s.id)}
                        >
                          Archive
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● In Archive</span>
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

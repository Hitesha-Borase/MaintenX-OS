import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function MigrationPage() {
  const { addToast } = useApp();

  const [migrationJobs, setMigrationJobs] = useState([
    { id: "MIG-01", targetTable: "Item & SKU Master", recordsCount: 1420, format: "CSV", importedBy: "Alexander Vance", date: "2026-08-28", status: "Completed" },
    { id: "MIG-02", targetTable: "BOM & Recipe Formulas", recordsCount: 48, format: "Excel (.xlsx)", importedBy: "Alexander Vance", date: "2026-08-29", status: "Completed" }
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateImport = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newJob = {
        id: `MIG-0${migrationJobs.length + 1}`,
        targetTable: "Storage Locations & Bins",
        recordsCount: 250,
        format: "CSV",
        importedBy: "Alexander Vance",
        date: new Date().toISOString().substring(0, 10),
        status: "Completed"
      };
      setMigrationJobs([...migrationJobs, newJob]);
      setIsUploading(false);
      addToast("Batch Data Migration Succeeded: 250 storage records imported cleanly!", "success");
    }, 900);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Data Migration & Bulk Import/Export Engine
            </h1>
            <Badge variant="emerald">CSV / Excel Migration</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Mass upload master data catalogues, legacy ERP data migration, CSV templates, and bulk validation staging.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={UploadCloud} onClick={handleSimulateImport} disabled={isUploading}>
            {isUploading ? "Validating Records..." : "Upload & Validate CSV"}
          </Button>
        </div>
      </div>

      {/* Migration Jobs Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Recent Data Migration Jobs
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Target Master Table</th>
                <th>Records Migrated</th>
                <th>File Format</th>
                <th>Operator</th>
                <th>Date Executed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {migrationJobs.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{m.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{m.targetTable}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>
                    {m.recordsCount.toLocaleString()} Rows
                  </td>
                  <td>
                    <Badge variant="cyan">{m.format}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{m.importedBy}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{m.date}</td>
                  <td>
                    <Badge variant="emerald">{m.status}</Badge>
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

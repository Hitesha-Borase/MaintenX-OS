import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Layers,
  Search,
  RotateCcw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { REPORT_TEMPLATES } from "../../data/mockReports";
import { useApp } from "../../context/AppContext";

export function ReportsCenter() {
  const { addToast } = useApp();
  const [reports, setReports] = useState(REPORT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("current-month");

  const filteredReports = selectedCategory === "all" ? reports : reports.filter((r) => r.category === selectedCategory);

  const handleGenerate = (reportName, format = "PDF") => {
    addToast(`Generating & Exporting '${reportName}' in ${format} format...`);
  };

  const handlePrint = (reportName) => {
    addToast(`Sending '${reportName}' to industrial print queue.`);
  };

  const columns = [
    {
      header: "Report Name",
      accessor: "name",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <FileSpreadsheet size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.id} • {row.description}</div>
          </div>
        </div>
      )
    },
    {
      header: "Domain Category",
      accessor: "category",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Cadence",
      accessor: "frequency",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{val}</span>
    },
    {
      header: "Formats",
      accessor: "formats",
      render: (val) => (
        <div style={{ display: "flex", gap: "4px" }}>
          {val.map((f, i) => (
            <Badge key={i} variant="slate">{f}</Badge>
          ))}
        </div>
      )
    },
    {
      header: "Last Published",
      accessor: "lastGenerated",
      render: (val) => <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{val}</span>
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => handleGenerate(row.name, "CSV")}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => handlePrint(row.name)}
          >
            Print
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Enterprise Reports & Compliance Analytics Center
            </h1>
            <Badge variant="cyan">Executive Reporting Suite</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Automated scheduled export and printing of Production, Quality, CMMS Reliability, Costing, and FDA Traceability dossiers.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            className="form-select"
            style={{ width: "auto", height: "36px", fontSize: "12px" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Report Categories</option>
            <option value="Production">Production & MES</option>
            <option value="Maintenance">Maintenance & CMMS</option>
            <option value="Quality">Quality & HACCP</option>
            <option value="Traceability">Traceability & Genealogy</option>
            <option value="Costing">Costing & Variance</option>
          </select>

          <Button variant="primary" icon={Download} onClick={() => addToast("Exporting Complete Master Manufacturing Dossier (Zip Archive)...")}>
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <DataTable
          title="Master Scheduled Reports & Regulatory Extracts"
          columns={columns}
          data={filteredReports}
          searchPlaceholder="Search report name, category, frequency..."
          exportFilename="flowstate_reports_center.csv"
        />
      </Card>
    </div>
  );
}

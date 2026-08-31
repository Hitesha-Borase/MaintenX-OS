import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  FileCode,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { INITIAL_DOCUMENTS } from "../../data/mockDocuments";
import { useApp } from "../../context/AppContext";

export function DocumentSOPLibrary() {
  const { addToast } = useApp();
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);

  const columns = [
    {
      header: "Document Title & ID",
      accessor: "title",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <FileText size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.id} • {row.version}</div>
          </div>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Linked Assets",
      accessor: "linkedAssets",
      render: (val) => (
        <div style={{ display: "flex", gap: "4px" }}>
          {val.map((a, i) => (
            <Badge key={i} variant="slate">{a}</Badge>
          ))}
        </div>
      )
    },
    {
      header: "File Type & Size",
      accessor: "fileType",
      render: (val, row) => (
        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
          {val} • {row.size}
        </span>
      )
    },
    {
      header: "Effective Date",
      accessor: "effectiveDate",
      render: (val) => <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)" }}>{val}</span>
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => <Badge variant="emerald">{val}</Badge>
    },
    {
      header: "Action",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={(e) => {
            e.stopPropagation();
            addToast(`Downloading ${row.title} (${row.fileType})...`);
          }}
        >
          Download
        </Button>
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
              Digital SOPs, Manuals & Engineering Schematics
            </h1>
            <Badge variant="cyan">ISO Document Master</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Version-controlled standard operating procedures, OEM machine wiring manuals, and P&ID technical blueprints.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => addToast("Upload Document / SOP modal opened.")}>
            + Upload Document
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Active SOPs & Manuals"
          value={documents.length.toString()}
          unit="files"
          trend={{ value: "Version Controlled", isPositive: true, text: "master repository" }}
          icon={BookOpen}
          colorVariant="blue"
        />
        <StatCard
          title="Asset Linked Drawings"
          value="100%"
          unit="covered"
          trend={{ value: "All Machinery", isPositive: true, text: "schematics online" }}
          icon={FileCode}
          colorVariant="cyan"
        />
        <StatCard
          title="Recent Revisions"
          value="4"
          unit="this quarter"
          trend={{ value: "Audited", isPositive: true, text: "safety review" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="SOP Compliance Rate"
          value="100%"
          unit=""
          trend={{ value: "Operator Trained", isPositive: true, text: "sign-offs current" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Documents Table */}
      <Card>
        <DataTable
          title="Master Engineering & Operations Document Library"
          columns={columns}
          data={documents}
          searchPlaceholder="Search document title, SOP code, asset, or category..."
          exportFilename="flowstate_documents_library.csv"
        />
      </Card>
    </div>
  );
}

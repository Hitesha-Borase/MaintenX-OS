import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Plus,
  Play,
  History,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PMChecklistList() {
  const { checklistTemplates, checklistHistory } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const columns = [
    {
      header: "Checklist Template",
      accessor: "name",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <FileCheck size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{row.name}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.id} • {row.version}</div>
          </div>
        </div>
      )
    },
    {
      header: "Target Asset",
      accessor: "assetName",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#38BDF8" }}>{row.assetId}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.assetName}</div>
        </div>
      )
    },
    {
      header: "Frequency",
      accessor: "frequency",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Est. Duration",
      accessor: "estimatedMinutes",
      render: (val) => (
        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
          {val} mins
        </span>
      )
    },
    {
      header: "Author / Engineer",
      accessor: "author",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{val}</span>
    },
    {
      header: "Action",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/maintenance/checklists/${row.id}`);
          }}
        >
          Execute Checklist
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
              PM Checklist Library & Templates
            </h1>
            <Badge variant="cyan">Standardized Inspection Protocols</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Editable, version-controlled preventive maintenance checklists with numerical pass/fail tolerance limits.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => addToast("New Checklist Template Editor opened.")}>
            Create Template
          </Button>
        </div>
      </div>

      {/* Templates Table */}
      <Card>
        <DataTable
          title="Active PM Inspection Checklists"
          columns={columns}
          data={checklistTemplates}
          searchPlaceholder="Search checklist name, asset, frequency, author..."
          onRowClick={(row) => navigate(`/maintenance/checklists/${row.id}`)}
          exportFilename="flowstate_pm_checklists.csv"
        />
      </Card>

      {/* Inspection Run History Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Recent Checklist Execution History & Sign-Offs
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Historical audit log of technician completed PM inspections
            </p>
          </div>
          <Badge variant="emerald">100% Signed Off</Badge>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit Run ID</th>
                <th>Checklist</th>
                <th>Asset</th>
                <th>Executed By</th>
                <th>Execution Date</th>
                <th>Result</th>
                <th>Supervisor Sign-Off</th>
              </tr>
            </thead>
            <tbody>
              {checklistHistory.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>{h.id}</td>
                  <td style={{ fontWeight: 600, color: "#FFFFFF" }}>{h.checklistTemplateId}</td>
                  <td>{h.assetId}</td>
                  <td>{h.executedBy}</td>
                  <td style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{h.executedDate}</td>
                  <td><Badge variant="emerald">{h.overallStatus}</Badge></td>
                  <td><span style={{ fontSize: "12px", color: "#34D399", fontWeight: 600 }}>{h.supervisorSignOff} ({h.supervisorStatus})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

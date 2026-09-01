import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Wrench,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PMChecklistList() {
  const navigate = useNavigate();
  const { checklistTemplates, checklistHistory } = useCMMS();
  const { addToast } = useApp();

  const [templates, setTemplates] = useState(checklistTemplates);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    applicableAsset: "Rotary Bottling Filler (Aseptic)",
    frequency: "Weekly",
    author: "Marcus Vance",
    sections: [
      {
        title: "Pneumatics & Drive Inspection",
        items: [{ label: "Verify main air regulator is at 6.0 ± 0.2 bar", type: "NUMERICAL" }]
      }
    ]
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTemplate.name.trim()) {
      addToast("Please provide template name.", "warning");
      return;
    }

    const created = {
      id: `CHK-00${templates.length + 1}`,
      name: newTemplate.name,
      applicableAsset: newTemplate.applicableAsset,
      frequency: newTemplate.frequency,
      version: "v1.0",
      itemCount: 8,
      author: newTemplate.author,
      lastUpdated: new Date().toISOString().substring(0, 10),
      sections: newTemplate.sections
    };

    setTemplates([created, ...templates]);
    addToast(`Template "${created.name}" created successfully!`, "success");
    setIsAddModalOpen(false);
    setNewTemplate({
      name: "",
      applicableAsset: "Rotary Bottling Filler (Aseptic)",
      frequency: "Weekly",
      author: "Marcus Vance",
      sections: []
    });
  };

  const columns = [
    {
      header: "Checklist Title & Scope",
      accessor: "name",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23" }}>
            <FileCheck size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{row.name}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              ID: {row.id} • {row.version}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Target Machine / Equipment",
      accessor: "applicableAsset",
      render: (val) => <strong style={{ color: "var(--text-primary)" }}>{val}</strong>
    },
    {
      header: "Frequency",
      accessor: "frequency",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Total Checks",
      accessor: "sections",
      render: (_, row) => {
        const total = (row.sections || []).reduce((acc, s) => acc + (s.items?.length || 0), 0) || row.itemCount || 6;
        return <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>{total} check items</span>;
      }
    },
    {
      header: "Author / Version",
      accessor: "author",
      render: (val, row) => (
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{val}</span>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.lastUpdated}</div>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/maintenance/pm-checklists/execute/${row.id}`);
          }}
        >
          Execute Checklist
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              PM Checklist Library & Templates
            </h1>
            <Badge variant="cyan">Standardized Inspection Protocols</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Create Template
          </Button>
        </div>
      </div>

      {/* Templates Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <DataTable
          title="Active PM Inspection Checklists"
          columns={columns}
          data={templates}
          searchPlaceholder="Search checklist name, asset, frequency, author..."
          exportFilename="flowstate_pm_checklists.csv"
        />
      </Card>

      {/* Inspection Run History Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Recent Checklist Execution History & Sign-Offs
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Historical audit log of technician completed PM inspections
            </p>
          </div>
          <Badge variant="emerald">100% Signed Off</Badge>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Checklist Name</th>
                <th>Target Asset</th>
                <th>Completed At</th>
                <th>Technician</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {checklistHistory.map((hist) => (
                <tr key={hist.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {hist.id}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{hist.templateName}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{hist.assetName}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                    {hist.executionDate}
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                      {hist.technician}
                    </span>
                  </td>
                  <td>
                    <Badge variant={hist.status.includes("Pass") ? "emerald" : "amber"}>
                      {hist.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE TEMPLATE MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create PM Checklist Template
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Pasteurizer Plate Exchanger CIP Inspection"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Applicable Asset</label>
                  <select
                    className="form-select"
                    value={newTemplate.applicableAsset}
                    onChange={(e) => setNewTemplate({ ...newTemplate, applicableAsset: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Rotary Bottling Filler (Aseptic)">Rotary Bottling Filler (Aseptic)</option>
                    <option value="HTST Flash Pasteurizer">HTST Flash Pasteurizer</option>
                    <option value="Induction Cap Sealer">Induction Cap Sealer</option>
                    <option value="Sleeve Rotary Labeler">Sleeve Rotary Labeler</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={newTemplate.frequency}
                    onChange={(e) => setNewTemplate({ ...newTemplate, frequency: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Author / Lead Engineer</label>
                <input
                  type="text"
                  value={newTemplate.author}
                  onChange={(e) => setNewTemplate({ ...newTemplate, author: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

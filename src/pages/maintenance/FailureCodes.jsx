import React, { useState } from "react";
import {
  Wrench,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function FailureCodes() {
  const { failureCodes } = useCMMS();
  const { addToast } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mechanical");
  const [newSeverity, setNewSeverity] = useState("High");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;
    addToast(`Failure code ${newCode} added to catalog!`);
    setIsAddModalOpen(false);
    setNewCode("");
    setNewName("");
    setNewDesc("");
  };

  const columns = [
    {
      header: "Failure Code",
      accessor: "code",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#38BDF8" }}>
          {val}
        </span>
      )
    },
    {
      header: "Category",
      accessor: "category",
      render: (val) => {
        const variant =
          val === "Mechanical"
            ? "cyan"
            : val === "Electrical"
            ? "amber"
            : val === "Hydraulic"
            ? "rose"
            : val === "Temperature"
            ? "rose"
            : "indigo";
        return <Badge variant={variant}>{val}</Badge>;
      }
    },
    {
      header: "Failure Name & Description",
      accessor: "name",
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}</div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{row.description}</div>
        </div>
      )
    },
    {
      header: "Severity",
      accessor: "severity",
      render: (val) => (
        <Badge variant={val === "Critical" ? "rose" : val === "High" ? "amber" : "slate"}>
          {val}
        </Badge>
      )
    },
    {
      header: "Cause Classification",
      accessor: "causeType",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{val}</span>
    },
    {
      header: "Occurrences",
      accessor: "occurrencesCount",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: val > 15 ? "#EF4444" : "var(--text-primary)" }}>
          {val} events
        </span>
      )
    },
    {
      header: "Status",
      accessor: "active",
      render: (val) => <Badge variant={val ? "emerald" : "slate"}>{val ? "ACTIVE" : "INACTIVE"}</Badge>
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Standardized Failure Codes Catalog
            </h1>
            <Badge variant="cyan">ISO 14224 Taxonomy</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Add Failure Code
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <DataTable
          title="Master Failure Modes Registry"
          columns={columns}
          data={failureCodes}
          searchPlaceholder="Search failure code, category, name, or cause..."
          exportFilename="flowstate_failure_codes.csv"
        />
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Standard Failure Code"
        subtitle="Add a new failure taxonomy mode for work orders and breakdown logs"
      >
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Failure Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MEC-012"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Hydraulic">Hydraulic</option>
                <option value="Pneumatic">Pneumatic</option>
                <option value="Temperature">Temperature</option>
                <option value="Instrumentation">Instrumentation</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Failure Mode Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Drive Belt Slippage / Tensile Fatigue"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Explain the physical characteristics and diagnostic symptoms..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus}>
              Save Failure Code
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


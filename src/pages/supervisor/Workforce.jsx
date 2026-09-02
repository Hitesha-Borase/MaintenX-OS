import React, { useState } from "react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { Users, UserPlus, CheckCircle2, XCircle, Send } from "lucide-react";

export function Workforce() {
  const { addToast } = useApp();

  const [employees, setEmployees] = useState([
    { name: "Elena Rostova", role: "Lead Operator", shift: "Shift A", line: "Line 1", status: "Present" },
    { name: "Carlos Mendez", role: "Packer Operator", shift: "Shift A", line: "Line 1", status: "Present" },
    { name: "Sarah Jenkins", role: "Sanitation Specialist", shift: "Shift A", line: "Line 1", status: "Present" },
    { name: "David Kim", role: "Maintenance Technician", shift: "Shift A", line: "Line 1", status: "Present" }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: "", role: "Operator", line: "Line 1", shift: "Shift A" });

  const handleToggleStatus = (idx) => {
    setEmployees(prev =>
      prev.map((emp, i) => {
        if (i === idx) {
          const nextStatus = emp.status === "Present" ? "Absent" : "Present";
          addToast(`${emp.name} attendance updated to ${nextStatus}.`, nextStatus === "Present" ? "success" : "warning");
          return { ...emp, status: nextStatus };
        }
        return emp;
      })
    );
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name) return;
    setEmployees(prev => [...prev, { ...newWorker, status: "Present" }]);
    addToast(`${newWorker.name} added to ${newWorker.shift} Roster.`, "success");
    setNewWorker({ name: "", role: "Operator", line: "Line 1", shift: "Shift A" });
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Departmental Workforce
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Manage active shift workers, track attendance, and roster allocations
          </p>
        </div>

        <Button variant="primary" icon={UserPlus} onClick={() => setIsAddModalOpen(true)}>
          Add Worker to Shift
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {employees.map((emp, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Users size={20} color="#0284C7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{emp.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {emp.role} • {emp.line}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Badge variant={emp.shift === "Shift A" ? "cyan" : "amber"}>{emp.shift}</Badge>
              <Badge variant={emp.status === "Present" ? "emerald" : "danger"}>{emp.status}</Badge>

              <Button
                variant={emp.status === "Present" ? "secondary" : "success"}
                size="xs"
                icon={emp.status === "Present" ? XCircle : CheckCircle2}
                onClick={() => handleToggleStatus(idx)}
              >
                {emp.status === "Present" ? "Mark Absent" : "Mark Present"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Worker Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Shift Worker to Roster"
        subtitle="Department: Bottling & Packaging"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleAddWorker}>
              Add Worker
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddWorker} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Employee Name
            </label>
            <input
              type="text"
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Role
              </label>
              <select
                value={newWorker.role}
                onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                className="input-field"
              >
                <option value="Lead Operator">Lead Operator</option>
                <option value="Operator">Operator</option>
                <option value="Packer Operator">Packer Operator</option>
                <option value="Sanitation Specialist">Sanitation Specialist</option>
                <option value="Maintenance Tech">Maintenance Tech</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Shift
              </label>
              <select
                value={newWorker.shift}
                onChange={(e) => setNewWorker({ ...newWorker, shift: e.target.value })}
                className="input-field"
              >
                <option value="Shift A">Shift A (Day)</option>
                <option value="Shift B">Shift B (Evening)</option>
                <option value="Shift C">Shift C (Night)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { Users, UserMinus, RefreshCw, BadgeCheck, Shuffle, Send, UserCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function Staffing() {
  const { addToast } = useApp();

  const [staff, setStaff] = useState([
    { id: 1, name: "Elena Rostova", role: "Lead Operator", station: "Filler HMI", status: "Active", cert: "Aseptic Certified" },
    { id: 2, name: "Carlos Mendez", role: "Packer Operator", station: "End-of-Line Case Packer", status: "Active", cert: "Packaging Controls" },
    { id: 3, name: "Sarah Jenkins", role: "Sanitation Specialist", station: "CIP Station L1", status: "Active", cert: "Chemical Safety" },
    { id: 4, name: "David Kim", role: "Maintenance Technician", station: "Tool Bench L1", status: "On Standby", cert: "Electrical & High-Temp" }
  ]);

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [op1Id, setOp1Id] = useState(1);
  const [op2Id, setOp2Id] = useState(2);

  const handleReassign = (id, newStation) => {
    setStaff(prev =>
      prev.map(s => s.id === id ? { ...s, station: newStation } : s)
    );
    addToast(`Reassigned operator station to: ${newStation}`, "success");
  };

  const handleReplacement = (name) => {
    addToast(`Replacement dispatcher requested for ${name}. HR & Supervisor notified.`, "info");
  };

  const handleRequestRelief = () => {
    addToast("Relief operator requested for Line 1 lunch/break rotation. Supervisor notified.", "warning");
  };

  const handleSwapStationsSubmit = (e) => {
    e.preventDefault();
    const op1 = staff.find(s => s.id === Number(op1Id));
    const op2 = staff.find(s => s.id === Number(op2Id));

    if (!op1 || !op2 || op1.id === op2.id) {
      addToast("Please select two different operators to swap stations.", "warning");
      return;
    }

    setStaff(prev =>
      prev.map(s => {
        if (s.id === op1.id) return { ...s, station: op2.station };
        if (s.id === op2.id) return { ...s, station: op1.station };
        return s;
      })
    );

    addToast(`Swapped stations between ${op1.name} and ${op2.name}.`, "success");
    setIsSwapModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Line Staffing & Roster Allocation
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Shuffle} onClick={() => setIsSwapModalOpen(true)}>
            Swap Stations
          </Button>

          <Button variant="warning" icon={UserCheck} onClick={handleRequestRelief}>
            Request Relief Operator
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {staff.map((operator) => (
          <Card key={operator.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px 20px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#0284C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 700
                }}
              >
                {operator.name.split(" ").map(n => n.charAt(0)).join("")}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{operator.name}</h4>
                  <Badge variant={operator.status === "Active" ? "emerald" : "amber"}>{operator.status}</Badge>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                  Role: {operator.role} • Station: <strong style={{ color: "#0284C7" }}>{operator.station}</strong>
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <BadgeCheck size={12} color="#10B981" /> {operator.cert}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <select
                onChange={(e) => handleReassign(operator.id, e.target.value)}
                className="input-field"
                style={{ fontSize: "12px", padding: "4px 8px", height: "32px", width: "140px" }}
                value={operator.station}
              >
                <option value="Filler HMI">Filler HMI</option>
                <option value="End-of-Line Case Packer">Case Packer</option>
                <option value="CIP Station L1">CIP Station</option>
                <option value="Tool Bench L1">Tool Bench</option>
                <option value="Quality Desk">Quality Desk</option>
              </select>
              <Button variant="ghost" size="sm" icon={UserMinus} onClick={() => handleReplacement(operator.name)}>
                Replace
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Swap Stations Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Swap Operator Station Assignments"
        subtitle="Reassign station duties between two active shift operators"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSwapModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Shuffle} onClick={handleSwapStationsSubmit}>
              Confirm Station Swap
            </Button>
          </>
        }
      >
        <form onSubmit={handleSwapStationsSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              First Operator
            </label>
            <select
              value={op1Id}
              onChange={(e) => setOp1Id(e.target.value)}
              className="input-field"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.station})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Second Operator
            </label>
            <select
              value={op2Id}
              onChange={(e) => setOp2Id(e.target.value)}
              className="input-field"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.station})</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

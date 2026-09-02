import React, { useState } from "react";
import { Users, CheckCircle, Wand2, RefreshCw, Send } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function Staffing() {
  const { addToast } = useApp();
  const [approved, setApproved] = useState(false);

  const [crew, setCrew] = useState([
    { id: 1, name: "Elena Rostova", station: "Line 1 Filler HMI", status: "Allocated" },
    { id: 2, name: "Carlos Mendez", station: "Line 1 Case Packer", status: "Allocated" },
    { id: 3, name: "Sarah Jenkins", station: "Line 1 CIP Station", status: "Allocated" }
  ]);

  const [isReallocateModalOpen, setIsReallocateModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(crew[0]);
  const [targetLine, setTargetLine] = useState("Line 2 Blender Panel");

  const handleReassign = (id, newStation) => {
    setCrew(prev =>
      prev.map(c => c.id === id ? { ...c, station: newStation } : c)
    );
    addToast(`Reassigned crew station.`, "success");
  };

  const handleOpenReallocateModal = (member) => {
    setSelectedMember(member);
    setIsReallocateModalOpen(true);
  };

  const handleReallocateSubmit = (e) => {
    e.preventDefault();
    setCrew(prev =>
      prev.map(c => c.id === selectedMember.id ? { ...c, station: targetLine } : c)
    );
    addToast(`Reallocated operator ${selectedMember.name} to station "${targetLine}". Roster updated.`, "success");
    setIsReallocateModalOpen(false);
  };

  const handleApproveStaffing = () => {
    setApproved(true);
    addToast("Shift staffing roster authorized.", "success");
  };

  const handleAutoFill = () => {
    setCrew([
      { id: 1, name: "Elena Rostova", station: "Line 1 Filler HMI", status: "Allocated (Aseptic Cert)" },
      { id: 2, name: "Carlos Mendez", station: "Line 1 Case Packer", status: "Allocated (Packaging Cert)" },
      { id: 3, name: "Sarah Jenkins", station: "Line 1 CIP Station", status: "Allocated (Sanitation Cert)" }
    ]);
    addToast("Auto-filled station roster by matching certified operator skills.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Shift Staffing Allocations & Reallocations
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Assign certified operators to machine stations and swap rosters during bottlenecks
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Wand2} onClick={handleAutoFill}>
            Auto-Fill by Skill
          </Button>

          {!approved ? (
            <Button variant="success" icon={CheckCircle} onClick={handleApproveStaffing}>
              Authorize Staffing
            </Button>
          ) : (
            <Badge variant="emerald">Staffing Roster Signed</Badge>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {crew.map((member) => (
          <Card key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Users size={20} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{member.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Current Station: <strong style={{ color: "#0284C7" }}>{member.station}</strong>
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                onChange={(e) => handleReassign(member.id, e.target.value)}
                className="input-field"
                style={{ fontSize: "12px", padding: "4px 8px", height: "34px", width: "170px" }}
                defaultValue={member.station}
              >
                <option value="Line 1 Filler HMI">Line 1 Filler HMI</option>
                <option value="Line 1 Case Packer">Line 1 Case Packer</option>
                <option value="Line 1 CIP Station">Line 1 CIP Station</option>
                <option value="Line 2 Blender Panel">Line 2 Blender Panel</option>
              </select>

              <Button variant="warning" size="sm" icon={RefreshCw} onClick={() => handleOpenReallocateModal(member)}>
                Reallocate
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Reallocate Operator Modal */}
      <Modal
        isOpen={isReallocateModalOpen}
        onClose={() => setIsReallocateModalOpen(false)}
        title={`Reallocate Operator: ${selectedMember.name}`}
        subtitle={`Current Station: ${selectedMember.station}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReallocateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleReallocateSubmit}>
              Confirm Reallocation
            </Button>
          </>
        }
      >
        <form onSubmit={handleReallocateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Target Station / Line Assignment
            </label>
            <select
              value={targetLine}
              onChange={(e) => setTargetLine(e.target.value)}
              className="input-field"
            >
              <option value="Line 1 Filler HMI">Line 1 Filler HMI</option>
              <option value="Line 1 Case Packer">Line 1 Case Packer</option>
              <option value="Line 1 CIP Station">Line 1 CIP Station</option>
              <option value="Line 2 Blender Panel">Line 2 Blender Panel</option>
              <option value="Line 3 Palletizer Conveyor">Line 3 Palletizer Conveyor</option>
            </select>
          </div>

          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
            Reallocating <strong>{selectedMember.name}</strong> updates active line labor cost tracking and skill coverage tags on the target line.
          </div>
        </form>
      </Modal>
    </div>
  );
}

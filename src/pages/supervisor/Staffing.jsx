import React, { useState } from "react";
import { Users, CheckCircle } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Staffing() {
  const { addToast } = useApp();
  const [approved, setApproved] = useState(false);

  const [crew, setCrew] = useState([
    { id: 1, name: "Elena Rostova", station: "Line 1 Filler HMI", status: "Allocated" },
    { id: 2, name: "Carlos Mendez", station: "Line 1 Case Packer", status: "Allocated" },
    { id: 3, name: "Sarah Jenkins", station: "Line 1 CIP Station", status: "Allocated" }
  ]);

  const handleReassign = (id, newStation) => {
    setCrew(prev =>
      prev.map(c => c.id === id ? { ...c, station: newStation } : c)
    );
    addToast(`Reassigned crew station.`, "success");
  };

  const handleApproveStaffing = () => {
    setApproved(true);
    addToast("Shift staffing roster authorized.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Shift Staffing Allocations
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Allocate and authorize operator positions on the production lines
          </p>
        </div>

        {!approved ? (
          <Button variant="success" icon={CheckCircle} onClick={handleApproveStaffing}>
            Authorize Staffing
          </Button>
        ) : (
          <Badge variant="emerald">Staffing Roster Signed</Badge>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {crew.map((member) => (
          <Card key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{member.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Station: <strong style={{ color: "#38BDF8" }}>{member.station}</strong>
                </span>
              </div>
            </div>

            <select
              onChange={(e) => handleReassign(member.id, e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", padding: "4px 8px", height: "30px", width: "160px" }}
              defaultValue={member.station}
            >
              <option value="Line 1 Filler HMI">Line 1 Filler HMI</option>
              <option value="Line 1 Case Packer">Line 1 Case Packer</option>
              <option value="Line 1 CIP Station">Line 1 CIP Station</option>
              <option value="Line 2 Blender Panel">Line 2 Blender Panel</option>
            </select>
          </Card>
        ))}
      </div>
    </div>
  );
}

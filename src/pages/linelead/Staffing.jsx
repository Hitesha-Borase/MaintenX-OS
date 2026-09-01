import React, { useState } from "react";
import { Users, UserMinus, RefreshCw, BadgeCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Staffing() {
  const { addToast } = useApp();

  const [staff, setStaff] = useState([
    { id: 1, name: "Elena Rostova", role: "Lead Operator", station: "Filler HMI", status: "Active", cert: "Aseptic Certified" },
    { id: 2, name: "Carlos Mendez", role: "Packer Operator", station: "End-of-Line Case Packer", status: "Active", cert: "Packaging Controls" },
    { id: 3, name: "Sarah Jenkins", role: "Sanitation Specialist", station: "CIP Station L1", status: "Active", cert: "Chemical Safety" },
    { id: 4, name: "David Kim", role: "Maintenance Technician", station: "Tool Bench L1", status: "On Standby", cert: "Electrical & High-Temp" }
  ]);

  const handleReassign = (id, newStation) => {
    setStaff(prev =>
      prev.map(s => s.id === id ? { ...s, station: newStation } : s)
    );
    addToast(`Reassigned operator station to: ${newStation}`, "success");
  };

  const handleReplacement = (name) => {
    addToast(`Replacement dispatcher requested for ${name}. HR notifications sent.`, "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Staffing & Roster
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {staff.map((operator) => (
          <Card key={operator.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
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
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{operator.name}</h4>
                  <Badge variant={operator.status === "Active" ? "emerald" : "amber"}>{operator.status}</Badge>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                  Role: {operator.role} • Station: <strong style={{ color: "#38BDF8" }}>{operator.station}</strong>
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <BadgeCheck size={12} color="#10B981" /> {operator.cert}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <select
                onChange={(e) => handleReassign(operator.id, e.target.value)}
                className="input-field"
                style={{ fontSize: "12px", padding: "4px 8px", height: "30px", width: "130px" }}
                defaultValue={operator.station}
              >
                <option value="Filler HMI">Filler HMI</option>
                <option value="Case Packer">Case Packer</option>
                <option value="CIP Station">CIP Station</option>
                <option value="Tool Bench">Tool Bench</option>
                <option value="Quality Desk">Quality Desk</option>
              </select>
              <Button variant="ghost" size="sm" icon={UserMinus} onClick={() => handleReplacement(operator.name)}>
                Replace
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Clock, CheckSquare, ShieldCheck, DollarSign, Award } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function LabourTime() {
  const { addToast } = useApp();

  const [timesheet, setTimesheet] = useState([
    { id: 1, name: "Elena Rostova", clockIn: "05:55", expectedHours: 8.0, overtimeHours: 1.5, status: "Active" },
    { id: 2, name: "Carlos Mendez", clockIn: "06:00", expectedHours: 8.0, overtimeHours: 0.0, status: "Active" },
    { id: 3, name: "Sarah Jenkins", clockIn: "05:45", expectedHours: 8.5, overtimeHours: 0.5, status: "Active" }
  ]);

  const handleApproveTime = (id) => {
    setTimesheet(prev =>
      prev.map(t => t.id === id ? { ...t, status: "Approved" } : t)
    );
    addToast(`Timesheet & base hours approved for record #${id}.`, "success");
  };

  const handleApproveOvertime = (id, name, otHours) => {
    addToast(`Overtime authorization of +${otHours} hrs granted for ${name}.`, "success");
  };

  const handleVerifyAll = () => {
    setTimesheet(prev => prev.map(t => ({ ...t, status: "Verified & Locked" })));
    addToast("All shift timecards verified and locked for payroll processing.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Crew Hours & Clock In logs
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Verify operator clock ins, authorize shift timecards, and approve overtime labor premiums
          </p>
        </div>

        <Button variant="success" icon={ShieldCheck} onClick={handleVerifyAll}>
          Verify & Lock Timecards
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {timesheet.map((t) => (
          <Card key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t.name}</span>
                <Badge variant={t.status.includes("Approved") || t.status.includes("Verified") ? "emerald" : "cyan"}>{t.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Clock In: {t.clockIn} | Base Hours: {t.expectedHours} hrs | OT Requested: <strong style={{ color: t.overtimeHours > 0 ? "#D97706" : "var(--text-secondary)" }}>+{t.overtimeHours} hrs</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {t.overtimeHours > 0 && (
                <Button variant="warning" size="sm" icon={DollarSign} onClick={() => handleApproveOvertime(t.id, t.name, t.overtimeHours)}>
                  Approve OT (+{t.overtimeHours}h)
                </Button>
              )}

              {t.status === "Active" && (
                <Button variant="success" size="sm" icon={CheckSquare} onClick={() => handleApproveTime(t.id)}>
                  Authorize Base Time
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

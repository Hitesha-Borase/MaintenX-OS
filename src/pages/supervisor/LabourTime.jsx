import React, { useState } from "react";
import { Clock, CheckSquare } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function LabourTime() {
  const { addToast } = useApp();

  const [timesheet, setTimesheet] = useState([
    { id: 1, name: "Elena Rostova", clockIn: "05:55", expectedHours: 8.0, status: "Active" },
    { id: 2, name: "Carlos Mendez", clockIn: "06:00", expectedHours: 8.0, status: "Active" },
    { id: 3, name: "Sarah Jenkins", clockIn: "05:45", expectedHours: 8.5, status: "Active" }
  ]);

  const handleApproveTime = (id) => {
    setTimesheet(prev =>
      prev.map(t => t.id === id ? { ...t, status: "Approved" } : t)
    );
    addToast(`Timesheet hours approved.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Crew Hours & Clock In logs
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify crew timesheets and authorize shift labor hours
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {timesheet.map((t) => (
          <Card key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{t.name}</span>
                <Badge variant={t.status === "Approved" ? "emerald" : "cyan"}>{t.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Clock In: {t.clockIn} | Scheduled Hours: {t.expectedHours} hrs
              </div>
            </div>

            {t.status === "Active" && (
              <Button variant="success" size="sm" icon={CheckSquare} onClick={() => handleApproveTime(t.id)}>
                Authorize
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

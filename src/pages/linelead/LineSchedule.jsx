import React, { useState } from "react";
import { Calendar, Printer, ShieldCheck, Lock } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function LineSchedule() {
  const { addToast } = useApp();
  const [scheduleLocked, setScheduleLocked] = useState(false);

  const [scheduleList, setScheduleList] = useState([
    { id: "JOB-402", sku: "SKU-AJ-500ML-ORG", desc: "Organic Orange Juice 500ml", shift: "Shift A (Day)", duration: "6.5 hours", changeover: "30 min", status: "Running" },
    { id: "JOB-403", sku: "SKU-AJ-1L-ORG", desc: "Organic Orange Juice 1L", shift: "Shift B (Evening)", duration: "8.0 hours", changeover: "45 min", status: "Planned" },
    { id: "JOB-404", sku: "SKU-AJ-250ML-KIDS", desc: "Kids Orange Juice Box 250ml", shift: "Shift C (Night)", duration: "5.0 hours", changeover: "30 min", status: "Planned" }
  ]);

  const handleLockSchedule = () => {
    setScheduleLocked(true);
    addToast("Shift schedule locked successfully. Read-only HMI applied.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Line Run Schedule
          </h1>

        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print Schedule
          </Button>
          {!scheduleLocked ? (
            <Button variant="primary" icon={Lock} onClick={handleLockSchedule}>
              Lock Schedule
            </Button>
          ) : (
            <Badge variant="emerald">Schedule Locked</Badge>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {scheduleList.map((job) => (
          <Card key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: job.status === "Running" ? "4px solid #10B981" : "4px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{job.id}: {job.sku}</span>
                <Badge variant={job.status === "Running" ? "emerald" : "amber"}>{job.status}</Badge>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{job.desc}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Shift: {job.shift} • Duration: {job.duration} • Changeover required: {job.changeover}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

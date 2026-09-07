import React, { useState } from "react";
import { Trash2, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function ScrapReworkCost() {
  const { addToast } = useApp();

  const [scrapEvents, setScrapEvents] = useState([
    { id: "SCR-109", batch: "BAT-2026-0890", cost: "$4,200", reason: "CCP Excursion - Pasteurized product discarded", status: "Closed", department: "Pasteurization", loggedBy: "QA Lead" },
    { id: "REW-204", batch: "BAT-2026-0877", cost: "$1,800", reason: "Label alignment rework", status: "In Progress", department: "Packaging Line 1", loggedBy: "Shift Supervisor" }
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const handleOpenAudit = (ev) => {
    setSelectedEvent(ev);
    setIsAuditModalOpen(true);
  };

  const handleConfirmAudit = () => {
    addToast(`Quality hold and scrap audit log verified for event ${selectedEvent?.id}`, "success");
    setIsAuditModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Scrap & Rework Costing
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Scrap Cost (MTD)" value="$4,200" description="Std Target: <$3,000" icon={Trash2} color="#DC2626" />
        <StatCard title="Rework Cost (MTD)" value="$1,800" description="Std Target: <$2,000" icon={Trash2} color="#059669" />
        <StatCard title="Yield Loss Margin" value="3.1%" description="vs. 2.5% standard yield limit" icon={Trash2} color="#D97706" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Scrap & Rework Ledger
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {scrapEvents.map((ev, idx) => (
            <div
              key={idx}
              style={{
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px"
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {ev.id} ({ev.batch})
                  </span>
                  <Badge variant={ev.status === "Closed" ? "emerald" : "warning"}>{ev.status}</Badge>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Reason: <strong>{ev.reason}</strong>
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", flexShrink: 0 }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#DC2626", fontFamily: "var(--font-mono)" }}>
                  {ev.cost}
                </span>
                <Button variant="secondary" size="xs" icon={FileText} onClick={() => handleOpenAudit(ev)}>
                  Audit Log
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Log Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`Scrap & Rework Audit Log: ${selectedEvent?.id || ""}`}
        subtitle={`Batch: ${selectedEvent?.batch || ""}`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmAudit}>
              Export Audit Record
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Financial Impact: <strong style={{ color: "#DC2626", fontFamily: "var(--font-mono)" }}>{selectedEvent?.cost}</strong></div>
            <div>Department: <strong>{selectedEvent?.department}</strong></div>
            <div>Logged By: <strong>{selectedEvent?.loggedBy}</strong></div>
            <div>Status: <strong>{selectedEvent?.status}</strong></div>
          </div>
          <div>
            <strong>Root Cause / Incident Detail:</strong>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "4px" }}>{selectedEvent?.reason}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { AlertOctagon, Send, ShieldAlert, Users, Paperclip, Camera, Image } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";

export function Escalations() {
  const { exceptions, addException } = useExceptions();
  const { addToast } = useApp();

  const activeEscalations = exceptions ? exceptions.filter((e) => e.location?.includes("Line 1") || e.severity === "P1") : [];

  const [targetRole, setTargetRole] = useState("Plant Manager");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("Photo attachment: Photo_Nozzle_Leak_1420.jpg");
  const [activeEsc, setActiveEsc] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    addException({
      severity: "P1",
      category: "Downtime",
      title: `Escalation to ${targetRole}: ${subject}`,
      location: "Line 1 - Aseptic Bottling",
      details: details,
      owner: targetRole,
      escalationLevel: "Immediate Dispatch"
    });

    addToast(`Critical Escalation dispatched to ${targetRole}.`, "danger");
    setSubject("");
    setDetails("");
  };

  const handleOpenEvidence = (ex) => {
    setActiveEsc(ex);
    setIsEvidenceModalOpen(true);
  };

  const handleSaveEvidence = (e) => {
    e.preventDefault();
    addToast(`RCA 2.0 Evidence file attached to Escalation #${activeEsc?.id}.`, "success");
    setIsEvidenceModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Lead Escalation Console (P1 Control Tower)
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Dispatch critical operational escalations and attach RCA 2.0 evidence for rapid resolution
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Active Escalations */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
            Active Escalation Records
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activeEscalations.map((ex) => (
              <div
                key={ex.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{ex.id}</span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <Badge variant="danger">{ex.severity}</Badge>
                    <Button variant="secondary" size="xs" icon={Paperclip} onClick={() => handleOpenEvidence(ex)}>
                      Attach Evidence
                    </Button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: "#EF4444" }}>{ex.title}</div>
                <div style={{ color: "var(--text-secondary)" }}>Escalated To: {ex.owner}</div>
                <div style={{ fontStyle: "italic", color: "var(--text-secondary)", marginTop: "4px" }}>"{ex.details || ex.impactDescription}"</div>
              </div>
            ))}
          </div>
        </Card>

        {/* New Escalation Form */}
        <form onSubmit={handleSubmit}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              Dispatch New Escalation
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Escalate Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="Plant Manager">Plant Manager</option>
                  <option value="Maintenance Lead / Planner">Maintenance Lead / Planner</option>
                  <option value="Warehouse & Logistics Lead">Warehouse & Logistics Lead</option>
                  <option value="Quality QA Manager">Quality QA Manager</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Escalation Subject
                </label>
                <input
                  type="text"
                  placeholder="E.g. Safety hazard near filler..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Details & Justification
                </label>
                <textarea
                  placeholder="Provide details for why this is escalated..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="input-field"
                  style={{ width: "100%", height: "38px", minHeight: "38px", resize: "vertical" }}
                  required
                />
              </div>

              <div>
                <Button type="submit" variant="danger" icon={Send} style={{ width: "100%", height: "38px" }}>
                  Dispatch Escalation
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>

      {/* Attach RCA 2.0 Evidence Modal */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title="Attach RCA 2.0 Breakdown Evidence / Photo"
        subtitle={`Escalation ID: ${activeEsc?.id}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEvidenceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSaveEvidence}>
              Upload & Attach Evidence
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEvidence} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Evidence File Attachment / Photo URL
            </label>
            <input
              type="text"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
            Attaching failure photos or sensor telemetry logs provides immediate evidence for Maintenance Techs and RCA 2.0 root-cause investigations.
          </div>
        </form>
      </Modal>
    </div>
  );
}

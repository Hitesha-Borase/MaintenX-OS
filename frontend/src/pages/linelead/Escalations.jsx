import React, { useState, useEffect } from "react";
import { AlertOctagon, Send, ShieldAlert, Users, Paperclip, Camera, Image } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function Escalations() {
  const { exceptions, addException } = useExceptions();
  const { addToast } = useApp();

  const [activeEscalations, setActiveEscalations] = useState([
    { id: "EXC-2026-174", severity: "P1", title: "Mechanical breakdown: High-Speed Rotary Filler 12-Head", owner: "Unassigned", details: "ewqd" },
    { id: "EXC-2026-081", severity: "P1", title: "Pasteurizer HTST-300 Unplanned Breakdown (Loop Pressure Loss)", owner: "David Kim (Thermal Tech)", details: "Line 2 halted. 1,200L blend buffer on QA hold. 5,000L order delayed." },
    { id: "EXC-2026-080", severity: "P1", title: "Pasteurization Thermal Excursion below Critical Control Limit (83.1°C)", owner: "Sarah Jenkins (QA Lead)", details: "CCP violation alarm triggered. Tank TK-04 quarantined under RED hold tag." }
  ]);

  const [targetRole, setTargetRole] = useState("Plant Manager");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("Photo attachment: Photo_Nozzle_Leak_1420.jpg");
  const [activeEsc, setActiveEsc] = useState(null);

  // Loading states
  const [dispatching, setDispatching] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Fetch escalations from backend on mount
  useEffect(() => {
    dashboardService.getEscalations()
      .then(data => {
        if (data && Array.isArray(data)) {
          setActiveEscalations(data);
        }
      })
      .catch(err => console.warn("[Escalations] Failed to load backend escalations:", err.message));
  }, []);

  // Sync with context if available
  useEffect(() => {
    if (exceptions && exceptions.length > 0) {
      const p1s = exceptions.filter((e) => e.location?.includes("Line 1") || e.severity === "P1");
      if (p1s.length > 0) {
        setActiveEscalations(prev => {
          const combined = [...p1s];
          prev.forEach(item => {
            if (!combined.some(c => c.id === item.id)) combined.push(item);
          });
          return combined;
        });
      }
    }
  }, [exceptions]);

  // ─── Dispatch Escalation -> POST /api/v1/dashboards/linelead/escalations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDispatching(true);

    try {
      const res = await dashboardService.dispatchEscalation({ targetRole, subject, details });

      const newEsc = res?.id ? res : {
        id: `EXC-2026-${Math.floor(100 + Math.random() * 900)}`,
        severity: "P1",
        title: `Escalation to ${targetRole}: ${subject}`,
        owner: targetRole,
        details: details
      };

      setActiveEscalations(prev => [newEsc, ...prev]);

      addException({
        id: newEsc.id,
        severity: "P1",
        category: "Downtime",
        title: newEsc.title,
        location: "Line 1 - Aseptic Bottling",
        details: details,
        owner: targetRole,
        escalationLevel: "Immediate Dispatch"
      });

      addToast(res?.message || `Critical Escalation dispatched to ${targetRole}.`, "danger");
      setSubject("");
      setDetails("");
    } catch (err) {
      const newEsc = {
        id: `EXC-2026-${Math.floor(100 + Math.random() * 900)}`,
        severity: "P1",
        title: `Escalation to ${targetRole}: ${subject}`,
        owner: targetRole,
        details: details
      };

      setActiveEscalations(prev => [newEsc, ...prev]);

      addException({
        id: newEsc.id,
        severity: "P1",
        category: "Downtime",
        title: newEsc.title,
        location: "Line 1 - Aseptic Bottling",
        details: details,
        owner: targetRole,
        escalationLevel: "Immediate Dispatch"
      });

      addToast(`Critical Escalation dispatched to ${targetRole}.`, "danger");
      setSubject("");
      setDetails("");
    } finally {
      setDispatching(false);
    }
  };

  const handleOpenEvidence = (ex) => {
    setActiveEsc(ex);
    setIsEvidenceModalOpen(true);
  };

  // ─── Attach Evidence -> POST /api/v1/dashboards/linelead/escalations/:id/evidence
  const handleSaveEvidence = async (e) => {
    e.preventDefault();
    if (!activeEsc) return;

    setUploadingEvidence(true);
    try {
      const res = await dashboardService.attachEscalationEvidence(activeEsc.id, { evidenceNote });
      addToast(res?.message || `RCA 2.0 Evidence file attached to Escalation #${activeEsc?.id}.`, "success");
      setIsEvidenceModalOpen(false);
    } catch (err) {
      addToast(`RCA 2.0 Evidence file attached to Escalation #${activeEsc?.id}.`, "success");
      setIsEvidenceModalOpen(false);
    } finally {
      setUploadingEvidence(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Lead Escalation Console (P1 Control Tower)
        </h1>
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
                    <Badge variant="danger">{ex.severity || "P1"}</Badge>
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
                <Button type="submit" variant="danger" icon={Send} style={{ width: "100%", height: "38px" }} disabled={dispatching}>
                  {dispatching ? "Dispatching..." : "Dispatch Escalation"}
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
            <Button variant="primary" icon={Send} onClick={handleSaveEvidence} disabled={uploadingEvidence}>
              {uploadingEvidence ? "Uploading..." : "Upload & Attach Evidence"}
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

import React, { useState } from "react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { Award, Calendar, RefreshCw, FileText, Send, Plus } from "lucide-react";

export function SkillsTraining() {
  const { addToast } = useApp();

  const [qualifications, setQualifications] = useState([
    { id: 1, name: "Elena Rostova", skill: "Aseptic Processing Level 3", expiry: "2027-04-12", status: "Active Certification" },
    { id: 2, name: "Carlos Mendez", skill: "Packaging Controls", expiry: "2026-11-20", status: "Active Certification" },
    { id: 3, name: "Sarah Jenkins", skill: "CIP Allergen Wash Procedures", expiry: "2027-01-15", status: "Active Certification" }
  ]);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activeWorker, setActiveWorker] = useState(null);

  const [trainingForm, setTrainingForm] = useState({
    workerName: "Carlos Mendez",
    courseName: "High-Speed Aseptic Sterilization Re-Certification",
    targetDate: "2026-10-15"
  });

  const [renewDate, setRenewDate] = useState("2028-04-12");

  const handleOpenRenewModal = (q) => {
    setActiveWorker(q);
    setIsRenewModalOpen(true);
  };

  const handleOpenAuditModal = (q) => {
    setActiveWorker(q);
    setIsAuditModalOpen(true);
  };

  const handleScheduleTraining = (e) => {
    e.preventDefault();
    addToast(`Re-training session scheduled for ${trainingForm.workerName}: ${trainingForm.courseName}.`, "success");
    setIsScheduleModalOpen(false);
  };

  const handleRenewSubmit = (e) => {
    e.preventDefault();
    setQualifications(prev =>
      prev.map(q => q.id === activeWorker.id ? { ...q, expiry: renewDate, status: "Renewed & Validated" } : q)
    );
    addToast(`Certification for ${activeWorker?.name} renewed until ${renewDate}. HACCP Audit Log updated.`, "success");
    setIsRenewModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Departmental Qualifications & Skills
          </h1>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsScheduleModalOpen(true)}>
          Schedule Re-Training
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {qualifications.map((q) => (
          <Card key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Award size={22} color="#D97706" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{q.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Credential: <strong style={{ color: "#0284C7" }}>{q.skill}</strong>
                </span>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Expires: <strong style={{ color: "var(--text-primary)" }}>{q.expiry}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Badge variant={q.status.includes("Renewed") ? "emerald" : "cyan"}>{q.status}</Badge>

              <Button
                variant="secondary"
                size="xs"
                icon={FileText}
                onClick={() => handleOpenAuditModal(q)}
              >
                View Audit
              </Button>

              <Button
                variant="warning"
                size="xs"
                icon={RefreshCw}
                onClick={() => handleOpenRenewModal(q)}
              >
                Renew Certificate
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Schedule Re-Training Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Operator Re-Training Session"
        subtitle="HACCP & Equipment Safety Program"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleScheduleTraining}>
              Confirm Training Session
            </Button>
          </>
        }
      >
        <form onSubmit={handleScheduleTraining} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Select Worker
            </label>
            <select
              value={trainingForm.workerName}
              onChange={(e) => setTrainingForm({ ...trainingForm, workerName: e.target.value })}
              className="input-field"
            >
              <option value="Elena Rostova">Elena Rostova</option>
              <option value="Carlos Mendez">Carlos Mendez</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Training Course / Certification
            </label>
            <input
              type="text"
              value={trainingForm.courseName}
              onChange={(e) => setTrainingForm({ ...trainingForm, courseName: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Target Session Date
            </label>
            <input
              type="date"
              value={trainingForm.targetDate}
              onChange={(e) => setTrainingForm({ ...trainingForm, targetDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Renew Certificate Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Renew Operator Credential"
        subtitle={`Worker: ${activeWorker?.name} (${activeWorker?.skill})`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={Send} onClick={handleRenewSubmit}>
              Authorize Renewal
            </Button>
          </>
        }
      >
        <form onSubmit={handleRenewSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              New Expiration Date
            </label>
            <input
              type="date"
              value={renewDate}
              onChange={(e) => setRenewDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
            Renewing this certification grants authorization for the operator to run regulated Aseptic and Allergen Wash machinery for another 12 months.
          </div>
        </form>
      </Modal>

      {/* View Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Certification Audit & HACCP Compliance"
        subtitle={`Employee: ${activeWorker?.name}`}
        maxWidth="500px"
        footer={
          <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>
            Close Audit View
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Credential Name:</span>
            <strong style={{ color: "var(--text-primary)" }}>{activeWorker?.skill}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Certified Issuer:</span>
            <span>National Food Safety Training Board</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Verification Status:</span>
            <Badge variant="emerald">HACCP AUDITED & PASSED</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>Current Expiry:</span>
            <strong style={{ color: "#D97706" }}>{activeWorker?.expiry}</strong>
          </div>
        </div>
      </Modal>
    </div>
  );
}

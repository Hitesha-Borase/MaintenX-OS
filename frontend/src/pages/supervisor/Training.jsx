import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  ShieldCheck,
  Send,
  RefreshCw,
  UserCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { TRAINING_PROGRAMS } from "../../data/mockLabour";

export function Training() {
  const { addToast } = useApp();

  const [trainings, setTrainings] = useState(TRAINING_PROGRAMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [completionModal, setCompletionModal] = useState(null);

  const [newTraining, setNewTraining] = useState({
    trainingProgram: "",
    employee: "Carlos Mendez",
    employeeId: "EMP-106",
    trainingType: "Technical Qualification",
    completionDate: "Pending",
    expiryDate: "2027-09-30",
    trainer: "Marcus Vance",
    status: "Not Started",
    certification: "Pending Certification Exam"
  });

  const [completionData, setCompletionData] = useState({
    completionDate: new Date().toISOString().substring(0, 10),
    expiryDate: "2027-09-05",
    certificationNumber: "CERT-2026-904"
  });

  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      const matchesSearch =
        t.trainingProgram.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.certification.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "All" || t.status === selectedStatus;
      const matchesType = selectedType === "All" || t.trainingType === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [trainings, searchQuery, selectedStatus, selectedType]);

  const handleEnrollTraining = (e) => {
    e.preventDefault();
    if (!newTraining.trainingProgram) return;
    const added = {
      id: `TRN-0${trainings.length + 1}`,
      ...newTraining
    };
    setTrainings((prev) => [added, ...prev]);
    addToast(`Enrolled ${newTraining.employee} into "${newTraining.trainingProgram}".`, "success");
    setIsEnrollModalOpen(false);
    setNewTraining({
      trainingProgram: "",
      employee: "Carlos Mendez",
      employeeId: "EMP-106",
      trainingType: "Technical Qualification",
      completionDate: "Pending",
      expiryDate: "2027-09-30",
      trainer: "Marcus Vance",
      status: "Not Started",
      certification: "Pending Certification Exam"
    });
  };

  const handleMarkCompleted = (e) => {
    e.preventDefault();
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === completionModal.id
          ? {
              ...t,
              status: "Completed",
              completionDate: completionData.completionDate,
              expiryDate: completionData.expiryDate,
              certification: `${t.trainingProgram.split(' ')[0]} Certified (${completionData.certificationNumber})`
            }
          : t
      )
    );
    addToast(`Training for ${completionModal.employee} marked Completed. Certificate ${completionData.certificationNumber} issued.`, "success");
    setCompletionModal(null);
  };

  const handleExportCSV = () => {
    const headers = "Training ID,Training Program,Employee,Training Type,Completion Date,Expiry Date,Trainer,Status,Certification\n";
    const rows = trainings
      .map(
        (t) =>
          `"${t.id}","${t.trainingProgram}","${t.employee}","${t.trainingType}","${t.completionDate}","${t.expiryDate}","${t.trainer}","${t.status}","${t.certification}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaintenX_Training_Records_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Training records exported to CSV.", "info");
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed":
        return "emerald";
      case "In Progress":
        return "cyan";
      case "Not Started":
        return "slate";
      case "Expired":
        return "amber";
      default:
        return "slate";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Training & Certification Programs
            </h1>
            <Badge variant="cyan">{trainings.length} Active Tracks</Badge>
            <Badge variant="emerald">{trainings.filter((t) => t.status === "Completed").length} Certified</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Mandatory safety, SOP refresher programs, technical machine qualifications, and trainer sign-offs.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Records
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsEnrollModalOpen(true)}>
            + Enroll in Training
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        <StatCard
          title="Completed Certifications"
          value={trainings.filter((t) => t.status === "Completed").length}
          unit="Certified"
          trend={{ value: "Audit-ready compliance", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="In Progress"
          value={trainings.filter((t) => t.status === "In Progress").length}
          unit="Employees"
          trend={{ value: "Active coursework / practicals", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Not Started"
          value={trainings.filter((t) => t.status === "Not Started").length}
          unit="Scheduled"
          trend={{ value: "Upcoming Q3 sessions", isPositive: true, text: "" }}
          icon={BookOpen}
          colorVariant="indigo"
        />
        <StatCard
          title="Expired / Due for Refresh"
          value={trainings.filter((t) => t.status === "Expired").length}
          unit="Urgent Action"
          trend={{ value: "Re-test required within 14 days", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
      </div>

      {/* Search & Filter Bar */}
      <Card style={{ padding: "14px 18px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: "1 1 300px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search training program, employee, or trainer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "36px", width: "100%", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", padding: "6px 10px", height: "36px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
            </select>

            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginLeft: "4px" }}>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field"
              style={{ fontSize: "12px", padding: "6px 10px", height: "36px" }}
            >
              <option value="All">All Types</option>
              <option value="Mandatory Safety">Mandatory Safety</option>
              <option value="Technical Qualification">Technical Qualification</option>
              <option value="SOP Refresh">SOP Refresh</option>
              <option value="Onboarding">Onboarding</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Training Table */}
      <Card style={{ padding: "0", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Workforce Training Log ({filteredTrainings.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Official training progression records, dates, certified instructors, and credentials.
            </span>
          </div>
        </div>

        <div className="data-table-container" style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "980px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>TRAINING PROGRAM</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>EMPLOYEE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>TRAINING TYPE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>COMPLETION DATE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>EXPIRY DATE</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>TRAINER</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>STATUS</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>CERTIFICATION</th>
                <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right", whiteSpace: "nowrap" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainings.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-subtle)", height: "46px" }}>
                  {/* Training Program */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{t.trainingProgram}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{t.id}</div>
                  </td>

                  {/* Employee */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>{t.employee}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.employeeId}</div>
                  </td>

                  {/* Training Type */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={t.trainingType === "Mandatory Safety" ? "amber" : "cyan"}>
                      {t.trainingType}
                    </Badge>
                  </td>

                  {/* Completion Date */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {t.completionDate}
                  </td>

                  {/* Expiry Date */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", fontFamily: "var(--font-mono)", color: t.status === "Expired" ? "#DC2626" : "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {t.expiryDate}
                  </td>

                  {/* Trainer */}
                  <td style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {t.trainer}
                  </td>

                  {/* Status (Not Started, In Progress, Completed, Expired) */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={getStatusBadgeVariant(t.status)} dot>
                      {t.status}
                    </Badge>
                  </td>

                  {/* Certification */}
                  <td style={{ padding: "8px 14px", fontSize: "12px", color: "#0284C7", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {t.certification}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    {t.status !== "Completed" ? (
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={CheckCircle2}
                        onClick={() => setCompletionModal(t)}
                        style={{ padding: "4px 8px", fontSize: "11px", height: "28px" }}
                      >
                        Sign Off
                      </Button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                        ✓ Valid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1. ENROLL IN TRAINING MODAL */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Employee in Training Track"
        subtitle="HACCP, OSHA & Machine Operational Qualification"
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleEnrollTraining}>
              Confirm Enrollment
            </Button>
          </>
        }
      >
        <form onSubmit={handleEnrollTraining} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Training Program Title
            </label>
            <input
              type="text"
              value={newTraining.trainingProgram}
              onChange={(e) => setNewTraining({ ...newTraining, trainingProgram: e.target.value })}
              placeholder="e.g. High-Speed Rotary Capper Clean-in-Place Validation"
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Employee Name
              </label>
              <input
                type="text"
                value={newTraining.employee}
                onChange={(e) => setNewTraining({ ...newTraining, employee: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Training Type
              </label>
              <select
                value={newTraining.trainingType}
                onChange={(e) => setNewTraining({ ...newTraining, trainingType: e.target.value })}
                className="input-field"
              >
                <option value="Mandatory Safety">Mandatory Safety</option>
                <option value="Technical Qualification">Technical Qualification</option>
                <option value="SOP Refresh">SOP Refresh</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Assigned Trainer
              </label>
              <input
                type="text"
                value={newTraining.trainer}
                onChange={(e) => setNewTraining({ ...newTraining, trainer: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Status
              </label>
              <select
                value={newTraining.status}
                onChange={(e) => setNewTraining({ ...newTraining, status: e.target.value })}
                className="input-field"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Expiry Date
            </label>
            <input
              type="date"
              value={newTraining.expiryDate}
              onChange={(e) => setNewTraining({ ...newTraining, expiryDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>

      {/* 2. SIGN OFF COMPLETION MODAL */}
      <Modal
        isOpen={!!completionModal}
        onClose={() => setCompletionModal(null)}
        title="Sign Off Training Completion"
        subtitle={`Program: ${completionModal?.trainingProgram} • Trainee: ${completionModal?.employee}`}
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCompletionModal(null)}>
              Cancel
            </Button>
            <Button variant="success" icon={Award} onClick={handleMarkCompleted}>
              Issue Certificate & Sign Off
            </Button>
          </>
        }
      >
        {completionModal && (
          <form onSubmit={handleMarkCompleted} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "12px", backgroundColor: "rgba(16, 185, 129, 0.08)", borderRadius: "6px", borderLeft: "4px solid #10B981" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>Sign-off Trainer: {completionModal.trainer}</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Audit trail verification that employee satisfied all written and practical evaluation standards.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Completion Date
                </label>
                <input
                  type="date"
                  value={completionData.completionDate}
                  onChange={(e) => setCompletionData({ ...completionData, completionDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Certificate Expiration
                </label>
                <input
                  type="date"
                  value={completionData.expiryDate}
                  onChange={(e) => setCompletionData({ ...completionData, expiryDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Certification Docket Number
              </label>
              <input
                type="text"
                value={completionData.certificationNumber}
                onChange={(e) => setCompletionData({ ...completionData, certificationNumber: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

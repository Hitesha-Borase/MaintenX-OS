import React, { useState } from "react";
import { TrendingUp, Award, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function CISavings() {
  const { addToast } = useApp();

  const [savingProjects, setSavingProjects] = useState([
    { id: "CI-001", title: "OEE Improvement — Line 1 Filler", projected: "$42,000", actual: "$38,200", status: "Verified" },
    { id: "CI-002", title: "CIP Cycle Time Reduction", projected: "$18,000", actual: "$14,800", status: "Pending Verification" }
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const handleOpenVerifyModal = (project) => {
    setSelectedProject(project);
    setIsVerifyModalOpen(true);
  };

  const handleConfirmVerification = () => {
    if (!selectedProject) return;

    setSavingProjects(prev =>
      prev.map(p => p.id === selectedProject.id ? { ...p, status: "Verified", actual: p.projected } : p)
    );

    addToast(`Signed off and verified YTD savings for project ${selectedProject.id}`, "success");
    setIsVerifyModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      <div>
        <h1 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
          Continuous Improvement (CI) Savings
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Total YTD Savings" value="$53,000" description="Sustainment phase active" icon={TrendingUp} color="#059669" />
        <StatCard title="Projected CI Savings" value="$60,000" description="YTD targets" icon={TrendingUp} color="#0284C7" />
        <StatCard title="Benefits Verified" value="84.2%" description="Audit verified" icon={TrendingUp} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "16px 18px", boxSizing: "border-box", minWidth: 0 }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 14px 0" }}>
          CI Savings Portfolio
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          {savingProjects.map((p, idx) => (
            <div
              key={idx}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxSizing: "border-box",
                minWidth: 0
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", wordBreak: "break-word", flex: "1 1 200px" }}>
                  {p.id}: {p.title}
                </span>
                <Badge variant={p.status === "Verified" ? "emerald" : "warning"}>
                  {p.status}
                </Badge>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "4px", borderTop: "1px dashed var(--border-subtle)" }}>
                <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span>Projected: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{p.projected}</strong></span>
                  <span>Actual Realized: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{p.actual}</strong></span>
                </div>

                {p.status === "Pending Verification" && (
                  <Button variant="success" size="xs" icon={Award} onClick={() => handleOpenVerifyModal(p)} style={{ fontSize: "12px", height: "30px", padding: "4px 12px", fontWeight: 700 }}>
                    Verify Benefits
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Benefits Verification Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={`Verify CI Project Benefits: ${selectedProject?.id || ""}`}
        subtitle={selectedProject?.title}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmVerification}>
              Sign Off & Confirm Savings
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "13px" }}>
            <div>Projected Savings: <strong>{selectedProject?.projected}</strong></div>
            <div>Realized Savings to Date: <strong style={{ color: "#059669" }}>{selectedProject?.actual}</strong></div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            Clicking sign off will confirm the project savings audit and update the enterprise financial ledger.
          </p>
        </div>
      </Modal>
    </div>
  );
}

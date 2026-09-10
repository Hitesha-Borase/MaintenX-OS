import React, { useState, useEffect } from "react";
import { TrendingUp, Award, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function CISavings() {
  const { addToast } = useApp();

  const [savingProjects, setSavingProjects] = useState([]);
  const [totalYtdSavings, setTotalYtdSavings] = useState("$53,000");
  const [projectedCiSavings, setProjectedCiSavings] = useState("$60,000");
  const [benefitsVerified, setBenefitsVerified] = useState("84.2%");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const fetchCiData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getCiSavings();
      const data = res.data || res;
      if (data) {
        if (data.projects) setSavingProjects(data.projects);
        if (data.totalYtdSavings) setTotalYtdSavings(data.totalYtdSavings);
        if (data.projectedCiSavings) setProjectedCiSavings(data.projectedCiSavings);
        if (data.benefitsVerified) setBenefitsVerified(data.benefitsVerified);
      }
    } catch (err) {
      console.error("Error loading CI savings:", err);
      addToast("Failed to load CI savings portfolio", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCiData();
  }, []);

  const handleOpenVerifyModal = (project) => {
    setSelectedProject(project);
    setIsVerifyModalOpen(true);
  };

  const handleConfirmVerification = async () => {
    if (!selectedProject) return;
    try {
      setVerifying(true);
      const res = await executiveService.verifyCiProjectSavings({ projectId: selectedProject.id });
      const data = res.data || res;
      if (data && data.projects) {
        setSavingProjects(data.projects);
      }
      addToast(data?.message || `Signed off and verified YTD savings for project ${selectedProject.id}`, "success");
      setIsVerifyModalOpen(false);
    } catch (err) {
      console.error("Error verifying CI project:", err);
      addToast("Failed to sign off project savings", "error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      <div>
        <h1 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
          Continuous Improvement (CI) Savings
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Total YTD Savings" value={totalYtdSavings} description="Sustainment phase active" icon={TrendingUp} color="#059669" />
        <StatCard title="Projected CI Savings" value={projectedCiSavings} description="YTD targets" icon={TrendingUp} color="#0284C7" />
        <StatCard title="Benefits Verified" value={benefitsVerified} description="Audit verified" icon={TrendingUp} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "16px 18px", boxSizing: "border-box", minWidth: 0 }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 14px 0" }}>
          CI Savings Portfolio
        </h3>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
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
        )}
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
            <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmVerification} disabled={verifying}>
              {verifying ? "Signing Off..." : "Sign Off & Confirm Savings"}
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

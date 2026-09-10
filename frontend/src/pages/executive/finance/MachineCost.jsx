import React, { useState, useEffect } from "react";
import { Settings, Cpu, Zap, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function MachineCost() {
  const { addToast } = useApp();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [machineCostMtd, setMachineCostMtd] = useState("$52,300");
  const [stdTarget, setStdTarget] = useState("$50,000");
  const [electricitySteam, setElectricitySteam] = useState("$14,200");
  const [toolingAmortization, setToolingAmortization] = useState("$18,000");
  const [machineRates, setMachineRates] = useState([]);

  const fetchMachineData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getMachineCosts();
      const data = res.data || res;
      if (data) {
        if (data.rates) setMachineRates(data.rates);
        if (data.machineCostMtd) setMachineCostMtd(data.machineCostMtd);
        if (data.stdTarget) setStdTarget(data.stdTarget);
        if (data.electricitySteam) setElectricitySteam(data.electricitySteam);
        if (data.toolingAmortization) setToolingAmortization(data.toolingAmortization);
      }
    } catch (err) {
      console.error("Error loading machine costs:", err);
      addToast("Failed to load machine costs telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData();
  }, []);

  const handleUtilityAudit = () => {
    setIsAuditModalOpen(true);
  };

  const handleConfirmAudit = async () => {
    try {
      setExporting(true);
      const res = await executiveService.auditMachineEfficiency({ timestamp: new Date().toISOString() });
      const data = res.data || res;
      addToast(data?.message || "Utility efficiency report dispatched to executive inbox.", "success");
      setIsAuditModalOpen(false);
    } catch (err) {
      console.error("Error generating utility report:", err);
      addToast("Failed to generate utility report", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Machine Time & Utility Costs
        </h1>
        <Button variant="secondary" icon={Cpu} onClick={handleUtilityAudit}>
          Analyze Utility Efficiency
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Machine Cost (MTD)" value={machineCostMtd} description={`Std target: ${stdTarget}`} icon={Settings} color="#0284C7" />
        <StatCard title="Electricity / Steam" value={electricitySteam} description="Actual utility allocation" icon={Zap} color="#059669" />
        <StatCard title="Tooling Amortization" value={toolingAmortization} description="Based on runtime hrs" icon={Settings} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Standard Machine Cost Rates
        </h3>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {machineRates.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.machine}</span>
                  <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    <span>Std Rate: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.stdRate}</strong></span>
                    <span>Act Rate: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.actRate}</strong></span>
                    <span>Utility: {item.energy}</span>
                  </div>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: item.status === "Optimal" ? "#059669" : "#DC2626", flexShrink: 0 }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Utility Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Utility Efficiency Analysis"
        subtitle="Machine time and energy allocation review for current period"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>Close</Button>
            <Button variant="primary" icon={Cpu} onClick={handleConfirmAudit} disabled={exporting}>
              {exporting ? "Generating..." : "Export Report"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>Machine Cost MTD: <strong>{machineCostMtd}</strong></div>
            <div>Standard Budget: <strong>{stdTarget}</strong></div>
            <div>Variance: <strong style={{ color: "#DC2626" }}>+$2,300 Over</strong></div>
            <div>Electricity: <strong>{electricitySteam}</strong></div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            Pasteurizer Unit on Line 1 showing $2.50/hr over-run due to steam pressure variance. Recommend CMMS PM inspection before next production run.
          </p>
        </div>
      </Modal>
    </div>
  );
}

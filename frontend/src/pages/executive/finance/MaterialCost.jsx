import React, { useState, useEffect } from "react";
import { Package, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function MaterialCost() {
  const { addToast } = useApp();

  const [rates, setRates] = useState([]);
  const [materialCostMtd, setMaterialCostMtd] = useState("$229,300");
  const [stdTarget, setStdTarget] = useState("$225,000");
  const [yieldLossAllocation, setYieldLossAllocation] = useState("$5,200");
  const [packagingCostMtd, setPackagingCostMtd] = useState("$44,100");
  const [packagingStdTarget, setPackagingStdTarget] = useState("$45,000");
  const [loading, setLoading] = useState(true);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchMaterialData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getMaterialCosts();
      const data = res.data || res;
      if (data) {
        setRates(data.rates || []);
        if (data.materialCostMtd) setMaterialCostMtd(data.materialCostMtd);
        if (data.stdTarget) setStdTarget(data.stdTarget);
        if (data.yieldLossAllocation) setYieldLossAllocation(data.yieldLossAllocation);
        if (data.packagingCostMtd) setPackagingCostMtd(data.packagingCostMtd);
        if (data.packagingStdTarget) setPackagingStdTarget(data.packagingStdTarget);
      }
    } catch (err) {
      console.error("Error loading material costs:", err);
      addToast("Failed to load material costs telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialData();
  }, []);

  const handleUpdateContracts = () => {
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setUpdating(true);
      const res = await executiveService.updateContractRates({ timestamp: new Date().toISOString() });
      const data = res.data || res;
      if (data && data.rates) {
        setRates(data.rates);
      }
      addToast(data?.message || "Raw materials supply contract rates synced from ERP.", "success");
      setIsUpdateModalOpen(false);
    } catch (err) {
      console.error("Error updating contract rates:", err);
      addToast("Failed to sync contract rates from ERP", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Material & Packaging Costs
        </h1>
        <Button variant="secondary" icon={RefreshCw} onClick={handleUpdateContracts}>
          Update Contract Rates
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Material Cost (MTD)" value={materialCostMtd} description={`Std target: ${stdTarget}`} icon={Package} color="#0284C7" />
        <StatCard title="Yield Loss Allocation" value={yieldLossAllocation} description="Scrap/spillages" icon={Package} color="#DC2626" />
        <StatCard title="Packaging Cost (MTD)" value={packagingCostMtd} description={`Std target: ${packagingStdTarget}`} icon={Package} color="#059669" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Raw Material Standards List
        </h3>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rates.map((item, idx) => (
              <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.item}</span>
                  <div style={{ display: "flex", gap: "14px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    <span>Std Price: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.stdPrice}</strong></span>
                    <span>Act Price: <strong style={{ color: item.status?.includes("Over") ? "#DC2626" : "#059669", fontFamily: "var(--font-mono)" }}>{item.actPrice}</strong></span>
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: item.status === "Optimal" ? "#059669" : "#DC2626", fontWeight: 800, flexShrink: 0 }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Update Contract Rates Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Raw Material Contract Rates"
        subtitle="Sync latest pricing from ERP supply contract database"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={RefreshCw} onClick={handleConfirmUpdate} disabled={updating}>
              {updating ? "Syncing ERP..." : "Sync Contract Rates"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Items to Update: <strong>{rates.length} Raw Materials</strong></div>
            <div>Material Cost MTD: <strong>{materialCostMtd}</strong></div>
            <div>Standard Budget: <strong>{stdTarget}</strong></div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", color: "#D97706", fontSize: "12px" }}>
            <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Liquid Apple Concentrate currently <strong>+$0.05/L</strong> over standard contract price. ERP sync will update this to latest negotiated rate.</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            This will fetch the latest contract-negotiated rates from ERP and update standard cost benchmarks for all tracked raw materials.
          </p>
        </div>
      </Modal>
    </div>
  );
}

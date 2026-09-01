import React, { useState } from "react";
import { Package, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function MaterialCost() {
  const { addToast } = useApp();

  const [rates, setRates] = useState([
    { item: "Liquid Apple Concentrate (1L)", stdPrice: "$1.20", actPrice: "$1.25", status: "Variance Over" },
    { item: "PET Bottles (1L Standard)", stdPrice: "$0.18", actPrice: "$0.17", status: "Optimal" },
    { item: "Carton Outer Box (Pack of 12)", stdPrice: "$0.45", actPrice: "$0.45", status: "Optimal" }
  ]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdateContracts = () => {
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      // Simulate a contract rate update — normalize the concentrate price
      setRates(prev => prev.map(r =>
        r.item === "Liquid Apple Concentrate (1L)"
          ? { ...r, actPrice: "$1.22", status: "Variance Over" }
          : r
      ));
      addToast("Raw materials supply contract rates synced from ERP. Apple Concentrate updated to $1.22/L.", "success");
      setIsUpdateModalOpen(false);
    }, 1200);
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
        <StatCard title="Material Cost (MTD)" value="$229,300" description="Std target: $225,000" icon={Package} color="#0284C7" />
        <StatCard title="Yield Loss Allocation" value="$5,200" description="Scrap/spillages" icon={Package} color="#DC2626" />
        <StatCard title="Packaging Cost (MTD)" value="$44,100" description="Std target: $45,000" icon={Package} color="#059669" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Raw Material Standards List
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rates.map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.item}</span>
                <div style={{ display: "flex", gap: "14px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span>Std Price: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.stdPrice}</strong></span>
                  <span>Act Price: <strong style={{ color: item.status.includes("Over") ? "#DC2626" : "#059669", fontFamily: "var(--font-mono)" }}>{item.actPrice}</strong></span>
                </div>
              </div>
              <span style={{ fontSize: "12px", color: item.status === "Optimal" ? "#059669" : "#DC2626", fontWeight: 800, flexShrink: 0 }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
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
            <Button variant="primary" icon={RefreshCw} onClick={handleConfirmUpdate}>
              {updating ? "Syncing ERP..." : "Sync Contract Rates"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Items to Update: <strong>3 Raw Materials</strong></div>
            <div>Material Cost MTD: <strong>$229,300</strong></div>
            <div>Standard Budget: <strong>$225,000</strong></div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", color: "#D97706", fontSize: "12px" }}>
            <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Liquid Apple Concentrate currently <strong>+$0.05/L</strong> over standard contract price. ERP sync may update this to latest negotiated rate.</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            This will fetch the latest contract-negotiated rates from ERP and update standard cost benchmarks for all tracked raw materials.
          </p>
        </div>
      </Modal>
    </div>
  );
}

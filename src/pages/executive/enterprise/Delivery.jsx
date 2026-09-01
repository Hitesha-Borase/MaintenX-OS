import React, { useState } from "react";
import { Send, Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function Delivery() {
  const { addToast } = useApp();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const deliveryData = [
    { plant: "Austin Main Plant", otif: "98.5%", dispatch: "5,800 Cases", transitTime: "1.7 Days" },
    { plant: "Chicago East Plant", otif: "97.4%", dispatch: "4,200 Cases", transitTime: "2.1 Days" },
    { plant: "Boston Logistics Hub", otif: "99.1%", dispatch: "2,400 Cases", transitTime: "1.2 Days" }
  ];

  const handleSync = () => {
    setIsSyncModalOpen(true);
  };

  const handleConfirmSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      addToast("Delivery schedules synced successfully with all regional distribution centers.", "success");
      setIsSyncModalOpen(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Delivery & Dispatch
        </h1>
        <Button variant="secondary" icon={Clock} onClick={handleSync}>
          Sync Delivery Schedules
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="On-Time In-Full (OTIF)" value="98.2%" description="Target: 98.5%" icon={Send} color="#059669" />
        <StatCard title="Avg Transit Lead Time" value="1.8 Days" description="Target: 2.0 Days" icon={Send} color="#0284C7" />
        <StatCard title="Shipment Volume" value="12,400 Cases" description="Dispatched today" icon={Send} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Delivery Performance by Plant
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {deliveryData.map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{item.plant}</span>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                <span>Transit: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.transitTime}</strong></span>
                <span>Dispatch: <strong>{item.dispatch}</strong></span>
                <span style={{ color: "#059669", fontWeight: 800, fontFamily: "var(--font-mono)" }}>OTIF: {item.otif}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sync Delivery Modal */}
      <Modal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        title="Sync Delivery Schedules"
        subtitle="Push schedule updates to all regional distribution centers"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSyncModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={RefreshCw} onClick={handleConfirmSync}>
              {syncing ? "Syncing..." : "Confirm Sync"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Plants to Sync: <strong>3 Plants</strong></div>
            <div>Total Shipment Volume: <strong>12,400 Cases</strong></div>
            <div>Current OTIF: <strong style={{ color: "#059669" }}>98.2%</strong></div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            This will push updated delivery schedule windows to all 3 regional distribution centers and update carrier ETA windows.
          </p>
        </div>
      </Modal>
    </div>
  );
}

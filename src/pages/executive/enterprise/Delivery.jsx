import React from "react";
import { Send, Clock } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Delivery() {
  const { addToast } = useApp();

  const handleSync = () => {
    addToast("Syncing shipment delivery schedules with regional distribution centers...", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Enterprise Delivery & Dispatch
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            OTIF (On-Time In-Full) performance and distribution logistics efficiency
          </p>
        </div>
        <Button variant="secondary" icon={Clock} onClick={handleSync}>
          Sync Delivery Schedules
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="On-Time In-Full (OTIF)" value="98.2%" description="Target: 98.5%" icon={Send} color="#10B981" />
        <StatCard title="Avg Transit Lead Time" value="1.8 Days" description="Target: 2.0 Days" icon={Send} color="#38BDF8" />
        <StatCard title="Shipment Volume" value="12,400 Cases" description="Dispatched today" icon={Send} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Delivery Performance by Plant</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { plant: "Austin Main Plant", otif: "98.5%", dispatch: "5,800 Cases", transitTime: "1.7 Days" },
            { plant: "Chicago East Plant", otif: "97.4%", dispatch: "4,200 Cases", transitTime: "2.1 Days" },
            { plant: "Boston Logistics Hub", otif: "99.1%", dispatch: "2,400 Cases", transitTime: "1.2 Days" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.plant}</span>
              <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <span>Transit: {item.transitTime}</span>
                <span>Dispatch: {item.dispatch}</span>
                <span style={{ color: "#10B981", fontWeight: 700 }}>OTIF: {item.otif}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

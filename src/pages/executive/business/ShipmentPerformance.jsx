import React from "react";
import { Truck, Send } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ShipmentPerformance() {
  const { addToast } = useApp();

  const handleSync = () => {
    addToast("Triggered Carrier dispatch priority routing update.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Shipment Performance
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Logistics carriers performance, tracking updates, and outbound transit health
          </p>
        </div>
        <Button variant="secondary" icon={Truck} onClick={handleSync}>
          Optimize Carrier Routing
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Active Carriers" value="5 Logistics Partners" description="All contract levels green" icon={Truck} color="#38BDF8" />
        <StatCard title="Carrier On-Time Score" value="98.5%" description="Target SLA: 98.0%" icon={Truck} color="#10B981" />
        <StatCard title="Dispatched Today" value="12,400 Cases" description="Across 14 shipments" icon={Truck} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Carrier Performance Ledger</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { carrier: "FedEx Freight", route: "Austin → Chicago East RDC", shipments: 8, onTime: "98.8%", status: "Optimal" },
            { carrier: "DHL Express", route: "Austin → Boston Logistics Hub", shipments: 4, onTime: "99.1%", status: "Optimal" },
            { carrier: "Schneider Logistics", route: "Chicago → regional retailers", shipments: 6, onTime: "96.5%", status: "Warning" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.carrier}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Route: {item.route}</span>
                  <span>Shipments (MTD): {item.shipments}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: item.status === "Optimal" ? "#10B981" : "#F59E0B" }}>{item.onTime}</span>
                <span style={{ fontSize: "12px", color: item.status === "Optimal" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

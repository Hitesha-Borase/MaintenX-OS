import React, { useState } from "react";
import { Truck, Send, MapPin, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ShipmentPerformance() {
  const { addToast } = useApp();
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const carriers = [
    { carrier: "FedEx Freight", route: "Austin → Chicago East RDC", shipments: 8, onTime: "98.8%", status: "Optimal" },
    { carrier: "DHL Express", route: "Austin → Boston Logistics Hub", shipments: 4, onTime: "99.1%", status: "Optimal" },
    { carrier: "Schneider Logistics", route: "Chicago → regional retailers", shipments: 6, onTime: "96.5%", status: "Warning" }
  ];

  const handleOptimize = () => {
    setIsRoutingModalOpen(true);
  };

  const handleConfirmOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      addToast("Carrier dispatch priority routing optimized. Schneider Logistics re-routed for improved on-time performance.", "success");
      setIsRoutingModalOpen(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Shipment Performance
        </h1>
        <Button variant="secondary" icon={Truck} onClick={handleOptimize}>
          Optimize Carrier Routing
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Active Carriers" value="5 Logistics Partners" description="All contract levels green" icon={Truck} color="#0284C7" />
        <StatCard title="Carrier On-Time Score" value="98.5%" description="Target SLA: 98.0%" icon={Truck} color="#059669" />
        <StatCard title="Dispatched Today" value="12,400 Cases" description="Across 14 shipments" icon={Truck} color="#7C3AED" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Carrier Performance Ledger
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {carriers.map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.carrier}</span>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span><MapPin size={10} style={{ marginRight: 2 }} />{item.route}</span>
                  <span>Shipments (MTD): <strong>{item.shipments}</strong></span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: item.status === "Optimal" ? "#059669" : "#D97706", fontFamily: "var(--font-mono)" }}>{item.onTime}</span>
                <Badge variant={item.status === "Optimal" ? "emerald" : "warning"}>{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Carrier Routing Modal */}
      <Modal
        isOpen={isRoutingModalOpen}
        onClose={() => setIsRoutingModalOpen(false)}
        title="Optimize Carrier Routing"
        subtitle="AI-driven dispatch priority rebalancing for all active carriers"
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRoutingModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmOptimize}>
              {optimizing ? "Optimizing..." : "Apply Routing Optimization"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Active Carriers: <strong>3 Partners</strong></div>
            <div>Current Overall Score: <strong style={{ color: "#059669" }}>98.5%</strong></div>
            <div style={{ color: "#D97706" }}>⚠ Schneider Logistics at <strong>96.5%</strong> — AI suggests priority reroute to FedEx on Chicago regional runs</div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            Running this optimization will re-balance dispatch loads between carriers to maximize on-time delivery scores across all routes.
          </p>
        </div>
      </Modal>
    </div>
  );
}

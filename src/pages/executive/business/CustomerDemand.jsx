import React, { useState } from "react";
import { ShoppingBag, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function CustomerDemand() {
  const { addToast } = useApp();
  const [demandSyncing, setDemandSyncing] = useState(false);

  const handleSyncDemand = () => {
    setDemandSyncing(true);
    setTimeout(() => {
      setDemandSyncing(false);
      addToast("Customer demand forecast successfully synced with ERP.", "success");
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Customer Demand Analytics
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Total backlog volume, incoming orders, and production supply alignment
          </p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={handleSyncDemand} style={{ animation: demandSyncing ? "spin 1s linear infinite" : "none" }}>
          Sync Forecast
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Backlog" value="48,200 Cases" description="Awaiting line production" icon={ShoppingBag} color="#38BDF8" />
        <StatCard title="Incoming Demand (Week)" value="142,000 Cases" description="vs 135,000 cases capacity" icon={ShoppingBag} color="#10B981" />
        <StatCard title="Demand Coverage" value="98.5%" description="Confirmed orders reserved" icon={ShoppingBag} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Customer Order Backlog</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { customer: "Costco Wholesale", product: "Apple Juice 1L", qty: "12,000 Cases", due: "2026-09-04", status: "Scheduled" },
            { customer: "Walmart Stores", product: "Apple Juice 500ML", qty: "8,500 Cases", due: "2026-09-06", status: "Staged" },
            { customer: "Target Corp", product: "Apple Juice 1L", qty: "6,200 Cases", due: "2026-09-08", status: "Pending Reserve" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.customer}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Product: {item.product}</span>
                  <span>Due: {item.due}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.qty}</span>
                <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

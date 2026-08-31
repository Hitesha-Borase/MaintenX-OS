import React, { useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function MaterialCost() {
  const { addToast } = useApp();
  const [rates, setRates] = useState([
    { item: "Liquid Apple Concentrate (1L)", stdPrice: "$1.20", actPrice: "$1.25", status: "Variance Over" },
    { item: "PET Bottles (1L Standard)", stdPrice: "$0.18", actPrice: "$0.17", status: "Optimal" },
    { item: "Carton Outer Box (Pack of 12)", stdPrice: "$0.45", actPrice: "$0.45", status: "Optimal" }
  ]);

  const handleUpdateContracts = () => {
    addToast("Triggered raw materials supply contract rate update from ERP...", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Material & Packaging Costs
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Monitor raw ingredient and packaging standard pricing vs actual procurement pricing
          </p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={handleUpdateContracts}>
          Update Contract Rates
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Material Cost (MTD)" value="$229,300" description="Std target: $225,000" icon={Package} color="#38BDF8" />
        <StatCard title="Yield Loss Allocation" value="$5,200" description="Scrap/spillages" icon={Package} color="#EF4444" />
        <StatCard title="Packaging Cost (MTD)" value="$44,100" description="Std target: $45,000" icon={Package} color="#10B981" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Raw Material Standards List</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rates.map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.item}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>Std Price: {item.stdPrice}</span>
                  <span>Act Price: <strong style={{ color: item.status.includes("Over") ? "#EF4444" : "#10B981" }}>{item.actPrice}</strong></span>
                </div>
              </div>
              <span style={{ fontSize: "12px", color: item.status === "Optimal" ? "#10B981" : "#EF4444", fontWeight: 700 }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

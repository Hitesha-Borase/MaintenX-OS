import React, { useState } from "react";
import { Gauge, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function MultiPlantKPIs() {
  const { addToast } = useApp();
  const [selectedPlant, setSelectedPlant] = useState("All");

  const kpis = [
    { plant: "Austin Main Plant", oee: "84.2%", fpy: "98.5%", throughput: "14,200/hr", labor: "94.2%", status: "Optimal" },
    { plant: "Chicago East Plant", oee: "78.9%", fpy: "96.2%", throughput: "11,800/hr", labor: "88.5%", status: "Warning" },
    { plant: "Boston Logistics Hub", oee: "89.5%", fpy: "99.1%", throughput: "16,000/hr", labor: "96.8%", status: "Optimal" }
  ];

  const handleAudit = (plant) => {
    addToast(`Triggered on-site performance audit for ${plant}`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Multi-Plant KPIs
        </h1>

      </div>

      <div className="grid-3">
        <StatCard title="Avg Enterprise OEE" value="84.2%" description="OEE Target: 85%" icon={Gauge} color="#38BDF8" />
        <StatCard title="Avg First Pass Yield" value="97.9%" description="Target: 98%" icon={CheckCircle} color="#10B981" />
        <StatCard title="Enterprise Labour Efficiency" value="93.1%" description="vs. 92.5% last week" icon={TrendingUp} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Performance Matrix</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {kpis.map((k, idx) => (
            <div key={idx} className="mobile-flex-col" style={{ padding: "12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{k.plant}</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span>OEE: <strong style={{ color: "#38BDF8" }}>{k.oee}</strong></span>
                  <span>FPY: <strong style={{ color: "#10B981" }}>{k.fpy}</strong></span>
                  <span>Throughput: <strong>{k.throughput}</strong></span>
                  <span>Labor Eff: <strong>{k.labor}</strong></span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <Badge variant={k.status === "Optimal" ? "emerald" : "warning"}>{k.status}</Badge>
                <Button variant="secondary" size="xs" onClick={() => handleAudit(k.plant)}>Audit Plant</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

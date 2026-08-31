import React, { useState } from "react";
import { Activity, Play } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function OEE() {
  const { addToast } = useApp();
  const [calibrating, setCalibrating] = useState(false);
  const [oeeData, setOeeData] = useState({
    avg: "84.2%",
    availability: "92.5%",
    performance: "93.8%",
    quality: "96.9%"
  });

  const handleRecalibrate = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      setOeeData({
        avg: "84.6%",
        availability: "92.9%",
        performance: "94.1%",
        quality: "96.9%"
      });
      addToast("OEE enterprise metrics recalibrated successfully.", "success");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Overall Equipment Effectiveness (OEE)
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Enterprise OEE breakdown: Availability × Performance × Quality
          </p>
        </div>
        <Button variant="secondary" icon={Play} onClick={handleRecalibrate} style={{ animation: calibrating ? "pulse 1s infinite" : "none" }}>
          Recalibrate OEE
        </Button>
      </div>

      <div className="grid-4">
        <StatCard title="Enterprise OEE" value={oeeData.avg} description="Target: 85%" icon={Activity} color="#A855F7" />
        <StatCard title="Availability" value={oeeData.availability} description="Target: 95%" icon={Activity} color="#38BDF8" />
        <StatCard title="Performance" value={oeeData.performance} description="Target: 92%" icon={Activity} color="#F59E0B" />
        <StatCard title="Quality" value={oeeData.quality} description="Target: 98%" icon={Activity} color="#10B981" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Plant-Level OEE Comparison</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { name: "Austin Main Plant", availability: "94.2%", performance: "92.8%", quality: "96.5%", total: "84.2%" },
            { name: "Chicago East Plant", availability: "90.5%", performance: "91.2%", quality: "95.5%", total: "78.9%" },
            { name: "Boston Logistics Hub", availability: "95.8%", performance: "95.2%", quality: "98.1%", total: "89.5%" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.name}</span>
              <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <span>Avail: {item.availability}</span>
                <span>Perf: {item.performance}</span>
                <span>Qual: {item.quality}</span>
                <span style={{ color: "#A855F7", fontWeight: 700 }}>Total: {item.total}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

import React from "react";
import { Factory, FileSpreadsheet } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Production() {
  const { addToast } = useApp();

  const handleExport = () => {
    addToast("Exporting production volume spreadsheet...", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Enterprise Production
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Total scheduled throughput, line availability, and volume metrics
          </p>
        </div>
        <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
          Export Volume Data
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Volume (MTD)" value="1.42M Cases" description="Target: 1.50M Cases" icon={Factory} color="#38BDF8" />
        <StatCard title="Attainment Rate" value="94.6%" description="Target: 95.0%" icon={Factory} color="#10B981" />
        <StatCard title="Active Line Capacity" value="92.1%" description="18 of 20 Lines Active" icon={Factory} color="#F59E0B" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Volume by Plant</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { plant: "Austin Main Plant", volume: "620,000 Cases", completion: "98.2%", runTime: "412 hrs" },
            { plant: "Chicago East Plant", volume: "480,000 Cases", completion: "91.5%", runTime: "392 hrs" },
            { plant: "Boston Logistics Hub", volume: "320,000 Cases", completion: "93.8%", runTime: "288 hrs" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{item.plant}</span>
              <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <span>Run Time: {item.runTime}</span>
                <span>Completion: <strong style={{ color: "#10B981" }}>{item.completion}</strong></span>
                <span style={{ color: "#38BDF8", fontWeight: 700 }}>{item.volume}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

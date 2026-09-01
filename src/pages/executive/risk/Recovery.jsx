import React, { useState } from "react";
import { RefreshCw, Play } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Recovery() {
  const { addToast } = useApp();
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      setDeploying(false);
      addToast("Supply chain raw materials recovery response protocol initiated.", "success");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Disaster Recovery & Business Continuity
          </h1>

        </div>
        <Button variant="danger" icon={Play} onClick={handleDeploy} style={{ animation: deploying ? "pulse 1s infinite" : "none" }}>
          Deploy Continuity Protocol
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Continuity Readiness" value="100% Prepared" description="Secondary supplier contracts verified" icon={RefreshCw} color="#10B981" />
        <StatCard title="Active Protocols" value="0 Active" description="All lines operating normally" icon={RefreshCw} color="#38BDF8" />
        <StatCard title="Rerouting Latency" value="< 4 hrs" description="Target response window met" icon={RefreshCw} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Continuity Protocols</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { name: "Secondary Apple Concentrate Supplier Routing", scope: "Chicago & Austin Processing Lines", latency: "2 hr contract activation lag", status: "Ready" },
            { name: "Utility Generator Backup Grid Sync", scope: "Austin Packaging Lines 1 & 2", latency: "15 min emergency transition window", status: "Ready" }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.name}</span>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Scope: {item.scope}</p>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Latency: {item.latency}</span>
              </div>
              <Badge variant="emerald">{item.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

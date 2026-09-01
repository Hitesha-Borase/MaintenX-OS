import React, { useState } from "react";
import { Trash2, ShieldAlert } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ScrapReworkCost() {
  const { addToast } = useApp();

  const [scrapEvents, setScrapEvents] = useState([
    { id: "SCR-109", batch: "BAT-2026-0890", cost: "$4,200", reason: "CCP Excursion - Pasteurized product discarded", status: "Closed" },
    { id: "REW-204", batch: "BAT-2026-0877", cost: "$1,800", reason: "Label alignment rework", status: "In Progress" }
  ]);

  const handleReview = (id) => {
    addToast(`Quality hold and scrap audit log created for event ${id}`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Scrap & Rework Costing
        </h1>

      </div>

      <div className="grid-3">
        <StatCard title="Scrap Cost (MTD)" value="$4,200" description="Std Target: <$3,000" icon={Trash2} color="#EF4444" />
        <StatCard title="Rework Cost (MTD)" value="$1,800" description="Std Target: <$2,000" icon={Trash2} color="#10B981" />
        <StatCard title="Yield Loss Margin" value="3.1%" description="vs. 2.5% standard yield limit" icon={Trash2} color="#F59E0B" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>Scrap & Rework Ledger</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {scrapEvents.map((ev, idx) => (
            <div key={idx} className="mobile-flex-col" style={{ padding: "12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{ev.id} ({ev.batch})</span>
                  <Badge variant={ev.status === "Closed" ? "emerald" : "warning"}>{ev.status}</Badge>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Reason: {ev.reason}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#EF4444" }}>{ev.cost}</span>
                <Button variant="secondary" size="xs" onClick={() => handleReview(ev.id)}>Audit Log</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { ShoppingBag, RefreshCw, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function CustomerDemand() {
  const { addToast } = useApp();
  const [demandSyncing, setDemandSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [totalBacklog, setTotalBacklog] = useState("48,200 Cases");
  const [incomingDemandWeek, setIncomingDemandWeek] = useState("142,000 Cases");
  const [demandCoverage, setDemandCoverage] = useState("98.5%");
  const [backlogItems, setBacklogItems] = useState([]);

  const fetchDemandData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getCustomerDemand();
      const data = res.data || res;
      if (data) {
        if (data.totalBacklog) setTotalBacklog(data.totalBacklog);
        if (data.incomingDemandWeek) setIncomingDemandWeek(data.incomingDemandWeek);
        if (data.demandCoverage) setDemandCoverage(data.demandCoverage);
        if (data.backlog) setBacklogItems(data.backlog);
      }
    } catch (err) {
      console.error("Error loading demand data:", err);
      addToast("Failed to load customer demand telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandData();
  }, []);

  const handleSyncDemand = async () => {
    try {
      setDemandSyncing(true);
      const res = await executiveService.syncCustomerDemand({ timestamp: new Date().toISOString() });
      const data = res.data || res;
      addToast(data?.message || "Customer demand forecast successfully synced with ERP.", "success");
    } catch (err) {
      console.error("Error syncing demand:", err);
      addToast("Failed to sync demand forecast", "error");
    } finally {
      setDemandSyncing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Customer Demand Analytics
          </h1>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={handleSyncDemand} disabled={demandSyncing}>
          {demandSyncing ? "Syncing..." : "Sync Forecast"}
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Backlog" value={totalBacklog} description="Awaiting line production" icon={ShoppingBag} color="#38BDF8" />
        <StatCard title="Incoming Demand (Week)" value={incomingDemandWeek} description="vs 135,000 cases capacity" icon={ShoppingBag} color="#10B981" />
        <StatCard title="Demand Coverage" value={demandCoverage} description="Confirmed orders reserved" icon={ShoppingBag} color="#A855F7" />
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Customer Order Backlog</h3>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {backlogItems.map((item, idx) => (
              <div key={idx} className="mobile-flex-col" style={{ padding: "10px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.customer}</span>
                  <div style={{ display: "flex", gap: "15px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    <span>Product: {item.product}</span>
                    <span>Due: {item.due}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.qty}</span>
                  <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

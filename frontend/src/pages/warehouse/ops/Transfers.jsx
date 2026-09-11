import React, { useState, useEffect } from "react";
import { Shuffle, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function Transfers() {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState([
    { id: 1, lot: "LOT-TRANS-01", qty: "2500.0000 kg", from: "WH-A Bin B", to: "STG-L1-IN", status: "Completed" },
    { id: 2, lot: "LOT-TRANS-01", qty: "2500.0000 kg", from: "WH-A Bin B", to: "STG-L1-IN", status: "Completed" },
    { id: 3, lot: "LOT-TRANS-01", qty: "2500.0000 kg", from: "WH-A Bin B", to: "STG-L1-IN", status: "Completed" },
    { id: 4, lot: "LOT-TRANS-01", qty: "5000.0000 Units", from: "WH-A Bin B", to: "STG-L1-IN", status: "Completed" }
  ]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getOpsTransfers();
      const data = res?.data || res;
      if (Array.isArray(data?.transfers) && data.transfers.length > 0) {
        setTransfers(data.transfers);
      } else if (Array.isArray(data) && data.length > 0) {
        setTransfers(data);
      }
    } catch (err) {
      console.warn("Backend transfers fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    if (nextStatus === "Pending") {
      addToast("Transfer marked as Pending.", "info");
    } else {
      addToast("Transfer marked as Completed.", "success");
    }

    try {
      await warehouseService.toggleOpsTransferStatus(id, nextStatus);
    } catch (err) {
      console.warn("Transfer toggle API fallback:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Active Transfers History
        </h1>
        <button
          onClick={fetchTransfers}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            background: "rgba(200, 149, 71, 0.12)",
            border: "1px solid rgba(200, 149, 71, 0.25)",
            borderRadius: "8px",
            color: "#C89547",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing..." : "Sync Transfers"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {transfers.map((t) => (
          <Card 
            key={t.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                <Shuffle size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {t.lot} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Quantity: {t.qty} <span style={{ margin: "0 4px" }}>•</span> Route: {t.from} → {t.to}</span>
              </span>
            </div>
            
            <div 
              onClick={() => handleToggleStatus(t.id, t.status)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              title="Click to toggle status"
            >
              <Badge variant={t.status === "Completed" ? "emerald" : "warning"}>
                {t.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default Transfers;

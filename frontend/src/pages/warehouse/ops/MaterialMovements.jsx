import React, { useState, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import warehouseService from "../../../services/warehouseService";

export function MaterialMovements() {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([
    { lot: "LOT-RM-ORG-4402", type: "RECEIPT", from: "Inbound Dock", to: "Cold Zone Rack", qty: "120000.0000 units", date: "Just now" },
    { lot: "LOT-SW-982", type: "RECEIPT", from: "Inbound Dock", to: "Cold Zone Rack", qty: "2.0000 Drums", date: "Just now" },
    { lot: "LOT-CAP-ORG-442", type: "TRANSFER", from: "Inbound Dock", to: "Cold Zone Rack", qty: "2500.0000 kg", date: "Just now" },
    { lot: "LOT-SW-0812", type: "RECEIPT", from: "Inbound Dock", to: "Cold Zone Rack", qty: "5000.0000 kg", date: "Just now" },
    { lot: "LOT-PKG-CAN-9140", type: "TRANSFER", from: "Inbound Dock", to: "Cold Zone Rack", qty: "2500.0000 kg", date: "Just now" }
  ]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getOpsMovements();
      const data = res?.data || res;
      if (Array.isArray(data?.movements) && data.movements.length > 0) {
        setMovements(data.movements);
      } else if (Array.isArray(data) && data.length > 0) {
        setMovements(data);
      }
    } catch (err) {
      console.warn("Backend movements fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Material Movements Logs
        </h1>
        <button
          onClick={fetchMovements}
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
          {loading ? "Syncing..." : "Sync Movements"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {movements.map((m, idx) => (
          <Card 
            key={m.id || idx} 
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
                <Clock size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                Moved: {m.qty} <span style={{ margin: "0 4px" }}>•</span> {m.type} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>From: {m.from} → To: {m.to}</span>
              </span>
            </div>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>
              {m.date}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default MaterialMovements;

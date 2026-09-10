import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function InventoryStatus() {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([
    { id: 1, sku: "SKU-AJ-500ML-ORG", level: "4 Pallets staged", bufferStatus: "OK" },
    { id: 2, sku: "SKU-BLK-SYRUP-1000L", level: "4 Drums", bufferStatus: "Under Safety Buffer" }
  ]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getInventoryStatus();
      const data = res?.data || res;
      const items = data?.items || data?.status;
      if (Array.isArray(items) && items.length > 0) {
        setStatus(items.map((item, idx) => ({
          id: item.id || idx + 1,
          sku: item.sku || item.code || "SKU-MATERIAL",
          level: item.level || item.stockLevel || `${item.quantity || 100} units`,
          bufferStatus: item.bufferStatus || item.status || "OK"
        })));
      }
    } catch (err) {
      console.warn("Backend inventory status fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleStatus = async (st) => {
    const id = st.id;
    const currentStatus = st.bufferStatus;
    const nextStatus = currentStatus === "OK" ? "Under Safety Buffer" : "OK";

    // Optimistic UI update
    setStatus(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, bufferStatus: nextStatus };
      }
      return s;
    }));

    if (nextStatus === "Under Safety Buffer") {
      addToast("Buffer levels dropped below threshold.", "warning");
    } else {
      addToast("Buffer replenished.", "success");
    }

    try {
      await warehouseService.toggleInventoryStatus(id, nextStatus);
    } catch (err) {
      console.warn("API buffer toggle fallback:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Inventory Buffers & Safety Status
        </h1>
        <button
          onClick={fetchStatus}
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
          {loading ? "Syncing..." : "Sync Buffer Status"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {status.map((st) => (
          <Card 
            key={st.id} 
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
                <ShieldAlert size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {st.sku} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Stock: {st.level}</span>
              </span>
            </div>
            
            <div 
              onClick={() => handleToggleStatus(st)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              title="Click to toggle buffer safety status"
            >
              <Badge variant={st.bufferStatus === "OK" ? "emerald" : "warning"}>
                {st.bufferStatus.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}

        {status.length === 0 && !loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            No buffer status records found.
          </div>
        )}
      </div>
    </div>
  );
}
export default InventoryStatus;

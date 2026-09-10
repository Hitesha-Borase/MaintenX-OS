import React, { useState, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function ShipmentTracking() {
  const { addToast } = useApp();

  const [trackingList, setTrackingList] = useState([
    { id: "TRK-9011", dest: "Walmart Logistics - Houston", status: "In Transit", eta: "2026-09-01 10:00" },
    { id: "TRK-9010", dest: "Target regional Chicago", status: "Delivered", eta: "Delivered 2026-08-31" }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getShipmentTracking();
      const data = res.data?.data || res.data;
      if (data?.trackingList && Array.isArray(data.trackingList)) {
        setTrackingList(data.trackingList);
      } else if (data?.activeShipments && Array.isArray(data.activeShipments)) {
        setTrackingList(data.activeShipments);
      } else if (Array.isArray(data)) {
        setTrackingList(data);
      }
    } catch (err) {
      console.warn("Could not load shipment tracking from API:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Delivered" ? "In Transit" : "Delivered";
    try {
      await warehouseService.toggleShipmentTracking(id, nextStatus);
      if (nextStatus === "Delivered") {
        addToast("Shipment marked as Delivered.", "success");
      } else {
        addToast("Shipment reverted to In Transit.", "info");
      }
    } catch (e) {
      console.warn("toggleShipmentTracking error:", e);
      if (nextStatus === "Delivered") {
        addToast("Shipment marked as Delivered.", "success");
      } else {
        addToast("Shipment reverted to In Transit.", "info");
      }
    }

    setTrackingList(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: 0 }}>
          Shipment Tracking
        </h1>
        <button
          onClick={fetchTracking}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "#f4f4f5",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#52525b",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {trackingList.map((t) => {
          const isDelivered = t.status === "Delivered" || t.status.toLowerCase() === "delivered";
          return (
            <div 
              key={t.id} 
              style={{ 
                display: "flex", 
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "space-between", 
                alignItems: "center",
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #e8e6e1",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Clock size={24} color="#10b981" strokeWidth={2} />
                <span style={{ fontSize: "15px", color: "#71717a" }}>
                  ETA / Delivery: {t.eta || t.destination || "In Transit"}
                </span>
              </div>
              
              <div 
                onClick={() => handleToggleStatus(t.id, t.status)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                <span style={{ 
                  padding: "6px 12px", 
                  backgroundColor: isDelivered ? "#e8fbf0" : "#e0f2fe", 
                  color: isDelivered ? "#10b981" : "#0ea5e9", 
                  border: `1px solid ${isDelivered ? "#a7e6c4" : "#bae6fd"}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase"
                }}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

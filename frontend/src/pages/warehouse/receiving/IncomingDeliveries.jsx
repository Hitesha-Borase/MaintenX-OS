import React, { useState, useEffect } from "react";
import { Truck, ArrowRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";
import warehouseService from "../../../services/warehouseService";

const INITIAL_DELIVERIES = [
  { id: "DLV-001", supplier: "GlassCorp", item: "Glass Bottles 1L", volume: "20,000 Pcs", status: "TRANSIT" },
  { id: "DLV-002", supplier: "Sugar Valley", item: "Liquid Cane Sugar 500L", volume: "2 Drums", status: "ARRIVED" },
  { id: "DLV-003", supplier: "Citrus Valley Farms Co.", item: "Valencia Orange Concentrate 65° Brix", volume: "6,000 kg", status: "ARRIVED" },
  { id: "DLV-004", supplier: "Amcor Rigid Packaging", item: "500ml PET Bottles", volume: "100,000 units", status: "TRANSIT" }
];

export function IncomingDeliveries() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const { receiveShipment } = useInventory();
  const [deliveriesList, setDeliveriesList] = useState(INITIAL_DELIVERIES);

  const fetchDeliveries = async () => {
    try {
      const res = await warehouseService.getIncomingDeliveries();
      const data = res?.data || res;
      if (Array.isArray(data?.deliveries) && data.deliveries.length > 0) {
        setDeliveriesList(data.deliveries);
      }
    } catch (err) {
      console.warn("Backend incoming deliveries sync fallback:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);
  
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await warehouseService.toggleDeliveryStatus(id);
      const updated = res?.data || res;
      setDeliveriesList(prev => prev.map(d => d.id === id ? { ...d, status: updated?.status || (currentStatus === "TRANSIT" ? "ARRIVED" : "TRANSIT") } : d));
    } catch (err) {
      setDeliveriesList(prev => prev.map(d => d.id === id ? { ...d, status: currentStatus === "TRANSIT" ? "ARRIVED" : "TRANSIT" } : d));
    }

    if (currentStatus === "TRANSIT") {
      receiveShipment && receiveShipment(id);
      addToast("Shipment marked as Arrived at dock.", "success");
    } else {
      addToast("Shipment status updated to In Transit.", "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Incoming Shipments & Deliveries
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {deliveriesList.map((d) => (
          <div 
            key={d.id} 
            style={{ 
              display: "flex",
              flexWrap: "wrap", 
              justifyContent: "space-between", 
              alignItems: "center",
              gap: "16px",
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e8e6e1",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "8px", minWidth: "250px" }}>
               <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Truck size={24} color="#38BDF8" strokeWidth={2} />
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#2B1D11" }}>
                  {d.supplier}
                </span>
              </div>
              <span style={{ fontSize: "15px", color: "#71717a", marginLeft: "40px" }}>
                Item: {d.item} <br /> Volume: {d.volume}
              </span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div 
                onClick={() => handleToggleStatus(d.id, d.status)}
                style={{ cursor: d.status === "TRANSIT" ? "pointer" : "default", transition: "opacity 0.2s" }}
              >
                {d.status === "TRANSIT" ? (
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: "#f4f4f5", 
                    color: "#52525b", 
                    border: "1px solid #e4e4e7",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    TRANSIT
                  </span>
                ) : (
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: "#e8fbf0", 
                    color: "#10b981", 
                    border: "1px solid #a7e6c4",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    ARRIVED
                  </span>
                )}
              </div>
              
              {d.status === "ARRIVED" && (
                <button
                   onClick={() => navigate("/warehouse/receiving/receive")}
                   style={{
                     display: "flex", alignItems: "center", gap: "6px",
                     padding: "8px 16px", backgroundColor: "#C89547", color: "#1A0F02",
                     border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px"
                   }}
                >
                  Receive Material <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

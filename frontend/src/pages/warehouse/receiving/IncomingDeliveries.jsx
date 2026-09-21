import React, { useState, useEffect } from "react";
import { Truck, ArrowRight, RefreshCw, Boxes, Factory, Layers, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";
import warehouseService from "../../../services/warehouseService";
import productionService from "../../../services/productionService";

const INITIAL_DELIVERIES = [];

export function IncomingDeliveries() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const { receiveShipment } = useInventory();
  const [deliveriesList, setDeliveriesList] = useState(INITIAL_DELIVERIES);
  const [productionOrders, setProductionOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [delRes, prodRes] = await Promise.all([
        warehouseService.getIncomingDeliveries().catch(() => null),
        productionService.getOrders().catch(() => null)
      ]);

      const delData = delRes?.data || delRes;
      if (Array.isArray(delData?.deliveries)) {
        setDeliveriesList(delData.deliveries);
      } else if (Array.isArray(delData)) {
        setDeliveriesList(delData);
      } else {
        setDeliveriesList([]);
      }

      const prodData = Array.isArray(prodRes) ? prodRes : (Array.isArray(prodRes?.data) ? prodRes.data : []);
      setProductionOrders(prodData);
    } catch (err) {
      console.warn("Incoming deliveries sync fallback:", err);
      setDeliveriesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 6px 0" }}>
            Incoming Shipments & Deliveries
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#71717a" }}>
            Inbound vendor shipments arriving at the dock & active Plant Planner production work orders awaiting line staging & finished goods receipt.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            backgroundColor: "#f4f4f5",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            color: "#3f3f46"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PLANT PLANNER WORK ORDERS (FROM PLANNER / ADMIN)               */}
      {/* ========================================================================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Factory size={20} color="#2563eb" />
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Plant Planner Work Orders (Production Line Staging & Output)
          </h2>
          <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 8px", backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "4px" }}>
            LIVE PLANNER SCHEDULE
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
          Orders created by the Plant Planner/Admin. The warehouse stages packaging/raw materials for the line, and receives the resulting finished product pallets.
        </p>

        {productionOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 20px", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
            <Boxes size={32} color="#94a3b8" style={{ margin: "0 auto 10px auto" }} />
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#334155", margin: "0 0 4px 0" }}>No Active Planner Work Orders</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Orders scheduled in Plant Planner / Admin will appear here for packaging staging and pallet receipt.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {productionOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  backgroundColor: "#ffffff",
                  padding: "20px 24px",
                  borderRadius: "16px",
                  border: "1px solid #bfdbfe",
                  boxShadow: "0 2px 10px rgba(37, 99, 235, 0.04)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "260px", flex: 1 }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "12px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                    <Boxes size={24} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 8px", backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "4px" }}>
                        WORK ORDER
                      </span>
                      <strong style={{ fontSize: "16px", color: "#1e293b" }}>{order.orderNumber}</strong>
                      <span style={{ fontSize: "14px", color: "#2563eb", fontWeight: 600 }}>
                        — {order.sku?.name || "SD HD"} ({order.sku?.skuCode || "SKU-004"})
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "5px" }}>
                      Line: <strong style={{ color: "#0f172a" }}>{order.line?.name || "PET line"}</strong>
                      &nbsp;|&nbsp; Target Output: <strong style={{ color: "#0f172a" }}>{Number(order.targetQuantity).toLocaleString()} {order.sku?.uom || "Bottles"}</strong>
                      &nbsp;|&nbsp; Status: <span style={{ color: "#d97706", fontWeight: 700 }}>{order.status}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => navigate("/warehouse/dashboard?tab=pkg-stage")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 16px",
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    Stage Packaging for {order.line?.name || "PET line"} <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => navigate("/warehouse/dashboard?tab=pkg-run")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 16px",
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    Receive FG Pallets <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DOCK DELIVERIES (EXTERNAL SUPPLIERS)                           */}
      {/* ========================================================================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Truck size={20} color="#0284c7" />
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Dock Inbound Deliveries (External Suppliers)
          </h2>
          <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 8px", backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: "4px" }}>
            TRUCK DOCK
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {deliveriesList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 24px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px dashed #e8e6e1" }}>
              <Truck size={36} color="#9ca3af" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2d2825", margin: "0 0 6px 0" }}>No External Vendor Shipments</h3>
              <p style={{ fontSize: "14px", color: "#71717a", margin: "0 0 16px 0" }}>
                Outside supplier delivery trucks arriving at the dock will appear here. Click below to manually receive raw materials or packaging from vendors.
              </p>
              <button
                onClick={() => navigate("/warehouse/receiving/receive")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", backgroundColor: "#C89547", color: "#1A0F02",
                  border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px"
                }}
              >
                Receive Material at Dock <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            deliveriesList.map((d) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

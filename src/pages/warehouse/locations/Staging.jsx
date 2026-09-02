import React from "react";
import { CalendarRange, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";

export function Staging() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const { lots } = useInventory();

  // Filter lots that are staged for inbound put-away
  const stagedLots = lots.filter(lot => lot.status === "STAGED");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Inbound Staging Area
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Materials received and awaiting put-away to storage locations
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {stagedLots.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", border: "1px dashed #ccc" }}>
            <p style={{ color: "#71717a" }}>No items currently in staging.</p>
          </div>
        ) : (
          stagedLots.map((s) => (
            <div 
              key={s.lotNumber} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #e8e6e1",
                borderLeft: "4px solid #f59e0b",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <CalendarRange size={24} color="#f59e0b" strokeWidth={2} />
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: "#fef3c7", 
                    color: "#b45309", 
                    border: "1px solid #fde68a",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    AWAITING PUT-AWAY
                  </span>
                </div>
                <div style={{ fontSize: "15px", color: "#71717a", marginTop: "4px", marginLeft: "48px" }}>
                  <strong style={{ color: "#2B1D11" }}>{s.materialName}</strong> <br/>
                  Lot: {s.lotNumber} <span style={{ margin: "0 4px" }}>•</span> Qty: {s.quantity} {s.unit}
                </div>
              </div>

              <button 
                onClick={() => navigate("/warehouse/locations/bins")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "#C89547",
                  color: "#1A0F02",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
              >
                Start Put-Away <ArrowRight size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

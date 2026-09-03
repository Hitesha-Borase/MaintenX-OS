import React, { useState } from "react";
import { Layers, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";

export function BinsRacks() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const { lots, transferLotLocation } = useInventory();

  // Show lots that are staged and need put-away
  const stagedLots = lots.filter(lot => lot.status === "STAGED");
  
  // Available bins mock
  const [selectedBins, setSelectedBins] = useState({});

  const handleSelectBin = (lotNum, bin) => {
    setSelectedBins(prev => ({ ...prev, [lotNum]: bin }));
  };

  const handlePutAway = (lotNum) => {
    const bin = selectedBins[lotNum];
    if (!bin) {
      addToast("Please select a destination bin.", "error");
      return;
    }
    
    transferLotLocation(lotNum, bin);
    addToast(`Lot ${lotNum} stored in ${bin}.`, "success");
    
    setTimeout(() => {
      navigate("/warehouse/inventory/raw");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          Bins & Storage Racks Put-Away
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {stagedLots.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", border: "1px dashed #ccc" }}>
            <p style={{ color: "#71717a" }}>No items pending put-away.</p>
          </div>
        ) : (
          stagedLots.map((s) => (
            <div 
              key={s.lotNumber} 
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
                borderLeft: "4px solid #C89547",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "250px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <Layers size={24} color="#C89547" strokeWidth={2} />
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: "rgba(200, 149, 71, 0.12)", 
                    color: "#8B6914", 
                    border: "1px solid rgba(200, 149, 71, 0.3)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    PENDING PUT-AWAY
                  </span>
                </div>
                <div style={{ fontSize: "15px", color: "#71717a", marginTop: "4px", marginLeft: "48px" }}>
                  <strong style={{ color: "#2B1D11" }}>{s.materialName}</strong> <br/>
                  Lot: {s.lotNumber} <br /> Qty: {s.quantity} {s.unit}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <select 
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e8e6e1",
                    backgroundColor: "#f9f9f9",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  value={selectedBins[s.lotNumber] || ""}
                  onChange={(e) => handleSelectBin(s.lotNumber, e.target.value)}
                >
                  <option value="" disabled>Select Target Bin...</option>
                  <option value="Aisle A, Rack 1, Bin B">Aisle A, Rack 1, Bin B</option>
                  <option value="Aisle B, Rack 4, Bin A">Aisle B, Rack 4, Bin A</option>
                  <option value="Cold Storage Zone A - Rack R04-B2">Cold Storage Zone A - Rack R04-B2</option>
                </select>
                
                <button 
                  onClick={() => handlePutAway(s.lotNumber)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
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
                  Store <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

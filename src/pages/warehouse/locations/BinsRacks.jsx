import React, { useState } from "react";
import { 
  Layers, 
  ArrowRight, 
  Check, 
  Thermometer, 
  Box, 
  CheckCircle2, 
  Warehouse, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  History,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";
import { INITIAL_INVENTORY_LOTS } from "../../../data/mockInventory";

export function BinsRacks() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const { lots, setLots, zones, transferLotLocation, putAwayHistory } = useInventory();

  // Active view: QUEUE or HISTORY
  const [activeTab, setActiveTab] = useState("QUEUE");

  // Show lots that are staged and need put-away
  const stagedLots = lots.filter(lot => lot.status === "STAGED");
  
  // Pre-initialize selectedBins with recommended bins
  const [selectedBins, setSelectedBins] = useState(() => {
    const initial = {};
    stagedLots.forEach(lot => {
      initial[lot.lotNumber] = lot.recommendedBin || "Cold Storage Zone A - Rack R04-B2";
    });
    return initial;
  });

  const handleSelectBin = (lotNum, bin) => {
    setSelectedBins(prev => ({ ...prev, [lotNum]: bin }));
  };

  const handlePutAway = (lotNum) => {
    const bin = selectedBins[lotNum] || "Cold Storage Zone A - Rack R04-B2";
    transferLotLocation(lotNum, bin);
    addToast(`Put-Away Confirmed! Lot ${lotNum} stored in ${bin}. Inventory ledger updated.`, "success");
  };

  const handlePutAwayAll = () => {
    if (stagedLots.length === 0) return;
    stagedLots.forEach(lot => {
      const bin = selectedBins[lot.lotNumber] || lot.recommendedBin || "Cold Storage Zone A - Rack R04-B2";
      transferLotLocation(lot.lotNumber, bin);
    });
    addToast(`All ${stagedLots.length} staged lots successfully allocated and stored.`, "success");
  };

  const handleResetDemoLots = () => {
    const stagedFromInitial = INITIAL_INVENTORY_LOTS.filter(l => l.status === "STAGED");
    setLots(prev => {
      // Remove any existing staged and re-add fresh initial ones
      const nonStaged = prev.filter(l => l.status !== "STAGED");
      return [...stagedFromInitial, ...nonStaged];
    });
    addToast("Reset: Staged lots reloaded to inbound queue for demo testing.", "info");
  };

  // Bin list options grouped by storage zone
  const availableBins = [
    { zone: "Cold Storage Zone A (+4°C)", bins: ["Cold Storage Zone A - Rack R04-B2", "Cold Storage Zone A - Rack R02-A1", "Cold Storage Zone A - Rack R06-C3"] },
    { zone: "Ambient Raw Storage Bay 2 (21°C)", bins: ["Ambient Storage Bay 2 - Bin G-12", "Ambient Storage Bay 2 - Bin TOTE-03", "Ambient Storage Bay 2 - Rack B-04"] },
    { zone: "Packaging High-Bay 3 (Ambient Dry)", bins: ["Packaging High-Bay 3 - Racks P01-P06", "Packaging High-Bay 3 - Rack P04-A1", "Packaging High-Bay 3 - Rack P08-C2"] },
    { zone: "Specialty Flavor & Ingredient Vault", bins: ["Specialty Vault - Rack FV-01-B2", "Specialty Vault - Bin S-09"] }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* Header & Quick Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Warehouse • Slotting & Location Management
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "2px 8px", borderRadius: "12px" }}>
              Capacity Validated
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
            Bins & Storage Racks Put-Away
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Allocate optimal storage slots, enforce cold-chain / packaging rack segregation, and execute put-away for staged deliveries.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {stagedLots.length > 0 && (
            <button
              onClick={handlePutAwayAll}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                color: "#261603",
                border: "none",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 3px 12px rgba(200, 149, 71, 0.35)"
              }}
            >
              <CheckCircle2 size={16} /> Confirm All Put-Aways ({stagedLots.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab(activeTab === "QUEUE" ? "HISTORY" : "QUEUE")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 750,
              color: "#261603",
              cursor: "pointer"
            }}
          >
            <History size={15} color="#B27E33" /> {activeTab === "QUEUE" ? `Put-Away Logs (${putAwayHistory?.length || 0})` : "Back to Queue"}
          </button>
        </div>
      </div>

      {/* Top Storage Capacity Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>TOTAL WAREHOUSE BINS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Warehouse size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>2,150 <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Slots</span></div>
          <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "4px" }}>Across 5 Dedicated Plant Zones</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>OVERALL UTILIZATION</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>76.7% <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Occupied</span></div>
          <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "4px" }}>500 Slots Currently Free</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>PENDING PUT-AWAY</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{stagedLots.length} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Lots Staged</span></div>
          <div style={{ fontSize: "11px", color: "#d97706", fontWeight: 700, marginTop: "4px" }}>Awaiting Forklift Rack Stacking</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>COLD STORAGE ZONE A</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(14, 165, 233, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
              <Thermometer size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>71.0% <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Capacity</span></div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700, marginTop: "4px" }}>58 Cold Bins Available (3.8°C)</div>
        </div>
      </div>

      {/* VIEW 1: ACTIVE PUT-AWAY WORK QUEUE */}
      {activeTab === "QUEUE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Active Put-Away Work Queue ({stagedLots.length} Lots Pending Storage)
            </h2>
            <span style={{ fontSize: "12px", color: "#6B5B4E", fontWeight: 600 }}>
              Select target bin slot and confirm storage
            </span>
          </div>

          {stagedLots.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px dashed #DACBB7" }}>
              <CheckCircle2 size={44} color="#059669" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#2B1D11", margin: "0 0 6px 0" }}>
                All Inbound Deliveries Successfully Put Away!
              </h3>
              <p style={{ fontSize: "13.5px", color: "#6B5B4E", margin: "0 0 16px 0" }}>
                Every staged lot has been allocated to its permanent storage rack. Inbound dock staging bays are completely clear.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/warehouse/locations/staging")}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "#F6F3EE",
                    border: "1px solid #E8DDCF",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#261603",
                    cursor: "pointer"
                  }}
                >
                  View Staging Docks
                </button>
                <button
                  onClick={() => navigate("/warehouse/inventory/raw")}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "#C89547",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#261603",
                    cursor: "pointer"
                  }}
                >
                  View Raw Materials Inventory →
                </button>
                <button
                  onClick={handleResetDemoLots}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8DDCF",
                    fontSize: "13px",
                    fontWeight: 750,
                    color: "#6B5B4E",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <RotateCcw size={14} /> Reload Staged Lots (Demo Test)
                </button>
              </div>
            </div>
          ) : (
            stagedLots.map((s) => {
              const isCold = s.tempCheck && s.tempCheck.includes("Cold");
              const selectedBin = selectedBins[s.lotNumber] || s.recommendedBin || "Cold Storage Zone A - Rack R04-B2";

              return (
                <div 
                  key={s.lotNumber} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "18px",
                    backgroundColor: "#ffffff",
                    padding: "22px 24px",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle, #e8e6e1)",
                    borderLeft: isCold ? "4.5px solid #0284c7" : "4.5px solid #C89547",
                    boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)"
                  }}
                >
                  {/* Left: Material Info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 360px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ 
                        padding: "4px 10px", 
                        backgroundColor: "rgba(200, 149, 71, 0.12)", 
                        color: "#8B6914", 
                        border: "1px solid rgba(200, 149, 71, 0.3)",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase"
                      }}>
                        AWAITING RACK ALLOCATION
                      </span>

                      <span style={{ fontSize: "11.5px", color: "#6B5B4E", background: "#F6F3EE", padding: "2px 8px", borderRadius: "4px", border: "1px solid #E8DDCF" }}>
                        Current: <strong>{s.location}</strong>
                      </span>

                      {isCold && (
                        <span style={{ fontSize: "11px", fontWeight: 750, color: "#0284c7", background: "rgba(14, 165, 233, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                          ❄️ Cold-Chain (2-4°C)
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#2B1D11", margin: "2px 0" }}>
                      {s.materialName}
                    </h3>

                    <div style={{ fontSize: "13px", color: "#6B5B4E", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span>Lot: <strong style={{ color: "#2B1D11", fontFamily: "var(--font-mono, monospace)" }}>{s.lotNumber}</strong></span>
                      <span>•</span>
                      <span>Qty: <strong style={{ color: "#2B1D11" }}>{typeof s.quantity === "number" ? s.quantity.toLocaleString() : s.quantity} {s.unit}</strong></span>
                      <span>•</span>
                      <span>Supplier: <strong style={{ color: "#2B1D11" }}>{s.supplier}</strong></span>
                    </div>

                    <div style={{ fontSize: "12px", color: "#B27E33", fontWeight: 700, marginTop: "2px" }}>
                      ⭐ Recommended Target: <strong>{s.recommendedBin || "Cold Storage Zone A - Rack R04-B2"}</strong>
                    </div>
                  </div>

                  {/* Right: Interactive Target Bin Select & Confirm Action */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 750, color: "#6B5B4E" }}>
                        DESTINATION STORAGE BIN:
                      </label>
                      <select 
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle, #E8DDCF)",
                          backgroundColor: "#F6F3EE",
                          color: "#261603",
                          fontSize: "13px",
                          fontWeight: 700,
                          outline: "none",
                          minWidth: "280px"
                        }}
                        value={selectedBin}
                        onChange={(e) => handleSelectBin(s.lotNumber, e.target.value)}
                      >
                        {availableBins.map((grp, gIdx) => (
                          <optgroup key={gIdx} label={grp.zone}>
                            {grp.bins.map((b, bIdx) => (
                              <option key={bIdx} value={b}>
                                {b}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 750, color: "transparent" }}>
                        ACTION:
                      </label>
                      <button 
                        onClick={() => handlePutAway(s.lotNumber)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 20px",
                          backgroundColor: "#C89547",
                          color: "#1A0F02",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "13.5px",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(200, 149, 71, 0.3)",
                          transition: "transform 0.15s ease"
                        }}
                      >
                        Store in Rack <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: COMPLETED PUT-AWAY AUDIT LOGS */}
      {activeTab === "HISTORY" && (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--border-subtle, #E8DDCF)", overflow: "hidden", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
                Recent Put-Away Operations Log
              </h3>
              <p style={{ fontSize: "13px", color: "#6B5B4E", margin: "2px 0 0 0" }}>
                Official WMS material slotting history and forklift operator audit trail.
              </p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 750, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
              Logged by Alexander Vance
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(!putAwayHistory || putAwayHistory.length === 0) ? (
              <p style={{ color: "#6B5B4E", fontSize: "13px", textAlign: "center", padding: "30px 0" }}>No recent put-away transactions recorded yet today.</p>
            ) : (
              putAwayHistory.map((h, hIdx) => (
                <div key={hIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F6F3EE", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <strong style={{ color: "#2B1D11" }}>{h.materialName}</strong>
                    <div style={{ fontSize: "11.5px", color: "#6B5B4E", marginTop: "2px" }}>
                      Lot: <strong style={{ fontFamily: "var(--font-mono, monospace)" }}>{h.lotNumber}</strong> • Qty: {h.quantity} {h.unit}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                    <span style={{ color: "#6B5B4E" }}>{h.fromLocation}</span>
                    <ArrowRight size={13} color="#B27E33" />
                    <strong style={{ color: "#B27E33" }}>{h.toLocation}</strong>
                  </div>

                  <div style={{ textAlign: "right", fontSize: "12px" }}>
                    <span style={{ color: "#059669", fontWeight: 750 }}>Completed</span>
                    <div style={{ fontSize: "11px", color: "#8C7B6E" }}>{h.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Warehouse Storage Zones & Capacity Overview Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
          Facility Warehouse Zones & Storage Capacity
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {zones.map((z) => {
            const pct = Math.round((z.occupied / z.capacity) * 100);
            const isHigh = pct >= 80;

            return (
              <div
                key={z.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "18px 20px",
                  borderRadius: "14px",
                  border: "1px solid var(--border-subtle, #E8DDCF)",
                  boxShadow: "0 2px 8px rgba(40, 25, 10, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#2B1D11", margin: "0 0 2px 0" }}>
                      {z.name}
                    </h4>
                    <span style={{ fontSize: "11px", color: "#8C7B6E", fontFamily: "var(--font-mono, monospace)" }}>
                      {z.id}
                    </span>
                  </div>

                  <span style={{
                    fontSize: "11px",
                    fontWeight: 750,
                    color: isHigh ? "#d97706" : "#059669",
                    backgroundColor: isHigh ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "4px"
                  }}>
                    {pct}% Full
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", height: "7px", backgroundColor: "#F6F3EE", borderRadius: "10px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      width: `${pct}%`, 
                      height: "100%", 
                      backgroundColor: isHigh ? "#d97706" : "#C89547", 
                      borderRadius: "10px",
                      transition: "width 0.4s ease"
                    }} 
                  />
                </div>

                {/* Stats Breakdown */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B5B4E" }}>
                  <span>Occupied: <strong>{z.occupied}</strong> / {z.capacity}</span>
                  <span>Temp: <strong>{z.temp}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

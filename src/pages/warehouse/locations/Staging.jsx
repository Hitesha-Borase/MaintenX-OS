import React, { useState } from "react";
import { 
  CalendarRange, 
  ArrowRight, 
  Check, 
  Search, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Thermometer, 
  Clock, 
  QrCode, 
  Printer, 
  Building2, 
  CheckCircle2,
  Box,
  Truck,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";

export function Staging() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const { lots } = useInventory();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [qaFilter, setQaFilter] = useState("ALL");

  // Filter lots that are staged for inbound put-away
  const stagedLots = lots.filter(lot => lot.status === "STAGED");

  // Filtered staged lots
  const filteredLots = stagedLots.filter(lot => {
    const matchesSearch = 
      lot.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.supplier && lot.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lot.poNumber && lot.poNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = 
      categoryFilter === "ALL" || 
      (categoryFilter === "RAW" && lot.category === "Raw Material") ||
      (categoryFilter === "PKG" && lot.category === "Packaging");

    const matchesQA = 
      qaFilter === "ALL" ||
      (qaFilter === "RELEASED" && lot.qaStatus.toLowerCase().includes("approved")) ||
      (qaFilter === "HOLD" && (lot.qaStatus.toLowerCase().includes("quarantine") || lot.qaStatus.toLowerCase().includes("hold")));

    return matchesSearch && matchesCategory && matchesQA;
  });

  const totalPallets = stagedLots.reduce((acc, lot) => acc + (lot.palletsCount || 2), 0);
  const coldLotsCount = stagedLots.filter(l => l.tempCheck && l.tempCheck.includes("Cold")).length;

  const handlePrintLabel = (lotNumber) => {
    addToast(`Printing GS1-128 LPN Pallet Tag for ${lotNumber}...`, "info");
    setTimeout(() => {
      addToast(`LPN Pallet Label dispatched to Zebra Dock Printer #2.`, "success");
    }, 900);
  };

  const handleVerifyBarcode = (lotNumber, barcode) => {
    addToast(`Scanning Barcode [${barcode || "8902810044025"}]... Verified valid GS1 Lot ${lotNumber}.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* Header & Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#B27E33", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Warehouse • Inbound Staging & Receiving
            </span>
            <span style={{ fontSize: "11px", fontWeight: 750, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "2px 8px", borderRadius: "12px" }}>
              Live Telemetry Ingest
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#2B1D11", margin: 0 }}>
            Inbound Staging Area
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #6B5B4E)", margin: "4px 0 0 0" }}>
            Real-time dock staging bays, quarantine holds, and raw material intake awaiting warehouse rack slotting.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={() => navigate("/warehouse/locations/bins")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              color: "#261603",
              border: "none",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 3px 12px rgba(200, 149, 71, 0.35)",
              transition: "transform 0.18s ease"
            }}
          >
            <Layers size={16} /> Open Bins Put-Away Queue
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {/* Metric 1 */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>ACTIVE STAGED PALLETS</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(200, 149, 71, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
              <Box size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{totalPallets} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Pallets</span></div>
          <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "4px" }}>Across 5 Inbound Dock Bays</div>
        </div>

        {/* Metric 2 */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>COLD-CHAIN MONITORED</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(14, 165, 233, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
              <Thermometer size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{coldLotsCount} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Lots (3.4°C)</span></div>
          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 700, marginTop: "4px" }}>Within 2°C - 4°C Target Limit</div>
        </div>

        {/* Metric 3 */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>AWAITING PUT-AWAY</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>{stagedLots.length} <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Batches</span></div>
          <div style={{ fontSize: "11px", color: "#d97706", fontWeight: 700, marginTop: "4px" }}>Ready for Forklift Slotting</div>
        </div>

        {/* Metric 4 */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", boxShadow: "0 2px 8px rgba(40, 25, 10, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary, #6B5B4E)" }}>AVG DOCK DWELL TIME</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
              <Truck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#2B1D11" }}>38 <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B5B4E" }}>Mins</span></div>
          <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "4px" }}>Compliant (&lt; 120 min limit)</div>
        </div>
      </div>

      {/* Dock Staging Overview Banner */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "16px 20px", borderRadius: "14px", border: "1px solid var(--border-subtle, #E8DDCF)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#2B1D11" }}>RECEIVING DOCK BAYS:</span>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", backgroundColor: "#F6F3EE", border: "1px solid #E8DDCF", color: "#261603" }}>
              🟢 Dock 01: Citrus Puree (STG-01)
            </span>
            <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", backgroundColor: "#F6F3EE", border: "1px solid #E8DDCF", color: "#261603" }}>
              🟢 Dock 02: Liquid Sugar (STG-02)
            </span>
            <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", backgroundColor: "#F6F3EE", border: "1px solid #E8DDCF", color: "#261603" }}>
              🟢 Dock 03: Can Packaging (STG-03)
            </span>
            <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", backgroundColor: "#F6F3EE", border: "1px solid #E8DDCF", color: "#261603" }}>
              🟢 Dock 04: Master Trays (STG-04)
            </span>
            <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(5, 150, 105, 0.08)", border: "1px dashed rgba(5, 150, 105, 0.3)", color: "#059669" }}>
              ⚪ Dock 05: Available for Carrier
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 320px", maxWidth: "440px", position: "relative" }}>
          <Search size={16} color="#8C7B6E" style={{ position: "absolute", left: "14px" }} />
          <input
            type="text"
            placeholder="Search by Material, Lot #, PO, or Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              fontSize: "13.5px",
              color: "#261603",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#6B5B4E" }}>
            <Filter size={14} /> Category:
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#261603",
              outline: "none"
            }}
          >
            <option value="ALL">All Materials</option>
            <option value="RAW">Raw Materials</option>
            <option value="PKG">Packaging Supplies</option>
          </select>

          <select
            value={qaFilter}
            onChange={(e) => setQaFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle, #E8DDCF)",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#261603",
              outline: "none"
            }}
          >
            <option value="ALL">All QA Statuses</option>
            <option value="RELEASED">QA Released</option>
            <option value="HOLD">Quarantine / Hold</option>
          </select>
        </div>
      </div>

      {/* Staged Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredLots.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px dashed #DACBB7" }}>
            <Box size={36} color="#B27E33" style={{ marginBottom: "10px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: "0 0 6px 0" }}>
              No Inbound Items Match Current Filter
            </h3>
            <p style={{ fontSize: "13px", color: "#6B5B4E", margin: 0 }}>
              All staged shipments have either been put away to storage racks or cleared from staging.
            </p>
          </div>
        ) : (
          filteredLots.map((lot) => {
            const isCold = lot.tempCheck && lot.tempCheck.includes("Cold");
            const isReleased = lot.qaStatus.toLowerCase().includes("approved");

            return (
              <div 
                key={lot.lotNumber}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid var(--border-subtle, #E8DDCF)",
                  borderLeft: isCold ? "4.5px solid #0284c7" : isReleased ? "4.5px solid #C89547" : "4.5px solid #f59e0b",
                  boxShadow: "0 2px 10px rgba(40, 25, 10, 0.03)",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                {/* Card Top Row: Location Badge & Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ 
                      padding: "4px 10px", 
                      backgroundColor: "rgba(200, 149, 71, 0.12)", 
                      color: "#8B6914", 
                      border: "1px solid rgba(200, 149, 71, 0.3)",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase"
                    }}>
                      {lot.location}
                    </span>

                    <span style={{
                      padding: "3px 8px",
                      backgroundColor: lot.category === "Raw Material" ? "rgba(16, 185, 129, 0.1)" : "rgba(14, 165, 233, 0.1)",
                      color: lot.category === "Raw Material" ? "#047857" : "#0369a1",
                      border: `1px solid ${lot.category === "Raw Material" ? "rgba(16, 185, 129, 0.25)" : "rgba(14, 165, 233, 0.25)"}`,
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 750
                    }}>
                      {lot.category}
                    </span>

                    <span style={{ fontSize: "12px", color: "#6B5B4E", fontFamily: "var(--font-mono, monospace)" }}>
                      PO: <strong>{lot.poNumber || "PO-2026-0881"}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isReleased ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 800, color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "3px 9px", borderRadius: "20px" }}>
                        <ShieldCheck size={13} /> QA RELEASED • READY TO STORE
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 800, color: "#d97706", background: "rgba(245, 158, 11, 0.1)", padding: "3px 9px", borderRadius: "20px" }}>
                        <AlertTriangle size={13} /> QUARANTINE • PENDING COA
                      </span>
                    )}
                  </div>
                </div>

                {/* Material Info Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#2B1D11", margin: "0 0 4px 0" }}>
                      {lot.materialName}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-secondary, #6B5B4E)" }}>
                      <span>Internal SKU: <strong style={{ color: "#2B1D11" }}>{lot.materialCode}</strong></span>
                      <span>•</span>
                      <span>Lot #: <strong style={{ color: "#2B1D11", fontFamily: "var(--font-mono, monospace)" }}>{lot.lotNumber}</strong></span>
                      <span>•</span>
                      <span>Supplier: <strong style={{ color: "#2B1D11" }}>{lot.supplier}</strong></span>
                    </div>
                  </div>

                  {/* Quantity and Pallets Badge */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "19px", fontWeight: 900, color: "#2B1D11" }}>
                      {typeof lot.quantity === "number" ? lot.quantity.toLocaleString() : lot.quantity} <span style={{ fontSize: "13px", fontWeight: 700, color: "#6B5B4E" }}>{lot.unit}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#8C7B6E", fontWeight: 600 }}>
                      {lot.palletsCount || 2} Physical Pallets Staged
                    </div>
                  </div>
                </div>

                {/* Sub-Details Ribbon */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", backgroundColor: "#F6F3EE", padding: "12px 16px", borderRadius: "10px", fontSize: "12.5px" }}>
                  <div>
                    <span style={{ color: "#8C7B6E", display: "block", fontSize: "11px", fontWeight: 700 }}>RECEIVED TIMESTAMP</span>
                    <strong style={{ color: "#2B1D11" }}>{lot.receivedDate} at {lot.receivedTime || "09:00 AM"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#8C7B6E", display: "block", fontSize: "11px", fontWeight: 700 }}>TEMP MONITORING</span>
                    <strong style={{ color: isCold ? "#0284c7" : "#2B1D11" }}>{lot.tempCheck || "Ambient Controlled"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#8C7B6E", display: "block", fontSize: "11px", fontWeight: 700 }}>RECOMMENDED PUT-AWAY BIN</span>
                    <strong style={{ color: "#B27E33" }}>{lot.recommendedBin || "Cold Storage Zone A - Rack R04-B2"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#8C7B6E", display: "block", fontSize: "11px", fontWeight: 700 }}>SHELF LIFE EXPIRY</span>
                    <strong style={{ color: "#2B1D11" }}>{lot.expiryDate}</strong>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "4px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleVerifyBarcode(lot.lotNumber, lot.barcode)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 12px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E8DDCF",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#6B5B4E",
                        cursor: "pointer"
                      }}
                    >
                      <QrCode size={13} color="#B27E33" /> Verify Scan
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintLabel(lot.lotNumber)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 12px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E8DDCF",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#6B5B4E",
                        cursor: "pointer"
                      }}
                    >
                      <Printer size={13} color="#B27E33" /> Print LPN Tag
                    </button>
                  </div>

                  <button 
                    onClick={() => navigate("/warehouse/locations/bins")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 18px",
                      backgroundColor: "#C89547",
                      color: "#1A0F02",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(200, 149, 71, 0.25)",
                      transition: "transform 0.15s ease"
                    }}
                  >
                    Allocate Bin & Put-Away <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { Modal } from "./Modal";
import { Search, Wrench, Activity, ShieldCheck, FileText, AlertTriangle, ArrowRight, Layers, Package, Boxes, Calendar, ClipboardCheck, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useProduction } from "../../context/ProductionContext";
import { useMasterData } from "../../context/MasterDataContext";

export function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { assets = [], workOrders = [], solutions = [] } = useCMMS() || {};
  const { productionOrders = [], batches = [] } = useProduction() || {};
  const { skus = [] } = useMasterData() || {};

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    // 1. Traceability Lots & Raw Materials
    const traceLots = [
      { id: "LOT-RM-ORG-4402", name: "Valencia Organic Orange Juice Concentrate 65° Brix", type: "Raw Lot", supplier: "SunGrow Organic Citrus Ltd" },
      { id: "LOT-ORG-442", name: "Organic Orange Concentrate Drums", type: "Raw Lot", supplier: "SunGrow Organic Citrus Ltd" },
      { id: "LOT-FG-2026-0885", name: "Sparkling Organic Orange Soda 330ml Can", type: "Finished Lot", supplier: "Internal Line 1" },
      { id: "LOT-CIT-0830", name: "Sparkling Citrus Soda 500ml", type: "Finished Lot", supplier: "Internal Line 2" },
      { id: "LOT-GIN-0830", name: "Organic Ginger Beer 330ml Can", type: "Finished Lot", supplier: "Internal Line 3" },
      { id: "LOT-CAN-ALU-9912", name: "330ml Slimline Aluminum Beverage Cans", type: "Packaging Lot", supplier: "PackCorp Global" },
      { id: "LOT-CAN-END-5521", name: "Stay-on Tab Can Ends (BPA-NI)", type: "Packaging Lot", supplier: "PackCorp Global" }
    ];

    const lotMatches = traceLots
      .filter((l) => l.id.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.type.toLowerCase().includes(q) || l.supplier.toLowerCase().includes(q))
      .slice(0, 3)
      .map((l) => ({
        type: "360° Traceability Lot",
        icon: Boxes,
        title: `${l.id} — ${l.name}`,
        subtitle: `${l.type} • Supplier: ${l.supplier} • Full Supplier-to-Customer Genealogy`,
        route: `/warehouse/traceability`
      }));

    // 2. Production Batches (eBR)
    const batchMatches = batches
      .filter((b) => (b.id || "").toLowerCase().includes(q) || (b.productName || b.recipeId || "").toLowerCase().includes(q) || (b.status || "").toLowerCase().includes(q))
      .slice(0, 2)
      .map((b) => ({
        type: "Production Batch (eBR)",
        icon: Layers,
        title: `${b.id} — ${b.productName || b.recipeId}`,
        subtitle: `Tank: ${b.tank || "T-01"} • Status: ${b.status || "In Process"} • 6-Step Electronic Batch Record`,
        route: `/production/batches`
      }));

    // 3. Production Orders
    const orderMatches = (productionOrders || [])
      .filter((o) => (o.id || "").toLowerCase().includes(q) || (o.productName || o.sku || "").toLowerCase().includes(q) || (o.line || "").toLowerCase().includes(q))
      .slice(0, 2)
      .map((o) => ({
        type: "Production Order",
        icon: Package,
        title: `${o.id} — ${o.productName || o.sku}`,
        subtitle: `Line: ${o.line || "Line 1"} • Target: ${o.targetQuantity || 10000} • Status: ${o.status}`,
        route: `/production/orders`
      }));

    // 4. Quality & CCP Checks
    const ccpItems = [
      { id: "CCP-1", name: "Pasteurizer Thermal Kill Step (≥83.1°C)", route: "/quality/checks/ccp", type: "Critical Control Point" },
      { id: "CCP-2", name: "In-line Metal Detection (0 Fe/Non-Fe/SS)", route: "/quality/checks/ccp", type: "Critical Control Point" },
      { id: "QA-REL", name: "21 CFR Part 11 Digital Batch Disposition & Release", route: "/quality/release/queue", type: "Quality Assurance" }
    ];
    const ccpMatches = ccpItems
      .filter((c) => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || "ccp quality inspection release".includes(q))
      .slice(0, 2)
      .map((c) => ({
        type: c.type,
        icon: ClipboardCheck,
        title: `${c.id} — ${c.name}`,
        subtitle: `HACCP / ISO 22000 Compliance Log & Real-time Verification`,
        route: c.route
      }));

    // 5. Assets / Equipment
    const assetMatches = assets
      .filter((a) => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q))
      .slice(0, 2)
      .map((a) => ({
        type: "Asset",
        icon: Wrench,
        title: `${a.id} - ${a.name}`,
        subtitle: `${a.location || a.line} • Status: ${a.status} (Health ${a.health}%)`,
        route: `/assets/360?id=${a.id}`
      }));

    // 6. Work Orders
    const woMatches = workOrders
      .filter((w) => w.id.toLowerCase().includes(q) || w.title.toLowerCase().includes(q) || w.assetName?.toLowerCase().includes(q))
      .slice(0, 2)
      .map((w) => ({
        type: "Work Order",
        icon: Activity,
        title: `${w.id} - ${w.title}`,
        subtitle: `${w.assetName || w.assetId} • ${w.status} • ${w.priority}`,
        route: `/work-orders/open?view=${w.id}`
      }));

    // 7. Verified Solutions
    const solMatches = solutions
      .filter((s) => (s.title || s.symptom || "").toLowerCase().includes(q) || (s.failureCode || "").toLowerCase().includes(q))
      .slice(0, 2)
      .map((s) => ({
        type: "Verified Solution",
        icon: ShieldCheck,
        title: s.title || s.symptom,
        subtitle: `Code: ${s.failureCode || "General"} • ${s.successfulUsesCount || 1} uses`,
        route: `/troubleshooting?search=${s.failureCode || s.title}`
      }));

    return [...lotMatches, ...batchMatches, ...orderMatches, ...ccpMatches, ...assetMatches, ...woMatches, ...solMatches];
  }, [query, assets, workOrders, solutions, batches, productionOrders]);

  const handleSelect = (route) => {
    setIsSearchOpen(false);
    setQuery("");
    navigate(route);
  };

  return (
    <Modal
      isOpen={isSearchOpen}
      onClose={() => {
        setIsSearchOpen(false);
        setQuery("");
      }}
      title="Global Manufacturing Search"
      subtitle="Search across Assets, Work Orders, Batches, Lots, CCPs, and Solutions"
      maxWidth="640px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50)",
              color: "var(--text-muted)"
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "42px", fontSize: "15px", height: "46px" }}
            placeholder="Search Lot (LOT-RM-ORG-4402), Batch (BAT-2026-0885), PO, CCP, Asset..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {results.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "360px", overflowY: "auto" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Search Results ({results.length})
            </span>
            {results.map((res, i) => {
              const Icon = res.icon;
              return (
                <div
                  key={i}
                  onClick={() => handleSelect(res.route)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-color, #E07A5F)";
                    e.currentTarget.style.backgroundColor = "rgba(224, 122, 95, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(224, 122, 95, 0.12)",
                        color: "var(--primary-color, #E07A5F)"
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {res.title}
                        </span>
                        <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#1E293B", color: "#94A3B8" }}>
                          {res.type}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {res.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        ) : query.trim() ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "13px" }}>
            No records found matching "{query}". Try "LOT-RM-ORG-4402", "BAT-2026-0885", "PO-2026-001", or "FM-001".
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-secondary)", fontSize: "12px" }}>
            <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Quick Manufacturing Shortcuts:</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("LOT-RM-ORG-4402")}>
                📦 Lot: LOT-RM-ORG-4402
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("BAT-2026-0885")}>
                ⚗️ Batch: BAT-2026-0885
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("PO-2026-001")}>
                📋 Order: PO-2026-001
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("CCP-1")}>
                🛡️ CCP: Pasteurizer
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("FM-001")}>
                ⚙️ Asset: FM-001
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

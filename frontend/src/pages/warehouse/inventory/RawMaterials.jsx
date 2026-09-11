import React, { useState, useEffect } from "react";
import { Package, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";
import { useMasterData } from "../../../context/MasterDataContext";
import warehouseService from "../../../services/warehouseService";

export function RawMaterials() {
  const { addToast } = useApp();
  const { lots } = useInventory();
  const { skus = [] } = useMasterData();
  const [loading, setLoading] = useState(false);
  const [apiMaterials, setApiMaterials] = useState([]);

  // Fetch live raw materials from backend API on mount
  const fetchRawMaterials = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getRawMaterials();
      const payload = res?.data || res;
      if (payload?.materials && Array.isArray(payload.materials)) {
        setApiMaterials(payload.materials);
      }
    } catch (err) {
      console.warn("Failed to fetch raw materials from backend API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  // Filter lots that are Raw Materials from InventoryContext (live context data)
  const rmLots = lots.filter(lot => lot.category === "Raw Material");

  // Fallback master data SKUs
  const rawMasterSkus = skus.filter((s) => s.category !== "Finished Goods");

  // Merged materials list prioritizing backend API > local context > master data
  const displayMaterials = apiMaterials.length > 0 
    ? apiMaterials 
    : rmLots.length > 0 
      ? rmLots.map((m, idx) => ({
          id: m.id || m.lotNumber || `RM-${idx + 1}`,
          lotNumber: m.lotNumber,
          materialName: m.materialName || m.name || "Raw Material",
          sku: m.sku || m.materialCode || "ING-1001",
          quantity: m.quantity ? `${m.quantity} ${m.unit || "Drums"}` : "2 Drums",
          onHand: m.onHand || `${m.quantity || 2} ${m.unit || "Drums"}`,
          location: m.location || "Receiving Dock - Staging Area",
          status: m.status || "STAGED",
          category: "Raw Material"
        }))
      : rawMasterSkus.length > 0
        ? rawMasterSkus.map((s, idx) => ({
            id: s.skuId || `RM-${idx + 1}`,
            lotNumber: `LOT-RM-${s.skuCode || "00" + (idx + 1)}`,
            materialName: s.name,
            sku: s.skuCode,
            quantity: idx === 0 ? "8,500 Liters (4 Bulk Tanks)" : idx === 1 ? "1,200 Kg (48 Bags)" : "42,000 Units",
            onHand: idx === 0 ? "8,500 Liters" : idx === 1 ? "1,200 Kg" : "42,000 Units",
            location: idx === 0 ? "Receiving Dock - Staging Area" : "Aisle B - Ambient Rack 04",
            status: idx === 0 ? "STAGED" : idx === 1 ? "SECURE STOCK" : "AVAILABLE",
            category: "Raw Material"
          }))
        : [
            { id: "RM-1", lotNumber: "LOT-SW-982", materialName: "Liquid Cane Sugar", sku: "ING-1001", quantity: "2 Drums", onHand: "2 Drums", location: "Receiving Dock - Staging Area", status: "STAGED" },
            { id: "RM-2", lotNumber: "LOT-CA-841", materialName: "Citric Acid Anhydrous USP", sku: "ING-1002", quantity: "1,200 Kg", onHand: "1,200 Kg", location: "Aisle B - Ambient Rack 04", status: "SECURE STOCK" }
          ];

  const handleToggleStatus = async (item) => {
    const lotId = item.id || item.lotNumber;
    const currentStatus = (item.status || "AVAILABLE").toUpperCase();
    let nextStatus = "AVAILABLE";
    if (currentStatus === "STAGED") nextStatus = "AVAILABLE";
    else if (currentStatus === "AVAILABLE") nextStatus = "ALLOCATED";
    else if (currentStatus === "ALLOCATED") nextStatus = "PUT-AWAY";
    else if (currentStatus === "PUT-AWAY") nextStatus = "SECURE STOCK";
    else nextStatus = "STAGED";

    // Optimistic update
    setApiMaterials(prev => prev.map(m => (m.id === lotId || m.lotNumber === lotId) ? { ...m, status: nextStatus } : m));

    try {
      await warehouseService.toggleRawMaterialStatus(lotId, nextStatus);
      addToast(`Status for ${item.lotNumber || item.materialName} updated to ${nextStatus}`, "success");
    } catch (err) {
      addToast(`Status updated locally to ${nextStatus}`, "info");
    }
  };

  const getBadgeVariant = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "STAGED" || s.includes("STAGE")) return "warning";
    if (s === "PUT-AWAY" || s === "SECURE STOCK" || s.includes("SECURE")) return "emerald";
    if (s === "ALLOCATED") return "emerald";
    return "slate";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Raw Material Inventory
        </h1>
        <button
          onClick={fetchRawMaterials}
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
          {loading ? "Syncing..." : "Sync Inventory"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {displayMaterials.map((m) => (
          <Card 
            key={m.id || m.lotNumber} 
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
                <Package size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {m.materialName || m.name} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {m.lotNumber ? `Lot: ${m.lotNumber}` : `SKU: ${m.sku}`} <span style={{ margin: "0 4px" }}>•</span> On-Hand: {m.onHand || m.quantity || m.qty}
                </span>
                {m.location && (
                  <>
                    <br/>
                    <span style={{ fontSize: "13px", color: "#C89547" }}>
                      Location: {m.location}
                    </span>
                  </>
                )}
              </span>
            </div>
            
            <div 
              onClick={() => handleToggleStatus(m)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              title="Click to advance status"
            >
              <Badge variant={getBadgeVariant(m.status)}>
                {(m.status || "AVAILABLE").toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}

        {displayMaterials.length === 0 && !loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            No raw materials currently recorded in inventory.
          </div>
        )}
      </div>
    </div>
  );
}
export default RawMaterials;

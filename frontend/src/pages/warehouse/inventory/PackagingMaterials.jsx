import React, { useState, useEffect } from "react";
import { Layers, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function PackagingMaterials() {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [packaging, setPackaging] = useState([
    { id: 1, name: "Aseptic Glass Bottles 1L", sku: "SKU-BOT-1L-01", qty: "42,000 Pcs", status: "Secure Stock", location: "High-Bay Packaging Zone P-01" },
    { id: 2, name: "Orange Cap SKU-CAP-ORG-01", sku: "SKU-CAP-ORG-01", qty: "2,500 Pcs", status: "Low Stock Alert", location: "Packaging Rack P-04-B" }
  ]);

  const fetchPackaging = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getPackagingMaterials();
      const payload = res?.data || res;
      if (payload?.packaging && Array.isArray(payload.packaging)) {
        setPackaging(payload.packaging);
      }
    } catch (err) {
      console.warn("Failed to fetch packaging materials from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackaging();
  }, []);

  const handleToggleStatus = async (item) => {
    const id = item.id;
    const currentStatus = item.status;
    const nextStatus = currentStatus === "Secure Stock" ? "Low Stock Alert" : "Secure Stock";

    // Optimistic UI update
    setPackaging(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: nextStatus };
      }
      return p;
    }));

    if (nextStatus === "Low Stock Alert") {
      addToast(`Stock alert triggered for ${item.name}.`, "warning");
    } else {
      addToast(`Stock replenished to secure levels for ${item.name}.`, "success");
    }

    try {
      await warehouseService.togglePackagingStatus(id, nextStatus);
    } catch (err) {
      console.warn("API status toggle fallback:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Packaging Inventory
        </h1>
        <button
          onClick={fetchPackaging}
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
          {loading ? "Syncing..." : "Sync Packaging"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {packaging.map((p) => {
          const isLowStock = (p.status || "").toLowerCase().includes("low");
          return (
            <Card 
              key={p.id} 
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
                  <Layers size={24} color="#C89547" />
                </div>
                <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                  {p.name} <br/>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    SKU: {p.sku} <span style={{ margin: "0 4px" }}>•</span> On-Hand: {p.qty || `${p.onHand} ${p.unit || "Pcs"}`}
                  </span>
                  {p.location && (
                    <>
                      <br/>
                      <span style={{ fontSize: "13px", color: "#C89547" }}>
                        Location: {p.location}
                      </span>
                    </>
                  )}
                </span>
              </div>
              
              <div 
                onClick={() => handleToggleStatus(p)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                title="Click to toggle stock status"
              >
                <Badge variant={isLowStock ? "slate" : "emerald"}>
                  {(p.status || "SECURE STOCK").toUpperCase()}
                </Badge>
              </div>
            </Card>
          );
        })}

        {packaging.length === 0 && !loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            No packaging materials recorded in inventory.
          </div>
        )}
      </div>
    </div>
  );
}
export default PackagingMaterials;

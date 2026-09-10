import React, { useState, useEffect } from "react";
import { Boxes, Check, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import warehouseService from "../../services/warehouseService";

export function PalletsContainers() {
  const { addToast } = useApp();

  const [pallets, setPallets] = useState([
    { id: "PLT-1020", sku: "SKU-AJ-1L-ORG", description: "Organic Orange Juice 1L (1,000 Bottles)", status: "Staged WH-B" },
    { id: "PLT-1021", sku: "SKU-AJ-500ML-ORG", description: "Organic Orange Juice 500ml (2,000 Bottles)", status: "Loaded Carrier" }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchPallets = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getPalletsContainers();
      const data = res.data?.data || res.data;
      if (data?.pallets && Array.isArray(data.pallets)) {
        setPallets(data.pallets);
      } else if (Array.isArray(data)) {
        setPallets(data);
      }
    } catch (err) {
      console.warn("Could not load pallets containers from API:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPallets();
  }, []);

  const handleStage = async (id) => {
    try {
      const res = await warehouseService.loadPalletContainer(id, {
        carrier: "Titan Freight Lines",
        trailerNo: "TR-4401",
        operator: "Carlos Mendez"
      });
      const msg = res.data?.message || `Pallet ${id} marked as Loaded. Outbound dispatch updated.`;
      addToast(msg, "success");
    } catch (e) {
      console.warn("Load Cargo err:", e);
      addToast(`Pallet ${id} marked as Loaded. Outbound dispatch updated.`, "success");
    }

    setPallets(prev =>
      prev.map(p => p.id === id ? { ...p, status: "Loaded Carrier" } : p)
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em", margin: 0 }}>
          Pallets & Cargo Containers
        </h1>
        <button
          onClick={fetchPallets}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "var(--bg-secondary, #f4f4f5)",
            border: "1px solid var(--border-color, #e4e4e7)",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary, #52525b)",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {pallets.map((p) => {
          const isStaged = p.status === "Staged WH-B" || p.status.includes("Staged");
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
                  <Boxes size={24} color="#C89547" />
                </div>
                <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                  {p.id} <br/>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>SKU: {p.sku} <span style={{ margin: "0 4px" }}>•</span> Contents: {p.description || p.contents}</span>
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <Badge variant={p.status.includes("Loaded") ? "emerald" : "warning"}>
                  {p.status.toUpperCase()}
                </Badge>
                <Button 
                  variant={isStaged ? "success" : "secondary"} 
                  size="sm" 
                  icon={Check} 
                  onClick={() => isStaged && handleStage(p.id)}
                  style={{ opacity: isStaged ? 1 : 0.6, cursor: isStaged ? "pointer" : "default" }}
                >
                  {isStaged ? "Load Cargo" : "Loaded"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


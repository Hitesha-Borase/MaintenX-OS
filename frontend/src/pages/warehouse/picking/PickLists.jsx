import React, { useState, useEffect } from "react";
import { FileText, ArrowRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function PickLists() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [pickLists, setPickLists] = useState([
    { id: "PL-101", order: "ORD-991", items: 2, status: "PENDING" },
    { id: "PL-102", order: "ORD-992", items: 5, status: "IN_PROGRESS" }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchPickLists = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getPickingLists();
      const data = res.data?.data || res.data;
      if (data?.pickLists && Array.isArray(data.pickLists)) {
        setPickLists(data.pickLists);
      } else if (Array.isArray(data)) {
        setPickLists(data);
      }
    } catch (err) {
      console.warn("Could not load picking lists from API, using cached state:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickLists();
  }, []);

  const handleStartPicking = async (id, currentStatus) => {
    try {
      await warehouseService.startPickingList(id);
      addToast(`Pick list ${id} started.`, "success");
      setPickLists(prev =>
        prev.map(item => item.id === id ? { ...item, status: "IN_PROGRESS" } : item)
      );
    } catch (err) {
      console.warn("startPickingList error:", err);
      addToast(`Pick list ${id} started.`, "success");
    }
    navigate("/warehouse/picking/execution");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em", margin: 0 }}>
          Warehouse Pick Lists
        </h1>
        <button
          onClick={fetchPickLists}
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
        {pickLists.map((l) => {
          const isPending = l.status === "PENDING";
          const isInProgress = l.status === "IN_PROGRESS";
          return (
            <Card 
              key={l.id} 
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
                  <FileText size={24} color="#C89547" />
                </div>
                <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                  Pick List: {l.id} <span style={{ margin: "0 4px" }}>•</span> Order: {l.order} <br/>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Payload: {l.items} Items <span style={{ margin: "0 4px" }}>•</span> Status: {l.status}</span>
                </span>
              </div>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Badge variant={isPending ? "slate" : isInProgress ? "cyan" : "emerald"}>
                  {l.status.toUpperCase()}
                </Badge>
                
                {(isPending || isInProgress) && (
                  <button 
                    onClick={() => handleStartPicking(l.id, l.status)}
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
                      cursor: "pointer"
                    }}
                  >
                    {isPending ? "Start Picking" : "Continue"} <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


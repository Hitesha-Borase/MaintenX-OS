import React, { useState } from "react";
import { Package, Send, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

export function MaterialReservation() {
  const { addToast } = useApp();

  const [reservations, setReservations] = useState([
    { id: "RES-901", order: "ORD-904", part: "Aseptic Glass Bottles 1L", quantity: "26,000 Bottles", status: "Staged" },
    { id: "RES-902", order: "ORD-905", part: "Organic Orange Concentrate", quantity: "600 Liters", status: "Allocated" }
  ]);

  const handleStage = (id) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Staged" } : r)
    );
    addToast(`Material Stage confirmation issued to warehouse.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Material Reservations (Staging)
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Reserve raw feedstocks and instruct warehouse staging teams
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reservations.map((res) => (
          <Card key={res.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", padding: "20px", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px" }}>
                <Package size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{res.order} ({res.id})</h4>
                  <Badge variant={res.status === "Staged" ? "emerald" : "slate"}>{res.status.toUpperCase()}</Badge>
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Part: {res.part} • Staged Target: {res.quantity}
                </span>
              </div>
            </div>

            <Button 
              variant={res.status === "Allocated" ? "success" : "outline"} 
              size="sm" 
              icon={Check} 
              onClick={() => handleStage(res.id)}
              style={{ opacity: res.status === "Allocated" ? 1 : 0.6, cursor: res.status === "Allocated" ? "pointer" : "default" }}
              disabled={res.status !== "Allocated"}
            >
              {res.status === "Allocated" ? "Confirm Stage" : "Staged"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

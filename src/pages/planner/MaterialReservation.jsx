import React, { useState } from "react";
import { Package, Send, Check } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Material Reservations (Staging)
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Reserve raw feedstocks and instruct warehouse staging teams
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reservations.map((res) => (
          <Card key={res.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={16} color="#38BDF8" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{res.id} (Order: {res.order})</span>
                <Badge variant={res.status === "Staged" ? "emerald" : "warning"}>{res.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Part: {res.part} • Staged Target: {res.quantity}
              </div>
            </div>

            {res.status === "Allocated" && (
              <Button variant="success" size="sm" icon={Check} onClick={() => handleStage(res.id)}>
                Confirm Stage
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

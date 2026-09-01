import React, { useState } from "react";
import { FileText } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function PickLists() {
  const { addToast } = useApp();

  const [lists, setLists] = useState([
    { id: "PK-102", order: "ORD-904", itemsCount: "2 Items (Caps, Bottles)", date: "2026-08-31", status: "Active" },
    { id: "PK-103", order: "ORD-905", itemsCount: "1 Item (Concentrate)", date: "2026-08-31", status: "Staged" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setLists(prev => prev.map(l => {
      if (l.id === id) {
        if (currentStatus === "Active") {
          addToast("Pick list marked as Staged.", "success");
          return { ...l, status: "Staged" };
        } else {
          addToast("Pick list marked as Active.", "info");
          return { ...l, status: "Active" };
        }
      }
      return l;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Warehouse Pick Lists
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Monitor staging requirements for scheduled production line runs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {lists.map((l) => {
          const isActive = l.status === "Active";
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
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Payload: {l.itemsCount} <span style={{ margin: "0 4px" }}>•</span> Created: {l.date}</span>
                </span>
              </div>
              
              <div 
                onClick={() => handleToggleStatus(l.id, l.status)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                <Badge variant={isActive ? "cyan" : "emerald"}>
                  {l.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

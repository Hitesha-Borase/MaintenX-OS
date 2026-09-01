import React, { useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ScheduleVersions() {
  const { addToast } = useApp();

  const [versions, setVersions] = useState([
    { id: "V4.2", author: "Thomas Sterling", timestamp: "2026-08-31 08:30", status: "Active Published" },
    { id: "V4.1", author: "Thomas Sterling", timestamp: "2026-08-30 15:45", status: "Archived" }
  ]);

  const handlePromote = (id) => {
    setVersions(prev =>
      prev.map(v => v.id === id ? { ...v, status: "Active Published" } : { ...v, status: "Archived" })
    );
    addToast(`Schedule version ${id} promoted to Active.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Schedule Version History
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {versions.map((v) => (
          <Card key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <FileText size={18} color="#A855F7" />
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Version {v.id}</span>
                <Badge variant={v.status.includes("Active") ? "emerald" : "slate"}>{v.status.toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Author: {v.author} • Saved: {v.timestamp}
              </div>
            </div>

            <Button 
              variant={v.status === "Archived" ? "secondary" : "outline"} 
              size="sm" 
              icon={RefreshCw} 
              onClick={() => handlePromote(v.id)}
              style={{ opacity: v.status === "Archived" ? 1 : 0.6, cursor: v.status === "Archived" ? "pointer" : "default" }}
              disabled={v.status !== "Archived"}
            >
              {v.status === "Archived" ? "Restore" : "Restored"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

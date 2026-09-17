import React, { useState, useEffect } from "react";
import { useExceptions } from "../../context/ExceptionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { AlertOctagon, Check, Zap, Box } from "lucide-react";
import { dashboardService } from "../../services/dashboardService";

export function Exceptions() {
  const { exceptions, updateExceptionStatus } = useExceptions();
  const { addToast } = useApp();
  const [list, setList] = useState([]);
  const [stageFilter, setStageFilter] = useState("ALL"); // ALL | PROCESSING | PACKAGING

  useEffect(() => {
    dashboardService.getEscalations()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setList(data);
        } else {
          setList(exceptions);
        }
      })
      .catch((err) => {
        console.warn("[Supervisor Exceptions] API fetch warning:", err.message);
        setList(exceptions);
      });
  }, [exceptions]);

  const getExceptionStage = (ex) => {
    const str = `${ex.title || ""} ${ex.details || ""} ${ex.category || ""}`.toLowerCase();
    if (
      str.includes("vessel") ||
      str.includes("mixer") ||
      str.includes("cooker") ||
      str.includes("blend") ||
      str.includes("pasteuriz") ||
      str.includes("tank") ||
      str.includes("kettle") ||
      str.includes("homogeniz") ||
      str.includes("agitator") ||
      str.includes("heat exchanger") ||
      str.includes("cip") ||
      str.includes("ferment") ||
      str.includes("batching") ||
      str.includes("formulation") ||
      str.includes("processing")
    ) {
      return "PROCESSING";
    }
    return "PACKAGING";
  };

  const handleResolveException = async (id) => {
    try {
      await dashboardService.dispatchEscalation({ id, action: "resolve" });
    } catch (err) {
      console.warn("[Supervisor Exceptions] Resolve API warning:", err.message);
    }
    updateExceptionStatus(id, "Resolved", "Supervisor signed off resolution.");
    setList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "Resolved" } : e))
    );
    addToast(`Exception ${id} marked as Resolved.`, "success");
  };

  const filteredList = (list || []).filter((ex) => {
    if (stageFilter === "ALL") return true;
    return getExceptionStage(ex) === stageFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Active Operations Exceptions & Control Tower
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            Monitor and resolve high-priority alarms categorized by manufacturing stage
          </p>
        </div>

        {/* Stage Filter Buttons Bar */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setStageFilter("ALL")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: stageFilter === "ALL" ? "var(--accent-primary)" : "var(--bg-card-subtle)",
              color: stageFilter === "ALL" ? "#FFFFFF" : "var(--text-secondary)"
            }}
          >
            🌐 All Events ({(list || []).length})
          </button>
          <button
            type="button"
            onClick={() => setStageFilter("PROCESSING")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: stageFilter === "PROCESSING" ? "#8B5CF6" : "var(--bg-card-subtle)",
              color: stageFilter === "PROCESSING" ? "#FFFFFF" : "var(--text-secondary)"
            }}
          >
            ⚡ Processing Hall
          </button>
          <button
            type="button"
            onClick={() => setStageFilter("PACKAGING")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: stageFilter === "PACKAGING" ? "#0EA5E9" : "var(--bg-card-subtle)",
              color: stageFilter === "PACKAGING" ? "#FFFFFF" : "var(--text-secondary)"
            }}
          >
            📦 Packaging Lines
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredList.map((ex) => {
          const stg = getExceptionStage(ex);
          return (
            <Card key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderLeft: ex.status !== "Resolved" ? "4px solid #EF4444" : "4px solid var(--border-subtle)", backgroundColor: "#FFFFFF", padding: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertOctagon size={16} color="#EF4444" />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{ex.id}</span>
                  <Badge variant={ex.status === "Resolved" ? "emerald" : "danger"}>{ex.status}</Badge>
                  <Badge variant={stg === "PROCESSING" ? "purple" : "blue"}>
                    {stg === "PROCESSING" ? "⚡ Processing Hall" : "📦 Packaging Line"}
                  </Badge>
                </div>
                <div style={{ fontWeight: 700, marginTop: "6px", color: "var(--text-primary)" }}>{ex.title}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Details: {ex.details} • Discovered: {ex.discoveredAt || ex.createdAt}
                </div>
              </div>

              {ex.status !== "Resolved" && (
                <Button variant="success" size="sm" icon={Check} onClick={() => handleResolveException(ex.id)}>
                  Resolve Alarm
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

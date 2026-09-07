import React, { useState } from "react";
import { AlertTriangle, Plus, Search, Microscope } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useQualityStore } from "../utils/useQualityStore";
import { useNavigate } from "react-router-dom";

export function Deviations() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const qualityState = useQualityStore();

  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!description) return;

    const devId = `DEV-${qualityState.deviations.length + 800}`;
    qualityState.createDeviation({
      id: devId,
      holdId: "None",
      description,
      status: "Open"
    });

    addToast(`Quality deviation ${devId} logged.`, "warning");
    setDescription("");
    setShowForm(false);
  };

  const handleStartInvestigation = (devId) => {
    qualityState.updateDeviation(devId, "Under Investigation");
    
    const invId = `INV-${qualityState.investigations.length + 900}`;
    qualityState.createInvestigation({
      id: invId,
      devId: devId,
      finding: "",
      action: "",
      status: "Pending"
    });
    
    addToast(`Investigation ${invId} started for deviation ${devId}.`, "info");
    setTimeout(() => navigate("/quality/events/investigations"), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Quality Deviations Console
          </h1>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>
          Report Deviation
        </Button>
      </div>

      {showForm && (
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", borderRadius: "16px", backgroundColor: "#f9fafb" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Report New Deviation</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Excursion Description
              </label>
              <textarea
                placeholder="Detail temperature drops, sensor faults..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", resize: "vertical" }}
                required
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button type="submit" variant="primary" icon={AlertTriangle}>
                Log Deviation
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {qualityState.deviations.map((d) => (
          <Card
            key={d.id}
            style={{
              padding: "20px 24px",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              borderLeft: d.status === "Open" ? "4px solid #EF4444" : d.status === "Under Investigation" ? "4px solid #F59E0B" : "4px solid #10B981"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "250px", flex: 1 }}>
              <div style={{ padding: "10px", backgroundColor: d.status === "Open" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                <AlertTriangle size={24} color={d.status === "Open" ? "#EF4444" : "#F59E0B"} strokeWidth={2} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{d.id}</span>
                  <Badge variant={d.status === "Open" ? "destructive" : d.status === "Under Investigation" ? "warning" : "emerald"}>{d.status}</Badge>
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>{d.description}</span>
                {d.holdId !== "None" && (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Linked to Hold: {d.holdId}</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Button variant="secondary" size="sm" icon={Search}>
                View Details
              </Button>
              {d.status === "Open" && (
                <Button variant="primary" size="sm" icon={Microscope} onClick={() => handleStartInvestigation(d.id)}>
                  Start Investigation
                </Button>
              )}
            </div>
          </Card>
        ))}

        {qualityState.deviations.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-secondary)" }}>No open deviations recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
}


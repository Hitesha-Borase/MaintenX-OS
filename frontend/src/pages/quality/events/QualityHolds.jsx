import React, { useState } from "react";
import { AlertOctagon, Check, Trash, Plus, Search, ShieldAlert } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useQualityStore } from "../utils/useQualityStore";
import { useNavigate } from "react-router-dom";

export function QualityHolds() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const qualityState = useQualityStore();

  const [showForm, setShowForm] = useState(false);
  const [newBatch, setNewBatch] = useState("");
  const [newReason, setNewReason] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newBatch || !newReason) return;
    
    qualityState.createHold({
      id: `HLD-${qualityState.holds.length + 400}`,
      batch: newBatch,
      reason: newReason,
      status: "Active",
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowForm(false);
    setNewBatch("");
    setNewReason("");
    addToast(`Quality Hold created for batch ${newBatch}`, "warning");
  };

  const handleReview = (id) => {
    // In a real app, opens a modal or navigates to review page
    addToast("Opened Hold Review Modal.", "info");
    // We can simulate creating a deviation from a hold review
    const devId = `DEV-${qualityState.deviations.length + 800}`;
    qualityState.createDeviation({
      id: devId,
      holdId: id,
      description: "Auto-generated deviation from Hold Review",
      status: "Open"
    });
    addToast(`Deviation ${devId} generated from Hold Review.`, "warning");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Quality Quarantine Holds
          </h1>
        </div>
        <Button variant="outline" icon={Plus} onClick={() => setShowForm(!showForm)}>
          Create Hold
        </Button>
      </div>

      {showForm && (
        <Card style={{ padding: "24px", borderRadius: "16px", backgroundColor: "#f9fafb", border: "1px solid var(--border-color)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Create New Quality Hold</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Batch ID</label>
              <input 
                type="text" 
                placeholder="e.g. BAT-2026-0899" 
                value={newBatch}
                onChange={e => setNewBatch(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                required
              />
            </div>
            <div style={{ flex: 2, minWidth: "250px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Reason for Hold</label>
              <input 
                type="text" 
                placeholder="e.g. Failed Visual Inspection" 
                value={newReason}
                onChange={e => setNewReason(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                required
              />
            </div>
            <Button variant="primary" type="submit">Save Hold</Button>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </form>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {qualityState.holds.map((h) => (
          <Card 
            key={h.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              borderLeft: h.status === "Active" ? "4px solid #EF4444" : "4px solid #10B981",
              padding: "20px 24px",
              borderRadius: "16px",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "250px" }}>
              <div style={{ padding: "10px", backgroundColor: h.status === "Active" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                <AlertOctagon size={24} color={h.status === "Active" ? "#EF4444" : "#10B981"} strokeWidth={2} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{h.id}</h3>
                  <Badge variant={h.status === "Active" ? "destructive" : "emerald"}>{h.status}</Badge>
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Batch: {h.batch} | Date: {h.date}
                </span>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Reason: <strong style={{ color: "var(--text-primary)" }}>{h.reason}</strong>
                </span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="secondary" size="sm" icon={Search}>
                View Hold
              </Button>
              {h.status === "Active" && (
                <Button variant="primary" size="sm" icon={ShieldAlert} onClick={() => handleReview(h.id)}>
                  Review Hold
                </Button>
              )}
            </div>
          </Card>
        ))}

        {qualityState.holds.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-secondary)" }}>No active quality holds.</p>
          </div>
        )}
      </div>
    </div>
  );
}


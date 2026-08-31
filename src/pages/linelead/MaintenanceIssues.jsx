import React, { useState } from "react";
import { Wrench, AlertTriangle, Send, ShieldAlert } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function MaintenanceIssues() {
  const { workOrders, setWorkOrders, addWorkOrder } = useCMMS();
  const { addToast } = useApp();

  const lineWOs = workOrders.filter((w) => w.line === "Line 1 (Aseptic Bottling)" || w.line === "Line 1");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("P2 - High");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newWO = {
      assetId: "FM-001",
      assetName: "High-Speed Aseptic Liquid Filler FM-001",
      line: "Line 1 (Aseptic Bottling)",
      title: `Corrective: ${title}`,
      description: desc,
      priority,
      status: "Open"
    };

    addWorkOrder(newWO);
    addToast("Corrective Maintenance Work Order created. Technicians notified.", "success");
    setTitle("");
    setDesc("");
  };

  const handleEscalate = (woId) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === woId ? { ...w, priority: "P1 - Critical" } : w))
    );
    addToast(`Work Order ${woId} escalated to P1 Critical severity. Dispatch team alerted.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Maintenance Issues
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log corrective hardware breakdowns and monitor open line work orders
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Active Work Orders */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Active Line Work Orders ({lineWOs.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {lineWOs.map((wo) => {
              const isP1 = wo.priority.includes("P1");
              return (
                <div
                  key={wo.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{wo.id}</span>
                    <Badge variant={isP1 ? "danger" : "warning"}>{wo.priority}</Badge>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{wo.title}</div>
                  <div style={{ color: "var(--text-secondary)" }}>Status: {wo.status}</div>
                  {!isP1 && (
                    <Button variant="ghost" size="xs" icon={ShieldAlert} onClick={() => handleEscalate(wo.id)} style={{ marginTop: "4px", width: "fit-content" }}>
                      Escalate to P1
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Log WO Form */}
        <form onSubmit={handleSubmit}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Log Corrective Defect
            </h3>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Issue Title
              </label>
              <input
                type="text"
                placeholder="E.g. Scrap belt slip..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Priority Urgency
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="P1 - Critical">P1 - Critical (Line Down)</option>
                <option value="P2 - High">P2 - High (Degraded Performance)</option>
                <option value="P3 - Medium">P3 - Medium (Minor Issue)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Symptom Details
              </label>
              <textarea
                placeholder="Describe machine behavior..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="input-field"
                style={{ width: "100%", minHeight: "80px" }}
                required
              />
            </div>

            <Button type="submit" variant="primary" icon={Wrench} style={{ marginTop: "6px" }}>
              Request Maintenance
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

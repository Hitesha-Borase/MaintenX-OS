import React, { useState } from "react";
import { AlertTriangle, Plus, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Deviations() {
  const { addToast } = useApp();

  const [deviations, setDeviations] = useState([
    { id: "DEV-102", title: "HTST Pasteurizer Temp Drop to 82.9°C", date: "2026-08-30", status: "Under Review" }
  ]);

  const [title, setTitle] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();

    const newDev = {
      id: `DEV-${Math.floor(100 + Math.random() * 99)}`,
      title,
      date: "2026-08-31",
      status: "Under Review"
    };

    setDeviations(prev => [...prev, newDev]);
    addToast(`Quality deviation logged. CAPA investigation triggered.`, "warning");
    setTitle("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Quality Deviations Console
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log and track out-of-specification critical parameters and excursions
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Deviations List */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Active Deviations ({deviations.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {deviations.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{d.id}</span>
                  <Badge variant="warning">{d.status}</Badge>
                </div>
                <div style={{ color: "var(--text-primary)" }}>{d.title}</div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Discovered: {d.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Create Deviation Form */}
        <form onSubmit={handleCreate}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Log Process Deviation
            </h3>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Excursion Description
              </label>
              <textarea
                placeholder="Detail temperature drops, sensor faults..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                style={{ width: "100%", minHeight: "80px" }}
                required
              />
            </div>

            <Button type="submit" variant="warning" icon={AlertTriangle} style={{ marginTop: "6px" }}>
              Log Deviation
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

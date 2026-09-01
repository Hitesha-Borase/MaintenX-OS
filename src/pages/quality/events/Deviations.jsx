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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Quality Deviations Console
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Log and track out-of-specification critical parameters and excursions
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Deviations List */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "24px", borderRadius: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {deviations.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{d.id}</span>
                  <Badge variant="slate">{d.status}</Badge>
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{d.title}</div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Discovered: {d.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Create Deviation Form */}
        <form onSubmit={handleCreate}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", borderRadius: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Excursion Description
              </label>
              <textarea
                placeholder="Detail temperature drops, sensor faults..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                style={{ width: "100%", minHeight: "100px", padding: "12px" }}
                required
              />
            </div>

            <Button type="submit" variant="secondary" icon={AlertTriangle} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              Log Deviation
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

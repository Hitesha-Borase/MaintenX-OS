import React, { useState } from "react";
import { Users, Send, Clipboard } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ShiftHandoff() {
  const { shiftHandoffs, addShiftHandoff } = useProduction();
  const { addToast } = useApp();

  const [shiftFrom, setShiftFrom] = useState("Shift A (Day)");
  const [shiftTo, setShiftTo] = useState("Shift B (Evening)");
  const [incomingOp, setIncomingOp] = useState("Thomas Sterling");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    addShiftHandoff({
      shiftFrom,
      shiftTo,
      handedOverBy: "Elena Rostova (Line Lead)",
      receivedBy: incomingOp,
      notes
    });

    addToast(`Line Lead Shift handoff logged and signed.`, "success");
    setNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Lead Shift Handoff
        </h1>

      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                Current Shift
              </label>
              <select
                value={shiftFrom}
                onChange={(e) => setShiftFrom(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Shift A (Day)">Shift A (Day - 06:00 - 14:30)</option>
                <option value="Shift B (Evening)">Shift B (Evening - 14:30 - 23:00)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                Incoming Shift
              </label>
              <select
                value={shiftTo}
                onChange={(e) => setShiftTo(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Shift B (Evening)">Shift B (Evening - 14:30 - 23:00)</option>
                <option value="Shift C (Night)">Shift C (Night - 23:00 - 06:00)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                Incoming Lead
              </label>
              <input
                type="text"
                value={incomingOp}
                onChange={(e) => setIncomingOp(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Handoff Notes & Performance Summary
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "80px" }}
              placeholder="Detail hourly targets, downtime causes, and schedule recovery status..."
              required
            />
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={Send}>
          Sign Off Shift Handoff
        </Button>
      </form>

      {/* handoff logs list */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
          Line Handoff Logs History
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {shiftHandoffs.map((ho) => (
            <div
              key={ho.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                fontSize: "13px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontWeight: 700, color: "#FFFFFF" }}>
                  {ho.shiftFrom} ➔ {ho.shiftTo}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {ho.timestamp}
                </span>
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                Signed Out By: <strong style={{ color: "#FFFFFF" }}>{ho.handedOverBy}</strong> | Incoming Lead: <strong style={{ color: "#FFFFFF" }}>{ho.receivedBy}</strong>
              </div>
              <p style={{ fontStyle: "italic", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                "{ho.notes}"
              </p>
              <div style={{ marginTop: "4px" }}>
                <Badge variant="emerald">{ho.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

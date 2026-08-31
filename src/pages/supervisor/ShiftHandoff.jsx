import React, { useState } from "react";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Users, Send } from "lucide-react";

export function ShiftHandoff() {
  const { shiftHandoffs, addShiftHandoff } = useProduction();
  const { addToast } = useApp();

  const [shiftFrom, setShiftFrom] = useState("Shift A (Day)");
  const [shiftTo, setShiftTo] = useState("Shift B (Evening)");
  const [incomingSuper, setIncomingSuper] = useState("Thomas Sterling");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    addShiftHandoff({
      shiftFrom,
      shiftTo,
      handedOverBy: "Operations Supervisor",
      receivedBy: incomingSuper,
      notes
    });

    addToast(`Supervisor shift handoff logged and signed.`, "success");
    setNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supervisor Shift Handoff
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Transfer department authority and sign off shift performance logs
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                My Shift
              </label>
              <select
                value={shiftFrom}
                onChange={(e) => setShiftFrom(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="Shift A (Day)">Shift A (Day)</option>
                <option value="Shift B (Evening)">Shift B (Evening)</option>
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
                <option value="Shift B (Evening)">Shift B (Evening)</option>
                <option value="Shift C (Night)">Shift C (Night)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
                Incoming Supervisor
              </label>
              <input
                type="text"
                value={incomingSuper}
                onChange={(e) => setIncomingSuper(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Shift Performance Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ width: "100%", minHeight: "80px" }}
              placeholder="Provide shift summary..."
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
          Shift Handoff History
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {shiftHandoffs.map((ho) => (
            <div
              key={ho.id}
              style={{
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
                Signed Out: <strong style={{ color: "#FFFFFF" }}>{ho.handedOverBy}</strong> | Incoming Lead: <strong style={{ color: "#FFFFFF" }}>{ho.receivedBy}</strong>
              </div>
              <p style={{ fontStyle: "italic", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                "{ho.notes}"
              </p>
              <Badge variant="emerald" style={{ marginTop: "4px" }}>{ho.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

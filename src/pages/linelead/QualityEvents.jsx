import React, { useState } from "react";
import { ShieldCheck, AlertOctagon, Send, FileCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { useExceptions } from "../../context/ExceptionContext";

export function QualityEvents() {
  const { addToast } = useApp();
  const { addException } = useExceptions();

  const [events, setEvents] = useState([
    { id: "QE-901", batch: "BAT-2026-0892", parameter: "Brix Concentration deviation", value: "12.4 °Bx (Limit: 12.1)", status: "Quarantined", severity: "Critical" },
    { id: "QE-902", batch: "BAT-2026-0892", parameter: "Cap torque under spec", value: "10 in-lbs (Limit: 12-18)", status: "Resolved", severity: "Medium" }
  ]);

  const [batchId, setBatchId] = useState("BAT-2026-0892");
  const [param, setParam] = useState("pH Acidity deviation");
  const [value, setValue] = useState("3.42 pH (Limit: 3.6-3.8)");

  const handleQuarantine = (e) => {
    e.preventDefault();

    const newQE = {
      id: `QE-${Math.floor(900 + Math.random() * 99)}`,
      batch: batchId,
      parameter: param,
      value,
      status: "Quarantined",
      severity: "Critical"
    };

    setEvents(prev => [newQE, ...prev]);

    // Push critical quality deviation ticket to exception tower
    addException({
      severity: "P1",
      category: "Quality Hold",
      title: `Quality Deviation: ${param} on ${batchId}`,
      location: "Line 1 - Aseptic Bottling",
      details: `Operator logged value: ${value}. Batch quarantined.`,
      owner: "Quality Inspector",
      escalationLevel: "Immediate Dispatch"
    });

    addToast(`Critical Quality hold initiated for batch ${batchId}. Incident logged in Exception Control Tower.`, "danger");
  };

  const handleResolve = (qeId) => {
    setEvents(prev =>
      prev.map(e => e.id === qeId ? { ...e, status: "Resolved" } : e)
    );
    addToast(`Quality Event ${qeId} marked as Resolved.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Quality Events & CCP Holds
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor Critical Control Point (CCP) validations and initiate quarantine alerts
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Active Quality Incidents */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Active Quality Logs
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {events.map((ev) => (
              <div
                key={ev.id}
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
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{ev.id}: {ev.batch}</span>
                  <Badge variant={ev.status === "Quarantined" ? "danger" : "emerald"}>
                    {ev.status}
                  </Badge>
                </div>
                <div style={{ color: "var(--text-secondary)" }}>
                  Deviation: {ev.parameter} ({ev.value})
                </div>
                {ev.status === "Quarantined" && (
                  <Button variant="success" size="xs" icon={FileCheck} onClick={() => handleResolve(ev.id)} style={{ marginTop: "4px", width: "fit-content" }}>
                    Resolve Event
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Quarantine Form */}
        <form onSubmit={handleQuarantine}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Initiate Quarantine Hold
            </h3>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Active Batch Code
              </label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Deviation Parameter
              </label>
              <input
                type="text"
                value={param}
                onChange={(e) => setParam(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Recorded Out-of-Spec Value
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <Button type="submit" variant="danger" icon={AlertOctagon} style={{ marginTop: "6px" }}>
              Initiate Quarantine Hold
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

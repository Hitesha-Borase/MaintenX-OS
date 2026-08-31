import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchCode, ChevronRight } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Investigations() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [investigations, setInvestigations] = useState([
    { id: "INV-802", title: "HTST Pasteurizer CCP Temp Excursion", batch: "BAT-2026-0890", phase: "Hypothesis & Tests" },
    { id: "INV-803", title: "Orange Cap Thread Dimension Out-of-Spec", batch: "NCR-402", phase: "Evidence" }
  ]);

  const [newTitle, setNewTitle] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    const id = `INV-${Math.floor(800 + Math.random() * 100)}`;
    setInvestigations(prev => [...prev, { id, title: newTitle, batch: "N/A", phase: "Event" }]);
    addToast(`RCA Investigation ${id} created. Workflow started at Event phase.`, "success");
    setNewTitle("");
  };

  const handleAdvance = (id) => {
    const phases = ["Event", "Evidence", "Hypothesis & Tests", "Occurrence Cause", "Escape Cause", "CAPA"];
    setInvestigations(prev => prev.map(inv => {
      if (inv.id === id) {
        const nextIdx = Math.min(phases.indexOf(inv.phase) + 1, phases.length - 1);
        return { ...inv, phase: phases[nextIdx] };
      }
      return inv;
    }));
    addToast(`Investigation ${id} advanced to next RCA phase.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          RCA 2.0 — Investigations
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Structured root cause workflow: Event → Evidence → Hypothesis → Test → Cause Validation → CAPA
        </p>
      </div>

      {/* Pipeline header */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        {["Event", "Evidence", "Hypothesis & Tests", "Occurrence Cause", "Escape Cause", "CAPA"].map((phase, idx, arr) => (
          <React.Fragment key={phase}>
            <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
              {phase}
            </span>
            {idx < arr.length - 1 && <ChevronRight size={14} color="var(--text-muted)" />}
          </React.Fragment>
        ))}
      </div>

      {/* Investigation List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {investigations.map((inv) => (
          <Card key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #EF4444" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SearchCode size={16} color="#EF4444" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{inv.id}: {inv.title}</span>
                <Badge variant="warning">{inv.phase}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Source: {inv.batch}
              </div>
            </div>
            <Button variant="primary" size="sm" icon={ChevronRight} onClick={() => handleAdvance(inv.id)}>
              Advance Phase
            </Button>
          </Card>
        ))}
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate}>
        <Card style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="New investigation title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
            required
          />
          <Button type="submit" variant="primary">Start Investigation</Button>
        </Card>
      </form>
    </div>
  );
}

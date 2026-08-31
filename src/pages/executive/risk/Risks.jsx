import React, { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function Risks() {
  const { addToast } = useApp();

  const [risks, setRisks] = useState([
    { id: "RSK-01", title: "Raw milk supplier delay (Chicago)", prob: "High", impact: "Critical", owner: "Supply Chain Team", status: "Mitigating" },
    { id: "RSK-02", title: "Austin Line 2 pasteurizer wear", prob: "Medium", impact: "High", owner: "Maintenance Team", status: "Open" }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newProb, setNewProb] = useState("Medium");
  const [newImpact, setNewImpact] = useState("High");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const id = `RSK-0${risks.length + 1}`;
    setRisks(prev => [...prev, { id, title: newTitle, prob: newProb, impact: newImpact, owner: "Executive Committee", status: "Open" }]);
    addToast(`New risk ${id} logged and added to tracking ledger.`, "success");
    setNewTitle("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1000px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Risk Registry
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log and monitor high-level supply chain, compliance, and equipment breakdown risks
        </p>
      </div>

      <div className="grid-3">
        <StatCard title="Critical Risks logged" value="1 Critical" description="Supply Chain supplier delays" icon={AlertTriangle} color="#EF4444" />
        <StatCard title="Open Risks Registry" value={String(risks.length)} description="Across all active facilities" icon={AlertTriangle} color="#F59E0B" />
        <StatCard title="Mitigation Rate" value="50%" description="Active mitigation plans" icon={AlertTriangle} color="#10B981" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {risks.map((r, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: r.impact === "Critical" ? "4px solid #EF4444" : "4px solid #F59E0B" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <AlertTriangle size={16} color={r.impact === "Critical" ? "#EF4444" : "#F59E0B"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{r.id}: {r.title}</span>
                <Badge variant={r.status === "Mitigating" ? "emerald" : "warning"}>{r.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Owner: {r.owner} | Probability: {r.prob} | Impact: {r.impact}
              </p>
            </div>
            <Button variant="secondary" size="xs" onClick={() => addToast(`Triggered audit report for ${r.id}`, "info")}>Run Audit</Button>
          </Card>
        ))}
      </div>

      <form onSubmit={handleAdd}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Log New Enterprise Risk</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
            <input
              type="text"
              placeholder="Risk description / title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-field"
              required
            />
            <select value={newProb} onChange={(e) => setNewProb(e.target.value)} className="input-field">
              <option value="Low">Low Prob</option>
              <option value="Medium">Medium Prob</option>
              <option value="High">High Prob</option>
            </select>
            <select value={newImpact} onChange={(e) => setNewImpact(e.target.value)} className="input-field">
              <option value="Medium">Medium Impact</option>
              <option value="High">High Impact</option>
              <option value="Critical">Critical Impact</option>
            </select>
          </div>
          <Button type="submit" variant="primary" icon={Plus}>Add Risk</Button>
        </Card>
      </form>
    </div>
  );
}

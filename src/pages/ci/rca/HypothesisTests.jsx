import React, { useState } from "react";
import { Zap, Save, Check } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function HypothesisTests() {
  const { addToast } = useApp();

  const [hypotheses, setHypotheses] = useState([
    { id: 1, inv: "INV-802", statement: "Temperature sensor probe drift caused false reading", tested: false }
  ]);

  const [statement, setStatement] = useState("");

  const handleTest = (id) => {
    setHypotheses(prev => prev.map(h => h.id === id ? { ...h, tested: true } : h));
    addToast("Hypothesis marked as tested. Cause validation triggered.", "success");
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setHypotheses(prev => [...prev, { id: Date.now(), inv: "INV-802", statement, tested: false }]);
    addToast("Hypothesis logged for testing.", "success");
    setStatement("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Hypothesis & Physical Tests
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log and physically test potential causal hypotheses against gathered evidence
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {hypotheses.map((h) => (
          <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: h.tested ? "4px solid #10B981" : "4px solid #F59E0B" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={16} color={h.tested ? "#10B981" : "#F59E0B"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{h.statement}</span>
                <Badge variant={h.tested ? "emerald" : "warning"}>{h.tested ? "Tested" : "Pending Test"}</Badge>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Investigation: {h.inv}</div>
            </div>
            {!h.tested && (
              <Button variant="success" size="sm" icon={Check} onClick={() => handleTest(h.id)}>Mark Tested</Button>
            )}
          </Card>
        ))}
      </div>

      <form onSubmit={handleAdd}>
        <Card style={{ display: "flex", gap: "8px" }}>
          <input type="text" placeholder="New hypothesis statement..." value={statement} onChange={(e) => setStatement(e.target.value)} className="input-field" style={{ flex: 1 }} required />
          <Button type="submit" variant="primary" icon={Zap}>Add Hypothesis</Button>
        </Card>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { FileText, Plus, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Evidence() {
  const { addToast } = useApp();

  const [evidence, setEvidence] = useState([
    { id: 1, inv: "INV-802", description: "SCADA temperature log showing 82.9°C at 14:20 — 45 sec below critical limit", source: "Automation SCADA Export" }
  ]);

  const [desc, setDesc] = useState("");
  const [source, setSource] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    setEvidence(prev => [...prev, { id: Date.now(), inv: "INV-802", description: desc, source }]);
    addToast("Evidence item logged to RCA investigation.", "success");
    setDesc("");
    setSource("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          RCA Evidence Log
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Attach and log physical evidence, SCADA exports, photos, and witness statements
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {evidence.map((ev) => (
          <Card key={ev.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <FileText size={18} color="#38BDF8" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{ev.inv}</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{ev.description}</p>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Source: {ev.source}</span>
            </div>
          </Card>
        ))}
      </div>

      <form onSubmit={handleAdd}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Add Evidence Item</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Evidence Description</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="input-field" style={{ width: "100%", minHeight: "70px" }} required />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Source</label>
              <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className="input-field" style={{ width: "100%" }} required />
            </div>
          </div>
          <Button type="submit" variant="primary" icon={Save}>Log Evidence</Button>
        </Card>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function CIProjects() {
  const { addToast } = useApp();

  const [projects, setProjects] = useState([
    { id: "CI-001", title: "OEE Improvement — Line 1 Filler", owner: "Ahmed Hassan", target: "$42,000", status: "Active" },
    { id: "CI-002", title: "CIP Cycle Time Reduction", owner: "Engineering Team", target: "$18,000", status: "Active" },
    { id: "CI-003", title: "Label Application Defect Elimination", owner: "Maria Santos", target: "$11,200", status: "Completed" }
  ]);

  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [target, setTarget] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    const id = `CI-00${projects.length + 1}`;
    setProjects(prev => [...prev, { id, title, owner, target, status: "Active" }]);
    addToast(`CI Project ${id} created.`, "success");
    setTitle(""); setOwner(""); setTarget("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>CI Projects</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Manage active and completed Continuous Improvement projects</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {projects.map((p) => (
          <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: p.status === "Completed" ? "4px solid #10B981" : "4px solid #38BDF8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Briefcase size={18} color={p.status === "Completed" ? "#10B981" : "#38BDF8"} />
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{p.id}: {p.title}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Owner: {p.owner} | Target: {p.target}</span>
              </div>
            </div>
            <Badge variant={p.status === "Completed" ? "emerald" : "cyan"}>{p.status}</Badge>
          </Card>
        ))}
      </div>

      <form onSubmit={handleAdd}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>New CI Project</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
            <input type="text" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
            <input type="text" placeholder="Project owner" value={owner} onChange={(e) => setOwner(e.target.value)} className="input-field" required />
            <input type="text" placeholder="Savings target" value={target} onChange={(e) => setTarget(e.target.value)} className="input-field" required />
          </div>
          <Button type="submit" variant="primary" icon={Plus}>Create Project</Button>
        </Card>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import {
  Building2,
  Plus,
  CheckCircle2,
  MapPin,
  Layers,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function PlantsPage() {
  const { addToast } = useApp();

  const [plants, setPlants] = useState([
    { id: "PLANT-01", name: "Austin Manufacturing Facility", code: "ATX-01", location: "Austin, Texas", lines: 3, capacity: "180,000 btl/day", status: "Operational" },
    { id: "PLANT-02", name: "Dallas Regional Facility", code: "DFW-02", location: "Dallas, Texas", lines: 3, capacity: "150,000 btl/day", status: "Operational" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Plant Facilities & Site Configuration
            </h1>
            <Badge variant="emerald">{plants.length} Active Sites</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Multi-site manufacturing plants, geographic locations, and facility capacity definitions.
          </p>
        </div>
      </div>

      {/* Plants Grid */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
        {plants.map((p) => (
          <Card key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{p.name}</h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Code: {p.code}</span>
              </div>
              <Badge variant="emerald" dot>
                {p.status}
              </Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={14} color="#38BDF8" /> {p.location}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Layers size={14} color="#F59E0B" /> {p.lines} Active Production Lines • Rated: {p.capacity}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" onClick={() => addToast(`Config verified for ${p.name}`, "info")}>
                Configure Site
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

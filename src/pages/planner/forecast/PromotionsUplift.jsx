import React, { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function PromotionsUplift() {
  const { addToast } = useApp();

  const [promos, setPromos] = useState([
    { id: 1, name: "Labor Day Juice Promo - Costco", sku: "SKU-AJ-500ML-ORG", uplift: "+15% demand", duration: "Sept 1 - Sept 8" }
  ]);

  const [name, setName] = useState("");
  const [uplift, setUplift] = useState("+10% demand");

  const handleCreate = (e) => {
    e.preventDefault();

    const newPromo = {
      id: Date.now(),
      name,
      sku: "SKU-AJ-1L-ORG",
      uplift,
      duration: "Sept 15 - Sept 22"
    };

    setPromos(prev => [...prev, newPromo]);
    addToast(`Promotion "${name}" configured. Demand uplift integrated into forecast baseline.`, "success");
    setName("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Promotion & Event Demand Uplifts
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Incorporate trade promotions or event volume spikes into the scheduling forecast model
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Active Promos */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Configured Promo Events
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {promos.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 750, color: "#FFFFFF" }}>{p.name}</span>
                  <Badge variant="emerald">{p.uplift}</Badge>
                </div>
                <div style={{ color: "var(--text-secondary)" }}>SKU: {p.sku}</div>
                <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>Active: {p.duration}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Promo Form */}
        <form onSubmit={handleCreate}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Configure Promo Event
            </h3>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Promo / Event Name
              </label>
              <input
                type="text"
                placeholder="E.g. Costco holiday flyer..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Target Demand Uplift (%)
              </label>
              <input
                type="text"
                value={uplift}
                onChange={(e) => setUplift(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <Button type="submit" variant="primary" icon={Plus} style={{ marginTop: "6px" }}>
              Create Event
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

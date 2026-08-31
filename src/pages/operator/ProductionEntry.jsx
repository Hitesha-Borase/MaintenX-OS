import React, { useState } from "react";
import { Factory, Plus, Minus, Send, Check } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionEntry() {
  const { productionOrders, setProductionOrders } = useProduction();
  const { addToast } = useApp();

  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];

  const [producedAdd, setProducedAdd] = useState(500);
  const [scrapAdd, setScrapAdd] = useState(10);
  const [reworkAdd, setReworkAdd] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();

    setProductionOrders((prev) =>
      prev.map((o) => {
        if (o.id === activeOrder.id) {
          return {
            ...o,
            producedQuantity: o.producedQuantity + Number(producedAdd),
            scrapQuantity: o.scrapQuantity + Number(scrapAdd),
            reworkQuantity: o.reworkQuantity + Number(reworkAdd)
          };
        }
        return o;
      })
    );

    addToast(`Successfully logged +${producedAdd} bottles produced, +${scrapAdd} scrap.`, "success");
    setProducedAdd(500);
    setScrapAdd(10);
    setReworkAdd(5);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production HMI Entry
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log manufactured batch output and reject quantities
        </p>
      </div>

      <Card style={{ backgroundColor: "var(--bg-card-subtle)" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
          Active Run
        </span>
        <div style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "15px", margin: "4px 0" }}>
          {activeOrder.orderNumber}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Current Total: <strong style={{ color: "#38BDF8" }}>{activeOrder.producedQuantity.toLocaleString()}</strong> Bottles produced (Target: {activeOrder.targetQuantity.toLocaleString()})
        </div>
      </Card>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Produced Quantity */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Add Good Produced Count (Bottles)
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                value={producedAdd}
                onChange={(e) => setProducedAdd(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-field"
                style={{ flex: 1 }}
                required
              />
              <div style={{ display: "flex", gap: "4px" }}>
                <Button type="button" variant="secondary" onClick={() => setProducedAdd(p => Math.max(0, p - 100))}>-100</Button>
                <Button type="button" variant="secondary" onClick={() => setProducedAdd(p => p + 100)}>+100</Button>
              </div>
            </div>
          </div>

          {/* Scrap Count */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Add Scrap Count
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                value={scrapAdd}
                onChange={(e) => setScrapAdd(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-field"
                style={{ flex: 1 }}
                required
              />
              <div style={{ display: "flex", gap: "4px" }}>
                <Button type="button" variant="secondary" onClick={() => setScrapAdd(p => Math.max(0, p - 5))}>-5</Button>
                <Button type="button" variant="secondary" onClick={() => setScrapAdd(p => p + 5)}>+5</Button>
              </div>
            </div>
          </div>

          {/* Rework Count */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Add Rework Count
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                value={reworkAdd}
                onChange={(e) => setReworkAdd(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-field"
                style={{ flex: 1 }}
                required
              />
              <div style={{ display: "flex", gap: "4px" }}>
                <Button type="button" variant="secondary" onClick={() => setReworkAdd(p => Math.max(0, p - 5))}>-5</Button>
                <Button type="button" variant="secondary" onClick={() => setReworkAdd(p => p + 5)}>+5</Button>
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={Send}>
          Submit Production Log
        </Button>
      </form>
    </div>
  );
}

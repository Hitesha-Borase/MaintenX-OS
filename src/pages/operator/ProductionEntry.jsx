import React, { useState } from "react";
import { Factory, Plus, Minus, Send, CheckCircle2, AlertOctagon, RotateCcw } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Production HMI Entry
        </h1>
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>
          ACTIVE RUN
        </span>
        <div style={{ fontWeight: 900, color: "var(--text-primary)", fontSize: "16px", margin: "4px 0" }}>
          {activeOrder.orderNumber}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Current Total: <strong style={{ color: "#B27E33", fontFamily: "var(--font-mono)" }}>{activeOrder.producedQuantity.toLocaleString()}</strong> Bottles produced (Target: {activeOrder.targetQuantity.toLocaleString()})
        </div>
      </Card>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {/* Produced Quantity Card */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "20px",
              borderTop: "3px solid #10B981",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Good Produced</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Bottles output</span>
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "3px 9px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                +Output
              </span>
            </div>

            {/* Stepper Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 8px", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
              <button
                type="button"
                onClick={() => setProducedAdd(p => Math.max(0, p - 100))}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
                title="-100"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                value={producedAdd}
                onChange={(e) => setProducedAdd(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#059669",
                  fontFamily: "var(--font-mono)",
                  fontSize: "22px",
                  fontWeight: 800,
                  outline: "none",
                  width: "100%",
                  minWidth: "60px",
                  padding: "4px 0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setProducedAdd(p => p + 100)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
                title="+100"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setProducedAdd(preset)}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    backgroundColor: producedAdd === preset ? "rgba(16, 185, 129, 0.15)" : "#FFFFFF",
                    border: producedAdd === preset ? "1px solid #10B981" : "1px solid var(--border-subtle)",
                    color: producedAdd === preset ? "#059669" : "var(--text-secondary)",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(70, 45, 15, 0.03)",
                    transition: "all 0.15s ease"
                  }}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </Card>

          {/* Scrap Count Card */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "20px",
              borderTop: "3px solid #EF4444",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                  <AlertOctagon size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Scrap Rejects</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Defects logged</span>
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "3px 9px", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
                Reject
              </span>
            </div>

            {/* Stepper Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 8px", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
              <button
                type="button"
                onClick={() => setScrapAdd(p => Math.max(0, p - 5))}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
                title="-5"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                value={scrapAdd}
                onChange={(e) => setScrapAdd(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#DC2626",
                  fontFamily: "var(--font-mono)",
                  fontSize: "22px",
                  fontWeight: 800,
                  outline: "none",
                  width: "100%",
                  minWidth: "60px",
                  padding: "4px 0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setScrapAdd(p => p + 5)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
                title="+5"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[1, 5, 10, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setScrapAdd(preset)}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    backgroundColor: scrapAdd === preset ? "rgba(239, 68, 68, 0.15)" : "#FFFFFF",
                    border: scrapAdd === preset ? "1px solid #EF4444" : "1px solid var(--border-subtle)",
                    color: scrapAdd === preset ? "#DC2626" : "var(--text-secondary)",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(70, 45, 15, 0.03)",
                    transition: "all 0.15s ease"
                  }}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </Card>

          {/* Rework Count Card */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "20px",
              borderTop: "3px solid #C89547",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
                  <RotateCcw size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Rework Count</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Reprocessing loop</span>
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8C5B23", backgroundColor: "rgba(200, 149, 71, 0.15)", padding: "3px 9px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
                Rework
              </span>
            </div>

            {/* Stepper Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 8px", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
              <button
                type="button"
                onClick={() => setReworkAdd(p => Math.max(0, p - 5))}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
                title="-5"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                value={reworkAdd}
                onChange={(e) => setReworkAdd(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#B27E33",
                  fontFamily: "var(--font-mono)",
                  fontSize: "22px",
                  fontWeight: 800,
                  outline: "none",
                  width: "100%",
                  minWidth: "60px",
                  padding: "4px 0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setReworkAdd(p => p + 5)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
                title="+5"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[1, 5, 10, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReworkAdd(preset)}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    backgroundColor: reworkAdd === preset ? "rgba(200, 149, 71, 0.2)" : "#FFFFFF",
                    border: reworkAdd === preset ? "1px solid #C89547" : "1px solid var(--border-subtle)",
                    color: reworkAdd === preset ? "#8C5B23" : "var(--text-secondary)",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(70, 45, 15, 0.03)",
                    transition: "all 0.15s ease"
                  }}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Button type="submit" variant="primary" icon={Send} style={{ width: "fit-content", padding: "10px 28px", alignSelf: "center" }}>
          Submit Production Log
        </Button>
      </form>
    </div>
  );
}

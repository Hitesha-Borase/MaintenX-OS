import React, { useState } from "react";
import { Factory, Plus, Minus, Send, CheckCircle2, AlertOctagon, RotateCcw, AlertTriangle } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionEntry() {
  const { productionOrders, setProductionOrders } = useProduction();
  const { addToast } = useApp();

  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0];

  const [producedAdd, setProducedAdd] = useState(500);
  const [scrapAdd, setScrapAdd] = useState(10);
  const [reworkAdd, setReworkAdd] = useState(5);

  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [defectCode, setDefectCode] = useState("Cap Seal Deformation / Dent");
  const [scrapNotes, setScrapNotes] = useState("Found during capper exit inspection");

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

  const handleLogScrapSubmit = (e) => {
    e.preventDefault();
    setProductionOrders((prev) =>
      prev.map((o) => o.id === activeOrder.id ? { ...o, scrapQuantity: o.scrapQuantity + Number(scrapAdd) } : o)
    );
    addToast(`Scrap reject of +${scrapAdd} units logged under defect category: "${defectCode}". Sent to Quality & Costing.`, "danger");
    setIsScrapModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Production HMI Entry & Scrap Logging
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Record good output quantities, categorize scrap rejects, and log rework units
          </p>
        </div>

        <Button variant="danger" icon={AlertTriangle} onClick={() => setIsScrapModalOpen(true)}>
          Log Scrap Defect Reason
        </Button>
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

            {/* Sleek Stepper Input */}
            <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "4px", borderRadius: "32px", border: "1px solid #E8DDCF", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => setProducedAdd(p => Math.max(0, p - 100))}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.2s ease",
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
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#059669",
                  fontFamily: "var(--font-mono)",
                  fontSize: "18px",
                  fontWeight: 800,
                  outline: "none",
                  width: "56px",
                  padding: "0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setProducedAdd(p => p + 100)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
                title="+100"
              >
                <Plus size={16} />
              </button>
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

            {/* Sleek Stepper Input */}
            <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "4px", borderRadius: "32px", border: "1px solid #E8DDCF", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => setScrapAdd(p => Math.max(0, p - 5))}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.2s ease",
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
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#DC2626",
                  fontFamily: "var(--font-mono)",
                  fontSize: "18px",
                  fontWeight: 800,
                  outline: "none",
                  width: "56px",
                  padding: "0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setScrapAdd(p => p + 5)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
                title="+5"
              >
                <Plus size={16} />
              </button>
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

            {/* Sleek Stepper Input */}
            <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "4px", borderRadius: "32px", border: "1px solid #E8DDCF", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => setReworkAdd(p => Math.max(0, p - 5))}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.2s ease",
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
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#B27E33",
                  fontFamily: "var(--font-mono)",
                  fontSize: "18px",
                  fontWeight: 800,
                  outline: "none",
                  width: "56px",
                  padding: "0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setReworkAdd(p => p + 5)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2D7C7",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
                title="+5"
              >
                <Plus size={16} />
              </button>
            </div>
          </Card>
        </div>

        <Button type="submit" variant="primary" icon={Send} style={{ width: "fit-content", padding: "10px 28px", alignSelf: "center" }}>
          Submit Production Log
        </Button>
      </form>

      {/* Log Scrap Defect Reason Modal */}
      <Modal
        isOpen={isScrapModalOpen}
        onClose={() => setIsScrapModalOpen(false)}
        title="Categorize Scrap Reject Reason"
        subtitle="Specify Defect Code & Material Impact"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsScrapModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Send} onClick={handleLogScrapSubmit}>
              Confirm Defect Log
            </Button>
          </>
        }
      >
        <form onSubmit={handleLogScrapSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Defect Category / Reason Code
            </label>
            <select
              value={defectCode}
              onChange={(e) => setDefectCode(e.target.value)}
              className="input-field"
            >
              <option value="Cap Seal Deformation / Dent">Cap Seal Deformation / Dent</option>
              <option value="Label Misalignment / Tear">Label Misalignment / Tear</option>
              <option value="Volume Underfill / Overfill">Volume Underfill / Overfill</option>
              <option value="Bottle Neck Contamination">Bottle Neck Contamination</option>
              <option value="Date Code Barcode Smudge">Date Code Barcode Smudge</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Scrap Reject Quantity
            </label>
            <input
              type="number"
              value={scrapAdd}
              onChange={(e) => setScrapAdd(Number(e.target.value))}
              className="input-field"
              min={1}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Operator Notes
            </label>
            <input
              type="text"
              value={scrapNotes}
              onChange={(e) => setScrapNotes(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
